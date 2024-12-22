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
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import AddMaterials from "../materials/materialsLineItems";
import AddServices from "../services/servicesLineItems";

import Button from "@mui/material/Button";
import {
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Divider,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";

const DashboardWhinch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [totalMaterialAmount, setTotalMaterialAmount] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activity, setActivity] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceLineItems, setServiceLineItems] = useState([]);
  const [materialCodes, setMaterialCodes] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [gisCode, setGisCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeLength, setRouteLength] = useState("");
  const [homepassCount, setHomepassCount] = useState("");
  const [customerProjectManager, setCustomerProjectManager] = useState("");
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  let mwoId = null;

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/findCity`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        console.log(response.data); // Debugging to check data structure

        // Group cities by their name and merge manager lists
        const cityMap = response.data.reduce((acc, city) => {
          const cityName = city.city_name;
          const managers = Array.isArray(city.manager_name)
            ? city.manager_name.map((name) => name.trim())
            : typeof city.manager_name === "string"
            ? [city.manager_name.trim()] // Convert string to array
            : []; // Fallback if null/undefined

          if (!acc[cityName]) {
            acc[cityName] = {
              cityManagerId: city.city_manager_id, // Optional: keep only the first city's ID
              cityName: cityName,
              managerNames: new Set(managers), // Use a Set to ensure uniqueness
              type: city.type,
            };
          } else {
            // Merge managers into the existing Set
            managers.forEach((manager) =>
              acc[cityName].managerNames.add(manager)
            );
          }

          return acc;
        }, {});

        // Convert the city map back to an array, with unique managers for each city
        const citiesArray = Object.values(cityMap).map((city) => ({
          ...city,
          managerNames: Array.from(city.managerNames), // Convert Set back to array
        }));

        console.log(citiesArray); // Check the processed city data
        setCityOptions(citiesArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCities();
  }, []);
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-service?company=${customerName}`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        const servicesArray = response.data.map((service) => ({
          id: service.service_id,
          description: service.service_description,
          uom: service.service_UOM,
          rate: service.service_rate,
        }));
        setServices(servicesArray);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
      }
    };

    if (customerName) fetchServices();
  }, [customerName]);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-material?company=${customerName}`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        const materialArray = response.data.map((material) => ({
          id: material.item_id,
          description: material.item_name,
          uom: material.item_uom,
          rate: material.item_rate,
        }));
        setMaterialCodes(materialArray);
      } catch (err) {
        console.error("Error fetching material:", err);
        setError("Failed to load materials");
      }
    };

    if (customerName) fetchMaterial();
  }, [customerName]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/findCustomer`,
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
  }, []);

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

  const resetForm = () => {
    setSelectedCustomerId("");
    setCustomerName("");
    setCustomerState("");
    setSelectedCity("");
    setSelectedDate(dayjs());
    setActivity("");
    setType("");
    setWorkOrderNumber("");
    setGisCode("");
    setRouteName("");
    setRouteLength("");
    setHomepassCount("");
    setCustomerProjectManager("");
  };
  const handleServiceLineItemsUpdate = (updatedServiceLineItems) => {
    setServiceLineItems(updatedServiceLineItems);
  };

  const handleTotalAmountChange = (updatedAmount) => {
    setTotalAmount(updatedAmount);
  };

  const handleTotalMaterialAmountChange = (updatedAmount) => {
    setTotalMaterialAmount(updatedAmount);
  };

  const handleLineItemsUpdate = (updatedLineItems) => {
    setLineItems(updatedLineItems);
  };
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  console.log(serviceLineItems);

  const handleSubmit = async () => {
    const createdBy = localStorage.getItem("username") || "unknown";
    const createdAt = new Date().toISOString();

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/workorder/create`,
        {
          mwo_number: workOrderNumber,
          workorder_type: "Fiber",
          workorder_number: workOrderNumber,
          workorder_status: "Pending Approval",
          gis_code: gisCode,
          route_name: routeName,
          route_length: routeLength,
          homepass_count: homepassCount,
          activity: activity,
          type: type,
          customer_id: selectedCustomerId,
          execution_city: selectedCity,
          total_service_cost: totalAmount,
          total_material_cost: totalMaterialAmount,
          customer_project_manager: customerProjectManager,
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
      mwoId = response.data;
      setSuccessPopupOpen(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit form");
    } finally {
      setLoading(false); // Set loading to false after API call is finished
    }

    try {
      const response = serviceLineItems.map(async (item) => {
        console.log(serviceLineItems);
        console.log(item);
        return await axios.post(
          `${process.env.REACT_APP_API_URL}/workorder/motherEnterServices`,
          {
            record_id: `${workOrderNumber}_${item.serviceId}`,
            mwo_number: workOrderNumber,
            service_id: item.serviceId,
            service_desc: item.serviceDescription,
            service_uom: item.serviceUOM,
            service_rate: item.serviceRate,
            service_wo_qty: item.serviceQTY,
            service_bal_qty: item.serviceQTY,
            service_price: item.servicePrice,
            mwo_id: mwoId,
          },
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
      });
      const responses = await Promise.all(response);
    } catch (error) {
      console.error("Error submitting services:", error);
      setError("Failed to submit services");
    }

    try {
      console.log(lineItems);
      const response = lineItems.map(async (item) => {
        return await axios.post(
          `${process.env.REACT_APP_API_URL}/workorder/motherEnterMaterial`,
          {
            record_id: `${workOrderNumber}_${item.materialCode}`,
            mwo_number: workOrderNumber,
            material_id: item.materialCode,
            material_desc: item.itemName,
            material_uom: item.itemUom,
            material_wo_qty: item.itemQTY,
            material_bal_qty: item.itemQTY,
            mwo_id: mwoId,
            material_price: item.itemPrice,
            material_rate: item.itemRate,
          },
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
      });
      const responses = await Promise.all(response);
    } catch (error) {
      console.error("Error submitting materials:", error);
      setError("Failed to submit materials");
    }
  };

  const handlePopupClose = () => {
    setSuccessPopupOpen(false);
    resetForm(); // Reset form after popup is closed
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
                  label="Customer W/O Number"
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
              <Grid item xs={12}>
                <Divider
                // style={{ backgroundColor: "#EC7C30", height: "4px" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "column" },
                  }}
                >
                  <Box sx={{ flex: 1, padding: 2 }}>
                    <Typography variant="h6">Services</Typography>
                    <AddServices
                      services={services}
                      onLineItemUpdate={handleServiceLineItemsUpdate}
                      onAmountUpdate={handleTotalAmountChange}
                    />
                  </Box>
                  <Divider
                    flexItem
                    sx={{ display: { xs: "none", md: "flex" } }}
                  />
                  <Box sx={{ flex: 1, padding: 2 }}>
                    <Typography variant="h6">Materials</Typography>
                    <AddMaterials
                      materialCodes={materialCodes}
                      onUpdate={handleLineItemsUpdate}
                      onAmountUpdate={handleTotalMaterialAmountChange}
                    />
                  </Box>
                </Box>
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
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
        <Dialog open={successPopupOpen} onClose={handlePopupClose}>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon style={{ color: "green" }} />{" "}
              {/* Green checkmark icon */}
              <DialogContentText>
                The work order has been successfully submitted.
              </DialogContentText>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePopupClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
