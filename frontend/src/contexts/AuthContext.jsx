import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const serverUrl = "http://localhost:8000/api/v1/users";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${serverUrl}`
})


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
  // const getHistoryOfUser = async () => {
  //   try {
  //     let request = await client.get("/get_all_activity", {
  //       params: {
  //         token: localStorage.getItem("token")
  //       }
  //     });
  //     return request.data.history;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get_all_activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  }


  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode
      });
      return request
    } catch (e) {
      throw e;
    }
  }

   const handleLogout = () => {
        setToken("");
    };


  const data = {
      addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
  }

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  )

}