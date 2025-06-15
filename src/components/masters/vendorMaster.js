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

const VendorMaster = () => {
  const { user } = useContext(AuthContext);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    vendor_id: "",
    vendor_name: "",
    vendor_location: "",
    vendor_gst_no: "",
    vendor_pan: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all vendors
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/vendors`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setVendors(response.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new vendor
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      vendor_id: "",
      vendor_name: "",
      vendor_location: "",
      vendor_gst_no: "",
      vendor_pan: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing vendor
  const handleOpenEditDialog = (vendor) => {
    setDialogMode("edit");
    setSelectedVendor(vendor);
    setFormData({
      vendor_id: vendor.vendor_id,
      vendor_name: vendor.vendor_name,
      vendor_location: vendor.vendor_location,
      vendor_gst_no: vendor.vendor_gst_no,
      vendor_pan: vendor.vendor_pan,
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVendor(null);
  };

  // Create a new vendor
  const handleCreateVendor = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/vendors`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Vendor created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchVendors();
    } catch (err) {
      console.error("Error creating vendor:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create vendor",
        severity: "error",
      });
    }
  };

  // Update an existing vendor
  const handleUpdateVendor = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/vendors/${selectedVendor.vendor_id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Vendor updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchVendors();
    } catch (err) {
      console.error("Error updating vendor:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update vendor",
        severity: "error",
      });
    }
  };

  // Delete a vendor
  const handleDeleteVendor = async (vendorId) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/vendors/${vendorId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Vendor deleted successfully",
          severity: "success",
        });
        fetchVendors();
      } catch (err) {
        console.error("Error deleting vendor:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete vendor",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateVendor();
    } else {
      handleUpdateVendor();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (vendors.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV header
    const headers = [
      "Vendor ID",
      "Vendor Name",
      "Location",
      "GST Number",
      "PAN Number",
    ].join(",");

    // Create CSV rows
    const csvRows = vendors.map((vendor) => {
      return [
        vendor.vendor_id,
        `"${vendor.vendor_name || ""}"`, // Wrap in quotes to handle commas in name
        `"${vendor.vendor_location || ""}"`, // Wrap in quotes to handle commas in location
        vendor.vendor_gst_no,
        vendor.vendor_pan,
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vendors.csv");
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

  // Validate GST number format
  const validateGST = (gst) => {
    if (!gst) return true; // Allow empty
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  // Validate PAN number format
  const validatePAN = (pan) => {
    if (!pan) return true; // Allow empty
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.vendor_id || !formData.vendor_name) {
      return false;
    }

    if (formData.vendor_gst_no && !validateGST(formData.vendor_gst_no)) {
      return false;
    }

    if (formData.vendor_pan && !validatePAN(formData.vendor_pan)) {
      return false;
    }

    return true;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Vendor Master
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
            Add Vendor
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
              <TableRow sx={{ height: "32px" }}>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Vendor ID
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Vendor Name
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Location
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  GST Number
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  PAN Number
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.vendor_id} sx={{ height: "32px" }}>
                  <TableCell sx={{ py: 0.5 }}>{vendor.vendor_id}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{vendor.vendor_name}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {vendor.vendor_location}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>{vendor.vendor_gst_no}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{vendor.vendor_pan}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(vendor)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteVendor(vendor.vendor_id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Add New Vendor" : "Edit Vendor"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="vendor_id"
                label="Vendor ID"
                value={formData.vendor_id}
                onChange={handleInputChange}
                fullWidth
                disabled={dialogMode === "edit"}
                required
                error={!formData.vendor_id}
                helperText={!formData.vendor_id ? "Vendor ID is required" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="vendor_name"
                label="Vendor Name"
                value={formData.vendor_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!formData.vendor_name}
                helperText={
                  !formData.vendor_name ? "Vendor Name is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="vendor_location"
                label="Location"
                value={formData.vendor_location}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="vendor_gst_no"
                label="GST Number"
                value={formData.vendor_gst_no}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.vendor_gst_no && !validateGST(formData.vendor_gst_no)
                }
                helperText={
                  formData.vendor_gst_no && !validateGST(formData.vendor_gst_no)
                    ? "Invalid GST format (e.g., 22AAAAA0000A1Z5)"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="vendor_pan"
                label="PAN Number"
                value={formData.vendor_pan}
                onChange={handleInputChange}
                fullWidth
                error={formData.vendor_pan && !validatePAN(formData.vendor_pan)}
                helperText={
                  formData.vendor_pan && !validatePAN(formData.vendor_pan)
                    ? "Invalid PAN format (e.g., AAAAA0000A)"
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

export default VendorMaster;
