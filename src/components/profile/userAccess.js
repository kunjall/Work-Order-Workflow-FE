import { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Paper,
  MenuItem,
} from "@mui/material";

export default function AdminPanel() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState("success");

  const [newUser, setNewUser] = useState({
    username: "",
    role: "",
    status: "Active",
    name: "",
    company: "",
  });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/reset-password`,
        { username }
      );
      setNewPassword(res.data.newPassword);
      setMessage("Password reset successfully.");
      setSeverity("success");
      setOpen(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting password");
      setSeverity("error");
      setOpen(true);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/user/create`, newUser);

      setMessage("User created successfully!");
      setSeverity("success");
      setOpen(true);
      setNewUser({
        username: "",
        role: "",
        status: "Active",
        name: "",
        company: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating user.");
      setSeverity("error");
      setOpen(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "91.5vh",
        bgcolor: "#f4f4f4",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
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
          Reset User Password
        </Typography>
        <form onSubmit={handleResetPassword}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="error"
            fullWidth
            sx={{ marginTop: "16px" }}
          >
            Reset Password
          </Button>
        </form>
        {newPassword && (
          <Typography
            variant="body1"
            fontWeight="bold"
            color="error"
            sx={{ marginTop: "16px" }}
          >
            New Password: {newPassword}
          </Typography>
        )}
      </Paper>

      {}
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
          Create New User
        </Typography>
        <form onSubmit={handleCreateUser}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
          />
          <TextField
            label="Role"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            SelectProps={{
              multiple: true,
              renderValue: (selected) => selected.filter(Boolean).join(";"), // Remove empty values
            }}
            value={newUser.role ? newUser.role.split(";").filter(Boolean) : []} // Handle empty case
            onChange={(e) => {
              const selectedRoles = e.target.value;
              setNewUser({ ...newUser, role: selectedRoles.join(";") }); // Convert array to semicolon-separated string
            }}
            required
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="actions">Actions</MenuItem>
            <MenuItem value="cwo">CWO</MenuItem>
            <MenuItem value="mwo">MWO</MenuItem>
            <MenuItem value="mb">MB</MenuItem>
            <MenuItem value="inv">INV</MenuItem>
            <MenuItem value="crm">Change Request MWO</MenuItem>
            <MenuItem value="crc">Change Request CWO</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="mm">MRS</MenuItem>
          </TextField>

          <TextField
            label="Status"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            value={newUser.status}
            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
          <TextField
            label="Company"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUser.company}
            onChange={(e) =>
              setNewUser({ ...newUser, company: e.target.value })
            }
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: "16px" }}
          >
            Create User
          </Button>
        </form>
        <Typography
          variant="body1"
          fontWeight="bold"
          color="primary"
          sx={{ marginTop: "16px" }}
        >
          Default Password: <strong>Welcome123</strong>
        </Typography>
      </Paper>

      {}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert severity={severity} onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
