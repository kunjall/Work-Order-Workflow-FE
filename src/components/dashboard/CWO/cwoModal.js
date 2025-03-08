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
} from "@mui/material";

const formatDate = (isoDateString) => {
  if (!isoDateString) return "N/A";
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "IST",
  }).format(date);
};

const MwoModal = ({
  open,
  onClose,
  rowData,
  childMaterial,
  setComment,
  childService,
  comment,
  handleApprove,
  handleReject,
  cwoStatus,
  username,
}) => {
  const getStatusStyles = (status) => {
    if (status.toLowerCase().includes("pending")) {
      return { backgroundColor: "#ec7c30", color: "white" };
    } else if (status.toLowerCase().includes("rejected")) {
      return { backgroundColor: "red", color: "white" };
    } else if (status.toLowerCase().includes("approved")) {
      return { backgroundColor: "green", color: "white" };
    }
    return { backgroundColor: "gray", color: "white" };
  };

  const statusStyles = getStatusStyles(cwoStatus);
  const isActionAllowed =
    cwoStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.created_by !== username &&
    (cwoStatus.toLowerCase() !== "pending for approval" ||
      username === rowData.cwo_approver_email);

  const handleApproveButton = () => {
    if (!isActionAllowed) return;
    handleApprove();
    onClose();
  };

  const handleRejectButton = () => {
    if (!isActionAllowed) return;
    handleReject();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ padding: "24px", position: "relative" }}>
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
            {cwoStatus}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Details
            </Typography>
            <Grid container spacing={2}>
              {rowData ? (
                Object.keys(rowData).map((key) => (
                  <Grid item xs={6} key={key}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                    >
                      {key.replace(/_/g, " ")}:
                    </Typography>
                    <Typography variant="body1">
                      {key.toLowerCase().includes("date") ||
                      key.toLowerCase().includes("time")
                        ? formatDate(rowData[key])
                        : rowData[key] || "N/A"}
                    </Typography>
                  </Grid>
                ))
              ) : (
                <Typography>Loading row data...</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Materials
            </Typography>
            {childMaterial && childMaterial.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>UOM</TableCell>
                      <TableCell>W/O QTY</TableCell>
                      <TableCell>Bal QTY</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {childMaterial.map((material) => (
                      <TableRow key={material.record_id}>
                        <TableCell>{material.material_id}</TableCell>
                        <TableCell>{material.material_desc}</TableCell>
                        <TableCell>{material.material_uom}</TableCell>
                        <TableCell>{material.material_wo_qty}</TableCell>
                        <TableCell>{material.material_bal_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No materials available.</Typography>
            )}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Services
            </Typography>
            {childService && childService.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>UOM</TableCell>
                      <TableCell>W/O QTY</TableCell>
                      <TableCell>Bal QTY</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {childService.map((service) => (
                      <TableRow key={service.record_id}>
                        <TableCell>{service.service_id}</TableCell>
                        <TableCell>{service.service_desc}</TableCell>
                        <TableCell>{service.service_uom}</TableCell>
                        <TableCell>{service.service_wo_qty}</TableCell>
                        <TableCell>{service.service_bal_qty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No services available.</Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <TextField
                label="Add Comment"
                fullWidth
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", padding: "16px 24px" }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleApproveButton}
          disabled={!isActionAllowed}
        >
          Approve
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleRejectButton}
          disabled={!isActionAllowed}
        >
          Reject
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MwoModal;
