import withAuth from '../utils/withAuth.jsx';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css"
import { IconButton, Button, TextField } from '@mui/material';
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from '../contexts/AuthContext.jsx';
import History from './History.jsx';


function Home() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);
  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`)
  }

  return (
    <>
      <div className='navBar'>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Konvo</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={
            () => {
              navigate("/history")
            }
          }>
            <RestoreIcon />
            <p>History</p>
          </IconButton>
          <Button
            className='logoutButton'
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>

      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h3>Where conversations happen live...</h3>
            <br />
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" /> &nbsp; &nbsp;
              <Button onClick={handleJoinVideoCall} variant="contained" style={{}}>Join</Button>

            </div>
          </div>
        </div>

        <div className="rightPanel">
          <img src="img.jpg" alt="" />
        </div>
      </div>

    </>

  );
}

export default withAuth(Home);