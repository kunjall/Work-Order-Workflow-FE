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
import AddMaterials from "../materials/materialsLineItems";
import AddServices from "../services/servicesLineItems";
import StatusModal from "../statusPopUp";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const DashboardWhinch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [managerOptions, setManagerOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activity, setActivity] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState(null);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  // const [materialCodes, setMaterialCodes] = useState([]);
  // const [services, setServices] = useState([]);
  // const [lineItems, setLineItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorLocation, setVendorLocation] = useState("");
  const [vendorRouteAllocation, setvendorRouteAllocation] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [childWorkOrderNumber, setChildWorkOrderNumber] = useState("");
  const [motherServices, setMotherServices] = useState([]);
  const [motherMaterials, setMotherMaterials] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceLineItems, setServiceLineItems] = useState(
    motherServices.map(() => ({ cwo_qty: "" }))
  );
  const [materialLineItems, setMaterialLineItems] = useState(
    motherMaterials.map(() => ({ cwo_qty: "" }))
  );
  const totalMaterialAmount = materialLineItems.reduce(
    (acc, item) => acc + Number(item.material_cwo_price || 0),
    0
  );

  let cwoId = null;

  const [vendorRouteAllocationError, setVendorRouteAllocationError] =
    useState("");

  // Update the handle for vendorRouteAllocation input change
  const handleVendorRouteAllocationChange = (event) => {
    const value = event.target.value;
    setvendorRouteAllocation(value);

    // Validate allocation against route length
    if (parseFloat(value) > parseFloat(formData.route_length)) {
      setVendorRouteAllocationError(
        "Vendor Route Allocation cannot exceed Route Length."
      );
    } else {
      setVendorRouteAllocationError(""); // Clear error if valid
    }
  };

  const [formData, setFormData] = useState({
    mwo_id: "",
    mwo_number: "",
    workorder_type: "",
    type: "",
    customer_id: "",
    gis_code: "",
    route_name: "",
    route_length: "",
    homepass_count: "",
    activity: "",
    execution_city: "",
    customer_approval_date: null,
    customer_project_manager: "",
  });

  // Fetch work orders on mount
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

        setCityOptions(citiesArray);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-workorder`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        setWorkOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch work orders:", error);
      }
    };
    fetchWorkOrders();
  }, []);

  // Handle work order selection
  const handleWorkOrderSelect = (event, newValue) => {
    if (newValue) {
      setSelectedWorkOrder(newValue);
      setFormData({
        mwo_id: newValue.mwo_id,
        mwo_number: newValue.mwo_number || "",
        workorder_type: newValue.workorder_type || "",
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
      setCustomerName(newValue.customer_name);
    } else {
      setSelectedVendorId(null);
      setvendorRouteAllocation("");
      setSelectedManager(null);
      setFormData({
        mwo_id: "",
        mwo_number: "",
        workorder_type: "",
        type: "",
        customer_id: "",
        gis_code: "",
        route_name: "",
        route_length: "",
        homepass_count: "",
        activity: "",
        execution_city: "",
        customer_approval_date: null,
        customer_project_manager: "",
      });
      setMotherMaterials([]);
      setMotherServices([]);
      setMaterialLineItems([]);
      setServiceLineItems([]);
    }
  };

  const [status, setStatus] = useState({
    workorder: false,
    services: false,
    materials: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  useEffect(() => {
    // Calculate total sum of service_cwo_price from serviceLineItems
    const total = serviceLineItems.reduce((sum, item) => {
      // Only add valid prices (non-empty and non-NaN)
      const price = parseFloat(item.service_cwo_price);
      return !isNaN(price) ? sum + price : sum;
    }, 0);

    // Set the total amount with two decimal points
    setTotalAmount(total.toFixed(2));
  }, [serviceLineItems]);
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

  // useEffect(() => {
  //   const fetchMaterial = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/master/find-material?company=${customerName}`,
  //         {
  //           headers: {
  //             Authorization: `${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       const materialArray = response.data.map((material) => ({
  //         id: material.item_id,
  //         description: material.item_name,
  //         uom: material.item_uom,
  //       }));
  //       setMaterialCodes(materialArray);
  //     } catch (err) {
  //       console.error("Error fetching material:", err);
  //       setError("Failed to load materials");
  //     }
  //   };

  //   if (customerName) fetchMaterial();
  // }, [customerName]);

  useEffect(() => {
    if (serviceLineItems.length < 1) {
      setServiceLineItems(
        motherServices.map((service) => ({
          mwo_id: service.mwo_id || "",
          mwo_number: service.mwo_number || "",
          service_record_id: service.record_id || "",
          service_bal_qty: service.service_bal_qty || "",
          service_desc: service.service_desc || "",
          service_id: service.service_id || "",
          service_mwo_price: service.service_price || "",
          service_rate: service.service_rate || "",
          service_uom: service.service_uom || "",
          service_wo_qty: service.service_wo_qty || "",
          service_cwo_qty: "",
          service_cwo_price: "", // Initially set to empty string or 0
        }))
      );
    }
  }, [motherServices, serviceLineItems]);

  useEffect(() => {
    if (materialLineItems.length === 0) {
      setMaterialLineItems(
        motherMaterials.map((material) => ({
          mwo_id: material.mwo_id || "",
          mwo_number: material.mwo_number || "",
          material_record_id: material.record_id || "",
          material_id: material.material_id || "",
          material_desc: material.material_desc || "",
          material_uom: material.material_uom || "",
          material_bal_qty: material.material_bal_qty || "",
          material_wo_qty: material.material_wo_qty || "",
          material_rate: material.material_rate || "",
          material_cwo_qty: "",
        }))
      );
    }
  }, [motherMaterials, materialLineItems]);

  // useEffect(() => {
  //   const fetchServices = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/master/find-service?company=${customerName}`,
  //         {
  //           headers: {
  //             Authorization: `${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       const servicesArray = response.data.map((service) => ({
  //         id: service.service_id,
  //         description: service.service_description,
  //         uom: service.service_UOM,
  //         rate: service.service_rate,
  //       }));
  //       setServices(servicesArray);
  //     } catch (err) {
  //       console.error("Error fetching services:", err);
  //       setError("Failed to load services");
  //     }
  //   };

  //   if (customerName) fetchServices();
  // }, [customerName]);

  useEffect(() => {
    if (selectedWorkOrder) {
      const fetchMotherServices = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-services`,
            {
              params: { mwo_id: formData.mwo_id },
              headers: { Authorization: `${localStorage.getItem("token")}` },
            }
          );
          setMotherServices(response.data);
        } catch (err) {
          console.error("Failed to fetch child services:", err);
          setError("Failed to load child services");
        }
      };

      const fetchMotherMaterials = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-mother-material`,
            {
              params: {
                mwo_id: formData.mwo_id, // Ensures cwo_id is a number
              },
              headers: { Authorization: `${localStorage.getItem("token")}` },
            }
          );
          setMotherMaterials(response.data);
        } catch (err) {
          console.error("Failed to fetch child materials:", err);
          setError("Failed to load child materials");
        }
      };

      fetchMotherMaterials();
      fetchMotherServices();
    }
  }, [selectedWorkOrder, formData]);

  useEffect(() => {
    if (!selectedWorkOrder) {
      setSelectedVendorId(null);
      setSelectedManager(null);
    }
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
  }, [selectedVendorId, vendorOptions, selectedWorkOrder]);

  useEffect(() => {
    if (formData.execution_city) {
      // Find the selected city's data based on the name
      const selectedCityData = cityOptions.find(
        (city) => city.cityName === formData.execution_city
      );

      // Set manager options based on the selected city's managers
      setManagerOptions(selectedCityData ? selectedCityData.managerNames : []);
    } else {
      // Clear manager options if no city is selected
      setManagerOptions([]);
    }
  }, [formData.execution_city, cityOptions]);

  // const handleSubmit = async () => {
  //   if (!vendorRouteAllocationError) {
  //     const createdBy = localStorage.getItem("username") || "unknown";
  //     const createdAt = new Date().toISOString();
  //     setModalOpen(true);

  //     // Initialize success flag
  //     let allRequestsSuccessful = true;

  //     let cwoId; // To store child work order ID for subsequent API calls

  //     try {
  //       // Step 1: Create child work order
  //       const response = await axios.post(
  //         `${process.env.REACT_APP_API_URL}/workorder/createChild`,
  //         {
  //           mwo_number: `${formData.mwo_number}`,
  //           vendor_id: selectedVendorId,
  //           vendor_route_allocation: vendorRouteAllocation,
  //           total_service_cost: totalAmount,
  //           internal_manager: selectedManager,
  //           execution_city: formData.execution_city,
  //           workorder_type: formData.workorder_type,
  //           cwo_number: childWorkOrderNumber,
  //           total_material_cost: totalMaterialAmount,
  //         },
  //         {
  //           headers: {
  //             Authorization: `${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       cwoId = response.data;
  //       setStatus((prevStatus) => ({ ...prevStatus, workorder: true }));

  //       // Step 2: Enter materials
  //       const materialResponses = await Promise.all(
  //         materialLineItems.map((item) =>
  //           axios.post(
  //             `${process.env.REACT_APP_API_URL}/workorder/enterMaterial`,
  //             {
  //               record_id: `${childWorkOrderNumber}_${item.material_id}`,
  //               mwo_number: formData.mwo_number,
  //               material_id: item.material_id,
  //               material_desc: item.material_desc,
  //               material_uom: item.material_uom,
  //               material_wo_qty: item.cwo_qty,
  //               material_bal_qty: item.cwo_qty,
  //               material_rate: item.material_rate,
  //               material_price: item.material_cwo_price,
  //               vendor_id: selectedVendorId,
  //               cwo_id: cwoId,
  //               cwo_number: childWorkOrderNumber,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `${localStorage.getItem("token")}`,
  //               },
  //             }
  //           )
  //         )
  //       );

  //       setStatus((prevStatus) => ({ ...prevStatus, materials: true }));

  //       // Step 3: Enter services
  //       const serviceResponses = await Promise.all(
  //         serviceLineItems.map((item) =>
  //           axios.post(
  //             `${process.env.REACT_APP_API_URL}/workorder/enterServices`,
  //             {
  //               record_id: `${childWorkOrderNumber}_${item.service_id}`,
  //               mwo_number: formData.mwo_number,
  //               service_id: item.service_id,
  //               service_desc: item.service_desc,
  //               service_uom: item.service_uom,
  //               service_wo_qty: item.cwo_qty,
  //               service_bal_qty: item.cwo_qty,
  //               service_price: item.service_cwo_price,
  //               service_rate: item.service_rate,
  //               vendor_id: selectedVendorId,
  //               cwo_id: cwoId,
  //               cwo_number: childWorkOrderNumber,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `${localStorage.getItem("token")}`,
  //               },
  //             }
  //           )
  //         )
  //       );

  //       setStatus((prevStatus) => ({ ...prevStatus, services: true }));

  //       // Step 4: Update material balance
  //       await Promise.all(
  //         materialLineItems.map((item) =>
  //           axios.patch(
  //             `${process.env.REACT_APP_API_URL}/workorder/update-mother-mat-bal`,
  //             {
  //               cwo_qty: item.cwo_qty,
  //               record_id: `${formData.mwo_number}_${item.material_id}`,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `${localStorage.getItem("token")}`,
  //               },
  //             }
  //           )
  //         )
  //       );

  //       // Step 5: Update service balance
  //       await Promise.all(
  //         serviceLineItems.map((item) =>
  //           axios.patch(
  //             `${process.env.REACT_APP_API_URL}/workorder/update-mother-service-bal`,
  //             {
  //               cwo_qty: item.cwo_qty,
  //               record_id: `${formData.mwo_number}_${item.service_id}`,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `${localStorage.getItem("token")}`,
  //               },
  //             }
  //           )
  //         )
  //       );

  //       // If all API requests are successful, set success state
  //       setSuccess(true);
  //     } catch (error) {
  //       // If any API request fails, handle the rollback
  //       console.error("Error occurred during the transaction:", error);
  //       setError("Transaction failed, rolling back.");
  //       setModalOpen(true);
  //       setSuccess(false);

  //       // Here you can add any logic to undo or reset previous changes if required
  //       // e.g., reset previous state, call an API to cancel changes, etc.
  //     }
  //   }
  // };

  const handleSubmit = async () => {
    const createdBy = localStorage.getItem("username") || "unknown";
    const createdAt = new Date().toISOString();

    // Construct the request body
    const requestData = {
      mwo_number: formData.mwo_number,
      vendor_id: selectedVendorId,
      vendor_route_allocation: vendorRouteAllocation,
      total_service_cost: totalAmount,
      internal_manager: selectedManager,
      execution_city: formData.execution_city,
      workorder_type: formData.workorder_type,
      cwo_number: childWorkOrderNumber,
      total_material_cost: totalMaterialAmount,
      materialItems: materialLineItems, // Array of material line items
      serviceItems: serviceLineItems, // Array of service line items
      created_by: createdBy,
      created_at: createdAt,
    };

    try {
      // Send data to the backend in a single request
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/workorder/createChild`,
        requestData,
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      // Handle success response
      if (response.status === 201) {
        setSuccess(true);
        // Additional success logic like closing the modal or redirecting
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("An error occurred while submitting the data.");
      setModalOpen(true);
      setSuccess(false);
    }
  };

  const handleFillFormAgain = () => {
    setModalOpen(false);
    setStatus({ workorder: false, services: false, materials: false });
    setSuccess(false);
  };

  const handleGoToDashboard = () => {
    window.location.href = "../../dashboard/dashboardAdmin.js";
  };

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <div id="fiber-rollout">
        <Box sx={{ flexGrow: 1 }}>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <Grid container spacing={2}>
              {/* Work Order Number Autocomplete */}
              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  options={workOrders}
                  getOptionLabel={(option) => "MWO_" + option.mwo_id.toString()} // Display mwo_id as a string
                  onChange={handleWorkOrderSelect}
                  isOptionEqualToValue={
                    (option, value) =>
                      String(option.mwo_id) === String(value.mwo_id) // Ensure both are strings for comparison
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="MWO Id"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  disabled
                  label="MWO Number"
                  value={formData.mwo_number}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              {/* Display work order details in readonly fields */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Type"
                  value={formData.type}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Customer ID"
                  disabled
                  value={formData.customer_id}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="GIS Code"
                  value={formData.gis_code}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Route Name"
                  value={formData.route_name}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Route Length"
                  value={formData.route_length}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Homepass Count"
                  value={formData.homepass_count}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              {/* Dropdown for activity */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="activity-label">Activity</InputLabel>
                  <Select
                    labelId="activity-label"
                    value={formData.activity}
                    label="Activity"
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
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Execution City"
                  value={formData.execution_city}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              {/* Date Picker for customer approval date */}
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    disabled
                    label="Customer Approval Date"
                    value={formData.customer_approval_date}
                    readOnly
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Customer Project Manager"
                  value={formData.customer_project_manager}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  id="child-work-order-number"
                  label="Child W/O Number"
                  variant="outlined"
                  fullWidth
                  value={childWorkOrderNumber}
                  onChange={(e) => setChildWorkOrderNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  disablePortal
                  id="manager-dropdown"
                  options={managerOptions}
                  getOptionLabel={(option) => option}
                  value={selectedManager} // Bind the value to the state
                  onChange={(event, newValue) => {
                    setSelectedManager(newValue || ""); // Update state on change
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
                  getOptionLabel={(option) => option.vendorId}
                  value={
                    vendorOptions.find(
                      (vendor) => vendor.vendorId === selectedVendorId
                    ) || null
                  } // Bind the value to the state
                  onChange={(event, newValue) => {
                    setSelectedVendorId(newValue ? newValue.vendorId : null); // Update state on change
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
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="vendor-route-allocation"
                  label="Vendor Route Allocation"
                  value={vendorRouteAllocation}
                  onChange={(e) => {
                    const value = e.target.value;
                    setvendorRouteAllocation(value);

                    // Check if the value exceeds route_length and set error if it does
                    if (parseFloat(value) > parseFloat(formData.route_length)) {
                      setVendorRouteAllocationError(
                        "Vendor Route Allocation cannot exceed Route Length."
                      );
                    } else {
                      setVendorRouteAllocationError(""); // Clear error if valid
                    }
                  }}
                  error={Boolean(vendorRouteAllocationError)}
                  helperText={vendorRouteAllocationError}
                  variant="outlined"
                  type="number"
                  fullWidth
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider
                // style={{ backgroundColor: "#EC7C30", height: "4px" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Services</Typography>
                <Grid container spacing={2} mt={1}>
                  {motherServices.map((service, index) => (
                    <React.Fragment key={service.record_id}>
                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          disabled
                          label="Code"
                          value={service.service_id || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          disabled
                          label="Description"
                          value={service.service_desc || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="UOM"
                          value={service.service_uom || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="MWO QTY"
                          value={service.service_wo_qty || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          label="Rate"
                          disabled
                          value={service.service_rate || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          label="Bal QTY"
                          disabled
                          value={service.service_bal_qty || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          label="CWO Qty"
                          value={serviceLineItems[index]?.cwo_qty || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const cwoQty = Number(value);
                            const balQty = Number(service.service_bal_qty);
                            const error =
                              cwoQty > balQty
                                ? "CWO Qty cannot exceed Bal QTY"
                                : "";

                            setServiceLineItems((prevItems) =>
                              prevItems.map((item, idx) =>
                                idx === index
                                  ? {
                                      ...item,
                                      cwo_qty: value,
                                      error,
                                      service_cwo_price: error
                                        ? "" // If there is an error, clear CWO Price
                                        : (
                                            cwoQty *
                                            Number(service.service_rate)
                                          ).toFixed(2), // Calculate CWO Price if no error
                                    }
                                  : item
                              )
                            );
                          }}
                          error={!!serviceLineItems[index]?.error} // Show error if it exists
                          helperText={serviceLineItems[index]?.error || ""} // Display error message if present
                          variant="outlined"
                          fullWidth
                          type="number"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          label="CWO Price"
                          value={
                            serviceLineItems[index]?.service_cwo_price || ""
                          }
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
                <Box
                  mt={2}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 2,
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total Amount:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#1976d2" }}
                  >
                    ₹{totalAmount}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6">Materials</Typography>
                <Grid container spacing={2} mt={1}>
                  {motherMaterials.map((material, index) => (
                    <React.Fragment key={material.record_id}>
                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          disabled
                          label="ID"
                          value={material.material_id || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          disabled
                          label="Description"
                          value={material.material_desc || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="UOM"
                          value={material.material_uom || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="Quantity"
                          value={material.material_wo_qty || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="Rate"
                          value={material.material_rate || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="Bal QTY"
                          value={material.material_bal_qty || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          label="CWO Qty"
                          value={materialLineItems[index]?.cwo_qty || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const cwoQty = Number(value);
                            const error =
                              cwoQty > Number(material.material_wo_qty)
                                ? "CWO Qty cannot exceed WO Qty"
                                : "";

                            setMaterialLineItems((prevItems) =>
                              prevItems.map((item, idx) =>
                                idx === index
                                  ? {
                                      ...item,
                                      cwo_qty: value,
                                      error,
                                      material_cwo_price: error
                                        ? "" // Clear CWO Price on error
                                        : (
                                            cwoQty *
                                            Number(material.material_rate)
                                          ).toFixed(2), // Calculate price if valid
                                    }
                                  : item
                              )
                            );
                          }}
                          error={!!materialLineItems[index]?.error}
                          helperText={materialLineItems[index]?.error || ""}
                          variant="outlined"
                          fullWidth
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          label="CWO Price"
                          value={
                            materialLineItems[index]?.material_cwo_price || ""
                          }
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
                <Box
                  mt={2}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 2,
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total Amount:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#1976d2" }}
                  >
                    ₹{totalMaterialAmount}
                  </Typography>
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
              <StatusModal
                open={modalOpen}
                status={status}
                success={success}
                woID={cwoId}
                onClose={() => setModalOpen(false)}
                onFillFormAgain={handleFillFormAgain}
                onGoToDashboard={handleGoToDashboard}
              />
            </Grid>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
