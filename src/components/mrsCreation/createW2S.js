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
  Divider,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
} from "@mui/material";
import dayjs from "dayjs";
import { Margin, SettingsInputCompositeSharp } from "@mui/icons-material";

const CreateMRS = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [internalWorkOrders, setInternalWorkOrders] = useState([]);
  const [externalWorkOrders, setExternalWorkOrders] = useState([]);
  const [childServices, setChildServices] = useState([]);
  const [childMaterials, setChildMaterials] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locatorStock, setLocatorStock] = useState([]);
  const [locators, setLocators] = useState([]);
  const [selectedLocator, setSelectedLocator] = useState(null);
  const [warehouseState, setWarehouseState] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedClientWarehouseId, setSelectedClientWarehouseId] =
    useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState(null);
  const [approverName, setApproverName] = useState("");

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [formData, setFormData] = useState({});
  const [vendorOptions, setVendorOptions] = useState([]);
  const [error, setError] = useState(null);
  const [internalExternal, setInternalExternal] = useState("internal");

  const [materialLineItems, setMaterialLineItems] = useState(
    childMaterials.map(() => ({ mm_qty: "" }))
  );
  const totalMaterialAmount = materialLineItems.reduce(
    (acc, item) => acc + Number(item.material_mm_price || 0),
    0
  );

  const handleRadioChange = (event) => {
    setSelectedWorkOrder(null);
    setFormData({});
    setChildMaterials([]);
    setMaterialLineItems([]);
    setSelectedLocator(null);
    setSelectedWarehouseId(null);
    setSelectedApproverEmail(null);
    setChildServices([]);
    setWarehouses([]);
    setLocators([]);

    if (event.target.value === "internal") {
      setInternalExternal("internal");
    } else {
      setInternalExternal("external");
    }
  };

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
      warehouse_id: selectedWarehouseId,
      vendor_id: formData.vendor_id,
      tps_pm: formData.internal_manager,
      vendor_name: formData.vendor_name,
      route_name: formData.route_name,
      execution_city: formData.execution_city,
      state: formData.state,
      internal_external: internalExternal,
      locator_name: selectedLocator,
      mm_status: "Pending with deployment head",
      customer_name: formData.customer_name,
      requested_by: createdBy,
      requested_at: createdAt,
      cwo_id: formData.cwo_id,
      cwo_number: formData.cwo_number,
      transaction_type: "W2S",
      mm_approver1_email: selectedApproverEmail,
      mm_approver1_name: approverName,
      materialItems: materialLineItems,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/mm/create-mm`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("An error occurred while submitting the data.");
    }
  };

  useEffect(
    () => {
      const fetchApprovers = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=MM&city=${formData.execution_city}`,
            {
              headers: {
                Authorization: user.authToken,
              },
            }
          );
          const reviewerArray = response.data.map((reviewer) => ({
            id: reviewer.record_id,
            type: reviewer.type,
            reviewer_email: reviewer.reviewer_email,
            city: reviewer.city,
            reviewer_name: reviewer.reviewer_name,
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
        (reviewer) => reviewer.reviewer_email === selectedApproverEmail
      );
      setApproverName(selectedReviewer ? selectedReviewer.reviewer_name : "");
    } else {
      setApproverName("");
    }
  }, [selectedApproverEmail, approvers]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (Object.keys(formData).length > 0) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/master/find-warehouse`,
            {
              headers: {
                Authorization: user.authToken,
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

          const warehousesOnCity = uniqueWarehouses.filter(
            (item) => item.city === formData.execution_city
          );

          setWarehouses(warehousesOnCity);
        } catch (err) {
          console.error("Error fetching warehouses:", err);
          setError("Failed to load warehouses");
        }
      }
    };

    fetchWarehouses();
  }, [formData.execution_city, formData]);

  useEffect(() => {
    const fetchLocators = async () => {
      if (selectedWorkOrder !== null) {
        if (
          !formData.execution_city ||
          (internalExternal === "internal" && !formData.internal_manager) ||
          (internalExternal === "external" && !formData.vendor_name)
        ) {
          console.warn("Missing required fields for locator fetch");
          return;
        }

        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/master/find-locators`,
            {
              params: {
                vendor_name:
                  internalExternal === "internal"
                    ? formData.internal_manager || ""
                    : formData.vendor_name || "",
                city: formData.execution_city || "",
                type: formData.workorder_type || "",
                customer_name: formData.customer_name || "",
              },
              headers: {
                Authorization: user.authToken,
              },
            }
          );

          setLocators(response.data);
        } catch (err) {
          console.error("Error fetching locators:", err);
          setError("Failed to load locators");
        }
      }
    };

    fetchLocators();
  }, [formData, internalExternal, selectedWorkOrder]);

  useEffect(() => {
    const fetchLocatorStock = async () => {
      if (
        selectedWorkOrder !== null &&
        materialLineItems.length > 0 &&
        selectedLocator !== null
      ) {
        try {
          const promises = materialLineItems.map((item) =>
            axios.get(
              `${process.env.REACT_APP_API_URL}/mm/find-material-stock`,
              {
                params: {
                  material_id: item.material_id,
                  locator_name: selectedLocator,
                },
                headers: {
                  Authorization: user.authToken,
                },
              }
            )
          );

          const responses = await Promise.all(promises);
          const locatorData = responses.map((response) => response.data);

          setLocatorStock(locatorData.flat());
        } catch (err) {
          console.error("Error fetching locators:", err);
          setError("Failed to load locators");
        }
      }
    };
    if (selectedLocator !== null) {
      fetchLocatorStock();
    }
  }, [selectedWorkOrder, selectedLocator, materialLineItems]);

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
    if (locatorStock.length > 0 && materialLineItems.length > 0) {
      const updatedMaterialLineItems = materialLineItems.map((item) => {
        const matchedLocator = locatorStock.find(
          (locator) => locator.material_id === item.material_id
        );
        return {
          ...item,
          locator_stock: matchedLocator ? matchedLocator.stock_qty : 0,
          cwo_id: item.cwo_id || "",
          cwo_number: item.cwo_number || "",
          material_record_id: item.record_id || "",
          material_id: item.material_id || "",
          material_desc: item.material_desc || "",
          material_uom: item.material_uom || "",
          material_bal_qty: item.material_bal_qty || "",
          material_cwo_qty: item.material_wo_qty || "",
          material_rate: item.material_rate || "",
        };
      });

      setMaterialLineItems((prev) => {
        const isSame =
          JSON.stringify(prev) === JSON.stringify(updatedMaterialLineItems);
        return isSame ? prev : updatedMaterialLineItems;
      });
    }
  }, [locatorStock, materialLineItems]);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-child-workorder`,
          {
            params: {
              company: user.company,
              internal_manager: user.name,
            },
            headers: { Authorization: user.authToken },
          }
        );

        const data = response.data;

        if (user.company === "TPS") {
          const internalOrders = data.filter((item) => item.vendor_id === null);
          setInternalWorkOrders(internalOrders);
          setExternalWorkOrders([]);
        } else {
          const externalOrders = data.filter((item) => item.vendor_id !== null);
          setExternalWorkOrders(externalOrders);
          setInternalWorkOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch work orders:", err);
        setError("Failed to load work orders");
      }
    };

    fetchWorkOrders();
  }, [user]);

  useEffect(() => {
    if (selectedWorkOrder) {
      const fetchChildServices = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-child-services`,
            {
              params: {
                cwo_number: selectedWorkOrder.cwo_number,
                cwo_id: selectedWorkOrder.cwo_id,
              },
              headers: { Authorization: user.authToken },
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
              params: { cwo_id: selectedWorkOrder.cwo_id },
              headers: { Authorization: user.authToken },
            }
          );
          setMaterialLineItems(response.data);
        } catch (err) {
          console.error("Failed to fetch child materials:", err);
          setError("Failed to load child materials");
        }
      };

      fetchChildServices();
      fetchChildMaterials();
    }
  }, [selectedWorkOrder]);

  const handleWorkOrderSelect = (event, newValue) => {
    if (newValue) {
      setSelectedWorkOrder(newValue);
      setFormData({
        mwo_number: newValue.mwo_number || "",
        vendor_id: newValue.vendor_id || "",
        vendor_name: newValue.vendor_name || "",
        state: newValue.state || "",
        customer_name: newValue.customer_name || "",
        route_name: newValue.route_name || "",
        workorder_type: newValue.workorder_type || "",
        vendor_route_allocation: newValue.vendor_route_allocation || "",
        internal_manager: newValue.internal_manager || "",
        execution_city: newValue.execution_city || "",
        cwo_id: newValue.cwo_id || "",
        cwo_number: newValue.cwo_number || "",
      });
    } else {
      setSelectedWorkOrder(null);
      setFormData({});
      setChildMaterials([]);
      setMaterialLineItems([]);
      setChildServices([]);
      setWarehouses([]);
      setLocators([]);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ overflowX: "hidden" }}>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid
            container
            spacing={2}
            sx={{
              marginLeft: 1,
              marginTop: 1,
              maxWidth: "100%",
            }}
          >
            <Grid item xs={12} sm={12} md={6}>
              <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group">
                  Requestor
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={internalExternal}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel
                    value="internal"
                    control={<Radio />}
                    label="TPS"
                  />
                  <FormControlLabel
                    value="external"
                    control={<Radio />}
                    label="Partner"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {internalExternal === "external" && (
              <>
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
                    label="Vendor Name"
                    value={formData.vendor_name || ""}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    disabled
                    fullWidth
                  />
                </Grid>
              </>
            )}
            {}
            <Grid item xs={12} sm={6} md={7}>
              <Autocomplete
                value={selectedWorkOrder}
                options={
                  internalExternal === "internal"
                    ? internalWorkOrders
                    : externalWorkOrders
                }
                getOptionLabel={(option) => option.cwo_id.toString() || ""}
                onChange={(event, newValue) => {
                  handleWorkOrderSelect(event, newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                  option.cwo_id === value?.cwo_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="CWO id"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>
            {}

            {/* <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Route Allocation"
                value={formData.vendor_route_allocation || ""}
                InputProps={{ readOnly: true }}
                disabled
                variant="outlined"
                fullWidth
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Route Name"
                value={formData.route_name || ""}
                InputProps={{ readOnly: true }}
                disabled
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Execution City"
                value={formData.execution_city || ""}
                InputProps={{ readOnly: true }}
                disabled
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Execution State"
                value={formData.state || ""}
                InputProps={{ readOnly: true }}
                disabled
                variant="outlined"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="TPS PM"
                value={formData.internal_manager || ""}
                InputProps={{ readOnly: true }}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1.5}>
              <Autocomplete
                value={
                  selectedWarehouseId
                    ? warehouses.find(
                        (warehouse) => warehouse.id === selectedWarehouseId
                      )
                    : null
                }
                options={warehouses}
                getOptionLabel={(option) => option.id.toString() || ""}
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
            <Grid item xs={12} sm={6} md={2.5}>
              <Autocomplete
                value={
                  selectedLocator
                    ? locators.find(
                        (locator) => locator.locator_name === selectedLocator
                      )
                    : null
                }
                options={locators}
                getOptionLabel={(option) =>
                  option.locator_name.toString() || ""
                }
                onChange={(event, newValue) => {
                  setSelectedLocator(newValue ? newValue.locator_name : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Locator"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>
            {}
            {/* <TextField
                        label="Description"
                        value={ || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      /> */}
            {}
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                value={
                  selectedApproverEmail
                    ? approvers.find(
                        (approver) =>
                          approver.reviewer_email === selectedApproverEmail
                      )
                    : null
                }
                options={approvers}
                getOptionLabel={(option) =>
                  option.reviewer_email.toString() || ""
                }
                onChange={(event, newValue) => {
                  setSelectedApproverEmail(
                    newValue ? newValue.reviewer_email : null
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Deployment Head"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="approver-name"
                label="Deployment Head Name"
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
            {selectedLocator && (
              <Grid item xs={12}>
                <Typography variant="h6">Materials</Typography>
                <Grid container spacing={2} mt={1}>
                  {materialLineItems.map((material, index) => (
                    <React.Fragment key={material.record_id}>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          label="Material Code"
                          value={material.material_id || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
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
                          label="CWO QTY"
                          value={material.material_wo_qty || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
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
                          label="CWO Bal QTY"
                          value={material.material_bal_qty || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1}>
                        <TextField
                          disabled
                          label="Locator QTY"
                          value={material.locator_stock || ""}
                          InputProps={{ readOnly: true }}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={1.5}>
                        <TextField
                          label="MM Qty"
                          value={materialLineItems[index]?.mm_qty || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            const mmQty = Number(value);
                            const error =
                              mmQty > Number(material.material_bal_qty)
                                ? "MM Qty cannot exceed Bal Qty"
                                : "";

                            setMaterialLineItems((prevItems) =>
                              prevItems.map((item, idx) =>
                                idx === index
                                  ? {
                                      ...item,
                                      mm_qty: value,
                                      error,
                                      material_mm_price: error
                                        ? ""
                                        : (
                                            mmQty *
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
                          label="Amount"
                          value={
                            materialLineItems[index]?.material_mm_price || ""
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
              </Grid>
            )}
          </Grid>
        )}
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
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
      </Box>
    </ThemeProvider>
  );
};

export default CreateMRS;
