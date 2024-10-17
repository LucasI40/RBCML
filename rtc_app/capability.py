from collections import namedtuple


class ChannelCapability(namedtuple('ChannelCapability', ['audio', 'video', 'string', 'blob'])):
    __slots__ = ()  # Prevents adding new attributes dynamically

    def __new__(cls, audio: bool, video: bool, string: bool, blob: bool):
        # Ensure all values are booleans
        if not isinstance(audio, bool) or not isinstance(video, bool) or not isinstance(string, bool) or not isinstance(blob, bool):
            raise ValueError("All fields must be booleans")
        return super(ChannelCapability, cls).__new__(cls, audio, video, string, blob)

    def __str__(self):
        return f"ChannelCapability: audio={self.audio}, video={self.video}, string={self.string}, blob={self.blob}"


class RoleCapability(namedtuple('RoleCapability', ['send_video', 'recv_video', 'send_audio', 'recv_audio', 'send_string', 'recv_string', 'send_blob', 'recv_blob'])):
    __slot__ = ()  # Prevents adding new attributes dynamically

    def __new__(cls, send_video: bool, recv_video: bool, send_audio: bool, recv_audio: bool, send_string: bool, recv_string: bool, send_blob: bool, recv_blob: bool):
        # Ensure all values are booleans
        if not isinstance(send_video, bool) or not isinstance(recv_video, bool) or not isinstance(send_audio, bool) or not isinstance(recv_audio, bool) or \
           not isinstance(send_string, bool) or not isinstance(recv_string, bool) or not isinstance(send_blob, bool) or not isinstance(recv_blob, bool):
            raise ValueError("All fields must be booleans")
        return super(RoleCapability, cls).__new__(cls, send_video, recv_video, send_audio, recv_audio, send_string, recv_string, send_blob, recv_blob)
    
    def __str__(self):
        return f"RoleCapability: send_video={self.send_video}, recv_video={self.recv_video}, send_audio={self.send_audio}, recv_audio={self.recv_audio},\
            send_string={self.send_string}, recv_string={self.recv_string}, send_blob={self.send_blob}, recv_blob={self.recv_blob}"