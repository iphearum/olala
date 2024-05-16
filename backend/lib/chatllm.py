import ollama, chromadb, datetime, re

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


class AIChat:
    def __init__(self):
        self.ai = ollama
        self.name_docs = "docs"
        # self.vx = VectorStoreIndex()
        self.collection = client.get_or_create_collection(name=self.name_docs)
        self.text_splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=100)

    def docs(self, name="docs"):
        self.collection = client.get_or_create_collection(name=name)

    def load_url(self, urls=list[str]):
        docs = SimpleWebPageReader(html_to_text=True).load_data(urls)
        doc_splits = self.text_splitter.get_nodes_from_documents(docs)
        chunks = [node.get_content() for node in doc_splits]
        self.embedded(doc_splits=chunks)

    def load_docs(self, docs=list[str]):
        self.embedded(doc_splits=docs)

    def load_pdf(self, pdf_file_path= list[str]):
        docs = SimpleDirectoryReader(input_files=pdf_file_path).load_data()
        chunks = self.text_splitter.get_nodes_from_documents(docs)
        chunks = [node.get_content() for node in chunks]
        self.embedded(doc_splits=chunks)

    def get_meta(self,file_path, text):
        return {
            "text": text,
            "file_path": file_path
        }

    def load_dir(self, path_dir: str):
        reader = SimpleDirectoryReader(input_dir=path_dir, required_exts=[".csv", ".pdf", ".docx", ".txt", ".md", ".ppt", ".pptm," ".pptx"], recursive=True)
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
            stream=True
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
            [{k[0]:k[1] for k in [i.split(": ") for i in node.get_metadata_str().split("\n")]},node.get_content()] 
            for node in chunks
        ]

    # store each document in a vector embedding database
    def embedded(self, doc_splits=list[str]):
        for i, d in enumerate(doc_splits):
            if type(d) is not str:
                d = d.page_content

            response = self.ai.embeddings(model=embeded_model, prompt=d)
            embedding = response["embedding"]
            self.collection.add(
                ids=[str(i)],
                embeddings=[embedding],
                documents=[d]
            )

    def lists(self):
        return self.ai.list()

    def chat(self, prompt=None, messages=[], history=[], chatllm_model=chatllm_model, embeded_model=embeded_model, stream=True):
        if len(messages) > 0:
            prompt = messages[len(messages)-1]["content"]

        response = self.ai.embeddings(model=embeded_model, prompt=prompt)
        results = self.collection.query(
            query_embeddings=[response["embedding"]], n_results=2)
        # print(results)
        if results['documents']:
            docs = '\n\n'.join(results['documents'][0])
        else:
            docs = ""

        prompt = CHATPROMT.format(document=docs, history=history, prompt=prompt, datetime=datetime.date.today())
        if len(messages) > 0:
            return self.ai.chat(model=chatllm_model, messages=messages, stream=stream)

        return self.ai.generate(chatllm_model, prompt=prompt.replace("\n\n\n", "\n"), stream=stream)
        # for content in res:
        #     print(content['response'], end="", flush=True)

    def extract_urls(self, text):
        # Regular expression pattern to match URLs
        url_pattern = r'https?://\S+'
        # Find all URLs in the text
        urls = re.findall(url_pattern, text)
        return urls