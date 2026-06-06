import './App.css'
import LandingPage from './pages/Landing';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Auth from './pages/Auth';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeet from './pages/VideoMeet';
import Home from './pages/Home';
import History from './pages/History';


function App() {
  return (
    <>

      <Router>
        <AuthProvider>

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/:url" element={<VideoMeet />} />
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </AuthProvider>

      </Router>

    </>
  )
}

export default App;