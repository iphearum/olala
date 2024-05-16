import json
import random
import string
import queue
import threading
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from lib.model import ai, db, chatllm_model, embeded_model, SECRET_KEY

json_content = 'application/json'

app = Flask(__name__)
origins = [
    "http://localhost:3000",
    "https://openkh.org",
    "https://chat.openkh.org",
]

app.config['SECRET_KEY'] = SECRET_KEY
app.config['SOCK_SERVER_OPTIONS'] = {'ping_interval': 25}
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app, origins=origins)

socketio = SocketIO(app, cors_allowed_origins="*",async_mode='threading')

# Create a queue for task management
task_queue = queue.Queue()

# Worker thread function
def worker():
    while True:
        data = task_queue.get()
        if data is None:
            break  # Exit the loop if None is received
        process_messages(data)
        task_queue.task_done()

# Function to process messages
def process_messages(data):
    message = json.loads(data)
    completion_id = ''.join(random.choices(string.ascii_letters + string.digits, k=28))
    message_text = {
        'event': 'data',
        'type': 'sources',
        'data': [],
        'messageId': completion_id
    }

    emit('message-{}'.format(message['socketId']), json.dumps(message_text), broadcast=True)
    ai.docs(name="docs-%s" % (message['socketId']))

    if len(message['history']) == 1:
        message['history'] = []
    elif len(message['history']) >= 6:
        message['history'] = message['history'][(len(message['history']) - 3):]

    response = ai.chat(prompt=message['content'], history=message['history'], chatllm_model=chatllm_model,
                       embeded_model=embeded_model)
    message_text['type'] = 'message'
    socketid = 'message-{}'.format(message['socketId'])
    texts = []
    sentense = []
    for text in response:
        sentense.append(text['response'])
        if len(sentense) >= random.randint(1, 5):
            message_text['data'] = "".join(sentense)
            emit(socketid, json.dumps(message_text), broadcast=True)
            texts.append(message_text['data'])
            sentense = []

    if len(sentense) > 0:
        message_text['data'] = "".join(sentense)
        emit(socketid, json.dumps(message_text), broadcast=True)
        texts.append(message_text['data'])
        sentense = []

    message_text['type'] = 'messageEnd'
    emit(socketid, json.dumps(message_text), broadcast=True)
    db.insert_one(message['socketId'], {
        "_id": completion_id,
        "question": message['content'],
        "message": ''.join(texts),
        "type": message_text['type']
    })

# SocketIO event handler for adding tasks
@socketio.on('message')
def handle_add_task(data):
    task_queue.put(data)

# Start worker threads
def start_workers(num_workers: int):
    threads = []
    for i in range(num_workers):
        t = threading.Thread(target=worker)
        t.start()
        threads.append(t)
    return threads

# Main entry point
if __name__ == '__main__':
    num_workers = 4  # Number of worker threads
    threads = start_workers(num_workers)
    try:
        socketio.run(app, host='0.0.0.0', port=5000,  debug=True, allow_unsafe_werkzeug=True)
        
    finally:
        # Stop workers by sending None to the queue
        for _ in range(num_workers):
            task_queue.put(None)
        for t in threads:
            t.join()