import React from "react";
import { useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { handleLogin, handleRegister, loading } = useContext(AuthContext);

  

  const handleSubmit = async (e) => { 
    e.preventDefault();

    if (isLogin) {
      const res = await handleLogin(username, password);
      if (res.success) {
        localStorage.setItem("token", res.token);
        navigate("/home");
      } else {
        setError(res.message);
      }
    } else {
      const res = await handleRegister(name, username, password);
      if (res.success) {
        setIsLogin(true);
        setName("");
        setPassword("");
        navigate("/home");
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "sans-serif" }}>

      <div style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        backgroundColor: "#ffffff"
      }}>
        <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", alignItems: "center" }}>

          <div style={{
            backgroundColor: "#0f172a",
            color: "white",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "20px", color: "#0f172a" }}>
            Welcome back
          </h1>

          <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: isLogin ? "#0f172a" : "#e2e8f0",
                color: isLogin ? "white" : "#0f172a",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                padding: "8px 16px",
                backgroundColor: !isLogin ? "#0f172a" : "#e2e8f0",
                color: !isLogin ? "white" : "#0f172a",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "100%", gap: "25px" }}>

            {error && <p style={{ color: "red", margin: 0, textAlign: "center" }}>{error}</p>}

            {!isLogin && (
              <div style={{ position: "relative" }}>
                <label style={{ position: "absolute", top: "-10px", left: "12px", backgroundColor: "white", padding: "0 4px", fontSize: "0.75rem", color: "#0f172a", fontWeight: "600" }}>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1.5px solid #0f172a", boxSizing: "border-box", fontSize: "1rem" }}
                />
              </div>
            )}

            <div style={{ position: "relative" }}>
              <label style={{ position: "absolute", top: "-10px", left: "12px", backgroundColor: "white", padding: "0 4px", fontSize: "0.75rem", color: "#0f172a", fontWeight: "600" }}>Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1.5px solid #0f172a", boxSizing: "border-box", fontSize: "1rem" }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{ position: "absolute", top: "-10px", left: "12px", backgroundColor: "white", padding: "0 4px", fontSize: "0.75rem", color: "#0f172a", fontWeight: "600" }}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "16px", borderRadius: "8px", border: "1.5px solid #cbd5e1", boxSizing: "border-box", fontSize: "1rem" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

        </div>
      </div>

      <div style={{
        flex: "3",
        backgroundColor: "#f8fafc",
        display: "block"
      }}></div>

    </div>
  );
}