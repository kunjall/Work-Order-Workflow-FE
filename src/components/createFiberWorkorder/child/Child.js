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
  const [error, setError] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");

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
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState(null);
  const [approverName, setApproverName] = useState("");

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

  const handleVendorRouteAllocationChange = (event) => {
    const value = event.target.value;
    setvendorRouteAllocation(value);

    if (parseFloat(value) > parseFloat(formData.route_length)) {
      setVendorRouteAllocationError(
        "Vendor Route Allocation cannot exceed Route Length."
      );
    } else {
      setVendorRouteAllocationError("");
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
    state: "",
    customer_approval_date: null,
    customer_project_manager: "",
  });

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

        const filteredCities = response.data.filter(
          (city) => city.company === "The Pinnacle Search"
        );

        const cityMap = filteredCities.reduce((acc, city) => {
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
  }, [selectedWorkOrder]);

  useEffect(
    () => {
      const fetchApprovers = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=CWO&city=${formData.execution_city}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );
          const reviewerArray = response.data.map((reviewer) => ({
            id: reviewer.record_id,
            type: reviewer.type,
            approver_email: reviewer.approver_email,
            city: reviewer.city,
            approver_name: reviewer.approver_name,
          }));
          setApprovers(reviewerArray);
        } catch (err) {
          console.error("Error fetching reviewer:", err);
          setError("Failed to load reviewer");
        }
      };

      if (formData.execution_city) fetchApprovers();
    },
    [formData.execution_city],
    selectedWorkOrder
  );

  useEffect(() => {
    if (selectedApproverEmail) {
      const selectedReviewer = approvers.find(
        (reviewer) => reviewer.approver_email === selectedApproverEmail
      );
      setApproverName(selectedReviewer ? selectedReviewer.approver_name : "");
    } else {
      setApproverName("");
    }
  }, [selectedApproverEmail, approvers]);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-workorder`,
          {
            headers: {
              Authorization: user.authToken,
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
        state: newValue.state || "",
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
        state: "",
        customer_approval_date: null,
        customer_project_manager: "",
      });
      setMotherMaterials([]);
      setMotherServices([]);
      setMaterialLineItems([]);
      setServiceLineItems([]);
      setSelectedApproverEmail(null);
      setApprovers([]);
      setApproverName(null);
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
    const total = serviceLineItems.reduce((sum, item) => {
      const price = parseFloat(item.service_cwo_price);
      return !isNaN(price) ? sum + price : sum;
    }, 0);

    setTotalAmount(total.toFixed(2));
  }, [serviceLineItems]);
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-vendors`,
          {
            headers: {
              Authorization: user.authToken,
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
          service_cwo_price: "",
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
          material_cwo_price: "",
        }))
      );
    }
  }, [motherMaterials, materialLineItems]);

  useEffect(() => {
    const fetchMotherServices = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-mother-services`,
          {
            params: { mwo_id: formData.mwo_id },
            headers: { Authorization: user.authToken },
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
              mwo_id: formData.mwo_id,
            },
            headers: { Authorization: user.authToken },
          }
        );
        setMotherMaterials(response.data);
      } catch (err) {
        console.error("Failed to fetch child materials:", err);
        setError("Failed to load child materials");
      }
    };

    if (selectedWorkOrder && formData.mwo_id) {
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
      const selectedCityData = cityOptions.find(
        (city) => city.cityName === formData.execution_city
      );

      setManagerOptions(selectedCityData ? selectedCityData.managerNames : []);
    } else {
      setManagerOptions([]);
    }
  }, [formData.execution_city, cityOptions]);

  const handleSubmit = async () => {
    const createdBy = user.username || "unknown";
    const createdAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "IST",
    });

    const requestData = {
      mwo_id: formData.mwo_id,
      mwo_number: formData.mwo_number,
      vendor_id: selectedVendorId,
      vendor_route_allocation: vendorRouteAllocation,
      total_service_cost: totalAmount,
      internal_manager: selectedManager,
      route_name: formData.route_name,
      execution_city: formData.execution_city,
      state: formData.state,
      workorder_type: formData.workorder_type,
      cwo_number: formData.mwo_number + "-" + childWorkOrderNumber,
      total_material_cost: totalMaterialAmount,
      materialItems: materialLineItems,
      serviceItems: serviceLineItems,
      created_by: createdBy,
      cwo_approver_email: selectedApproverEmail,
      cwo_approver_name: approverName,
      created_at: createdAt,
      customer_name: customerName,
      vendor_name: vendorName,
      gis_code: formData.gis_code,
      homepass_count: formData.homepass_count,
      activity: formData.activity,
      cwo_status: "Pending for approval",
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/workorder/createChild`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );

      if (response.status === 201) {
        setSuccess(true);
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100vw",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: "#2c3e50",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textAlign: "center",
                  }}
                >
                  Child Workorder
                </Typography>
              </Box>
              {}
              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  options={workOrders}
                  getOptionLabel={(option) => "MWO-" + option.mwo_id.toString()}
                  onChange={handleWorkOrderSelect}
                  isOptionEqualToValue={(option, value) =>
                    String(option.mwo_id) === String(value.mwo_id)
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
              {}
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
              {}
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
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  disabled
                  label="Execution State"
                  value={formData.state}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              {}
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="child-work-order-number"
                  label="Child W/O Number"
                  variant="outlined"
                  fullWidth
                  required
                  value={childWorkOrderNumber}
                  onChange={(e) => {
                    const input = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "");
                    if (input.length <= 2) {
                      setChildWorkOrderNumber(input);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <span style={{ fontWeight: "bold", marginRight: "4px" }}>
                        {formData.mwo_number}-{" "}
                      </span>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  disablePortal
                  id="manager-dropdown"
                  options={managerOptions}
                  getOptionLabel={(option) => option}
                  value={selectedManager}
                  required
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
                  value={
                    vendorOptions.find(
                      (vendor) => vendor.vendorId === selectedVendorId
                    ) || null
                  }
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
                  required
                  value={vendorRouteAllocation}
                  onChange={(e) => {
                    const value = e.target.value;
                    setvendorRouteAllocation(value);

                    if (parseFloat(value) > parseFloat(formData.route_length)) {
                      setVendorRouteAllocationError(
                        "Vendor Route Allocation cannot exceed Route Length."
                      );
                    } else {
                      setVendorRouteAllocationError("");
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
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  required
                  options={approvers}
                  getOptionLabel={(option) => option.approver_email.toString()}
                  onChange={(event, newValue) => {
                    setSelectedApproverEmail(
                      newValue ? newValue.approver_email : null
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Approver Email"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12}>
                <Divider />
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
                          value={service.service_rate || ""}
                          variant="outlined"
                          fullWidth
                          onChange={(e) => {
                            const newRate = e.target.value;
                            setMotherServices((prevServices) =>
                              prevServices.map((s, idx) =>
                                idx === index
                                  ? { ...s, service_rate: newRate }
                                  : s
                              )
                            );
                          }}
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
                                        ? ""
                                        : (
                                            cwoQty *
                                            Number(service.service_rate)
                                          ).toFixed(2),
                                    }
                                  : item
                              )
                            );
                          }}
                          error={!!serviceLineItems[index]?.error}
                          helperText={serviceLineItems[index]?.error || ""}
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
                    Budget Amount:
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
                              cwoQty > Number(material.material_bal_qty)
                                ? "CWO Qty cannot exceed Bal Qty"
                                : "";

                            setMaterialLineItems((prevItems) =>
                              prevItems.map((item, idx) =>
                                idx === index
                                  ? {
                                      ...item,
                                      cwo_qty: value,
                                      error,
                                      material_cwo_price: error
                                        ? ""
                                        : (
                                            cwoQty *
                                            Number(material.material_rate)
                                          ).toFixed(2),
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
                    Budget Amount:
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
