import random
import string
import json
import time
import os
import sys
import threading
import asyncio
from flask import Flask, request, Response
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit, Namespace

from werkzeug.utils import secure_filename
from markupsafe import escape

from lib.helper import ResponseMode
from lib.model import ai, db, chatllm_model, embeded_model, models, configs, SECRET_KEY, PUBLIC_KEY


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

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
# socketio = SocketIO(app, cors_allowed_origins="*",async_mode='threading')

threads = []

# @async_handlers


def worker(message):
    completion_id = ''.join(random.choices(
        string.ascii_letters + string.digits, k=28))
    message_text = {
        'event': 'data',
        'type': 'sources',
        'data': [],
        'messageId': completion_id
    }

    emit('message-{}'.format(message['socketId']),
         json.dumps(message_text), broadcast=True)
    ai.docs(name="docs-%s" % (message['socketId']))

    length = len(message['history'])
    if len(message['history']) <= 3:
        message['history'] = message['history']
    elif len(message['history']) < 6:
        message['history'] = message['history'][length - 2:]
    elif len(message['history']) >= 6:
        message['history'] = message['history'][length - 3:]

    response = ai.chat(prompt=message['content'], history=message['history'], chatllm_model=chatllm_model, embeded_model=embeded_model)
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


# Background thread to process messages from the queue
@socketio.on('message')
def handle_message(data):
    message = json.loads(data)

    if message['type'] == 'translate':
        message['text'] = message['text']['content']
        return handle_translate(message)
        # thread = threading.Thread(target=handle_translate, args=(message,))
        # threads.append(thread)
        # thread.start()
    # print(message)
    return worker(message)
    # Assuming the room name is the same as the socket ID
    room = message['socketId']

    ai.docs(name=f"docs-{room}")

    length = len(message['history'])
    if len(message['history']) <= 3:
        message['history'] = message['history']
    elif len(message['history']) < 6:
        message['history'] = message['history'][length - 2:]
    elif len(message['history']) >= 6:
        message['history'] = message['history'][length - 3:]

    ai.chatsocket(prompt=message['content'], history=message['history'],
                  chatllm_model=chatllm_model, embeded_model=embeded_model, socketio=socketio, room=room)
    # worker(message)

@socketio.on('translate')
def handle_translate(message):
    sockid = message['socketId']
    completion_id = ''.join(random.choices(
        string.ascii_letters + string.digits, k=28))
    message_text = {
        'event': 'data',
        'type': 'translate',
        'data': [],
        'messageId': completion_id
    }
    text = ai.translate(text=message['text'], to_language=message['tl'] or 'km')
    message_text['data'] = text
    if len(text) > 0:
        emit(f'translate-{sockid}',  json.dumps(message_text), broadcast=True)

    message_text['type'] = 'messageEnd'
    message_text['data'] = None
    emit(f'translate-{sockid}',  json.dumps(message_text), broadcast=True)
    


@socketio.on('connect')
def handle_connect(data):
    emit('message', json.dumps({"data": "Hello from server"}), broadcast=True)
    print(['Client connected', data])


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@app.route('/api/models')
async def api_models():
    data = json.dumps(models)
    return Response(data, content_type=json_content)


@app.route('/api/config')
async def api_config():
    return Response(json.dumps(configs), content_type=json_content)


@app.route('/chat/completions', methods=['POST'])
def chat_completions():
    model = request.get_json().get('model', 'seallm')
    stream = request.get_json().get('stream', False)
    messages = request.get_json().get('messages')

    barer = request.headers.get('Authorization')
    if barer is None:
        barer = 'unknown'
    else:
        barer = barer.strip().split(" ")[1] if len(
            barer.strip().split(" ")) > 1 else 'unknown'

    if barer != f"pk-{PUBLIC_KEY}":
        return Response(response='Unauthorized', status=401)

    completion_id = ''.join(random.choices(
        string.ascii_letters + string.digits, k=28))

    response = ai.chat(messages=messages, stream=stream)

    def streaming():
        for data in response:
            print(data)
            chunk = data['message']['content']
            mydict = ResponseMode(completion_id, model, chunk)
            content = json.dumps(mydict.to_dict(), separators=(',', ':'))
            yield f'data: {content}\n\n'
            time.sleep(0.1)

        mydict = ResponseMode(completion_id, model, True)
        content = json.dumps(mydict.to_dict(), separators=(',', ':'))
        yield f'data: {content}\n\n'

    return app.response_class(streaming(), mimetype='text/event-stream')


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000,
                 allow_unsafe_werkzeug=True, debug=True)

# def main(port:int = 5000):
#     socketio.run(app, host='0.0.0.0', port=port)

# if __name__ == '__main__':
#     arg = sys.argv[1:]
#     if(len(arg)==0):
#         main()
#     else:
#         for port in arg:
#             main(int(port))
