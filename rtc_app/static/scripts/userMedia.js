class Tracks {
  constructor() {
    this.streams = null;
    this.audio = null;
    this.video = null;

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((streams) => {
        this.streams = streams;
        this.audio = streams.getAudioTracks()[0];

        const audioElem = document.getElementById("user-audio");
        audioElem.srcObject = streams;
      })
      .catch((error) => {
        this.audio = "not allowed";
      });

    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((streams) => {
        this.streams = streams;
        this.video = streams.getVideoTracks()[0];

        const videoElem = document.getElementById("user-video");
        videoElem.srcObject = streams;
      })
      .catch((error) => {
        this.video = "not allowed";
      });
  }

  async ready(neededDevices) {
    const result = await new Promise((resolve, reject) => {
      const verifier = () => {
        if (neededDevices.camera && neededDevices.microphone) {
          // If both camera and mirophone are needed
          if (this.audio === "not allowed" && this.video === "not allowed") {
            reject("User microphone and camera not allowed");
          } else if (this.audio === null || this.video === null) {
            setTimeout(verifier, 1000);
          } else if (this.audio === "not allowed") {
            resolve("User camera allowed");
          } else if (this.video === "not allowed") {
            resolve("User microphone allowed");
          } else {
            resolve("User microphone and camera allowed");
          }
        } else if (!neededDevices.camera && neededDevices.microphone) {
          // If only the microphone are needed
          if (this.audio === "not allowed") {
            reject("User microphone not allowed");
          } else if (this.audio !== null) {
            resolve("User microphone allowed");
          } else {
            setTimeout(verifier, 1000);
          }
        } else if (neededDevices.camera && !neededDevices.microphone) {
          // If only the camera are needed
          if (this.video === "not allowed") {
            reject("User camera not allowed");
          } else if (this.video !== null) {
            resolve("User camera allowed");
          } else {
            setTimeout(verifier, 1000);
          }
        } else {
          // !neededDevices.camera && !neededDevices.microphone
          // Neither camera or microphone are needed
          resolve("No device needed");
        }
      };

      setTimeout(verifier, 1000);
    });

    return result;
  }
}

const tracks = new Tracks();

const toggleUserPhone = () => {
  const audioUIElem = document.getElementById("user-audio-ui");
  audioUIElem.classList.toggle("disabled");

  tracks.audio.enabled = !tracks.audio.enabled;
};

const toggleUserCamera = () => {
  const videoUIElem = document.getElementById("user-video-ui");
  videoUIElem.classList.toggle("disabled");

  tracks.video.enabled = !tracks.video.enabled;
};
