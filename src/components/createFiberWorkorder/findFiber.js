import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import { Typography, Grid } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const DashboardWhinch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [routeName, setRouteName] = useState("");
  const [gisCode, setGisCode] = useState("");
  const [routeLength, setRouteLength] = useState("");
  const [homepassCount, setHomepassCount] = useState("");
  const [activity, setActivity] = useState("");
  const [type, setType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [executionCity, setExecutionCity] = useState("");
  const [customerApprovalDate, setCustomerApprovalDate] = useState(dayjs());
  const [customerProjectManager, setCustomerProjectManager] = useState("");
  const [internalProjectManager, setInternalProjectManager] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleRunQuery = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/workorder/find-workorder`,
        {
          params: {
            workOrderNumber: `%${workOrderNumber}%`,
            routeName: `%${routeName}%`,
          },
          headers: {
            Authorization: user.authToken,
          },
        }
      );

      const data = response.data;

      if (data) {
        setGisCode(data.gis_code || "");
        setRouteLength(data.route_length || "");
        setHomepassCount(data.homepass_count || "");
        setActivity(data.activity || "");
        setType(data.type || "");
        setCustomerName(data.customer_name || "");
        setCustomerState(data.customer_state || "");
        setExecutionCity(data.execution_city || "");
        setCustomerApprovalDate(
          data.customer_approval_date
            ? dayjs(data.customer_approval_date)
            : dayjs()
        );
        setCustomerProjectManager(data.customer_project_manager || "");
        setInternalProjectManager(data.internal_project_manager || "");
      } else {
        setError("No data found for the given criteria.");
      }
    } catch (error) {
      console.error("Error fetching workorder data:", error);
      setError("Failed to fetch workorder data");
    }
  };

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <div>
        <Box sx={{ flexGrow: 1 }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="work-order-number"
                  label="Work Order Number"
                  variant="outlined"
                  fullWidth
                  value={workOrderNumber}
                  onChange={(e) => setWorkOrderNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="route-name"
                  label="Route Name"
                  variant="outlined"
                  fullWidth
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#ec7c30",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "black",
                    },
                  }}
                  onClick={handleRunQuery}
                >
                  Run
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="gis-code"
                  label="GIS Code"
                  variant="outlined"
                  fullWidth
                  value={gisCode}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="route-length"
                  label="Route Length (m)"
                  variant="outlined"
                  fullWidth
                  value={routeLength}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="homepass-count"
                  label="Homepass Count"
                  variant="outlined"
                  fullWidth
                  value={homepassCount}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="activity"
                  label="Activity"
                  variant="outlined"
                  fullWidth
                  value={activity}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="type"
                  label="Type"
                  variant="outlined"
                  fullWidth
                  value={type}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Customer Approval Date"
                    value={customerApprovalDate}
                    onChange={(newValue) => setCustomerApprovalDate(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    )}
                    format="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-name"
                  label="Customer Name"
                  variant="outlined"
                  fullWidth
                  value={customerName}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-state"
                  label="Customer State"
                  variant="outlined"
                  fullWidth
                  value={customerState}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="execution-city"
                  label="Execution City"
                  variant="outlined"
                  fullWidth
                  value={executionCity}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-project-manager"
                  label="Customer Project Manager"
                  variant="outlined"
                  fullWidth
                  value={customerProjectManager}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="internal-project-manager"
                  label="Internal Project Manager"
                  variant="outlined"
                  fullWidth
                  value={internalProjectManager}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
