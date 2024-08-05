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
import Button from "@mui/material/Button";
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

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [managerOptions, setManagerOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activity, setActivity] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState(null);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [gisCode, setGisCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeLength, setRouteLength] = useState("");
  const [homepassCount, setHomepassCount] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [customerProjectManager, setCustomerProjectManager] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/customer/findCity`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        const citiesArray = response.data.map((city) => ({
          cityManagerId: city.city_manager_id,
          cityName: city.city_name,
          managerNames: city.manager_name.split(";").map((name) => name.trim()),
        }));

        setCityOptions(citiesArray);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/customer/findCustomer`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        const customersArray = response.data.map((customer) => ({
          name: customer.customer_name,
          id: customer.customer_id,
          state: customer.customer_state,
        }));

        const uniqueCustomers = Array.from(
          new Map(
            customersArray.map((customer) => [customer.id, customer])
          ).values()
        );

        setCustomers(uniqueCustomers);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Failed to load customers");
      }
    };

    fetchCustomers();
  }, [user]);

  useEffect(() => {
    if (selectedCustomerId) {
      const selectedCustomer = customers.find(
        (customer) => customer.id === selectedCustomerId
      );
      setCustomerName(selectedCustomer ? selectedCustomer.name : "");
      setCustomerState(selectedCustomer ? selectedCustomer.state : "");
    } else {
      setCustomerName("");
      setCustomerState("");
    }
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (selectedCity) {
      const selectedCityData = cityOptions.find(
        (city) => city.cityName === selectedCity
      );
      setManagerOptions(selectedCityData ? selectedCityData.managerNames : []);
    } else {
      setManagerOptions([]);
    }
  }, [selectedCity, cityOptions]);
  const handleSubmit = async () => {
    // Retrieve data from localStorage or set default values
    const createdBy = localStorage.getItem("username") || "unknown";
    const createdAt = new Date().toISOString(); // ISO format date for consistency

    try {
      // Send a POST request with the provided data and headers
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/workorder/create`,
        {
          workorder_type: "Fiber",
          workorder_number: workOrderNumber,
          workorder_status: "Draft",
          gis_code: gisCode,
          route_name: routeName,
          route_length: routeLength,
          homepass_count: homepassCount,
          activity: activity,
          type: type,
          customer_id: selectedCustomerId,
          execution_city: selectedCity,
          customer_project_manager: customerProjectManager,
          internal_project_manager: selectedManager,
          customer_name: customerName,
          customer_state: customerState,
          customer_approval_date: selectedDate,
          created_by: createdBy,
          created_at: createdAt,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      // Handle successful response
      console.log(response.data);
      // navigate("/success"); // Redirect or handle successful submission as needed
    } catch (error) {
      // Handle errors
      console.error("Error submitting form:", error);
      setError("Failed to submit form");
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
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={customers}
                  getOptionLabel={(option) => option.id.toString()}
                  onChange={(event, newValue) => {
                    setSelectedCustomerId(newValue ? newValue.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Customer ID"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-name"
                  label="Customer Name"
                  value={customerName}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-state"
                  label="Customer State"
                  value={customerState}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  id="work-order-number"
                  label="Work Order Number"
                  variant="outlined"
                  fullWidth
                  value={workOrderNumber}
                  onChange={(e) => setWorkOrderNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <TextField
                  id="gis-code"
                  label="GIS Code"
                  variant="outlined"
                  fullWidth
                  value={gisCode}
                  onChange={(e) => setGisCode(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="execution-city-label">
                    Execution City
                  </InputLabel>
                  <Select
                    labelId="execution-city-label"
                    id="execution-city"
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                    label="Execution City"
                  >
                    {cityOptions.map((city) => (
                      <MenuItem key={city.cityManagerId} value={city.cityName}>
                        {city.cityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
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
                <TextField
                  id="route-length"
                  label="Route Length (m)"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={routeLength}
                  onChange={(e) => setRouteLength(e.target.value)}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="homepass-count"
                  label="Homepass Count"
                  variant="outlined"
                  type="number"
                  fullWidth
                  value={homepassCount}
                  onChange={(e) => setHomepassCount(e.target.value)}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="dropdown-label">Activity</InputLabel>
                  <Select
                    labelId="activity-label"
                    id="activity"
                    value={activity}
                    onChange={(event) => setActivity(event.target.value)}
                    label="Activity"
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
              <Grid item xs={12} sm={6} md={1}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="dropdown-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    label="Type"
                  >
                    <MenuItem value="Flatbed">Flatbed</MenuItem>
                    <MenuItem value="IBW">IBW</MenuItem>
                    <MenuItem value="OH">OH</MenuItem>
                    <MenuItem value="OSP">OSP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="CUST Approval Date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                    format="DD/MM/YYYY"
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-project-manager"
                  label="Customer Project Manager"
                  variant="outlined"
                  fullWidth
                  value={customerProjectManager}
                  onChange={(e) => setCustomerProjectManager(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  disablePortal
                  id="manager-dropdown"
                  options={managerOptions}
                  getOptionLabel={(option) => option}
                  onChange={(event, newValue) => {
                    setSelectedManager(newValue || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Manager"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#ec7c30",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "black",
                    },
                  }}
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
