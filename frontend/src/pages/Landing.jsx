import React from 'react';
import "../App.css";
import { Link, useNavigate  } from "react-router-dom";




function LandingPage() {
  const router = useNavigate();
  return (
    <div className='LandingPageContainer'>
      <nav>
        <div className="navHeader">
          <h2>Konvo</h2>
        </div>

        <div className="navlist">
          <p onClick={() => {
            router("/aljy67")
          }}>Join as Guest</p>
          <p onClick={() => {
            router("/auth")

          }}>Register</p>
          <div role="button" onClick={() => {
            router("/auth")

          }}>Login</div>

        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1><span style={{ color: "#F6A196" }}>Connect</span> with your loved ones</h1>
          <p>Cover the distance by Konvo</p><br />
          <div role="button" className='getStartedButton'>
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="Video Call" />
        </div>
      </div>




    </div>



  );
}

export default LandingPage;
