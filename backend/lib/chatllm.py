import random
import string
import ollama
import chromadb
import datetime
import re
import threading
import json
import requests

import pandas as pd

from pandasai import SmartDataframe
import translators as ts
from pandasai.llm import OpenAI
from dotenv import dotenv_values
from llama_index.core import SimpleDirectoryReader
from llama_index.core.text_splitter import SentenceSplitter
from llama_index.readers.web import SimpleWebPageReader

from .helper import CHATPROMT


client = chromadb.Client()
collection = client.get_or_create_collection(name="docs")

config = {
    **dotenv_values(".env"),  # load shared development variables
    # **os.environ,  # override loaded values with environment variables
}
embeded_model = config['embeded_model']
chatllm_model = config['chatllm_model']

llm = OpenAI(
    api_base="http://localhost:11434/v1",
    api_token="openkh",
    model_name="openkh"
)


class AIChat:

    threads = []

    def __init__(self):
        self.ai = ollama
        self.name_docs = "docs"
        self.collection = client.get_or_create_collection(name=self.name_docs)
        self.text_splitter = SentenceSplitter(
            chunk_size=1024, chunk_overlap=100)

    def docs(self, name="docs"):
        self.collection = client.get_or_create_collection(name=name)

    def load_url(self, urls=list[str]):
        docs = SimpleWebPageReader(html_to_text=True).load_data(urls)
        doc_splits = self.text_splitter.get_nodes_from_documents(docs)
        chunks = [node.get_content() for node in doc_splits]
        self.embedded(doc_splits=chunks)

    def load_docs(self, docs=list[str]):
        self.embedded(doc_splits=docs)

    def load_pdf(self, pdf_file_path=list[str]):
        docs = SimpleDirectoryReader(input_files=pdf_file_path).load_data()
        chunks = self.text_splitter.get_nodes_from_documents(docs)
        chunks = [node.get_content() for node in chunks]
        self.embedded(doc_splits=chunks)

    def get_meta(self, file_path, text):
        return {
            "text": text,
            "file_path": file_path
        }

    def load_dir(self, path_dir: str):
        reader = SimpleDirectoryReader(input_dir=path_dir, required_exts=[
                                       ".csv", ".pdf", ".docx", ".txt", ".md", ".ppt", ".pptm," ".pptx"], recursive=True)
        all_docs = []
        for docs in reader.iter_data():
            chunks = self.text_splitter.get_nodes_from_documents(docs)
            chunks = [node.get_content() for node in chunks]
            all_docs.extend(chunks)
        self.embedded(doc_splits=all_docs)

    def load_img(self, images_path=list[str]):
        texts = []
        docs = self.load_textimg(images_path=images_path)
        new_path = []
        for text in docs:
            if text[1] != '':
                texts.append(text)
            else:
                new_path.append(text[0]['file_path'])

        res = self.ai.generate(
            model='llava:7b',
            prompt=f"Short, Meaning, Using data:\n{texts}\n Please discript what is in this image:",
            images=new_path,
            stream=True,
            keep_alive=-1
        )
        for text in res:
            if text['done'] is True:
                break
            print(text['response'], end="", flush=True)
            texts.append(text['response'])
        join_str = ""
        if len(texts) > 1:
            join_str = "\n"

        texts = join_str.join(texts)
        self.embedded(doc_splits=[texts])

    def load_textimg(self, images_path=list[str]):
        docs = SimpleDirectoryReader(input_files=images_path).load_data()
        chunks = self.text_splitter.get_nodes_from_documents(docs)
        return [
            [{k[0]: k[1] for k in [i.split(": ") for i in node.get_metadata_str().split(
                "\n")]}, node.get_content()]
            for node in chunks
        ]

    # store each document in a vector embedding database
    def embedded(self, doc_splits=list[str]):
        for i, d in enumerate(doc_splits):
            if type(d) is not str:
                d = d.page_content

            response = self.ai.embeddings(model=embeded_model, prompt=d, keep_alive=-1)
            embedding = response["embedding"]
            self.collection.add(
                ids=[str(i)],
                embeddings=[embedding],
                documents=[d]
            )

    def lists(self):
        return self.ai.list()

    def chat(self, prompt=None, messages=[], history=[], chatllm_model=chatllm_model, embeded_model=embeded_model, stream=True, flush=False):
        if len(messages) > 0:
            prompt = messages[len(messages)-1]["content"]

        response = self.ai.embeddings(model=embeded_model, prompt=prompt)
        print(prompt)
        results = self.collection.query(
            query_embeddings=[response["embedding"]], n_results=2)
        # print(results)
        if results['documents']:
            docs = '\n\n'.join(results['documents'][0])
        else:
            docs = ""

        prompt = CHATPROMT.format(
            document=docs, history=history, prompt=prompt, datetime=datetime.date.today())
        if len(messages) > 0:
            return self.ai.chat(model=chatllm_model, messages=messages, stream=stream, keep_alive=-1)

        # thread = threading.Thread(target=self.worker, args=(chatllm_model,prompt, stream,))
        # self.threads.append(thread)
        # thread.start()
        if flush is True:
            res = self.ai.generate(chatllm_model, prompt=prompt.replace("\n\n\n", "\n"), stream=stream, keep_alive=-1)
            for content in res:
                print(content['response'], end="", flush=True)
        else:
            return self.ai.generate(chatllm_model, prompt=prompt.replace("\n\n\n", "\n"), stream=stream, keep_alive=-1)
        print('Done')

    def chatsocket(self, prompt=None, messages=[], history=[], chatllm_model=chatllm_model, embeded_model=embeded_model, socketio=None, room=None):
        if len(messages) > 0:
            prompt = messages[len(messages) - 1]["content"]

        response = self.ai.embeddings(model=embeded_model, prompt=prompt)
        results = self.collection.query(
            query_embeddings=[response["embedding"]], n_results=2)
        docs = '\n\n'.join(results['documents'][0]
                           ) if results['documents'] else ""

        prompt = CHATPROMT.format(
            document=docs, history=history, prompt=prompt, datetime=datetime.date.today())

        thread = threading.Thread(target=self.worker, args=(
            chatllm_model, prompt, socketio, room,))
        self.threads.append(thread)
        thread.start()

    def worker(self, chatllm_model, prompt, socketio, room):
        completion_id = ''.join(random.choices(
            string.ascii_letters + string.digits, k=28))
        message_text = {
            'event': 'data',
            'type': 'message',
            'data': [],
            'messageId': completion_id
        }
        texts = []
        sentense = []
        sockid = f"message-{room}"
        for text in self.ai.generate(chatllm_model, prompt=prompt.replace("\n\n\n", "\n"), stream=True, keep_alive=-1):
            if socketio and room:
                socketio.sleep(0.1)
                sentense.append(text['response'])
                if len(sentense) >= random.randint(1, 5):
                    message_text['data'] = "".join(sentense)
                    socketio.emit(sockid, json.dumps(message_text))
                    texts.append(message_text['data'])
                    sentense = []

        if len(sentense) > 0:
            message_text['data'] = "".join(sentense)
            socketio.emit(sockid, json.dumps(message_text))
            texts.append(message_text['data'])

        message_text['type'] = 'messageEnd'
        socketio.emit(sockid, json.dumps(message_text))
    
    def translate(self, text: str, translator='google', from_language='auto', to_language='km'):
        text = ts.translate_text(text, translator=translator, from_language=from_language, to_language=to_language)
        return text
        return text.replace(f"\(", f"$").replace(f"\ (", f"$").replace("\)", "$")


    async def texttospeech(self, text:str, sound = 'male'):
        sounds = await requests.post('https://tts-api.idri.edu.kh/api/v1/text-to-speech',data={
            'text': text,
            'sound': sound 
        })
        return sounds
        

    def extract_urls(self, text):
        # Regular expression pattern to match URLs
        url_pattern = r'https?://\S+'
        # Find all URLs in the text
        urls = re.findall(url_pattern, text)
        return urls
