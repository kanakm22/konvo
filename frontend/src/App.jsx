
import './App.css'
import LandingPage from './pages/Landing';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Authentication from './pages/Authentication';

function App() {
  

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
