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

const CustomerWhMaster = () => {
  const { user } = useContext(AuthContext);
  const [clientWarehouses, setClientWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    warehouse_id: "",
    warehouse_city: "",
    warehouse_company: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all client warehouses
  const fetchClientWarehouses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/customerWarehouse`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setClientWarehouses(response.data);
    } catch (err) {
      console.error("Error fetching customer warehouses:", err);
      setError("Failed to load customer warehouses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientWarehouses();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new client warehouse
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      warehouse_id: "",
      warehouse_city: "",
      warehouse_company: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing client warehouse
  const handleOpenEditDialog = (warehouse) => {
    setDialogMode("edit");
    setSelectedWarehouse(warehouse);
    setFormData({
      warehouse_id: warehouse.warehouse_id,
      warehouse_city: warehouse.warehouse_city || "",
      warehouse_company: warehouse.warehouse_company || "",
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWarehouse(null);
  };

  // Create a new client warehouse
  const handleCreateClientWarehouse = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/customerWarehouse`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Customer warehouse created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchClientWarehouses();
    } catch (err) {
      console.error("Error creating customer warehouse:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Failed to create customer warehouse",
        severity: "error",
      });
    }
  };

  // Update an existing client warehouse
  const handleUpdateClientWarehouse = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/customerWarehouse/${selectedWarehouse.warehouse_id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Customer warehouse updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchClientWarehouses();
    } catch (err) {
      console.error("Error updating customer warehouse:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message || "Failed to update customer warehouse",
        severity: "error",
      });
    }
  };

  // Delete a client warehouse
  const handleDeleteClientWarehouse = async (warehouseId) => {
    if (
      window.confirm("Are you sure you want to delete this customer warehouse?")
    ) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/customerWarehouse/${warehouseId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Customer warehouse deleted successfully",
          severity: "success",
        });
        fetchClientWarehouses();
      } catch (err) {
        console.error("Error deleting customer warehouse:", err);
        setSnackbar({
          open: true,
          message:
            err.response?.data?.message ||
            "Failed to delete customer warehouse",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateClientWarehouse();
    } else {
      handleUpdateClientWarehouse();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (clientWarehouses.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV header
    const headers = [
      "Warehouse ID",
      "Warehouse City",
      "Warehouse Company",
    ].join(",");

    // Create CSV rows
    const csvRows = clientWarehouses.map((warehouse) => {
      return [
        warehouse.warehouse_id,
        `"${warehouse.warehouse_city || ""}"`, // Wrap in quotes to handle commas in city
        `"${warehouse.warehouse_company || ""}"`, // Wrap in quotes to handle commas in company
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "client_warehouses.csv");
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

  // Check if form is valid
  const isFormValid = () => {
    return formData.warehouse_id && formData.warehouse_city;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Customer Warehouse Master
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
            Add Customer Warehouse
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
                  Warehouse ID
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Warehouse City
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Warehouse Company
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientWarehouses.map((warehouse) => (
                <TableRow key={warehouse.warehouse_id} sx={{ height: "32px" }}>
                  <TableCell sx={{ py: 0.5 }}>
                    {warehouse.warehouse_id}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {warehouse.warehouse_city}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {warehouse.warehouse_company}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(warehouse)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() =>
                        handleDeleteClientWarehouse(warehouse.warehouse_id)
                      }
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create"
            ? "Add New Customer Warehouse"
            : "Edit Customer Warehouse"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="warehouse_id"
                label="Warehouse ID"
                value={formData.warehouse_id}
                onChange={handleInputChange}
                fullWidth
                disabled={dialogMode === "edit"}
                required
                error={!formData.warehouse_id}
                helperText={
                  !formData.warehouse_id ? "Warehouse ID is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="warehouse_city"
                label="Warehouse City"
                value={formData.warehouse_city}
                onChange={handleInputChange}
                fullWidth
                required
                error={!formData.warehouse_city}
                helperText={
                  !formData.warehouse_city ? "Warehouse City is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="warehouse_company"
                label="Warehouse Company"
                value={formData.warehouse_company}
                onChange={handleInputChange}
                fullWidth
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

export default CustomerWhMaster;
