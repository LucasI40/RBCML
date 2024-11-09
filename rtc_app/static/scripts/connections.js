let selectedConnection = "";
window.usersInConnection = {}; // connectionName -> [User]
window.usersMessages = {}; // connectionName -> [Message]
window.usersMedias = {}; // connectionName -> [Media]
window.listeners = {}; // connectionName -> [Channel]
window.userConnectionCapabilities = {}; // connectionName -> UserCapabilities

class UserCapabilities {
  constructor(
    sendVideo,
    recvVideo,
    sendAudio,
    recvAudio,
    sendString,
    recvString,
    sendBlob,
    recvBlob
  ) {
    this.sendVideo = sendVideo;
    this.recvVideo = recvVideo;
    this.sendAudio = sendAudio;
    this.recvAudio = recvAudio;
    this.sendString = sendString;
    this.recvString = recvString;
    this.sendBlob = sendBlob;
    this.recvBlob = recvBlob;
  }
}

class channelCapability {
  constructor(audio, video, string, blob) {
    this.audio = audio;
    this.video = video;
    this.string = string;
    this.blob = blob;
  }
}

class User {
  constructor(userName, userRole, userId) {
    this.userName = userName;
    this.userRole = userRole;
    this.userId = userId;
  }
}

class Message {
  constructor(sender, message) {
    this.sender = sender;
    this.message = message;
  }
}

class Media {
  constructor(userName, userId, stream, kind) {
    this.userName = userName;
    this.userId = userId;
    this.stream = stream;
    this.kind = kind;
  }
}

const setupConnections = (data) => {
  initUsersInConnection(data);
  initUsersMessages(data);
  initUsersMedias(data);
  initListeners(data);
  const connectionsElem = document.getElementById("connections");
  connectionsElem.style.display = "block";

  data.forEach((connectionName) => {
    const elem = document.createElement("span");
    elem.classList.add("connection");
    elem.id = "connection-" + connectionName;
    elem.textContent = connectionName;
    elem.onclick = () => {
      changeConnection(connectionName);
    };

    connectionsElem.appendChild(elem);
  });

  if (data.length > 0) {
    const firstConnection = document.getElementById("connection-" + data[0]);
    firstConnection.classList.add("selected");
    selectedConnection = data[0];
  }
};

const setupUserCapabilities = (data) => {
  Object.keys(data).forEach((connectionName) => {
    window.userConnectionCapabilities[connectionName] = new UserCapabilities(
      ...data[connectionName]
    );
  });

  window.updateMessagesUI();
};

const changeConnection = (newSelectedConnection) => {
  if (selectedConnection === newSelectedConnection) {
    return;
  }

  document
    .getElementById("connection-" + selectedConnection)
    .classList.toggle("selected");
  selectedConnection = newSelectedConnection;
  document
    .getElementById("connection-" + selectedConnection)
    .classList.toggle("selected");

  window.updateUsersUI();
  window.updateVideosUI();
  window.updateMessagesUI();
};

const send = () => {
  const inputElem = document.getElementById("input-area");
  const msg = inputElem.value;
  inputElem.value = "";

  window.usersMessages[selectedConnection].push({
    sender: user,
    message: msg,
  });

  window.listeners[selectedConnection].forEach((channel) => {
    channel.send(msg);
  });

  window.updateMessagesUI();
};

const initUsersInConnection = (data) => {
  data.forEach((connectionName) => {
    window.usersInConnection[connectionName] = [];
  });
};

const initUsersMessages = (data) => {
  data.forEach((connectionName) => {
    window.usersMessages[connectionName] = [];
  });
};

const initUsersMedias = (data) => {
  data.forEach((connectionName) => {
    window.usersMedias[connectionName] = [];
  });
};

const initListeners = (data) => {
  data.forEach((connectionName) => {
    window.listeners[connectionName] = [];
  });
};

window.updateUsersUI = () => {
  const usersElem = document.getElementById("users-list");
  usersElem.replaceChildren();

  window.usersInConnection[selectedConnection].forEach((user) => {
    const nameElem = document.createElement("span");
    nameElem.classList.add("user-name");
    nameElem.textContent = user["userName"];

    const roleElem = document.createElement("span");
    roleElem.classList.add("user-role");
    roleElem.textContent = user["userRole"];

    usersElem.appendChild(nameElem);
    usersElem.appendChild(roleElem);
  });
};

window.updateMessagesUI = () => {
  // Clear the input area
  const buttonElem = document.getElementById("send-button");
  const inputElem = document.getElementById("input-area");
  inputElem.value = "";

  // Handle UI affect by user capabilities
  if (window.userConnectionCapabilities[selectedConnection].sendString) {
    inputElem.disabled = false;
    buttonElem.disabled = false;
  } else {
    inputElem.disabled = true;
    buttonElem.disabled = true;
  }

  // Update the messages
  const messagesElem = document.getElementById("messages");
  messagesElem.replaceChildren();

  window.usersMessages[selectedConnection].forEach((msg) => {
    const divElem = document.createElement("div");
    divElem.classList.add("message");

    const senderElem = document.createElement("span");
    senderElem.classList.add("sender");
    senderElem.textContent = msg["sender"];

    const messageElem = document.createElement("span");
    messageElem.textContent = msg["message"];

    divElem.appendChild(senderElem);
    divElem.appendChild(messageElem);

    messagesElem.appendChild(divElem);
  });
};

window.updateVideosUI = () => {
  const videosElem = document.getElementById("videos");
  videosElem.replaceChildren();

  window.usersMedias[selectedConnection].forEach((media) => {
    const userId = media["userId"];
    const otherName = media["userName"];
    const stream = media["stream"];
    const kind = media["kind"];

    const divElem = document.getElementById(userId);
    if (divElem !== null) {
      divElem.getElementsByTagName(kind).srcObject = stream;
    } else {
      const newDivElem = document.createElement("div");
      newDivElem.classList.add("audio-video-container");
      newDivElem.id = userId;
  
      const videoElem = document.createElement("video");
      videoElem.classList.add("video");
      videoElem.autoplay = true;
      videoElem.playsInline = true;
      videoElem.controls = false;

      const audioElem = document.createElement("audio");
      audioElem.classList.add("audio");
      audioElem.autoplay = true;
  
      const nameElem = document.createElement("h3");
      nameElem.classList.add("peer-name");
      nameElem.innerText = otherName;

      if (kind === "audio") {
        audioElem.srcObject = stream;
      } else if (kind === "video") {
        videoElem.srcObject = stream;
      }
  
      newDivElem.appendChild(videoElem);
      newDivElem.appendChild(audioElem);
      newDivElem.appendChild(nameElem);
  
      videosElem.appendChild(newDivElem);
    }
  });
}