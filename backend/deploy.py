import os
import signal

from gunicorn import glogging
from gunicorn.app.base import Application

def on_starting(server):
    server.log.info('Server started')

def on_exit(server):
    server.log.info('Server stopped')

class SocketApplication(Application):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        config = {
            'bind': '%s:%s' % ('0.0.0.0', '8000'),
            'workers': 2,
            'accesslog': '-',
            'errorlog': '-',
            'worker_class': 'gevent',
            'on_starting': on_starting,
            'on_exit': on_exit
        }
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

if __name__ == '__main__':
    from app import app, socketio  # Import your Flask app and SocketIO instance

    options = {
        'bind': '%s:%s' % ('0.0.0.0', '8000'),
        'workers': 2,
        'accesslog': '-',
        'errorlog': '-',
        'worker_class': 'gevent'
    }
    SocketApplication(socketio.wsgi_app, options).run()