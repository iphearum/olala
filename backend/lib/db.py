import datetime
from pymongo import MongoClient

dbclient = MongoClient("localhost", 27017)

class DB:

    def __init__(self) -> None:
        self.db = dbclient['chatllama']

    def list_docs(self):
        return self.db.list_collection_names()

    def documents(self, user_id, chat_id):
        return self.db.document.find_one({'_id': chat_id, 'user_id': user_id})

    def insert_one(self, group_id: str, docs={}):
        docs['group_id'] = group_id
        docs['datetime'] = datetime.datetime.now()
        return self.db.chats.insert_one(docs)

    def insert_many(self, group_id: str, docs=[]):
        for i in docs:
            docs[i]['group_id'] = group_id
            docs[i]['datetime'] = datetime.datetime.now()
        return self.db.chats.insert_many(docs)

    def insert_into_group(self, user_id: str, group_id: str):
        return self.db.groupchats.insert_one({
            'user_id': user_id,
            'group_id': group_id,
            'datetime': datetime.datetime.now()
        })
