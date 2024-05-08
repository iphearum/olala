error with connection
I have this in NextJS

```ts
import io, {Socket} from 'socket.io-client';
const useSocket = (url: string) => {
  const [ws, setWs] = useState<Socket | null>(null);

  useEffect(() => {
    if (!ws) {
      const connectWs = async () => {
        wsURL.search = searchParams.toString();
        const ws = io(wsURL.toString());
        ws.on('connection', () => {
          console.log('[DEBUG] open');
          setWs(ws);
        });

        ws.on('message',(e) => {
          const parsedData = JSON.parse(e.data);
          if (parsedData.type === 'error') {
            toast.error(parsedData.data);
            if (parsedData.key === 'INVALID_MODEL_SELECTED') {
              localStorage.clear();
            }
          }
        });
      };

      connectWs();
    }

    return () => {
      ws?.close();
      console.log('[DEBUG] closed');
    };
  }, [ws, url]);

  return ws;
};

const ws = useSocket("sw://localhost:5000");
```
and this in server

```py
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, support_credentials=True)
socketio = SocketIO(app)

@socketio.on('connect', namespace="/ws")
def handle_connect(message):
    print(['Received message',message])

@socketio.on('open')
def handle_open(message):
    completion_id = ''.join(random.choices(string.ascii_letters + string.digits, k=28))
    print([completion_id,message])

@socketio.on('disconnect')
def handle_disconnect():
    print('[DEBUG] Client disconnected')

@socketio.on('message')
def handle_message(message):
    print(['Received message',message])


if __name__ == '__main__':
    socketio.run(app)
```

sudo nano /etc/systemd/system/flaskapp.service
systemctl daemon-reload
systemctl restart flaskapp.service
```sh
[Unit]
Description=Flask Application
After=network.target

[Service]
User=linx
WorkingDirectory=/home/linx/smis/codes/ollama/openkh/backend
ExecStart=/home/linx/.chat/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
#ExecStart=/home/linx/.chat/bin/python3 -m app
Restart=always

[Install]
WantedBy=multi-user.target
```