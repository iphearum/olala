import json
from dotenv import dotenv_values

from .chatllm import AIChat
from .db import DB

PUBLIC_KEY = "pJNAtlAqCHbUDTrDudubjSKeUVgbOMvkRQWMLtscqsdiKmhI"

config = {
    **dotenv_values(".env"),  # load shared development variables
    # **os.environ,  # override loaded values with environment variables
}
embeded_model = config["embeded_model"]
chatllm_model = config["chatllm_model"]
SECRET_KEY = config["SECRET_KEY"]

db = DB()
ai = AIChat()

with open("./src/models.json") as file:
    models = json.loads(file.read())

with open("./src/config.json") as file:
    configs = json.loads(file.read())


def writeFile(s, fn):
    f = open(fn, "w")
    f.write(s)
    f.close()
