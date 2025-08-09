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
import GetAppIcon from "@mui/icons-material/GetApp";
import { CSVLink } from "react-csv";

const InventoryMaster = () => {
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const uomOptions = ["EAC", "MTR", "KMS", "PKT", "DAY", "NOS"];
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    item_id: "",
    item_name: "",
    item_uom: "",
    item_company: "",
    item_rate: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch all materials
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/materials`,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setMaterials(response.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [user.authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Open dialog for creating a new material
  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setFormData({
      item_id: "",
      item_name: "",
      item_uom: "",
      item_company: "",
      item_rate: "",
    });
    setOpenDialog(true);
  };

  // Open dialog for editing an existing material
  const handleOpenEditDialog = (material) => {
    setDialogMode("edit");
    setSelectedMaterial(material);
    setFormData({
      item_id: material.item_id,
      item_name: material.item_name,
      item_uom: material.item_uom,
      item_company: material.item_company,
      item_rate: material.item_rate,
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMaterial(null);
  };

  // Create a new material
  const handleCreateMaterial = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/master/materials`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Material created successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchMaterials();
    } catch (err) {
      console.error("Error creating material:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create material",
        severity: "error",
      });
    }
  };

  // Update an existing material
  const handleUpdateMaterial = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/master/materials/${selectedMaterial.entry_id}`,
        formData,
        {
          headers: { Authorization: user.authToken },
        }
      );
      setSnackbar({
        open: true,
        message: "Material updated successfully",
        severity: "success",
      });
      handleCloseDialog();
      fetchMaterials();
    } catch (err) {
      console.error("Error updating material:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update material",
        severity: "error",
      });
    }
  };

  // Delete a material
  const handleDeleteMaterial = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/master/materials/${entryId}`,
          {
            headers: { Authorization: user.authToken },
          }
        );
        setSnackbar({
          open: true,
          message: "Material deleted successfully",
          severity: "success",
        });
        fetchMaterials();
      } catch (err) {
        console.error("Error deleting material:", err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to delete material",
          severity: "error",
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (dialogMode === "create") {
      handleCreateMaterial();
    } else {
      handleUpdateMaterial();
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Prepare CSV export data
  const csvData = materials.map((material) => ({
    "Material ID": material.item_id,
    "Material Name": material.item_name,
    "Unit of Measure": material.item_uom,
    Company: material.item_company,
    Rate: material.item_rate,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Material Master
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {materials.length > 0 && (
            <CSVLink
              data={csvData}
              filename="material_master.csv"
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<GetAppIcon />}
              >
                Export CSV
              </Button>
            </CSVLink>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Material
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
                  Material ID
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>Name</TableCell>
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
              {materials.map((material) => (
                <TableRow key={material.entry_id} sx={{ height: "32px" }}>
                  <TableCell sx={{ py: 0.5 }}>{material.item_id}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{material.item_name}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{material.item_uom}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {material.item_company}
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>{material.item_rate}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenEditDialog(material)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteMaterial(material.entry_id)}
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
          {dialogMode === "create" ? "Add New Material" : "Edit Material"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_id"
                label="Material ID"
                value={formData.item_id}
                onChange={handleInputChange}
                fullWidth
                disabled={dialogMode === "edit"}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_name"
                label="Material Name"
                value={formData.item_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={uomOptions}
                value={formData.item_uom || null}
                onChange={(event, newValue) => {
                  handleInputChange({
                    target: {
                      name: "item_uom",
                      value: newValue,
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="item_uom"
                    label="Unit of Measure"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_company"
                label="Company"
                value={formData.item_company}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="item_rate"
                label="Rate"
                type="number"
                value={formData.item_rate}
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

export default InventoryMaster;
