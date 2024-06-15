import React, { useState, useContext } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import ButtonComponent from "../components/buttons/button";
import OTP from "../components/login/loginOTP";
import Password from "../components/login/loginPassword";
import "../assets/styles/login.css";
import WOW from "../assets/images/wow.png";
import { AuthContext } from "../context/authContext";

export default function Login() {
  const [loginMethod, setLoginMethod] = useState(null);
  const [username, setUsername] = useState("");
  const { user, logout } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleLoginClick = () => {
    if (username) {
      setLoginMethod("password");
      setError("");
    } else {
      setError("Username is required");
    }
  };

  const handleOtpClick = () => {
    if (username) {
      setLoginMethod("otp");
      setError("");
    } else {
      setError("Username is required");
    }
  };

  const handleBackClick = () => {
    setLoginMethod(null);
  };

  return !user ? (
    <React.Fragment>
      <CssBaseline />
      <div className="container">
        <Container maxWidth="sm">
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
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!loginMethod ? (
              <div className="form">
                <img src={WOW} alt="wow" />
                <div className="username">
                  <TextField
                    id="outlined-basic"
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={!!error}
                    helperText={error}
                  />
                </div>
                <span>
                  <ButtonComponent
                    variant="contained"
                    text="Use Password"
                    onClick={handleLoginClick}
                  />
                  <ButtonComponent
                    variant="contained"
                    text="Use OTP"
                    onClick={handleOtpClick}
                  />
                </span>
                <p>Contact admin if you're unable to login</p>
              </div>
            ) : (
              <div className="transition-wrapper visible">
                {loginMethod === "password" && (
                  <Password onBackClick={handleBackClick} username={username} />
                )}
                {loginMethod === "otp" && <OTP onBackClick={handleBackClick} />}
              </div>
            )}
          </Box>
        </Container>
      </div>
    </React.Fragment>
  ) : (
    <>
      Already Logged In
      <button onClick={logout}>Logout</button>
    </>
  );
}
