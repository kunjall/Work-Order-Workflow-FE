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
import { Typography, Grid, Divider, FormControl } from "@mui/material";
import dayjs from "dayjs";
import { SettingsInputCompositeSharp } from "@mui/icons-material";

const CreateMRS = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [workOrders, setWorkOrders] = useState([]);
  const [childServices, setChildServices] = useState([]);
  const [childMaterials, setChildMaterials] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseState, setWarehouseState] = useState("");

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedClientWarehouseId, setSelectedClientWarehouseId] =
    useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [formData, setFormData] = useState({});
  const [vendorOptions, setVendorOptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-warehouse`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        const warehouseArray = response.data.map((warehouse) => ({
          id: warehouse.warehouse_id,
          city: warehouse.warehouse_city,
        }));
        const uniqueWarehouses = Array.from(
          new Map(
            warehouseArray.map((warehouse) => [warehouse.id, warehouse])
          ).values()
        );
        setWarehouses(uniqueWarehouses);
      } catch (err) {
        console.error("Error fetching warehouses:", err);
        setError("Failed to load warehouses");
      }
    };

    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      const selectedWarehouse = warehouses.find(
        (warehouse) => warehouse.id === selectedWarehouseId
      );
      setWarehouseState(selectedWarehouse ? selectedWarehouse.city : "");
    } else {
      setWarehouseState("");
    }
  }, [selectedWarehouseId, warehouses]);

  // Fetch work orders on component mount
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
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-child-workorder`,
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
  useEffect(() => {
    if (selectedWorkOrder) {
      const fetchChildServices = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-services`,
            {
              params: { mwo_number: selectedWorkOrder.mwo_number },
              headers: { Authorization: `${localStorage.getItem("token")}` },
            }
          );
          setChildServices(response.data);
        } catch (err) {
          console.error("Failed to fetch child services:", err);
          setError("Failed to load child services");
        }
      };

      const fetchChildMaterials = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-material`,
            {
              params: { mwo_number: selectedWorkOrder.mwo_number },
              headers: { Authorization: `${localStorage.getItem("token")}` },
            }
          );
          setChildMaterials(response.data);
          console.log(childMaterials);
        } catch (err) {
          console.error("Failed to fetch child materials:", err);
          setError("Failed to load child materials");
        }
      };

      fetchChildServices();
      fetchChildMaterials();
    }
  }, [selectedWorkOrder]);

  // Handle work order selection
  const handleWorkOrderSelect = (event, newValue) => {
    if (newValue) {
      setSelectedWorkOrder(newValue);
      setFormData({
        mwo_number: newValue.mwo_number || "",
        vendor_id: newValue.vendor_id || "",
        vendor_route_allocation: newValue.vendor_route_allocation || "",
        internal_manager: newValue.internal_manager || "",
        execution_city: newValue.execution_city || "",
      });
    } else {
      setSelectedWorkOrder(null);
      setFormData({});
      setChildMaterials([]);
      setChildServices([]);
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
                    label="CWO Number"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Work Order Details */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <Autocomplete
                  disabled
                  disablePortal
                  id="vendor-dropdown"
                  options={vendorOptions}
                  getOptionLabel={(option) => option.vendorId}
                  value={
                    vendorOptions.find(
                      (option) => option.vendorId === formData.vendor_id
                    ) || null
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Vendor ID"
                      variant="outlined"
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Vendor Route Allocation"
                value={formData.vendor_route_allocation || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
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
              <TextField
                label="Internal Manager"
                value={formData.internal_manager || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={warehouses}
                getOptionLabel={(option) => option.id.toString()}
                onChange={(event, newValue) => {
                  setSelectedWarehouseId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="From Warehouse"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={warehouses}
                getOptionLabel={(option) => option.id.toString()}
                onChange={(event, newValue) => {
                  setSelectedWarehouseId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="To Warehouse"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              {/* <TextField
                        label="Description"
                        value={ || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      /> */}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Materials</Typography>
              <Grid container spacing={2} mt={1}>
                {childMaterials.map((material, index) => (
                  <React.Fragment key={material.record_id}>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        label="ID"
                        value={material.material_id || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        label="Description"
                        value={material.material_desc || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={1}>
                      <TextField
                        label="Quantity"
                        value={material.material_wo_qty || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        label="UOM"
                        value={material.material_uom || ""}
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
            </Grid>
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CreateMRS;
