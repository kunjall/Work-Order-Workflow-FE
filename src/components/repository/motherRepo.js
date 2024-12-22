import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const DashboardWhinch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);

  // Fetch work orders on component mount
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-workorder`,
          {
            headers: { Authorization: `${localStorage.getItem("token")}` },
          }
        );
        setWorkOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch work orders:", err);
        setError("Failed to load work orders");
      }
    };
    fetchWorkOrders();
  }, []);

  // Handle work order selection
  const handleWorkOrderSelect = (event, newValue) => {
    if (newValue) {
      setSelectedWorkOrder(newValue);
      setFormData({
        workorder_number: newValue.workorder_number || "",
        type: newValue.type || "",
        customer_id: newValue.customer_id || "",
        gis_code: newValue.gis_code || "",
        route_name: newValue.route_name || "",
        route_length: newValue.route_length || "",
        homepass_count: newValue.homepass_count || "",
        activity: newValue.activity || "",
        execution_city: newValue.execution_city || "",
        customer_approval_date: newValue.customer_approval_date
          ? dayjs(newValue.customer_approval_date)
          : null,
        customer_project_manager: newValue.customer_project_manager || "",
      });
    } else {
      setSelectedWorkOrder(null);
      setFormData({});
    }
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {/* Work Order Number Autocomplete */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={workOrders}
                getOptionLabel={(option) => option.mwo_number}
                onChange={handleWorkOrderSelect}
                isOptionEqualToValue={(option, value) =>
                  option.mwo_number === value.mwo_number
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Work Order Number"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Work Order Details */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Type"
                value={formData.type || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Customer ID"
                value={formData.customer_id || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="GIS Code"
                value={formData.gis_code || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Route Name"
                value={formData.route_name || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Route Length"
                value={formData.route_length || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Homepass Count"
                value={formData.homepass_count || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="activity-label">Activity</InputLabel>
                <Select
                  labelId="activity-label"
                  value={formData.activity || ""}
                  disabled
                >
                  <MenuItem value="FTTH">FTTH</MenuItem>
                  <MenuItem value="OSP">OSP</MenuItem>
                  <MenuItem value="FF">FF</MenuItem>
                  <MenuItem value="LM">LM</MenuItem>
                  <MenuItem value="FTTB">FTTB</MenuItem>
                  <MenuItem value="OH">OH</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Execution City"
                value={formData.execution_city || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Customer Approval Date"
                  value={formData.customer_approval_date || null}
                  readOnly
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Customer Project Manager"
                value={formData.customer_project_manager || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
