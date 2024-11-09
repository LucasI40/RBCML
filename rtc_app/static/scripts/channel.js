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
    console.log(tracks);

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

    // Does the connection have audio capability?
    const hasAudioChannel = channelCapability.audio;
    // Does the peers have matching capability to establish an audio channel?
    const audioMatchingCapability =
      (selfCapability.sendAudio && otherCapability.recvAudio) ||
      (selfCapability.recvAudio && otherCapability.sendAudio);
    this.hasAudioChannel = hasAudioChannel && audioMatchingCapability;

    // Does the connection have video capability?
    const hasVideoChannel = channelCapability.video;
    // Does the peers have matching capability to establish a video channel?
    const videoMatchingCapability =
      (selfCapability.sendVideo && otherCapability.recvVideo) ||
      (selfCapability.recvVideo && otherCapability.sendVideo);
    this.hasVideoChannel = hasVideoChannel && videoMatchingCapability;

    // Does the connection have string capability?
    const hasStringChannel = channelCapability.string;
    // Does the peers have matching capability to establish a string channel?
    const stringMatchingCapability =
      (selfCapability.sendString && otherCapability.recvString) ||
      (selfCapability.recvString && otherCapability.sendString);
    this.hasStringChannel = hasStringChannel && stringMatchingCapability;

    this.neededDevices = {
      camera: false,
      microphone: false,
    };
    if (selfCapability.sendAudio && otherCapability.recvAudio)
      this.neededDevices.microphone = true;
    if (selfCapability.sendVideo && otherCapability.recvVideo)
      this.neededDevices.camera = true;

    tracks
      .ready(this.neededDevices)
      .then((msg) => {
        console.log(msg);
        this.establisChannel(policy);
      })
      .catch((error) => {
        console.log(error);
        this.establisChannel(policy);
      });
  }

  establisChannel(policy) {
    if (
      !(this.hasAudioChannel || this.hasVideoChannel || this.hasStringChannel)
    )
      return;

    if (this.neededDevices.microphone) {
      this.pc.addTrack(tracks.audio, tracks.streams);
    }

    if (this.neededDevices.camera) {
      this.pc.addTrack(tracks.video, tracks.streams);
    }

    if (policy == "proactive") {
      this.createOffer();
    }
  }

  createOffer() {
    this.dataChannel = this.pc.createDataChannel("Channel");

    this.pc.ontrack = (event) => {
      console.log("imhere!!");
      console.log(event);
    };

    this.dataChannel.onmessage = (msg) => {
      const selfCandRecv = this.selfCapability.recvString;
      const otherCandSend = this.otherCapability.sendString;

      if (selfCandRecv && otherCandSend) {
        window.usersMessages[this.connectionName].push(
          new Message(this.otherName, msg.data)
        );

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
    this.pc.ontrack = (track) => {
      if (
        window.usersMedias[this.connectionName][this.otherName] === undefined
      ) {
        window.usersMedias[this.connectionName][this.otherName] = new Media(
          null,
          null
        );
      }

      if (track.track.kind === "audio") {
        const [audioStream] = track.streams;
        window.usersMedias[this.connectionName][this.otherName].audioStream =
          audioStream;
      } else if (track.track.kind === "video") {
        const [videoStream] = track.streams;
        window.usersMedias[this.connectionName][this.otherName].videoStream =
          videoStream;
      }

      window.updateVideosUI();
    };

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
          window.usersMessages[this.connectionName].push(
            new Message(this.otherName, msg.data)
          );

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
  // Update the usersInConnections object
  connection = data["connection"];
  window.usersInConnection[connection] = window.usersInConnection[
    connection
  ].filter((user) => {
    return user["userId"] !== data["other_id"];
  });

  // Update the usersMedias object
  // window.usersMedias[connection] = Object.keys(window.usersMedias[connection]).filter(
  //   (user) => {
  //     return user["userId"] !== data["other_id"];
  //   }
  // );

  window.updateUsersUI();
  window.updateVideosUI();
});
