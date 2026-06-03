import React, { useEffect, useRef, useState } from 'react';
import "../styles/VideoMeet.css";
import { TextField, Button, Typography, Container, Box, Grid } from '@mui/material';
// import { connectToSocket } from '../../../backend/src/controllers/socketManager';
import { io } from 'socket.io-client';

const server_url = 'http://localhost:8000';

var connections = {};

const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}

function VideoMeet() {
  var socketRef = useRef();
  let socketId = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [message, setMessage] = useState("");
  let [messages, setmessages] = useState([]);
  let [newMessage, setNewMessage] = useState(0);
  let [username, setUsername] = useState("");
  let [askForUsername, setAskForUsername] = useState(true);

  const videoRef = useRef();

  let [videos, setVideos] = useState([]);


  // if(isChrome === false){

  // }

  const getPermissions = async () => {
    try {
      // video
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true })

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      // audio
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (audioPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      // screen sharing
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }


      const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (userMediaStream) {
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
      }

    } catch (err) {
      console.log(err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  }

  let silence = () => {
    let stx = new AudioContext()
    let oscillator = createContext.createOscilltor();

    let dst = oscillator.connect(createContext.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  let black = ({ width = 640, height = 780 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });

    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })

  }


  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {
          window.localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(e => { console.log(e) });
    } else {
      try {
        let tracks = localVideoRef.current?.srcObject?.getTracks();
        if (tracks) {
          tracks.forEach(track => track.stop());
        }
      } catch (e) {
        console.log(e);
      }
    }
  }


  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  useEffect(() => {
    getPermissions();
  }, [])

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())

    } catch (e) {
      console.log(e);

    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId.current) continue;

      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketId.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          })
          .catch(e => console.log(e))

      })
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())

      } catch (e) {
        console.log(e);
      }

      let blacksilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blacksilence();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
            }).catch(e => console.log(e));
        })
      }
    })
  }

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketId.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromid].createAnswer().then((description) => {
                connections[fromId].setLocalDescription(description).then(() => {
                  socketId.current.emit('signal', fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
                }).catch(e => console.log(e))
              }).catch(e => console.log(e))
            }
          }).catch(e => console.log(e))
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))

      }
    }

  }

  let addMessage = () => {

  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);
    socketRef.current.on('connect', () => {
      socketRef.current.emit("join-call", window.location.href)
      socketId.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage)
      socketRef.current.on('user-left', (id) => {
        setVideos((videos) => videos.filter((video) => { video.socketId !== id }))
      })
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId)
            if (videoExists) {
              setVideo(videos => {
                const updateVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                )
                videoRef.current = updateVideos;
                return updateVideos;
              })
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsInline: true,
              }
              setVideos(videos => {
                const updatedVideos = [...videos, newVideo]
                videoRef.current = updatedVideos;
                return updatedVideos;
              })

            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);

          } else {
            let blacksilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blacksilence();
            connections[socketListId].addStream(window.localStream);
          }
        })
        if (id === socketId.current) {
          for (let id2 in connections) {
            if (id2 === socketId.current) continue

            try {
              connections[id2].addStream(window.localStream)

            } catch (e) {

            }
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2), JSON.stringify({ "sdp": connections[id2].localDescription })
                })
                .catch(e => console.log(e))

            })
          }
        }
      })
    })
  }

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }


  return (
    <div>
      {askForUsername === true ?
        <div>
          <h2>Enter into Lobby</h2>
          <TextField id="outlined-basic" value={username} onChange={e => setUsername(e.target.value)} label="username" variant="outlined" />
          <Button variant="contained" onClick={getMedia}>Connect</Button>

          <div>
            <video ref={localVideoRef} autoPlay muted playsInline></video>
          </div>
        </div> : <>
        <video ref={localVideoRef} autoPlay muted></video>
        <div key={video.socketId}>

        </div>
        </>
      }
    </div>
  );
}

export default VideoMeet;