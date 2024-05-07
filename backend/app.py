import random, string, json, time, os, sys
from flask import Flask, url_for, render_template, request, abort, redirect, session, Response,jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit, Namespace

from werkzeug.utils import secure_filename
from markupsafe import escape
from dotenv import dotenv_values
from lib.model import AIChat
from lib.helper import ResponseMode, ollama_format_prompt


public_key = "pJNAtlAqCHbUDTrDudubjSKeUVgbOMvkRQWMLtscqsdiKmhI"

config = {
    **dotenv_values(".env"),  # load shared development variables
    # **os.environ,  # override loaded values with environment variables
}
embeded_model = config['embeded_model']
chatllm_model = config['chatllm_model']
SECRET_KEY = config['SECRET_KEY']

json_content = 'application/json'

with open('./src/models.json') as file:
    models = json.loads(file.read())

with open('./src/config.json') as file:
    configs = json.loads(file.read())


app = Flask(__name__)
origins = [
    "http://localhost:3000",  # Replace with the origin you want to allow
    "https://openkh.org",  # Replace with the origin you want to allow
    "https://chat.openkh.org",  # Replace with the origin you want to allow
]

app.config['SECRET_KEY'] = SECRET_KEY
app.config['SOCK_SERVER_OPTIONS'] = {'ping_interval': 25}
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app, resources={r"/*": {"origins": origins}})
socketio = SocketIO(app, cors_allowed_origins="*",async_mode='threading')


ai = AIChat()
 
@socketio.on('connection')
def handle_connect(data):
    # req = request.get_json().get('chatModel')
    # # model = data.get('chatModel', 'openkh:lasted')
    emit('message', json.dumps({"data":"Hello from server"}), broadcast=True)
    print(['Client connected',data,req])

@socketio.on('connect')
def handle_connect(data):
    # req = request.get_json().get('chatModel')
    # model = data.get('chatModel', 'openkh:lasted')
    emit('message', json.dumps({"data":"Hello from server"}), broadcast=True)
    print(['Client connected',data])

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(data):
    message = json.loads(data)
    completion_id = ''.join(random.choices(string.ascii_letters + string.digits, k=28))
    message_text = {
        'event': 'data',
        'type': 'sources',
        'data': [],
        'messageId': completion_id
    }

    emit('message-{}'.format(message['socketId']), json.dumps(message_text), broadcast=True)
    # ai.docs(name=f"docs-{socketid}")
    response = ai.chat(prompt=message['content'], chatllm_model=chatllm_model, embeded_model=embeded_model)
    message_text['type'] = 'message'
    socketid = 'message-{}'.format(message['socketId'])
    for text in response:
        message_text['data'] = text['response']
        if text['response'] is not None:
            emit(socketid, json.dumps(message_text), broadcast=True)
    message_text['type'] = 'messageEnd'
    emit(socketid, json.dumps(message_text), broadcast=True)

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
    stream   = request.get_json().get('stream', False)
    messages = request.get_json().get('messages')

    barer = request.headers.get('Authorization')
    if barer is None:
        barer = 'unknown'
    else:
        barer = barer.strip().split(" ")[1] if len(barer.strip().split(" ")) > 1 else 'unknown'

    if barer != f"pk-{public_key}":
        return Response(response='Unauthorized', status=401)

    completion_id = ''.join(random.choices(string.ascii_letters + string.digits, k=28))

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

def main(port:int = 5000):
    socketio.run(app, host='0.0.0.0', port=port, debug=True, use_reloader=True)

if __name__ == '__main__':
    arg = sys.argv[1:]
    if(len(arg)==0):
        main()
    else:
        for port in arg:
            main(int(port))
