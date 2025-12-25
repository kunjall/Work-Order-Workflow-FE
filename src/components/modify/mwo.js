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
  Divider,
  IconButton,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const DashboardWhinch = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const [totalAmount, setTotalAmount] = useState("");

  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const [motherServices, setMotherServices] = useState([]);
  const [motherMaterials, setMotherMaterials] = useState([]);

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
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-all-workorder`,
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
    } else {
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // useEffect(() => {
  //   console.log("Updated formData:", formData);
  // }, [formData]);

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

  const handleAddLineItem = () => {
    const newMaterial = {
      record_id: Date.now(), // Unique key
      material_id: "",
      material_desc: "",
      material_uom: "",
      material_wo_qty: "",
      material_rate: "",
    };

    setMotherMaterials((prevMaterials) => [...prevMaterials, newMaterial]);
  };

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...motherMaterials];
    updatedMaterials[index][field] = value;
    setMotherMaterials(updatedMaterials);
  };

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
                  name="mwo_number"
                  value={formData.mwo_number}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
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
                  label="GIS Code"
                  name="gis_code"
                  value={formData.gis_code}
                  onChange={handleInputChange}
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
                  label="Route Length"
                  name="route_length"
                  value={formData.route_length}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Homepass Count"
                  name="homepass_count"
                  value={formData.homepass_count}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel id="activity-label">Activity</InputLabel>
                  <Select
                    labelId="activity-label"
                    name="activity"
                    value={formData.activity}
                    label="Activity"
                    onChange={handleInputChange}
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

              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Services</Typography>
                <Grid container spacing={2} mt={1}>
                  {motherMaterials.map((material, index) => (
                    <React.Fragment key={material.record_id}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <TextField
                            label="ID"
                            value={material.material_id || ""}
                            onChange={(e) =>
                              handleMaterialChange(
                                index,
                                "material_id",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            label="Description"
                            value={material.material_desc || ""}
                            onChange={(e) =>
                              handleMaterialChange(
                                index,
                                "material_desc",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1}>
                          <TextField
                            label="UOM"
                            value={material.material_uom || ""}
                            onChange={(e) =>
                              handleMaterialChange(
                                index,
                                "material_uom",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1}>
                          <TextField
                            label="Quantity"
                            value={material.material_wo_qty || ""}
                            onChange={(e) =>
                              handleMaterialChange(
                                index,
                                "material_wo_qty",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1}>
                          <TextField
                            label="Rate"
                            value={material.material_rate || ""}
                            onChange={(e) =>
                              handleMaterialChange(
                                index,
                                "material_rate",
                                e.target.value
                              )
                            }
                            variant="outlined"
                            fullWidth
                          />
                        </Grid>
                      </Grid>

                      {/* Line break after each line item */}
                      <Grid item xs={12}></Grid>
                    </React.Fragment>
                  ))}

                  <Grid
                    item
                    xs={12}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <IconButton color="primary" onClick={handleAddLineItem}>
                      <AddCircleOutline />
                      <Typography>Add Line Item</Typography>
                    </IconButton>
                  </Grid>
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
                      <Box mt={2}>
                        <IconButton color="primary" onClick={handleAddLineItem}>
                          <AddCircleOutline />
                          <Typography>Add Line Item</Typography>
                        </IconButton>
                      </Box>
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
              ></Grid>
            </Grid>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default DashboardWhinch;
