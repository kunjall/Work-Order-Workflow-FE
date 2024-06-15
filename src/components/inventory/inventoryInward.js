import React, { useContext, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";

const DashboardWhinch = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Box sx={{ flexGrow: 1, mt: 10 }}>
          <Typography variant="h5">Warehouse Inventory Inward</Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Item>xs=8</Item>
            </Grid>
            <Grid item xs={4}>
              <Item>xs=4</Item>
            </Grid>
            <Grid item xs={4}>
              <Item>xs=4</Item>
            </Grid>
            <Grid item xs={8}>
              <Item>xs=8</Item>
            </Grid>
          </Grid>
        </Box>
        <button onClick={logout}>Logout</button>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
