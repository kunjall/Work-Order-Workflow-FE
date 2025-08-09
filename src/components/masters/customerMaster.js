import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const CustomerMaster = () => {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    customer_state: "",
    customer_pincode: "",
    customer_address: "",
    customer_poc: "",
    customer_mobile: "",
    customer_email: "",
    customer_gstin: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/customer`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setCustomers(response.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new customer
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      customer_id: "",
      customer_name: "",
      customer_state: "",
      customer_pincode: "",
      customer_address: "",
      customer_poc: "",
      customer_mobile: "",
      customer_email: "",
      customer_gstin: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing customer
  const handleOpenEditDialog = (customer) => {
    setDialogMode("edit");
    setSelectedCustomer(customer);
    setFormData({
      customer_id: customer.customer_id,
      customer_name: customer.customer_name || "",
      customer_state: customer.customer_state || "",
      customer_pincode: customer.customer_pincode || "",
      customer_address: customer.customer_address || "",
      customer_poc: customer.customer_poc || "",
      customer_mobile: customer.customer_mobile || "",
      customer_email: customer.customer_email || "",
      customer_gstin: customer.customer_gstin || "",
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
  };

  // Create a new customer
  const handleCreateCustomer = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/customer`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Customer created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      console.error("Error creating customer:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create customer",
        severity: "error",
      });
    }
  };

  // Update an existing customer
  const handleUpdateCustomer = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/customer/${selectedCustomer.customer_id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Customer updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchCustomers();
    } catch (err) {
      console.error("Error updating customer:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update customer",
        severity: "error",
      });
    }
  };

  // Delete a customer
  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/customer/${customerId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Customer deleted successfully",
          severity: "success",
        });
        fetchCustomers();
      } catch (err) {
        console.error("Error deleting customer:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete customer",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateCustomer();
    } else {
      handleUpdateCustomer();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (customers.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV header
    const headers = [
      "Customer ID",
      "Customer Name",
      "State",
      "Pincode",
      "Address",
      "Point of Contact",
      "Mobile",
      "Email",
      "GSTIN",
    ].join(",");

    // Create CSV rows
    const csvRows = customers.map((customer) => {
      return [
        customer.customer_id,
        `"${customer.customer_name || ""}"`, // Wrap in quotes to handle commas in name
        `"${customer.customer_state || ""}"`,
        customer.customer_pincode || "",
        `"${customer.customer_address || ""}"`, // Wrap in quotes to handle commas in address
        `"${customer.customer_poc || ""}"`,
        customer.customer_mobile || "",
        customer.customer_email || "",
        customer.customer_gstin || "",
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSnackbar({
      open: true,
      message: "CSV exported successfully",
      severity: "success",
    });
  };

  // Validate email format
  const validateEmail = (email) => {
    if (!email) return true; // Allow empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate GST number format
  const validateGST = (gst) => {
    if (!gst) return true; // Allow empty
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  // Validate mobile number
  const validateMobile = (mobile) => {
    if (!mobile) return true; // Allow empty
    return !isNaN(mobile) && mobile.toString().length >= 10;
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.customer_id || !formData.customer_name) {
      return false;
    }

    if (formData.customer_email && !validateEmail(formData.customer_email)) {
      return false;
    }

    if (formData.customer_gstin && !validateGST(formData.customer_gstin)) {
      return false;
    }

    if (formData.customer_mobile && !validateMobile(formData.customer_mobile)) {
      return false;
    }

    return true;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Customer Master
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
            sx={{ mr: 2 }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ height: 24 }}>
                {[
                  "Customer ID",
                  "Customer Name",
                  "State",
                  "Point of Contact",
                  "Mobile",
                  "Email",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: "bold",
                      py: 0.5,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      backgroundColor: "#000000", // black header
                      color: "white", // white text
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer, index) => {
                const bgColor = index % 2 === 0 ? "#ffe5cc" : "#ffffff"; // lighter orange & white

                return (
                  <TableRow
                    key={customer.customer_id}
                    sx={{
                      height: 28,
                      backgroundColor: bgColor,
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 120,
                      }}
                    >
                      {customer.customer_id}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 150,
                      }}
                    >
                      {customer.customer_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 100,
                      }}
                    >
                      {customer.customer_state}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 150,
                      }}
                    >
                      {customer.customer_poc}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 120,
                      }}
                    >
                      {customer.customer_mobile}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 180,
                      }}
                    >
                      {customer.customer_email}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, whiteSpace: "nowrap" }}>
                      <IconButton
                        sx={{ color: "#ff9933" }}
                        size="small"
                        onClick={() => handleOpenEditDialog(customer)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          handleDeleteCustomer(customer.customer_id)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Add New Customer" : "Edit Customer"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_id"
                label="Customer ID"
                value={formData.customer_id}
                onChange={handleInputChange}
                fullWidth
                disabled={dialogMode === "edit"}
                required
                error={!formData.customer_id}
                helperText={
                  !formData.customer_id ? "Customer ID is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_name"
                label="Customer Name"
                value={formData.customer_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!formData.customer_name}
                helperText={
                  !formData.customer_name ? "Customer Name is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_state"
                label="State"
                value={formData.customer_state}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_pincode"
                label="Pincode"
                value={formData.customer_pincode}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="customer_address"
                label="Address"
                value={formData.customer_address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_poc"
                label="Point of Contact"
                value={formData.customer_poc}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_mobile"
                label="Mobile"
                value={formData.customer_mobile}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.customer_mobile &&
                  !validateMobile(formData.customer_mobile)
                }
                helperText={
                  formData.customer_mobile &&
                  !validateMobile(formData.customer_mobile)
                    ? "Invalid mobile number"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_email"
                label="Email"
                value={formData.customer_email}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.customer_email &&
                  !validateEmail(formData.customer_email)
                }
                helperText={
                  formData.customer_email &&
                  !validateEmail(formData.customer_email)
                    ? "Invalid email format"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="customer_gstin"
                label="GSTIN"
                value={formData.customer_gstin}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.customer_gstin &&
                  !validateGST(formData.customer_gstin)
                }
                helperText={
                  formData.customer_gstin &&
                  !validateGST(formData.customer_gstin)
                    ? "Invalid GST format (e.g., 22AAAAA0000A1Z5)"
                    : ""
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!isFormValid()}
          >
            {dialogMode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerMaster;
