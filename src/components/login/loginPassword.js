import React, { useState, useContext } from "react";
import axios from "axios";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ButtonComponent from "../buttons/button";
import WOW from "../../assets/images/wow.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

export default function Password({ onBackClick, username }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_API_URL;
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${URL}/user/loginUser`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        const token = response.data.token;
        login(token);
        localStorage.setItem("username", username);
        localStorage.setItem("name", response.data.name);
        const role = response.data.role;
        const redirectTo = `/dashboard-${role}`;
        navigate(redirectTo);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login.");
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: "#E3E3E3",
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <IconButton
          onClick={onBackClick}
          style={{ position: "absolute", left: "10px", top: "10px" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <div className="form">
          <img src={WOW} alt="wow" />

          <div className="password">
            <TextField
              id="outlined-basic"
              label="Password"
              variant="outlined"
              style={{ width: "460px", minWidth: "250px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
          </div>
          <span>
            <ButtonComponent
              variant="contained"
              text={"Login"}
              onClick={handleLogin}
            />
          </span>
          <p>Contact admin if you're unable to login</p>
        </div>
      </Box>
    </React.Fragment>
  );
}
