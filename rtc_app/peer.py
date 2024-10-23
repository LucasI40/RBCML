class Peer:
    def __init__(self, user: str, sid: str, role: str) -> None:
        self.user = user
        self.sid = sid
        self.role = role

    def __repr__(self):
        return f"{self.user}:{self.role}"