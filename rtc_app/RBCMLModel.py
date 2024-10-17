from .capability import ChannelCapability, RoleCapability

class RBCMLModel:
    def __init__(self, model: str) -> None:
        self.model = model

    def channel_capability(self, connection: str):
        # Return the channel capability for the given connection in the model
        return ChannelCapability(False, False, True, False)
    
    def role_capability(self, role: str, connection: str):
        # Return the role capability for the giver connetion in the model
        return RoleCapability(False, False, False, False, True, True, False, False)