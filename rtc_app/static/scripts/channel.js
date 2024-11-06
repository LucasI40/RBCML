const channels = {}; // channelName -> Channel

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
    this.connectionName = channelName.split(":")[0];
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
    const hasStringChannel = channelCapability.string;
    // Does the peers have matching capability to establish  a channel?
    const stringMatchingCapability =
      (selfCapability.sendString && otherCapability.recvString) ||
      (selfCapability.recvString && otherCapability.sendString);
    console.log(stringMatchingCapability);
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
      const selfCandRecv = this.selfCapability.recvString;
      const otherCandSend = this.otherCapability.sendString;

      if (selfCandRecv && otherCandSend) {
        window.usersMessages[this.connectionName].push({
          sender: this.otherName,
          message: msg.data,
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
    };

    this.pc.createOffer().then((offer) => {
      this.pc.setLocalDescription(offer);
      socket.emit("send_offer", {
        channelName: this.channelName,
        to: this.otherSocketId,
        offerSdp: offer,
      });
    });
  }

  createAnswer(offer) {
    this.pc.onicecandidate = (e) => {
      socket.emit("SDP", {
        channelName: this.channelName,
        to: this.otherSocketId,
        sdp: this.pc.localDescription,
      });
    };

    this.pc.ondatachannel = (e) => {
      this.dataChannel = e.channel;
      this.pc.dataChannel = e.channel;
      this.pc.dataChannel.onmessage = (msg) => {
        const selfCandRecv = this.selfCapability.recvString;
        const otherCandSend = this.otherCapability.sendString;

        if (selfCandRecv && otherCandSend) {
          window.usersMessages[this.connectionName].push({
            sender: this.otherName,
            message: msg.data,
          });

          window.updateMessagesUI();
        }
      };
      this.pc.dataChannel.onopen = (e) => {
        console.log("Connection opened");
      };
    };

    this.pc.setRemoteDescription(offer);

    this.pc.createAnswer().then((answer) => {
      this.pc.setLocalDescription(answer);
    });
  }

  setRemoteDescription(description) {
    this.pc.setRemoteDescription(description).catch((e) => {
      // TODO?: handle this error
    });
  }

  send(msg) {
    const selfCanSend = this.selfCapability.sendString;
    const otherCanRecv = this.otherCapability.recvString;

    if (selfCanSend && otherCanRecv) {
      this.dataChannel.send(msg);
    }
  }
}

socket.on("create_answer", (data) => {
  offerSdp = data["offer_sdp"];
  channelName = data["channel_name"];
  channels[channelName].createAnswer(offerSdp);
});

socket.on("SDP", (data) => {
  sdp = data["sdp"];
  channelName = data["channel_name"];
  channels[channelName].setRemoteDescription(sdp);
});

socket.on("setup_channel", (data) => {
  console.log(data);

  // Update the userInConnections object
  connection = data["connection"];
  window.usersInConnection[connection].push({
    userName: data["other_name"],
    userRole: data["other_role"],
    userId: data["other_id"],
  });

  let channelName = data["connection"];
  // Proactive peer come first in channel name, making both peers agree on channelName
  if (data["signaling_policy"] === "proactive") {
    channelName += ":" + user + ":" + data["other_name"];
  } else {
    channelName += ":" + data["other_name"] + ":" + user;
  }
  const channel = new Channel(
    channelName,
    new channelCapability(...data["channel_capability"]),
    window.userConnectionCapabilities[connection],
    new UserCapabilities(...data["other_capability"]),
    data["other_name"],
    data["other_id"],
    data["signaling_policy"]
  );
  channels[channelName] = channel;

  window.updateUsersUI();
});

socket.on("release_channel", (data) => {
  // Update the userInConnections object
  connection = data["connection"];
  window.usersInConnection[connection] = window.usersInConnection[
    connection
  ].filter((user) => {
    return user["userId"] !== data["other_id"];
  });

  window.updateUsersUI();
});
