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
    second: "2-digit",
    hour12: true, // AM/PM format
    timeZone: "UTC",
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
  setSelectedApproverEmail,
  approvers,
  setApproverName,
}) => {
  const handleApproveButton = () => {
    console.log(comment);
    handleApprove();
    onClose();
  };

  const handleReject = () => {
    console.log("Rejected with comment:");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="ld" fullWidth>
      <DialogContent sx={{ padding: "24px" }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: "16px" }}
            >
              Details
            </Typography>
            {rowData ? (
              <Grid container spacing={2}>
                {Object.entries(rowData).map(([key, value]) => (
                  <Grid item xs={5} key={key}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
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
                      }}
                    >
                      {key.toLowerCase().includes("date") ||
                      key.toLowerCase().includes("time")
                        ? formatDate(value)
                        : value || "N/A"}
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
              Materials
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
                  setApproverName(newValue.approver_name);
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
        >
          Accept
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleReject}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
          }}
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
