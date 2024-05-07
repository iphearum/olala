import ollama,chromadb,pytesseract,datetime
# from IPython.display import Image, display
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain.vectorstores.utils import filter_complex_metadata
from dotenv import dotenv_values

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
        self.client = client
        self.collection = client.get_or_create_collection(name="docs")
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=100)

    def docs(self,name="docs"):
        self.collection = client.get_or_create_collection(name=name)

    def load_url(self,urls=[]):
        docs = [WebBaseLoader(url).load() for url in urls]
        docs_list = [item for sublist in docs for item in sublist]
        doc_splits = self.text_splitter.split_documents(docs_list)
        self.embedded(doc_splits=doc_splits)

    def load_docs(self,docs=[]):
        self.embedded(doc_splits=docs)

    def load_pdf(self,pdf_file_path):
        docs = PyPDFLoader(file_path=pdf_file_path).load()
        chunks = self.text_splitter.split_documents(docs)
        chunks = filter_complex_metadata(chunks)
        self.embedded(doc_splits=chunks)

    def load_img(self, images_path=[]):
        texts = []
        res = self.ai.generate(
            model='llava:7b',
            prompt="Please discript what is in this image:",
            images=images_path,
            stream=True
        )
        for text in res:
            if text['done'] is True:
                break
            print(text['response'], end="", flush=True)
            texts.append(text['response'])
        texts = "".join(texts)
        self.embedded(doc_splits=[texts])

    def load_tetimg(self, images_path=[]):
        textImages = []
        for img in images_path:
            text = pytesseract.image_to_string(img)
            textImages.append(text)
        self.embedded(doc_splits=textImages)

    # store each document in a vector embedding database
    def embedded(self,doc_splits=[]):
        for i, d in enumerate(doc_splits):
            if type(d) is not str:
                d = d.page_content
            # d = d.replace("\n\n", "").replace("  ", "")
            response = self.ai.embeddings(model=embeded_model, prompt=d)
            embedding = response["embedding"]
            self.collection.add(
                ids=[str(i)],
                embeddings=[embedding],
                documents=[d]
            )

    def lists(self):
        return self.ai.list()

    def chat(self, prompt = None, messages = [], chatllm_model = chatllm_model, embeded_model = embeded_model, stream=True):
        if len(messages)>0 :
            prompt = messages[len(messages)-1]["content"]

        response = self.ai.embeddings(model=embeded_model, prompt=prompt)
        results = self.collection.query(query_embeddings=[response["embedding"]], n_results=2)
        # print(results)
        if results['documents']:
            docs = '\n\n'.join(results['documents'][0])
        else:
            docs = ""
        # prompt = systemprompt.format(chat_history=docs, query=prompt)
        # prompt = exportprompt.format(context=prompt, date=datetime.date.today())
        prompt = f"Using this data:\n[{docs}].\nIf data is empty, please just reponse to the question and reject all following prompt.\nRespond to this prompt:\n{prompt}"
        if len(messages)>0 :
            return self.ai.chat(model=chatllm_model, messages=messages, stream=stream)
        
        return self.ai.generate(chatllm_model, prompt=prompt.replace("\n\n\n","\n"), stream=stream)
        # for content in res:
        #     print(content['response'], end="", flush=True)
        