import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

export default function Profile() {
  const [role, setRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setSeverity("error");
      setOpen(true);
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/change-password`,
        {
          username: user.username,
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      setMessage("Password changed successfully!");
      setSeverity("success");
      setOpen(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
      setSeverity("error");
      setOpen(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f4f4f4",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          bgcolor: "white",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Profile
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Role: {role || "N/A"}
        </Typography>

        <form onSubmit={handleChangePassword}>
          <TextField
            label="Current Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <TextField
            label="Confirm New Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: "16px" }}
          >
            Change Password
          </Button>
        </form>

        {}
        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{ marginTop: "16px" }}
          onClick={logout}
        >
          Logout
        </Button>
      </Paper>

      {}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert severity={severity} onClose={() => setOpen(false)}>
          {message || error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
