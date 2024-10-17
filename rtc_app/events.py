from flask import request
from flask_socketio import emit, join_room

from .extensions import socketio
from .peer import Peer
from .RBCMLModel import RBCMLModel
from .connector import Connector

@socketio.on('connect')
def handle_connect():
    print(f'Client connected - {request.sid}')
    print(f'Client connected - {request.remote_user}')

@socketio.on('disconnect')
def handle_close():
    print(f'Client disconnected - {request.sid}')

connectors: dict[str, Connector] = dict()

@socketio.on('join')
def join(data):
    user = data['user']
    session = data['session']

    peer = Peer(user, request.sid, get_user_role(user, session))
    connections = get_session_connections(user, session)
    
    for connection in connections:
        if connection not in connectors.keys():
            model = RBCMLModel('')
            connector = Connector(connection, model)
            connector.add_peer(peer)
            connectors[connection] = connector
        else:
            print(connectors[connection])
            connectors[connection].add_peer(peer)


def get_user_role(user: str, role: str) -> str:
    return 'default-role'

def get_session_connections(user: str, session: str) -> list[str]:
    return ['c1', 'c2', 'c3']