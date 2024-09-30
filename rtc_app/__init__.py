import os

from flask import Flask, send_from_directory

from .events import socketio
from .routes import main


def create_app():
    app = Flask(__name__)
    app.config['DEBUG'] = True
    app.config['SECRET'] = 'secret'

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')
    
    app.register_blueprint(main)

    socketio.init_app(app)

    return app