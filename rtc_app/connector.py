from .extensions import socketio
from .peer import Peer
from .RBCMLModel import RBCMLModel

class Connector:

    def __init__(self, connection: str, model: RBCMLModel) -> None:
        self.connected: list[Peer] = []
        self.connection: str = connection
        self.model: RBCMLModel = model

    def __str__(self):
        return f"Connector['{self.connection}']: {self.connected}"

    def add_peer(self, peer: Peer):
        # To avoid duplicate peers, remove any other occurrence of peer        
        self.connected = [_peer for _peer in self.connected if _peer.user != peer.user]
        
        # Connect the give peer with the already 'connected' ones
        for _peer in self.connected:
            self.do_connection(peer, _peer)
        
        self.connected.append(peer)
    
    def do_connection(self, p1: Peer, p2: Peer):
        # Connect two peers based on the model of this Connector.
        # This step trigger the peer's javascript code to start the WebRTC
        # connection, serving as a channel for sinnaling step, and setup
        # their UI based on its own and the other's peer capabilities3
        channel_capability = self.model.channel_capability(self.connection)
        p1_capability = self.model.role_capability(p1.role, self.connection)
        p2_capability = self.model.role_capability(p2.role, self.connection)

        socketio.emit(
            'setup_channel',
            {
                'connection': self.connection,
                'channel_capability': channel_capability,
                'peer_name': p1.user,
                'peer_role': p1.role,
                'peer_capability': p1_capability,
                'other_name': p2.user,
                'other_role': p2.role,
                'other_capability': p2_capability,
                'signaling_policy': 'proactive'
            },
            to=p1.sid
        )

        socketio.emit(
            'setup_channel',
            {
                'connection': self.connection,
                'channel_capability': channel_capability,
                'peer_name': p2.user,
                'peer_role': p2.role,
                'peer_capability': p2_capability,
                'other_name': p1.user,
                'other_role': p1.role,
                'other_capability': p1_capability,
                'signaling_policy': 'reactive'
            },
            to=p2.sid
        )