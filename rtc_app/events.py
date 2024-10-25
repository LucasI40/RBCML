import random

from flask import request
# from flask_socketio import emit, join_room

from .extensions import socketio
from .peer import Peer
from .RBCMLModel import RBCMLModel
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
    connections = get_session_connections(user, session)
    user_connections[request.sid] = connections

    socketio.emit('setup_connections', connections, to=peer.sid)
    
    for connection in connections:
        if connection not in connectors.keys():
            model = RBCMLModel('')
            connector = Connector(connection, model)
            connector.add_peer(peer)
            connectors[connection] = connector
        else:
            connectors[connection].add_peer(peer)

@socketio.on('SDP')
def sdp(data):
    print(data)

    channel_name = data["channelName"]
    to = data['to']
    sdp = data['sdp']
    socketio.emit('SDP', {"sdp": sdp, 'channel_name': channel_name}, to=to)

memoizator = dict()
def get_user_role(user: str, session: str) -> str:
    if user in memoizator:
        return memoizator[user]
    
    return {"Alice": "Enfermeiro", "Bob": "Paciente", "Caesar": "Acompanhante", "Diana": "Técnico"}[user]
    
    roles = ["Médico", "Enfermeiro", "Paciente", "Acompanhante", "Técnico"]
    memoizator[user] = roles[random.randint(0,4)]
    return memoizator[user]

def get_session_connections(user: str, session: str) -> list[str]:
    connections = ["Conversa Particular", "Triagem", "Exame", "Consulta", "Diagnóstico"]
    return [connections[0]]
    n = random.randint(2, 4)
    return random.sample(connections, n)