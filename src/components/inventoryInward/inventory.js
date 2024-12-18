import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
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
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";
import AddMaterials from "./materialInward";

const InventoryInward = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedClientWarehouseId, setSelectedClientWarehouseId] =
    useState(null);
  const [customers, setCustomers] = useState([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [dcDate, setDCDate] = useState(dayjs());
  const [mrsDate, setMRSDate] = useState(dayjs());
  const [MRSNumber, setMRSNumber] = useState("");
  const [entryDate, setEntryDate] = useState(dayjs());
  const [lineItems, setLineItems] = useState([]);
  const [warehouseState, setWarehouseState] = useState("");
  const [clientWarehouseState, setClientWarehouseState] = useState("");
  const [materialCodes, setMaterialCodes] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerEmail, setSelectedReviewerEmail] = useState(null);
  const [reviewerName, setReviewerName] = useState("");
  const [error, setError] = useState(null);
  const [eWayBillNumber, setEWayBillNumber] = useState("");
  const [deliveryChallanNumber, setdeliveryChallanNumber] = useState("");
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [clientWarehouses, setClientWarehouses] = useState([]);
  let inventoryId = null;

  dayjs.extend(utc); // Add UTC plugin
  dayjs.extend(timezone);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

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
    const fetchReviewers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=Inventory&city=${warehouseState}`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        const reviewerArray = response.data.map((reviewer) => ({
          id: reviewer.record_id,
          type: reviewer.type,
          reviewer_email: reviewer.reviewer_email,
          approver_email: reviewer.approver_email,
          city: reviewer.city,
          reviewer_name: reviewer.reviewer_name,
          approver_name: reviewer.approver_name,
        }));
        setReviewers(reviewerArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };

    if (warehouseState) fetchReviewers();
  }, [warehouseState]);

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

  useEffect(() => {
    if (selectedReviewerEmail) {
      console.log(selectedReviewerEmail);
      const selectedReviewer = reviewers.find(
        (reviewer) => reviewer.reviewer_email === selectedReviewerEmail
      );
      setReviewerName(selectedReviewer ? selectedReviewer.reviewer_name : "");
      console.log(reviewerName);
    } else {
      setReviewerName("");
      console.log("test");
    }
  }, [selectedReviewerEmail, reviewers]);

  useEffect(() => {
    const fetchClientWarehouses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-client-warehouse?company=${customerName}`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(response);
        const clientWarehouseArray = response.data.map((warehouse) => ({
          id: warehouse.warehouse_id,
          city: warehouse.warehouse_city,
        }));
        setClientWarehouses(clientWarehouseArray);
        console.log(clientWarehouseArray);
      } catch (err) {
        console.error("Error fetching warehouse:", err);
        setError("Failed to load warehouses");
      }
    };

    if (customerName) fetchClientWarehouses();
  }, [customerName]);

  useEffect(() => {
    if (selectedClientWarehouseId) {
      const selectedClientWarehouse = clientWarehouses.find(
        (clientWarehouse) => clientWarehouse.id === selectedClientWarehouseId
      );
      setClientWarehouseState(
        selectedClientWarehouse ? selectedClientWarehouse.city : ""
      );
    } else {
      setClientWarehouseState("");
    }
  }, [selectedClientWarehouseId, clientWarehouses]);

  const handleLineItemsUpdate = (updatedLineItems) => {
    setLineItems(updatedLineItems);
  };

  const resetForm = () => {
    setSelectedWarehouseId("");
    setWarehouseState("");

    // Reset date fields to current date, formatted in your desired format
    setDCDate(dayjs().format("MMM DD, YYYY, hh:mm:ss A")); // Adjusted for your date format
    setEntryDate(dayjs().format("MMM DD, YYYY, hh:mm:ss A")); // Adjusted for your date format

    setEWayBillNumber("");
    setdeliveryChallanNumber("");
  };

  const handleSubmit = async () => {
    const createdBy = localStorage.getItem("username") || "unknown";
    const createdAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short", // e.g., "Dec"
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // AM/PM format
      timeZone: "IST", // Adjust to UTC
    });
    const entryDateFormatted = dayjs(entryDate)
      .tz("Asia/Kolkata")
      .format("MMM DD, YYYY, HH:mm")
      .toLocaleString("en-US", {
        day: "2-digit",
        month: "short", // e.g., "Dec"
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // AM/PM format
        timeZone: "IST", // Adjust to UTC
      });

    const dcDateformatted = dayjs(dcDate)
      .tz("Asia/Kolkata")
      .format("MMM DD, YYYY, HH:mm")
      .toLocaleString("en-US", {
        day: "2-digit",
        month: "short", // e.g., "Dec"
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // AM/PM format
        timeZone: "IST",
      });

    const mrsDateFormatted = dayjs(mrsDate)
      .tz("Asia/Kolkata")
      .format("MMM DD, YYYY, HH:mm")
      .toLocaleString("en-US", {
        day: "2-digit",
        month: "short", // e.g., "Dec"
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // AM/PM format
        timeZone: "IST",
      });
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/inventory/create`,
        {
          customer_dc_number: deliveryChallanNumber,
          customer_id: selectedCustomerId,
          customer_name: customerName,
          client_warehouse_id: selectedClientWarehouseId,
          client_warehouse_city: clientWarehouseState,
          warehouse_id: selectedWarehouseId,
          warehouse_city: warehouseState,
          entry_date: entryDateFormatted,
          dc_date: dcDateformatted,
          eway_bill_number: eWayBillNumber,
          mrs_number: MRSNumber,
          mrs_date: mrsDateFormatted,
          inventory_inward_status: "Pending for receipt",
          created_by: createdBy,
          created_at: createdAt,
          inventory_receiver_email: selectedReviewerEmail,
          inventory_receiver_name: reviewerName,
        },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );
      inventoryId = response.data;
      console.log("Inventory ID:", inventoryId);
      console.log("Create Response:", response.data);
    } catch (error) {
      console.error("Error creating child workorder:", error);
      // Handle error appropriately
    }
    try {
      // Ensure the lineItems are mapped and awaited correctly
      const responses = await Promise.all(
        lineItems.map(async (item) => {
          console.log("Sending inventory_id:", inventoryId); // Log to ensure inventoryId is being passed
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/inventory/enterMaterial`,
            {
              record_id: `${deliveryChallanNumber}_${item.materialCode}`,
              customer_dc_number: deliveryChallanNumber,
              material_id: item.materialCode,
              material_desc: item.itemName,
              material_uom: item.itemUom,
              material_wo_qty: item.itemQTY,
              inventory_id: inventoryId, // Ensure inventoryId is being passed
            },
            {
              headers: {
                Authorization: `${localStorage.getItem("token")}`,
              },
            }
          );
          return response; // Return the response so Promise.all can capture it
        })
      );
      console.log("All material responses:", responses);
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
      <div
        style={{
          marginTop: "90px",
          height: "calc(100vh - 60px)",
          marginLeft: "20px",
        }}
      >
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
                    style: {
                      color: "red",
                      fontWeight: "bold",
                    },
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="customer-city"
                  label="Customer State"
                  value={customerState}
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
              <Grid item xs={12} sm={6} md={2}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={clientWarehouses}
                  getOptionLabel={(option) => option.id.toString()}
                  onChange={(event, newValue) => {
                    setSelectedClientWarehouseId(newValue ? newValue.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Client Warehouse ID"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="warehouse-city"
                  label="Warehouse City"
                  value={clientWarehouseState}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={1.5}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    disabled
                    label="Entry Date"
                    value={entryDate}
                    onChange={(newValue) => setEntryDate(newValue)}
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
                  />
                </LocalizationProvider>
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
                      label="Select Warehouse ID"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  id="warehouse-city"
                  label="Warehouse City"
                  value={warehouseState}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  id="delivery-challan-number"
                  label="Customer DC Number"
                  variant="outlined"
                  fullWidth
                  value={deliveryChallanNumber}
                  onChange={(e) => setdeliveryChallanNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="DC Date"
                    value={dcDate}
                    onChange={(newValue) => setDCDate(newValue)}
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
                    format="DD-MMM-YYYY"
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="eway-bill-number"
                  label="EWay Bill Number"
                  variant="outlined"
                  fullWidth
                  value={eWayBillNumber}
                  onChange={(e) => setEWayBillNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={5}>
                <TextField
                  id="MRS Number"
                  label="MRS Number"
                  variant="outlined"
                  fullWidth
                  value={MRSNumber}
                  onChange={(e) => setMRSNumber(e.target.value)}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      step: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="MRS Date"
                    value={mrsDate}
                    onChange={(newValue) => setMRSDate(newValue)}
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
                    format="DD-MMM-YYYY"
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={reviewers}
                  getOptionLabel={(option) => option.reviewer_email.toString()}
                  onChange={(event, newValue) => {
                    setSelectedReviewerEmail(
                      newValue ? newValue.reviewer_email : null
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reviewer Email"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="reviewer-name"
                  label="Reviewer Name"
                  value={reviewerName}
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

              <Grid item xs={11.5}>
                <Divider
                  sx={{
                    borderColor: "#ec7c30",
                    borderWidth: "1px",
                  }}
                />{" "}
                {/* Horizontal Divider */}
              </Grid>
              <Box sx={{ flex: 1, padding: 2 }}>
                <Typography variant="h6">Materials</Typography>
                <AddMaterials
                  materialCodes={materialCodes}
                  onUpdate={handleLineItemsUpdate}
                />
              </Box>
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

export default InventoryInward;
