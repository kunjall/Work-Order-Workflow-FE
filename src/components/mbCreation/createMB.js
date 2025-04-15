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
  Dialog,
  DialogActions,
  DialogTitle,
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
  const [locatorStock, setLocatorStock] = useState([]);
  const [locators, setLocators] = useState([]);
  const [selectedLocator, setSelectedLocator] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState(null);
  const [approverName, setApproverName] = useState("");
  const [attachmentLink, setAttachmentLink] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [formData, setFormData] = useState({});
  const [vendorOptions, setVendorOptions] = useState([]);
  const [error, setError] = useState(null);
  const [exists, setExists] = useState(false);
  const [internalExternal, setInternalExternal] = useState("internal");

  const [materialLineItems, setMaterialLineItems] = useState(
    childMaterials.map(() => ({ mb_qty: "" }))
  );

  const [serviceLineItems, setServiceLineItems] = useState(
    childServices.map(() => ({ mb_qty: "" }))
  );
  const totalMaterialAmount = materialLineItems.reduce(
    (acc, item) => acc + Number(item.material_mb_price || 0),
    0
  );

  const handleRadioChange = (event) => {
    setSelectedWorkOrder(null);
    setFormData({});
    setChildMaterials([]);
    setMaterialLineItems([]);
    setServiceLineItems([]);
    setSelectedLocator(null);
    setSelectedApproverEmail(null);
    setChildServices([]);
    setLocators([]);

    if (event.target.value === "internal") {
      setInternalExternal("internal");
    } else {
      setInternalExternal("external");
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedApproverEmail ||
      !selectedWorkOrder ||
      !selectedLocator ||
      !attachmentLink
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

    const requestData = {
      vendor_id: formData.vendor_id,
      tps_pm: formData.internal_manager,
      vendor_name: formData.vendor_name,
      route_name: formData.route_name,
      gis_code: formData.gis_code,
      execution_city: formData.execution_city,
      state: formData.state,
      internal_external: internalExternal,
      locator_name: selectedLocator,
      mb_status: "Pending with deployment head",
      customer_name: formData.customer_name,
      requested_by: createdBy,
      requested_at: createdAt,
      cwo_id: formData.cwo_id,
      cwo_number: formData.cwo_number,
      transaction_type: "W2S",
      mb_approver1_email: selectedApproverEmail,
      mb_approver1_name: approverName,
      attachment_url: attachmentLink,
      materialItems: materialLineItems,
      serviceItems: serviceLineItems,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/mb/create-mb`,
        requestData,
        {
          headers: {
            Authorization: user.authToken,
          },
        }
      );

      if (response.status === 201) {
        alert(`MB submitted`);
        resetForm();
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setError("An error occurred while submitting the data.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/mb/find-mb`,
          {
            params: {
              cwo_number: formData.cwo_number,
              mbstatus: "Pending with billing spoc",
            },
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        if (response.data.length > 0) {
          setExists(true);
          setSelectedWorkOrder(null);
          setFormData({});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (formData.cwo_number) fetchData();
  }, [formData.cwo_number, user.authToken]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=MB&city=${formData.execution_city}&reviewer_name=${formData.internal_manager}`,
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

    if (formData.execution_city && formData.internal_manager) fetchApprovers();
  }, [formData.execution_city, formData.internal_manager, selectedWorkOrder]);

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
    if (materialLineItems.length === 0) {
      setMaterialLineItems(
        materialLineItems.map((material) => ({
          cwo_id: material.cwo_id || "",
          cwo_number: material.cwo_number || "",
          material_record_id: material.record_id || "",
          material_id: material.material_id || "",
          material_desc: material.material_desc || "",
          material_uom: material.material_uom || "",
          material_bal_qty: material.material_bal_qty || "",
          material_cwo_qty: material.material_wo_qty || "",
          material_rate: material.material_rate || "",
          material_mb_qty: "",
          material_mb_price: "",
        }))
      );
    }
  }, [childMaterials, materialLineItems]);

  useEffect(() => {
    if (serviceLineItems.length === 0) {
      setServiceLineItems(
        serviceLineItems.map((service) => ({
          cwo_id: service.cwo_id || "",
          cwo_number: service.cwo_number || "",
          service_record_id: service.record_id || "",
          service_id: service.service_id || "",
          service_desc: service.service || "",
          service_uom: service.service_uom || "",
          service_bal_qty: service.service_bal_qty || "",
          service_cwo_qty: service.service_wo_qty || "",
          service_rate: service.service_rate || "",
          service_mb_qty: "",
          service_mb_price: "",
        }))
      );
    }
  }, [childServices, serviceLineItems]);

  useEffect(() => {
    if (locatorStock.length > 0 && materialLineItems.length > 0) {
      const updatedMaterialLineItems = materialLineItems.map((item) => {
        const matchedLocator = locatorStock.find(
          (locator) => locator.material_id === item.material_id
        );
        return {
          ...item,
          locator_stock: matchedLocator ? matchedLocator.stock_qty : 0,
        };
      });

      setMaterialLineItems((prev) => {
        const isSame =
          JSON.stringify(prev) === JSON.stringify(updatedMaterialLineItems);
        return isSame ? prev : updatedMaterialLineItems;
      });
    }
  }, [locatorStock]);

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
          setServiceLineItems(response.data);
        } catch (err) {
          console.error("Failed to fetch child services:", err);
          setError("Failed to load child services");
        }
      };

      const fetchMmMaterials = async () => {
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
      fetchMmMaterials();
    }
  }, [selectedWorkOrder]);

  const resetForm = () => {
    setSelectedWorkOrder(null);
    setFormData({});
    setChildMaterials([]);
    setMaterialLineItems([]);
    setServiceLineItems([]);
    setChildServices([]);
    setLocators([]);
    setApprovers([]);
    setSelectedApproverEmail([]);
    setApproverName("");
  };

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
        gis_code: newValue.gis_code || "",
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
      setServiceLineItems([]);
      setChildServices([]);
      setLocators([]);
      setApprovers([]);
      setSelectedApproverEmail([]);
      setApproverName("");
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
        {exists ? (
          <Dialog open={exists}>
            <DialogTitle>
              Please wait until previous MB's are processed
            </DialogTitle>
            <DialogActions>
              <Button
                onClick={() => {
                  setExists(false);
                  resetForm();
                }}
              >
                {" "}
                Close
              </Button>
            </DialogActions>
          </Dialog>
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
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
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
                                (option) =>
                                  option.vendorId === formData.vendor_id
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
                      getOptionLabel={(option) => option.cwo_number || ""}
                      onChange={(event, newValue) => {
                        handleWorkOrderSelect(event, newValue);
                      }}
                      isOptionEqualToValue={(option, value) =>
                        option.cwo_number === value?.cwo_number
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

                  <Grid item xs={12} sm={6} md={4}>
                    <Autocomplete
                      value={
                        selectedLocator
                          ? locators.find(
                              (locator) =>
                                locator.locator_name === selectedLocator
                            )
                          : null
                      }
                      options={locators}
                      getOptionLabel={(option) =>
                        option.locator_name.toString() || ""
                      }
                      onChange={(event, newValue) => {
                        setSelectedLocator(
                          newValue ? newValue.locator_name : null
                        );
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
                                approver.reviewer_email ===
                                selectedApproverEmail
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

                  <Grid item xs={12} sm={6} md={3}>
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
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Attachment Link"
                      value={attachmentLink}
                      onChange={(event) =>
                        setAttachmentLink(event.target.value)
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>

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
                              label="Locator QTY"
                              value={material.locator_stock || ""}
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
                              label="Price"
                              value={material.material_rate || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>
                          {/* <Grid item xs={12} sm={6} md={1}>
                      <TextField
                        disabled
                        label="CWO Bal QTY"
                        value={material.material_bal_qty || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid> */}
                          {/* <Grid item xs={12} sm={6} md={1}>
                      <TextField
                        disabled
                        label="Locator QTY"
                        value={material.locator_stock || ""}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid> */}
                          <Grid item xs={12} sm={6} md={1.5}>
                            <TextField
                              label="MB Qty"
                              value={materialLineItems[index]?.mb_qty || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                const mbQty = Number(value);
                                const error =
                                  mbQty > Number(material.locator_stock)
                                    ? "MB Qty cannot exceed Locator Qty"
                                    : "";

                                setMaterialLineItems((prevItems) =>
                                  prevItems.map((item, idx) =>
                                    idx === index
                                      ? {
                                          ...item,
                                          mb_qty: value,
                                          error,
                                          material_mb_price: error
                                            ? ""
                                            : (
                                                mbQty *
                                                Number(material.material_rate)
                                              ).toFixed(2),
                                        }
                                      : item
                                  )
                                );
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "-" ||
                                  e.key === "e" ||
                                  e.key === "E"
                                ) {
                                  e.preventDefault(); // Block negative and exponential input
                                }
                              }}
                              inputProps={{ min: 0 }}
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
                                materialLineItems[index]?.material_mb_price ||
                                ""
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

                  <Grid item xs={12}>
                    <Typography variant="h6">Services</Typography>
                    <Grid container spacing={2} mt={1}>
                      {serviceLineItems.map((service, index) => (
                        <React.Fragment key={service.record_id}>
                          <Grid item xs={12} sm={6} md={2}>
                            <TextField
                              label="Material Code"
                              value={service.service_id || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={2}>
                            <TextField
                              label="Description"
                              value={service.service_desc || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
                              label="MM QTY"
                              value={service.service_bal_qty || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={1}>
                            <TextField
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
                              label="Rate"
                              value={service.service_rate || ""}
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={1.5}>
                            <TextField
                              label="MB Qty"
                              value={serviceLineItems[index]?.mb_qty || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                const mmQty = Number(value);
                                const error =
                                  mmQty > Number(service.service_bal_qty)
                                    ? "MM Qty cannot exceed CWO Qty"
                                    : "";

                                setServiceLineItems((prevItems) =>
                                  prevItems.map((item, idx) =>
                                    idx === index
                                      ? {
                                          ...item,
                                          mb_qty: value,
                                          error,
                                          service_mb_price: error
                                            ? ""
                                            : (
                                                mmQty *
                                                Number(service.service_rate)
                                              ).toFixed(2),
                                        }
                                      : item
                                  )
                                );
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "-" ||
                                  e.key === "e" ||
                                  e.key === "E"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              inputProps={{ min: 0 }}
                              error={!!serviceLineItems[index]?.error}
                              helperText={serviceLineItems[index]?.error || ""}
                              variant="outlined"
                              fullWidth
                              type="number"
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} md={1.5}>
                            <TextField
                              label="Amount"
                              value={
                                serviceLineItems[index]?.service_mb_price || ""
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
              </>
            )}
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CreateMRS;
