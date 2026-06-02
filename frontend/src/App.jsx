import './App.css'
import LandingPage from './pages/Landing';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"; 
import Auth from './pages/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';


function App() {
  return (
    <>
    <AuthProvider>
      <Router>
        
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        
      </Router>
      </AuthProvider>
    </>
  )
}

export default App;