import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const serverUrl = "http://localhost:8000/api/v1/users";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const handleRegister = async (name, username, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${serverUrl}/register`, { name, username, password });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (username, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${serverUrl}/login`, { username, password });
            if (response.data.token) {
                setToken(response.data.token);
                return { success: true };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Login failed" };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setToken("");
    };

    return (
        <AuthContext.Provider value={{ token, loading, handleRegister, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);