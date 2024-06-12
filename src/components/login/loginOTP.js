import React from "react";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
// import Container from "@mui/material/Container";
import ButtonComponent from "../buttons/button";
import WOW from "../../assets/images/wow.png";
import { MuiOtpInput } from "mui-one-time-password-input";

export default function Otp({ onBackClick }) {
  const [otp, setOtp] = React.useState("");

  const handleChange = (newValue) => {
    setOtp(newValue);
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
            <MuiOtpInput value={otp} onChange={handleChange} />
          </div>
          <span>
            <ButtonComponent variant="contained" text={"Login"} />
          </span>
          <p>Contact admin if you're unable to login</p>
        </div>
      </Box>
    </React.Fragment>
  );
}
