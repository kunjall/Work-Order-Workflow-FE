import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Container,
  CssBaseline,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WOW from "../../assets/images/wow.png";

export default function Password({ onBackClick, username }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const URL = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${URL}/user/loginUser`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        login(response.data.token);
        navigate(`/dashboard-${response.data.role}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login.");
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <IconButton
        onClick={onBackClick}
        sx={{ position: "absolute", left: 16, top: 1 }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <img
          src={WOW}
          alt="WOW Logo"
          style={{
            width: "110px",
            height: "auto",
            objectFit: "contain",
            marginBottom: "10px",
          }}
        />
      </Box>

      <form onSubmit={handleLogin} style={{ width: "100%" }}>
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 1, padding: "12px", fontSize: "16px" }}
        >
          Login
        </Button>
      </form>

      <Typography variant="body2" color="textSecondary" mt={2}>
        Contact admin if you're unable to login.
      </Typography>
    </React.Fragment>
  );
}
