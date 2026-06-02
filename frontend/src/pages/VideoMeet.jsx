import React, { useEffect, useRef, useState } from 'react';
import "../styles/VideoMeet.css";
import { TextField, Button, Typography, Container, Box, Grid } from '@mui/material';
// import { connectToSocket } from '../../../backend/src/controllers/socketManager';

const server_url = 'localhost://8000';

var connections = {};

const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun.stun.l.google.com:19302" }
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

  // for actions in local system in other clients system
  let getUserMediaSuccess = (stream) =>{

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

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    // connectToSocketServer();
  }


  return (
    <div>
      {askForUsername === true ?
        <div>
          <h2>Enter into Lobby</h2>
          <TextField id="outlined-basic" value={username} onChange={e => setUsername(e.target.value)} label="username" variant="outlined" />
          <Button variant="contained" >Connect</Button>

          <div>
            <video ref={localVideoRef} autoPlay muted playsInline></video>
          </div>
        </div> : <></>
      }
    </div>
  );
}

export default VideoMeet;