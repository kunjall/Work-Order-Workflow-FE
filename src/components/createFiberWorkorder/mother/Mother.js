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
  Container,
  Paper,
  Card,
  CardContent,
  Chip,
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
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState(null);
  const [approverName, setApproverName] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [mwoId, setMwoId] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=MWO&city=${selectedCity}`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        const reviewerArray = response.data.map((reviewer) => ({
          id: reviewer.record_id,
          type: reviewer.type,
          approver_email: reviewer.reviewer_email,
          city: reviewer.city,
          approver_name: reviewer.reviewer_name,
        }));
        setApprovers(reviewerArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };

    if (selectedCity) fetchApprovers();
  }, [selectedCity]);

  useEffect(() => {
    if (selectedApproverEmail) {
      const selectedReviewer = approvers.find(
        (reviewer) => reviewer.approver_email === selectedApproverEmail
      );
      setApproverName(selectedReviewer ? selectedReviewer.approver_name : "");
    } else {
      setSelectedApproverEmail("");
      setApproverName("");
    }
  }, [selectedApproverEmail, approvers]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/findCity`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        const cityMap = response.data.reduce((acc, city) => {
          const cityName = city.city_name;
          const managers = Array.isArray(city.manager_name)
            ? city.manager_name.map((name) => name.trim())
            : typeof city.manager_name === "string"
            ? [city.manager_name.trim()]
            : [];

          if (!acc[cityName]) {
            acc[cityName] = {
              cityManagerId: city.city_manager_id,
              cityName: cityName,
              managerNames: new Set(managers),
              type: city.type,
              state: city.state,
            };
          } else {
            managers.forEach((manager) =>
              acc[cityName].managerNames.add(manager)
            );
          }

          return acc;
        }, {});

        const citiesArray = Object.values(cityMap).map((city) => ({
          ...city,
          managerNames: Array.from(city.managerNames),
        }));

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
              Authorization: user.authToken,
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
              Authorization: user.authToken,
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
              Authorization: user.authToken,
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
    setApproverName("");
    setSelectedApproverEmail("");
    setServiceLineItems([]);
    setLineItems([]);
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

  const handleCityChange = (event) => {
    const cityName = event.target.value;
    setSelectedCity(cityName);

    const city = cityOptions.find((c) => c.cityName === cityName);
    if (city) {
      setSelectedState(city.state);
    } else {
      setSelectedState("");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (
      !selectedApproverEmail ||
      !gisCode ||
      !routeLength ||
      !activity ||
      !type ||
      !selectedDate ||
      !homepassCount ||
      !routeName ||
      !selectedCity ||
      !workOrderNumber ||
      !customerProjectManager ||
      !selectedCustomerId
    ) {
      window.alert("Please select all fields before proceeding.");
      return;
    }
    const isConfirmed = window.confirm("Are you sure you want to submit?");

    if (!isConfirmed) {
      return;
    }

    const createdBy = user.name || "unknown";
    const createdAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "IST",
    });

    setLoading(true);

    const requestData = {
      mwo_number: workOrderNumber,
      workorder_type: "Fiber",
      mwo_status: "Pending with deployment head",
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
      mwo_approver_email: selectedApproverEmail,
      mwo_approver_name: approverName,
      created_by: createdBy,
      created_at: createdAt,
      state: selectedState,
      materialRecords: lineItems,
      serviceRecords: serviceLineItems,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/workorder/create`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );
      setMwoId(response.data.workorderId);
      if (response.status === 201) {
        setSuccessPopupOpen(true);
        resetForm();
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    setSuccessPopupOpen(false);
    resetForm();
  };

  let theme = createTheme({
    palette: {
      primary: {
        main: "#ec7c30",
      },
      secondary: {
        main: "#2c3e50",
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 4,
            padding: "4px 12px",
            boxShadow: "none",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
          margin: "dense",
        },
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              height: 32,
            },
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: "small",
          margin: "dense",
        },
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              height: 32,
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: "small",
          margin: "dense",
        },
      },
      MuiAutocomplete: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            "& .MuiInputBase-root": {
              height: 32,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.8rem",
            transform: "translate(14px, 8px) scale(1)",
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -6px) scale(0.75)",
            },
          },
        },
      },
    },
  });
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <div id="fiber-rollout">
        <Box sx={{ flexGrow: 1 }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Grid container spacing={0.5}>
              <Box sx={{ mb: 1, width: "100%" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#2c3e50",
                    mb: 0.5,
                  }}
                >
                  Mother Workorder - Fiber Rollout
                </Typography>
              </Box>
              {}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: "4px 8px",
                    mb: 0.5,
                    borderRadius: "4px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.25,
                      color: "#2c3e50",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Customer Information
                  </Typography>
                  <Grid container spacing={0.5}>
                    {/* Row 1 */}
                    <Grid item xs={12} md={3}>
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
                            label="Customer ID"
                            variant="outlined"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="work-order-number"
                        label="Customer W/O Number"
                        variant="outlined"
                        fullWidth
                        value={workOrderNumber}
                        onChange={(e) => setWorkOrderNumber(e.target.value)}
                      />
                    </Grid>

                    {/* Row 2 */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="gis-code"
                        label="GIS Code"
                        variant="outlined"
                        fullWidth
                        value={gisCode}
                        onChange={(e) =>
                          setGisCode(e.target.value.toUpperCase())
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="execution-city-label">
                          Execution City
                        </InputLabel>
                        <Select
                          labelId="execution-city-label"
                          id="execution-city"
                          value={selectedCity}
                          onChange={handleCityChange}
                          label="Execution City"
                        >
                          {cityOptions.map((city) => (
                            <MenuItem
                              key={city.cityManagerId}
                              value={city.cityName}
                            >
                              {city.cityName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="state"
                        label="State"
                        variant="outlined"
                        fullWidth
                        disabled
                        value={selectedState}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="route-name"
                        label="Route Name"
                        variant="outlined"
                        fullWidth
                        value={routeName}
                        onChange={(e) =>
                          setRouteName(e.target.value.toUpperCase())
                        }
                      />
                    </Grid>

                    {/* Row 3 */}
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="route-length"
                        label="Route Length (m)"
                        variant="outlined"
                        type="text"
                        fullWidth
                        value={routeLength}
                        onChange={(e) => {
                          const value = e.target.value;
                          const isValid = /^(\d+(\.\d{0,3})?)?$/.test(value);

                          if (isValid || value === "") {
                            setRouteLength(value);
                          }
                        }}
                        InputProps={{
                          inputProps: {
                            inputMode: "decimal",
                            pattern: "\\d+(\\.\\d{0,3})?",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
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

                    {/* Row 4 */}
                    <Grid item xs={12} md={3}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="CUST Approval Date"
                          value={selectedDate}
                          onChange={(newValue) => setSelectedDate(newValue)}
                          maxDate={dayjs()}
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
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="customer-project-manager"
                        label="Customer Project Manager"
                        variant="outlined"
                        fullWidth
                        value={customerProjectManager}
                        onChange={(e) =>
                          setCustomerProjectManager(e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={approvers}
                        getOptionLabel={(option) =>
                          option.approver_email.toString()
                        }
                        onChange={(event, newValue) => {
                          setSelectedApproverEmail(
                            newValue ? newValue.approver_email : null
                          );
                          setShowWarning(false);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Approver"
                            variant="outlined"
                            fullWidth
                            onBlur={() => {
                              if (!selectedApproverEmail) {
                                setShowWarning(true);
                              }
                            }}
                          />
                        )}
                      />
                      {showWarning && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ mt: 1 }}
                        >
                          Please select an approver
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        id="approver-name"
                        label="Approver Name"
                        value={approverName}
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                          style: {
                            color: "red",
                            fontWeight: "bold",
                          },
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: "4px 8px",
                    mb: 0.5,
                    borderRadius: "4px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.25,
                      color: "blue",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Services
                  </Typography>
                  <AddServices
                    services={services}
                    onLineItemUpdate={handleServiceLineItemsUpdate}
                    onAmountUpdate={handleTotalAmountChange}
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: "4px 8px",
                    mb: 0.5,
                    borderRadius: "4px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.25,
                      color: "green",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Materials
                  </Typography>
                  <AddMaterials
                    materialCodes={materialCodes}
                    onUpdate={handleLineItemsUpdate}
                    onAmountUpdate={handleTotalMaterialAmountChange}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 0.5,
                    mb: 0.5,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : null
                    }
                    sx={{
                      backgroundColor: "#ec7c30",
                      color: "white",
                      fontWeight: "bold",
                      px: 2,
                      py: 0.5,
                      height: 28,
                      fontSize: "0.75rem",
                      "&:hover": {
                        backgroundColor: "#d86b20",
                      },
                    }}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Submit"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>

        {}
        <Dialog
          open={successPopupOpen}
          onClose={handlePopupClose}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#f8f9fa",
              borderBottom: "1px solid #eaeaea",
              py: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CheckCircleIcon
              sx={{ color: "#4caf50", mr: 1.5, fontSize: "1.8rem" }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#2c3e50" }}
            >
              Workorder Created Successfully
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, color: "#2c3e50" }}>
                Mother Workorder has been created with number:
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "#ec7c30",
                  mb: 2,
                  p: 2,
                  border: "2px dashed #ec7c30",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                {mwoId}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
                The workorder has been submitted and is pending approval.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              borderTop: "1px solid #eaeaea",
              px: 3,
              py: 2,
              justifyContent: "center",
            }}
          >
            <Button
              onClick={handlePopupClose}
              variant="contained"
              color="primary"
              sx={{
                minWidth: "120px",
                fontWeight: "bold",
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
