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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const LocatorMaster = () => {
  const { user } = useContext(AuthContext);
  const [locators, setLocators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedLocator, setSelectedLocator] = useState(null);
  const [formData, setFormData] = useState({
    vendor_name: "",
    locator_name: "",
    type: "",
    internal_external: "",
    city: "",
    customer_name: "",
  });
  const [customerNames, setCustomerNames] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Type options
  const typeOptions = ["Fiber", "Gas"];

  // Internal/External options
  const internalExternalOptions = ["Internal", "External"];

  // Fetch all locators
  const fetchLocators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/locators`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setLocators(response.data);
    } catch (err) {
      console.error("Error fetching locators:", err);
      setError("Failed to load locators");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all locators
  useEffect(() => {
    fetchLocators();
  }, [user.authToken]);

  // Fetch unique customer names for dropdown
  useEffect(() => {
    const fetchCustomerNames = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/unique-customer-names`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setCustomerNames(response.data);
      } catch (err) {
        console.error("Error fetching customer names:", err);
      }
    };

    fetchCustomerNames();
  }, [user.authToken]);

  // Fetch unique vendor names for dropdown
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/unique-vendor-names`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setVendorNames(response.data);
      } catch (err) {
        console.error("Error fetching vendor names:", err);
      }
    };

    fetchVendorNames();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new locator
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      vendor_name: "",
      locator_name: "",
      type: "",
      internal_external: "",
      city: "",
      customer_name: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing locator
  const handleOpenEditDialog = (locator) => {
    setDialogMode("edit");
    setSelectedLocator(locator);
    setFormData({
      vendor_name: locator.vendor_name || "",
      locator_name: locator.locator_name || "",
      type: locator.type || "",
      internal_external: locator.internal_external || "",
      city: locator.city || "",
      customer_name: locator.customer_name || "",
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLocator(null);
  };

  // Create a new locator
  const handleCreateLocator = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/locators`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Locator created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchLocators();
    } catch (err) {
      console.error("Error creating locator:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create locator",
        severity: "error",
      });
    }
  };

  // Update an existing locator
  const handleUpdateLocator = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/locators/${selectedLocator.id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Locator updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchLocators();
    } catch (err) {
      console.error("Error updating locator:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update locator",
        severity: "error",
      });
    }
  };

  // Delete a locator
  const handleDeleteLocator = async (locatorId) => {
    if (window.confirm("Are you sure you want to delete this locator?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/locators/${locatorId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Locator deleted successfully",
          severity: "success",
        });
        fetchLocators();
      } catch (err) {
        console.error("Error deleting locator:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete locator",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateLocator();
    } else {
      handleUpdateLocator();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (locators.length === 0) {
      setSnackbar({
        open: true,
        message: "No data to export",
        severity: "warning",
      });
      return;
    }

    // Create CSV header
    const headers = [
      "ID",
      "Vendor Name",
      "Locator Name",
      "Type",
      "Internal/External",
      "City",
      "Customer Name",
    ].join(",");

    // Create CSV rows
    const csvRows = locators.map((locator) => {
      return [
        locator.id,
        `"${locator.vendor_name || ""}"`, // Wrap in quotes to handle commas in name
        `"${locator.locator_name || ""}"`, // Wrap in quotes to handle commas in name
        `"${locator.type || ""}"`,
        `"${locator.internal_external || ""}"`,
        `"${locator.city || ""}"`,
        `"${locator.customer_name || ""}"`,
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers, ...csvRows].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "locators.csv");
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
    return formData.locator_name.trim() !== "";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Locator Master
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
            Add Locator
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
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Vendor Name
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Locator Name
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Internal/External
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>City</TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Customer Name
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locators.map((locator) => (
                <TableRow key={locator.id} sx={{ height: "32px" }}>
                  <TableCell sx={{ py: 0.5 }}>{locator.id}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{locator.vendor_name}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{locator.locator_name}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{locator.type}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {locator.internal_external}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>{locator.city}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {locator.customer_name}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(locator)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteLocator(locator.id)}
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
          {dialogMode === "create" ? "Add New Locator" : "Edit Locator"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="vendor-name-label">Vendor Name</InputLabel>
                <Select
                  labelId="vendor-name-label"
                  id="vendor_name"
                  name="vendor_name"
                  value={formData.vendor_name}
                  label="Vendor Name"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {vendorNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="locator_name"
                label="Locator Name"
                value={formData.locator_name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!formData.locator_name}
                helperText={
                  !formData.locator_name ? "Locator Name is required" : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formData.type}
                  label="Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {typeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="internal-external-label">
                  Internal/External
                </InputLabel>
                <Select
                  labelId="internal-external-label"
                  id="internal_external"
                  name="internal_external"
                  value={formData.internal_external}
                  label="Internal/External"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {internalExternalOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="city"
                label="City"
                value={formData.city}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="customer-name-label">Customer Name</InputLabel>
                <Select
                  labelId="customer-name-label"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  label="Customer Name"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {customerNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default LocatorMaster;
