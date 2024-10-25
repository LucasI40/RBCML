const channels = {};   // channelName -> Channel

class Channel {
  constructor(
    channelName,
    channelCapability,
    selfCapability,
    otherCapability,
    otherName,
    otherSocketId,
    policy
  ) {
    this.channelName = channelName;
    this.connectionName = "connection-" + channelName.split(":")[0];
    this.channelCapability = channelCapability;
    this.selfCapability = selfCapability;
    this.otherCapability = otherCapability;
    this.otherName = otherName;
    this.otherSocketId = otherSocketId;

    this.dataChannel = null;

    window.listeners[this.connectionName].push(this);

    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    this.pc = new RTCPeerConnection(configuration);

    // Does the connection have string capability?
    const hasStringChannel = channelCapability[2];
    // Does the peers have matching capability to establish  a channel?
    const stringMatchingCapability =
      (selfCapability[4] && otherCapability[5]) ||
      (selfCapability[5] && otherCapability[4]);
    this.hasStringChannel = hasStringChannel && stringMatchingCapability;

    this.establishStringChannel(policy);
  }

  establishStringChannel(policy) {
    if (!this.hasStringChannel) return;

    if (policy == "proactive") {
      this.createOffer();
    }
  }

  createOffer() {
    this.dataChannel = this.pc.createDataChannel("Channel");

    this.dataChannel.onmessage = (msg) => {
      const selfCandRecv = this.selfCapability[5];
      const otherCandSend = this.otherCapability[4];

      if (selfCandRecv && otherCandSend) {
        window.usersMessages[this.connectionName].push({
          sender: this.otherName,
          message: msg.data
        });

        window.updateMessagesUI();
      }
    };

    this.dataChannel.onopen = (e) => {
      console.log("Connection opened");
    };

    this.pc.onicecandidate = (e) => {
      socket.emit("SDP", {
        channelName: this.channelName,
        to: this.otherSocketId,
        sdp: this.pc.localDescription,
      });
      console.log(this.pc.localDescription);
    };

    this.pc.createOffer().then((offer) => {
      this.pc.setLocalDescription(offer);
    });
  }

  createAnswer() {
    this.pc.onicecandidate = (e) => {
      socket.emit("SDP", {
        channelName: this.channelName,
        to: this.otherSocketId,
        sdp: this.pc.localDescription,
      });
      console.log(this.pc.localDescription);
    };

    this.pc.ondatachannel = (e) => {
      this.dataChannel = e.channel;
      this.pc.dataChannel = e.channel;
      this.pc.dataChannel.onmessage = (msg) => {
        const selfCandRecv = this.selfCapability[5];
        const otherCandSend = this.otherCapability[4];

        if (selfCandRecv && otherCandSend) {
          window.usersMessages[this.connectionName].push({
            sender: this.otherName,
            message: msg.data
          });

          window.updateMessagesUI();
        }
      };
      this.pc.dataChannel.onopen = (e) => {
        console.log("Connection opened");
      };
    };

    this.pc.createAnswer().then((answer) => {
      this.pc.setLocalDescription(answer);
    });
  }

  setRemoteDescription(description) {
    this.pc.setRemoteDescription(description);
  }

  send(msg) {
    const selfCanSend = this.selfCapability[4];
    const otherCanRecv = this.otherCapability[5];

    if (selfCanSend && otherCanRecv) {
      this.dataChannel.send(msg);
    }
  }
}

socket.on("SDP", (data) => {
  sdp = data["sdp"];
  channelName = data["channel_name"];

  if (sdp.type == "offer") {
    channels[channelName].setRemoteDescription(sdp);
    channels[channelName].createAnswer();
  } else {
    // if (sdp.type == "answer")
    channels[channelName].setRemoteDescription(sdp);
  }
  console.log(data);
});

socket.on("setup_channel", (data) => {
  console.log(data);

  // Update the userInConnections object
  connection = "connection-" + data["connection"];
  window.usersInConnection[connection].push({
    userName: data["other_name"],
    userRole: data["other_role"],
    userId: data["other_id"],
  });

  let channelName = data["connection"];
  // Proactive peer come first in channel name, making both peers agree on this
  if (data["signaling_policy"] === "proactive") {
    channelName += ":" + data["peer_name"] + ":" + data["other_name"];
  } else {
    channelName += ":" + data["other_name"] + ":" + data["peer_name"];
  }
  // const channelName = data["connection"] + ":" + data["peer_name"] + ":" + data["other_name"];
  const channel = new Channel(
    channelName,
    data["channel_capability"],
    data["peer_capability"],
    data["other_capability"],
    data["other_name"],
    data["other_id"],
    data["signaling_policy"]
  );
  channels[channelName] = channel;

  window.updateUsersUI();
});

socket.on("release_channel", (data) => {
  // console.log(data);

  // Update the userInConnections object
  connection = "connection-" + data["connection"];
  window.usersInConnection[connection] = window.usersInConnection[
    connection
  ].filter((user) => {
    return user["userId"] !== data["other_id"];
  });

  window.updateUsersUI();
});
