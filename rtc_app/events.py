import csv
import random

from flask import request
# from flask_socketio import emit, join_room

from .extensions import socketio
from .peer import Peer
from .RBCMLModel import get_model
from .connector import Connector

@socketio.on('connect')
def handle_connect():
    print(f'Client connected - {request.sid}')

@socketio.on('disconnect')
def handle_close():
    print(f'Client disconnected - {request.sid}')
    connections = user_connections[request.sid]
    for connection in connections:
        connectors[connection].remove_peer(request.sid)

connectors: dict[str, Connector] = dict()
user_connections: dict[str, list[str]] = dict()

@socketio.on('join')
def join(data):
    user: str = data['user']
    session: str = data['session']

    peer = Peer(user, request.sid, get_user_role(user, session))
    print(f"Creating {peer}")

    model = get_model(session)
    role = get_user_role(user, session)
    connections = model.get_connections(role)

    user_connections[request.sid] = connections

    socketio.emit('setup_connections', connections, to=peer.sid)
    capabilities = {}
    for connection in connections:
        capabilities[connection] = model.role_capability(role, connection)
    socketio.emit('setup_user_capabilities', capabilities, to=peer.sid)

    for connection in connections:
        if connection not in connectors.keys():
            connector = Connector(connection, model)
            connector.add_peer(peer)
            connectors[connection] = connector
        else:
            connectors[connection].add_peer(peer)

@socketio.on('send_offer')
def send_offer(data):
    print(data)

    channel_name = data["channelName"]
    to = data['to']
    offer_sdp = data['offerSdp']
    socketio.emit('create_answer', {"offer_sdp": offer_sdp, 'channel_name': channel_name}, to=to)

@socketio.on('SDP')
def sdp(data):
    print(data)

    channel_name = data["channelName"]
    to = data['to']
    sdp = data['sdp']
    socketio.emit('SDP', {"sdp": sdp, 'channel_name': channel_name}, to=to)

def get_user_role(user: str, session: str) -> str:
    roleName = user
    return roleName

