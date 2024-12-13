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
import AddMaterials from "./materials/materialsLineItems";
import AddServices from "./services/servicesLineItems";
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
  const [materialCodes, setMaterialCodes] = useState([]);
  const [services, setServices] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  const [serviceLineItems, setServiceLineItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState("");
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorLocation, setVendorLocation] = useState("");
  const [vendorRouteAllocation, setvendorRouteAllocation] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
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
    workorder_number: "",
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
          `${process.env.REACT_APP_API_URL}/master/findCity`, // Fixed template literal syntax
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`, // Fixed template literal syntax
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
      setCustomerName(newValue.customer_name);
    } else {
      setFormData({
        workorder_number: "",
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
    }
  };

  const [status, setStatus] = useState({
    workorder: false,
    services: false,
    materials: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    if (formData.execution_city) {
      const selectedCityData = cityOptions.find(
        (city) => city.cityName === formData.execution_city
      );
      setManagerOptions(selectedCityData ? selectedCityData.managerNames : []);
    } else {
      setManagerOptions([]);
    }
  }, [formData.execution_city, cityOptions]);

  const handleSubmit = async () => {
    if (!vendorRouteAllocationError) {
      const createdBy = localStorage.getItem("username") || "unknown";
      const createdAt = new Date().toISOString();
      setModalOpen(true);
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/workorder/createChild`,
          {
            workorder_id: `${formData.workorder_number}_${selectedVendorId}`,
            vendor_id: selectedVendorId,
            vendor_route_allocation: vendorRouteAllocation,
            total_service_cost: totalAmount,
            internal_manager: selectedManager,
          },
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );

        setStatus((prevStatus) => ({ ...prevStatus, workorder: true }));
        const responses = await Promise.all(response);
      } catch (error) {
        console.error("Error creating child workorder:", error);
        // Handle error appropriately
      }

      try {
        const response = lineItems.map(async (item) => {
          return await axios.post(
            `${process.env.REACT_APP_API_URL}/workorder/enterMaterial`,
            {
              record_id: `${formData.workorder_number}_${item.materialCode}`,
              workorder_id: formData.workorder_number + "_" + selectedVendorId,
              material_id: item.materialCode,
              material_desc: item.itemName,
              material_uom: item.itemUom,
              material_wo_qty: item.itemQTY,
              vendor_id: selectedVendorId,
            },
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );
        });
        setStatus((prevStatus) => ({ ...prevStatus, materials: true }));
        const responses = await Promise.all(response);
      } catch (error) {
        console.error("Error submitting materials:", error);
        setError("Failed to submit materials");
        setModalOpen(true);
        setSuccess(false);
      }

      try {
        const response = serviceLineItems.map(async (item) => {
          return await axios.post(
            `${process.env.REACT_APP_API_URL}/workorder/enterServices`,
            {
              record_id: `${formData.workorder_number}_${item.serviceId}`,
              workorder_id: formData.workorder_number + "_" + selectedVendorId,
              service_id: item.serviceId,
              service_desc: item.serviceDescription,
              service_uom: item.serviceUOM,
              service_rate: item.serviceRate,
              service_wo_qty: item.serviceQTY,
              service_price: item.servicePrice,
              vendor_id: selectedVendorId,
            },
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );
        });
        setStatus((prevStatus) => ({ ...prevStatus, services: true }));
        const responses = await Promise.all(response);
      } catch (error) {
        console.error("Error submitting services:", error);
        setError("Failed to submit services");
        setModalOpen(true);
        setSuccess(false);
      }
      setSuccess(true);
    }
  };

  const handleFillFormAgain = () => {
    setModalOpen(false);
    setStatus({ workorder: false, services: false, materials: false });
    setSuccess(false);
  };

  const handlePrintPdf = () => {
    const doc = new jsPDF();

    // Capture the heading and active tab name
    const heading = "Child Workorder";
    const tabName = "Fiber Rollout";

    // Add Heading and Active Tab Name to the PDF
    doc.setFontSize(16);
    doc.text(heading, 10, 10);
    doc.setFontSize(12);
    doc.text(tabName, 10, 20);

    // Capture the content area as a PNG image
    const contentElement = document.querySelector("#fiber-rollout");

    // Adjust canvas size to capture the full scrollable area
    html2canvas(contentElement, {
      scale: 2, // Use scale for higher quality
      logging: true,
      useCORS: true,
      height: contentElement.scrollHeight, // Ensure the entire content is captured
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Add the image to the PDF
      doc.addImage(imgData, "PNG", 10, 30, 180, 0); // Adjust image positioning

      // Add footer with page number on the right side
      const totalPages = doc.internal.getNumberOfPages(); // Get the total number of pages

      // Loop through all pages to add footer with page number on the right side
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Set the current page
        const pageWidth = doc.internal.pageSize.width; // Get page width
        const pageHeight = doc.internal.pageSize.height; // Get page height

        // Add page number to footer, aligned to the right
        doc.setFontSize(10);
        const pageNumberText = `Page ${i} of ${totalPages}`;
        const textWidth = doc.getTextWidth(pageNumberText); // Get the width of the text
        const margin = 10; // Set margin from the right edge

        // Position the text to the right
        doc.text(
          pageNumberText,
          pageWidth - textWidth - margin,
          pageHeight - 10
        ); // Position the footer on the right
      }

      // Save the PDF
      doc.save("workorder.pdf");
    });
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
              <Grid item xs={12} sm={6} md={6}>
                <Autocomplete
                  options={workOrders}
                  getOptionLabel={(option) => option.workorder_number}
                  onChange={handleWorkOrderSelect}
                  isOptionEqualToValue={(option, value) =>
                    option.workorder_id === value.workorder_id
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

              {/* Display work order details in readonly fields */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
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
                  value={formData.customer_id}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="GIS Code"
                  value={formData.gis_code}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Route Name"
                  value={formData.route_name}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Route Length"
                  value={formData.route_length}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
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
                  label="Customer Project Manager"
                  value={formData.customer_project_manager}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
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
                  getOptionLabel={(option) => option.vendorId}
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
                <Grid
                  item
                  xs={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#4CAF50", // You can adjust color
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#45a049", // Hover effect color
                      },
                    }}
                    onClick={handlePrintPdf}
                  >
                    Print
                  </Button>
                </Grid>
              </Grid>
              <StatusModal
                open={modalOpen}
                status={status}
                success={success}
                woID={workOrderNumber}
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
