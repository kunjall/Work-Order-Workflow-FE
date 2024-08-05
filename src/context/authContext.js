import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`${URL}/user/validateToken`, {
            headers: { Authorization: `${token}` },
          });
          if (response.status === 200) {
            const decoded = jwtDecode(token);
            setUser({ ...decoded, authToken: token });
            setAuthToken(token);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Token validation error:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [URL]);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({ ...decoded, authToken: token });
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    navigate("/login");
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(`${URL}/user/logout`, null, {
          headers: { Authorization: `${authToken}` },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
