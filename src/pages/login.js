import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ButtonComponent from "../components/buttons/button";
import Password from "../components/login/loginPassword";
import "../assets/styles/login.css";
import WOW from "../assets/images/wow.png";
import { AuthContext } from "../context/authContext";
import { Fade } from "@mui/material";

export default function Login() {
  const [loginMethod, setLoginMethod] = useState(null);
  const [username, setUsername] = useState("");
  const { user, logout } = useContext(AuthContext);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (username.trim()) {
      setLoginMethod("password");
      setError("");
    } else {
      setError("Username is required");
    }
  };

  const handleBackClick = () => {
    setLoginMethod(null);
  };

  // Handle redirection after login
  if (user) {
    const userRoles = user.role ? user.role.split(";") : [];

    if (
      userRoles.includes("admin") ||
      userRoles.includes("mm") ||
      userRoles.includes("mb") ||
      userRoles.includes("expense") ||
      userRoles.includes("mwo") ||
      userRoles.includes("inv") ||
      userRoles.includes("cwo")
    ) {
      navigate("/actions");
    } else {
      return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>
            You are logged in but don't have permissions to access this page.
          </p>
          <button onClick={logout}>Logout</button>
        </div>
      );
    }
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f5f5f5",
        }}
      >
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            width: "100%",
            maxWidth: "500px",
            minHeight: "40vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            flex: 1,
          }}
        >
          <Fade in={!loginMethod} timeout={500}>
            <div
              className="form"
              style={{
                display: loginMethod ? "none" : "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <img
                src={WOW}
                alt="wow"
                style={{
                  width: "150px",
                  height: "auto",
                  objectFit: "contain",
                  marginBottom: "25px",
                }}
              />
              <TextField
                id="outlined-basic"
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={!!error}
                helperText={error}
                sx={{ marginBottom: "20px", fontSize: "16px" }}
              />
              <ButtonComponent
                variant="contained"
                text="Use Password"
                onClick={handleLoginClick}
                sx={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "16px",
                  marginBottom: "15px",
                }}
              />
              <p style={{ marginTop: "15px", fontSize: "14px", color: "#666" }}>
                Contact admin if you're unable to login
              </p>
            </div>
          </Fade>

          <Fade in={loginMethod === "password"} timeout={500}>
            <div
              className="transition-wrapper"
              style={{
                display: loginMethod === "password" ? "block" : "none",
                width: "100%",
              }}
            >
              <Password
                onBackClick={handleBackClick}
                username={username.toLowerCase()}
              />
            </div>
          </Fade>
        </Box>
      </div>
    </React.Fragment>
  );
}
