import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

// Utility function to format dates
const formatDate = (isoDateString) => {
  if (!isoDateString) return "N/A";

  const date = new Date(isoDateString);

  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short", // "Dec"
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // AM/PM format
    timeZone: "IST",
  }).format(date);
};

const InventoryModal = ({
  open,
  onClose,
  rowData,
  inventoryMaterial,
  setComment,
  comment,
  handleApprove,
  handleReject,
  setSelectedApproverEmail,
  approvers,
  setApproverName,
  inventoryStatus,
  username,
}) => {
  // Function to determine styles based on the status
  const getStatusStyles = (status) => {
    if (status.toLowerCase().includes("pending")) {
      return {
        backgroundColor: "#ec7c30",
        color: "white",
      };
    } else if (status.toLowerCase().includes("rejected")) {
      return {
        backgroundColor: "red",
        color: "white",
      };
    } else if (status.toLowerCase().includes("approved")) {
      return {
        backgroundColor: "green",
        color: "white",
      };
    }
    return {
      backgroundColor: "gray",
      color: "white",
    }; // Default style
  };

  const statusStyles = getStatusStyles(inventoryStatus);

  const isActionAllowed =
    inventoryStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.created_by !== username;

  const handleApproveButton = () => {
    if (!isActionAllowed) return;
    console.log(comment);
    handleApprove();
    onClose();
  };

  const handleRejectButton = () => {
    if (!isActionAllowed) return;
    console.log("Rejected with comment:");
    handleReject();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="ld" fullWidth>
      <DialogContent sx={{ padding: "24px", position: "relative" }}>
        {/* Status Box */}
        <Box
          sx={{
            position: "absolute",
            top: "16px",
            right: "16px",
            padding: "8px 16px",
            borderRadius: "8px",
            ...statusStyles,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {inventoryStatus}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: "16px" }}
            >
              Details
            </Typography>
            {rowData ? (
              <Grid container spacing={3}>
                {[
                  "customer_name",

                  "inventory_id",
                  "client_warehouse_city",
                  "customer_dc_number",
                  "dc_date",

                  "warehouse_city",

                  "created_by",
                  "created_at",
                  "inventory_inward_status",

                  "received_by",
                  "received_at",
                  "receiver_comments",
                  "approved_by",
                  "approved_at",
                  "approver_comments",

                  ...Object.keys(rowData).filter(
                    (key) =>
                      ![
                        "inventory_id",
                        "customer_dc_number",
                        "customer_id",
                        "customer_name",
                        "warehouse_id",
                        "warehouse_city",
                        "entry_date",
                        "dc_date",
                        "eway_bill_number",
                        "mrs_number",
                        "mrs_date",
                        "client_warehouse_id",
                        "client_warehouse_city",
                        "inventory_inward_status",
                        "created_by",
                        "created_at",
                        "received_by",
                        "received_at",
                        "receiver_comments",
                        "approved_by",
                        "approved_at",
                        "approver_comments",
                        "inventory_approver_name",
                        "inventory_receiver_email",
                        "inventory_receiver_name",
                        "inventory_approver_email",
                      ].includes(key)
                  ), // Include remaining keys not in the explicit order
                ].map((key) => (
                  <Grid item xs={4} key={key}>
                    <Typography
                      variant="body2"
                      color="purple"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "capitalize",
                        marginBottom: "4px",
                      }}
                    >
                      {key.replace(/_/g, " ")}:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        color: key.toLowerCase().includes("customer")
                          ? "red"
                          : "inherit",
                      }}
                    >
                      {key.toLowerCase().includes("date") ||
                      key.toLowerCase().includes("time")
                        ? formatDate(rowData[key])
                        : rowData[key] || "N/A"}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>Loading row data...</Typography>
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: "16px" }}
            >
              Materials Inward
            </Typography>
            {inventoryMaterial && inventoryMaterial.length > 0 ? (
              <TableContainer component={Paper} sx={{ maxHeight: "400px" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material ID</TableCell>
                      <TableCell>Material Description</TableCell>
                      <TableCell>UOM</TableCell>
                      <TableCell>Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryMaterial.map((material) => (
                      <TableRow key={material.record_id}>
                        <TableCell>{material.material_id}</TableCell>
                        <TableCell>{material.material_desc}</TableCell>
                        <TableCell>{material.material_uom}</TableCell>
                        <TableCell>{material.material_wo_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No materials available.</Typography>
            )}
            {/* Approvers Dropdown */}
            {inventoryStatus.toLowerCase() === "pending for receipt" && (
              <Box sx={{ marginTop: "16px" }}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={approvers}
                  getOptionLabel={(option) => option.approver_email.toString()}
                  onChange={(event, newValue) => {
                    setSelectedApproverEmail(
                      newValue ? newValue.approver_email : null
                    );
                    setApproverName(newValue ? newValue.approver_name : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Approver Email"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Box>
            )}
            {/* Comment Box */}
            <Box sx={{ marginTop: "16px" }}>
              <TextField
                label="Add Comment"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          padding: "16px 24px",
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={handleApproveButton}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
          disabled={!isActionAllowed}
        >
          Accept
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleRejectButton}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
          disabled={!isActionAllowed}
        >
          Reject
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Close w/o Action
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryModal;
