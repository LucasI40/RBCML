from .capability import ChannelCapability, RoleCapability

class RBCMLModel:
    def __init__(self, model: str) -> None:
        self.model = model

    def channel_capability(self, connection: str):
        # Return the channel capability for the given connection in the model
        return ChannelCapability(False, False, True, False)
    
    def role_capability(self, role: str, connection: str):
        if role =="Enfermeiro":
            # Can send and receive
            return RoleCapability(False, False, False, False, True, True, False, False)

        if role == "Paciente":
            # Can send but can't receive
            return RoleCapability(False, False, False, False, True, False, False, False)

        if role == "Acompanhante":
            # Can't send but can receive
            return RoleCapability(False, False, False, False, False, True, False, False)
        
        if role == "Técnico":
            # Can't send and receive
            return RoleCapability(False, False, False, False, False, False, False, False)

        # Return the role capability for the given connetion in the model
        return RoleCapability(False, False, False, False, True, True, False, False)