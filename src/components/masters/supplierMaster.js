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

const SupplierMaster = () => {
  const { user } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplier_id: "",
    supplier_name: "",
    supplier_state: "",
    supplier_pincode: "",
    supplier_address: "",
    supplier_poc: "",
    supplier_mobile: "",
    supplier_email: "",
    supplier_gstin: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/supplier`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSuppliers(response.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new supplier
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      supplier_id: "",
      supplier_name: "",
      supplier_state: "",
      supplier_pincode: "",
      supplier_address: "",
      supplier_poc: "",
      supplier_mobile: "",
      supplier_email: "",
      supplier_gstin: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing supplier
  const handleOpenEditDialog = (supplier) => {
    setDialogMode("edit");
    setSelectedSupplier(supplier);
    setFormData({
      supplier_id: supplier.supplier_id,
      supplier_name: supplier.supplier_name || "",
      supplier_state: supplier.supplier_state || "",
      supplier_pincode: supplier.supplier_pincode || "",
      supplier_address: supplier.supplier_address || "",
      supplier_poc: supplier.supplier_poc || "",
      supplier_mobile: supplier.supplier_mobile || "",
      supplier_email: supplier.supplier_email || "",
      supplier_gstin: supplier.supplier_gstin || "",
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSupplier(null);
  };

  // Create a new supplier
  const handleCreateSupplier = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/supplier`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Supplier created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchSuppliers();
    } catch (err) {
      console.error("Error creating supplier:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create supplier",
        severity: "error",
      });
    }
  };

  // Update an existing supplier
  const handleUpdateSupplier = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/supplier/${selectedSupplier.supplier_id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Supplier updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchSuppliers();
    } catch (err) {
      console.error("Error updating supplier:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update supplier",
        severity: "error",
      });
    }
  };

  // Delete a supplier
  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/supplier/${supplierId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Supplier deleted successfully",
          severity: "success",
        });
        fetchSuppliers();
      } catch (err) {
        console.error("Error deleting supplier:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete supplier",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateSupplier();
    } else {
      handleUpdateSupplier();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (suppliers.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV header
    const headers = [
      "Supplier ID",
      "Supplier Name",
      "State",
      "Pincode",
      "Address",
      "Point of Contact",
      "Mobile",
      "Email",
      "GSTIN",
    ].join(",");

    // Create CSV rows
    const csvRows = suppliers.map((supplier) => {
      return [
        supplier.supplier_id,
        `"${supplier.supplier_name || ""}"`, // Wrap in quotes to handle commas in name
        `"${supplier.supplier_state || ""}"`,
        supplier.supplier_pincode || "",
        `"${supplier.supplier_address || ""}"`, // Wrap in quotes to handle commas in address
        `"${supplier.supplier_poc || ""}"`,
        supplier.supplier_mobile || "",
        supplier.supplier_email || "",
        supplier.supplier_gstin || "",
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "suppliers.csv");
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
    if (!formData.supplier_id || !formData.supplier_name) {
      return false;
    }

    if (formData.supplier_email && !validateEmail(formData.supplier_email)) {
      return false;
    }

    if (formData.supplier_gstin && !validateGST(formData.supplier_gstin)) {
      return false;
    }

    if (formData.supplier_mobile && !validateMobile(formData.supplier_mobile)) {
      return false;
    }

    return true;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Supplier Master
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
            Add Supplier
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
                  "Supplier ID",
                  "Supplier Name",
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
              {suppliers.map((supplier, index) => {
                const bgColor = index % 2 === 0 ? "#ffe5cc" : "#ffffff"; // lighter orange & white

                return (
                  <TableRow
                    key={supplier.supplier_id}
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
                      {supplier.supplier_id}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 150,
                      }}
                    >
                      {supplier.supplier_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 100,
                      }}
                    >
                      {supplier.supplier_state}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 150,
                      }}
                    >
                      {supplier.supplier_poc}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 120,
                      }}
                    >
                      {supplier.supplier_mobile}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 0.5,
                        whiteSpace: "nowrap",
                        overflowX: "auto",
                        maxWidth: 180,
                      }}
                    >
                      {supplier.supplier_email}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, whiteSpace: "nowrap" }}>
                      <IconButton
                        sx={{ color: "#ff9933" }}
                        size="small"
                        onClick={() => handleOpenEditDialog(supplier)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() =>
                          handleDeleteSupplier(supplier.supplier_id)
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
          {dialogMode === "create" ? "Add New Supplier" : "Edit Supplier"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_id"
                label="Supplier ID"
                value={formData.supplier_id}
                onChange={handleInputChange}
                fullWidth
                disabled={dialogMode === "edit"}
                required
                error={!formData.supplier_id}
                helperText={
                  !formData.supplier_id ? "Supplier ID is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_name"
                label="Supplier Name"
                value={formData.supplier_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!formData.supplier_name}
                helperText={
                  !formData.supplier_name ? "Supplier Name is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_state"
                label="State"
                value={formData.supplier_state}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_pincode"
                label="Pincode"
                value={formData.supplier_pincode}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="supplier_address"
                label="Address"
                value={formData.supplier_address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_poc"
                label="Point of Contact"
                value={formData.supplier_poc}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_mobile"
                label="Mobile"
                value={formData.supplier_mobile}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.supplier_mobile &&
                  !validateMobile(formData.supplier_mobile)
                }
                helperText={
                  formData.supplier_mobile &&
                  !validateMobile(formData.supplier_mobile)
                    ? "Invalid mobile number"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_email"
                label="Email"
                value={formData.supplier_email}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.supplier_email &&
                  !validateEmail(formData.supplier_email)
                }
                helperText={
                  formData.supplier_email &&
                  !validateEmail(formData.supplier_email)
                    ? "Invalid email format"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="supplier_gstin"
                label="GSTIN"
                value={formData.supplier_gstin}
                onChange={handleInputChange}
                fullWidth
                error={
                  formData.supplier_gstin &&
                  !validateGST(formData.supplier_gstin)
                }
                helperText={
                  formData.supplier_gstin &&
                  !validateGST(formData.supplier_gstin)
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

export default SupplierMaster;
