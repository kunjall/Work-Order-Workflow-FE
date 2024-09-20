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
  Divider,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AddMaterials from "./materials/materialsLineItems";
import AddServices from "./services/servicesLineItems";

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
  const [materialCodes, setMaterialCodes] = useState([]);
  const [services, setServices] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [serviceLineItems, setServiceLineItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorLocation, setVendorLocation] = useState("");

  const handleLineItemsUpdate = (updatedLineItems) => {
    setLineItems(updatedLineItems);
  };

  const handleServiceLineItemsUpdate = (updatedServiceLineItems) => {
    setServiceLineItems(updatedServiceLineItems);
  };

  const handleTotalAmountChange = (updatedAmount) => {
    setTotalAmount(updatedAmount);
  };
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
        const citiesArray = response.data.map((city) => ({
          cityManagerId: city.city_manager_id,
          cityName: city.city_name,
          managerNames: city.manager_name.split(";").map((name) => name.trim()),
        }));
        setCityOptions(citiesArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCities();
  }, []);

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
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-vendors`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        const vendorsArray = response.data.map((vendor) => ({
          vendorId: vendor.vendor_id,
          vendorName: vendor.vendor_name,
          vendorLocation: vendor.vendor_location,
        }));
        setVendorOptions(vendorsArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVendors();
  }, []);

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

  useEffect(() => {
    if (selectedVendorId) {
      const selectedVendor = vendorOptions.find(
        (vendor) => vendor.vendorId === selectedVendorId
      );
      setVendorName(selectedVendor ? selectedVendor.vendorName : "");
      setVendorLocation(selectedVendor ? selectedVendor.vendorLocation : "");
    } else {
      setVendorName("");
      setVendorLocation("");
    }
  }, [selectedVendorId, vendorOptions]);

  const handleSubmit = async () => {
    const createdBy = localStorage.getItem("username") || "unknown";
    const createdAt = new Date().toISOString();

    try {
      console.log(vendorName);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/workorder/create`,
        {
          workorder_type: "Fiber",
          workorder_number: workOrderNumber,
          workorder_status: "Submitted",
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
          total_service_cost: totalAmount,
          vendor_name: vendorName,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit form");
    }

    try {
      const response = lineItems.map(async (item) => {
        return await axios.post(
          `${process.env.REACT_APP_API_URL}/workorder/enterMaterial`,
          {
            record_id: `${workOrderNumber}_${item.materialCode}`,
            workorder_id: workOrderNumber,
            material_id: item.materialCode,
            material_desc: item.itemName,
            material_uom: item.itemUom,
            material_wo_qty: item.itemQTY,
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

    try {
      const response = serviceLineItems.map(async (item) => {
        return await axios.post(
          `${process.env.REACT_APP_API_URL}/workorder/enterServices`,
          {
            record_id: `${workOrderNumber}_${item.serviceId}`,
            workorder_id: workOrderNumber,
            service_id: item.serviceId,
            service_desc: item.serviceDescription,
            service_uom: item.serviceUOM,
            service_rate: item.serviceRate,
            service_wo_qty: item.serviceQTY,
            service_price: item.servicePrice,
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
              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  disablePortal
                  id="vendor-dropdown"
                  options={vendorOptions}
                  getOptionLabel={(option) => option.vendorId} // Display vendor ID
                  onChange={(event, newValue) => {
                    setSelectedVendorId(newValue ? newValue.vendorId : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Vendor ID"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="vendor-name"
                  label="Vendor Name"
                  value={vendorName}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="vendor-location"
                  label="Vendor Location"
                  value={vendorLocation}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
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
                    orientation="vertical"
                    flexItem
                    sx={{ display: { xs: "none", md: "flex" } }}
                  />
                  <Box sx={{ flex: 1, padding: 2 }}>
                    <Typography variant="h6">Materials</Typography>
                    <AddMaterials
                      materialCodes={materialCodes}
                      onUpdate={handleLineItemsUpdate}
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
