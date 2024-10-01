from collections import namedtuple

from flask import request
from flask_socketio import emit, join_room

from .extensions import socketio


local_database = dict()
Record = namedtuple('Record', 'user room')

def users_in_room(room):
    print([local_database[key].user for key in local_database if local_database[key].room == room])
    return [local_database[key].user for key in local_database if local_database[key].room == room]

@socketio.on('connect')
def handle_connect():
    print(f'Client connected - {request.sid}')

@socketio.on('disconnect')
def handle_close():
    print(f'Client disconnected - {request.sid}')
    (user, room) = local_database.pop(request.sid)
    emit('bye', {'user': user}, to=room)

@socketio.on('join')
def join(data):
    user = data['user']
    room = data['room']
    local_database[request.sid] = Record(user, room)
    join_room(room)
    emit('hello', {'user': user}, to=room, skip_sid=request.sid)
    emit('update_users_in_room', users_in_room(room), to=room)