import React from "react";
import "../assets/styles/login.css";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import ButtonComponent from "../components/buttons/button";
import WOW from "../assets/images/wow.png";

export default function Login() {
  return (
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
            }}
          >
            <div className="form">
              <img src={WOW} alt="wow" />
              <div className="username">
                <TextField
                  id="outlined-basic"
                  label="Username"
                  variant="outlined"
                  fullWidth
                />
              </div>
              <div className="password">
                <TextField
                  id="outlined-basic"
                  label="Password"
                  variant="outlined"
                  fullWidth
                />
              </div>
              <span>
                <ButtonComponent
                  variant="contained"
                  text={"Login"}
                ></ButtonComponent>
                <ButtonComponent
                  variant="contained"
                  text={"Use OTP"}
                ></ButtonComponent>
              </span>
              <p>Contact admin, if you're unable to login</p>
            </div>
          </Box>
        </Container>
      </div>
    </React.Fragment>
  );
}
