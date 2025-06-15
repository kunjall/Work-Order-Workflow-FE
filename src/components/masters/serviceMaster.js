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
  Autocomplete,
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

const ServiceMaster = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const uomOptions = ["METER", "EAC", "DAY"];
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    service_id: "",
    service_description: "",
    service_UOM: "",
    service_company: "",
    service_rate: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/services`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new service
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      service_id: "",
      service_description: "",
      service_UOM: "",
      service_company: "",
      service_rate: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing service
  const handleOpenEditDialog = (service) => {
    setDialogMode("edit");
    setSelectedService(service);
    setFormData({
      service_id: service.service_id,
      service_description: service.service_description,
      service_UOM: service.service_UOM,
      service_company: service.service_company,
      service_rate: service.service_rate,
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
  };

  // Create a new service
  const handleCreateService = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/services`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Service created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchServices();
    } catch (err) {
      console.error("Error creating service:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create service",
        severity: "error",
      });
    }
  };

  // Update an existing service
  const handleUpdateService = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/services/${selectedService.service_id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Service updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchServices();
    } catch (err) {
      console.error("Error updating service:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update service",
        severity: "error",
      });
    }
  };

  // Delete a service
  const handleDeleteService = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/services/${serviceId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Service deleted successfully",
          severity: "success",
        });
        fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete service",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateService();
    } else {
      handleUpdateService();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (services.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV header
    const headers = [
      "Service ID",
      "Description",
      "UOM",
      "Company",
      "Rate",
    ].join(",");

    // Create CSV rows
    const csvRows = services.map((service) => {
      return [
        service.service_id,
        `"${service.service_description || ""}"`, // Wrap in quotes to handle commas in description
        service.service_UOM,
        `"${service.service_company || ""}"`, // Wrap in quotes to handle commas in company
        service.service_rate,
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "services.csv");
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Service Master
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
            Add Service
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
                  Service ID
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>UOM</TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Company
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>Rate</TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.service_id} sx={{ height: "32px" }}>
                  <TableCell sx={{ py: 0.5 }}>{service.service_id}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {service.service_description}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>{service.service_UOM}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {service.service_company}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>{service.service_rate}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(service)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteService(service.service_id)}
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
          {dialogMode === "create" ? "Add New Service" : "Edit Service"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="service_id"
                label="Service ID"
                value={formData.service_id}
                onChange={handleInputChange}
                fullWidth
                disabled={dialogMode === "edit"}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="service_description"
                label="Service Description"
                value={formData.service_description}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={uomOptions}
                value={formData.service_UOM || null}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: {
                      name: "service_UOM",
                      value: newValue,
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="service_UOM"
                    label="Unit of Measure"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="service_company"
                label="Company"
                value={formData.service_company}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="service_rate"
                label="Rate"
                type="number"
                value={formData.service_rate}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
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

export default ServiceMaster;
