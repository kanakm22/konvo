import React, { useEffect, useRef, useState } from 'react';
import styles from "../styles/VideoMeet.module.css";
import { TextField, Button, Typography, Container, Box, Grid, IconButton, Badge } from '@mui/material';
// import { connectToSocket } from '../../../backend/src/controllers/socketManager';
import { io } from 'socket.io-client';
import VideoCamIcon from "@mui/icons-material/VideoCam"
import VideoCamOffIcon from "@mui/icons-material/VideoCamOff"
import CallEndIcon from "@mui/icons-material/CallEnd"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from 'react-router-dom';
import server from '../enviroment.js';



const server_url = server;

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

  const [meetingCode, setMeetingCode] = useState("");
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [message, setMessage] = useState("");
  let [messages, setmessages] = useState([]);
  let [newMessage, setNewMessage] = useState(0);
  let [username, setUsername] = useState("");
  let [askForUsername, setAskForUsername] = useState(true);

  const videoRef = useRef([]);

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
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = ctx.createMediaStreamDestination();

    oscillator.connect(dst);

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
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


  // useEffect(() => {
  //   if (video !== undefined && audio !== undefined) {
  //     getUserMedia();
  //   }
  // }, [audio, video]);

  useEffect(() => {
    getPermissions();
  }, [])

  // let getUserMediaSuccess = (stream) => {
  //   try {
  //     window.localStream.getTracks().forEach(track => track.stop())

  //   } catch (e) {
  //     console.log(e);

  //   }
  //   window.localStream = stream;
  //   localVideoRef.current.srcObject = stream;

  //   for (let id in connections) {
  //     if (id === socketId.current) continue;

  //     connections[id].addStream(window.localStream)
  //     connections[id].createOffer().then((description) => {
  //       connections[id].setLocalDescription(description)
  //         .then(() => {
  //           socketId.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
  //         })
  //         .catch(e => console.log(e))

  //     })
  //   }

  //   stream.getTracks().forEach(track => track.onended = () => {
  //     setVideo(false);
  //     setAudio(false);

  //     try {
  //       let tracks = localVideoRef.current.srcObject.getTracks()
  //       tracks.forEach(track => track.stop())

  //     } catch (e) {
  //       console.log(e);
  //     }

  //     let blacksilence = (...args) => new MediaStream([black(...args), silence()])
  //     window.localStream = blacksilence();
  //     localVideoRef.current.srcObject = window.localStream;

  //     for (let id in connections) {
  //       connections[id].addStream(window.localStream)
  //       connections[id].createOffer().then((description) => {
  //         connections[id].setLocalDescription(description)
  //           .then(() => {
  //             socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
  //           }).catch(e => console.log(e));
  //       })
  //     }
  //   })
  // }

  let getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
      }
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;

    if (localVideoRef && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketId.current) continue;

      const senders = connections[id].getSenders();
      window.localStream.getTracks().forEach(track => {
        const sender = senders.find(s => s.track && s.track.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          connections[id].addTrack(track, window.localStream);
        }
      });

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
          })
          .catch(e => console.log(e));
      }).catch(e => console.log(e));
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current?.srcObject?.getTracks();
        if (tracks) {
          tracks.forEach(track => track.stop());
        }
      } catch (e) {
        console.log(e);
      }

      let blacksilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blacksilence();

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }

      for (let id in connections) {
        if (id === socketId.current) continue;

        const senders = connections[id].getSenders();
        window.localStream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            connections[id].addTrack(track, window.localStream);
          }
        });

        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
            }).catch(e => console.log(e));
        }).catch(e => console.log(e));
      }
    });
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketId.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer().then((description) => {
                connections[fromId].setLocalDescription(description).then(() => {
                  socketRef.current.emit('signal', fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
                }).catch(e => console.log(e))
              }).catch(e => console.log(e))
            }
          }).catch(e => console.log(e))
      } else if (signal.ice) {
        if (connections[fromId].remoteDescription) {
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch(e => console.log(e))
        }
      }
    }
  }




  let addMessage = (data, sender, socketIdSender) => {
    setMessage((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);

    if (socketIdSender !== socketId.connect) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }

  }

  let connectToSocketServer = () => {
  videoRef.current = [];
  socketRef.current = io.connect(server_url, { secure: false });
  socketRef.current.on('signal', gotMessageFromServer);
  socketRef.current.on('connect', () => {
    socketRef.current.emit("join-call", window.location.href)
    socketId.current = socketRef.current.id;
    
    socketRef.current.on('user-left', (id) => {
      setVideos((videos) => videos.filter((video) => video.socketId !== id))
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
            setVideos(videos => {
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
            console.log(e)
          }
          
          connections[id2].createOffer().then((description) => {
            connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
              })
              .catch(e => console.log(e))
          })
        }
      }
    })
  })
}

  let getMedia = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (userMediaStream) {
        window.localStream = userMediaStream;

        setVideo(true);
        setAudio(true);
        setAskForUsername(false);

        connectToSocketServer();
      }
    } catch (err) {
      console.log("Error accessing media devices:", err);
    }
  };

  let routeTo = useNavigate();


  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  let handleVideo = () => {
    if (window.localStream) {
      const videoTrack = window.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideo(videoTrack.enabled);
      }
    }
  };

  let handleAudio = () => {
    if (window.localStream) {
      const audioTrack = window.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudio(audioTrack.enabled);
      }
    }
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId.current) continue;

      connections[id].addStream(window.localStream)
      connections[id].createOffer()
        .then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
            })
            .catch(e => console.log(e))
        })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop())
      } catch (e) {
        console.log(e);
      }
      let blacksilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blacksilence();
      localVideoRef.current.srcObject = window.localStream;

      getUserMedia();

    })


  }

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((screen = {}))
          .catch((e) => console.log(e))
      }
    }
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen])

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    } catch (e) { }
    routeTo("/home");
  }

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  }
  let closeChat = () => {
    setModal(false);
  }
  let handleMessage = (e) => {
    setMessage(e.target.value);
  }

  let handleScreen = () => {
    setScreen(!screen);
  }

  let sendMessage = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (message.trim() === "") return;

    socketRef.current.emit("chat-message", message, username);

    setmessages((prev) => [...prev, { sender: username || "You", message: message }]);
    setMessage("");
  };

  const saveMeetingToHistory = async (code) => {
    try {
      console.log("1. Sending this to backend:", { token: localStorage.getItem("token"), meeting_code: code });
      
      let response = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: code
      });
      
      console.log("2. Backend successfully saved:", response.data);
    } catch (err) {
      console.log("3. Backend rejected it. Error:", err.response?.data || err);
    }
  }

//   useEffect(() => {
//     const startMeeting = async () => {
//         await connectWebRTC();
//         saveMeetingToHistory(meetingCodeFromUrl);
//     }
    
//     startMeeting();
// }, [])







  return (
    <div>

      {askForUsername === true ?

        <div>


          <h2>Enter into Lobby </h2>
          <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
          <Button variant="contained" onClick={connect}>Connect</Button>


          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>

        </div> :


        <div className={styles.meetVideoContainer}>

          {showModal ? <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
              <h1>Chat</h1>

              <div className={styles.chattingDisplay}>
                {messages.map((item, index) => {
                  return (
                    <div style={{ marginBottom: "20px" }} key={index}>
                      <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                      <p>{item.message}</p>
                    </div>
                  )
                })}
              </div>

              <div className={styles.chattingArea}>
                <TextField
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  id="standard-basic"
                  label="Chat"
                  variant="standard"
                  sx={{
                    '& .MuiInput-underline:after': {
                      borderBottomColor: '#1f0029',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1f0029',
                    },
                  }}
                />
                <Button variant="contained" onClick={() => sendMessage()}>Send</Button>
              </div>

            </div>
          </div> : <></>}




          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {(video === true) ? <VideoCamIcon /> : <VideoCamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ?
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton> : <></>}

            <Badge badgeContent={newMessage} max={999} color='orange'>
              <IconButton onClick={() => setShowModal(!showModal)} style={{ color: "white" }}>
                <ChatIcon />                        </IconButton>
            </Badge>

          </div>


          {/* <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video> */}
          <video
            className={styles.meetUserVideo}
            ref={ref => {
              if (ref && window.localStream) {
                ref.srcObject = window.localStream;
              }
              localVideoRef.current = ref;
            }}
            autoPlay
            muted
            playsInline
          />

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video

                  data-socket={video.socketId}
                  ref={ref => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                >
                </video>
              </div>

            ))}

          </div>

        </div>

      }

    </div>
  )
}

export default VideoMeet;