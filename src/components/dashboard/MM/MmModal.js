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

const MmModal = ({
  open,
  onClose,
  rowData,
  mmMaterial,
  setComment,
  comment,
  handleApprove,
  handleReject,
  setSelectedApproverEmail,
  approvers,
  setApproverName,
  mmStatus,
  username,
  handleProvidedQtyChange,
}) => {
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
    };
  };

  const statusStyles = getStatusStyles(mmStatus);

  const isActionAllowed =
    mmStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.requested_by !== username &&
    ((mmStatus.toLowerCase().includes("pending with deployment head") &&
      username === rowData?.mm_approver1_email) ||
      (mmStatus.toLowerCase().includes("pending with material incharge") &&
        username === rowData?.mm_approver2_email) ||
      (mmStatus.toLowerCase().includes("pending with material head") &&
        username === rowData?.mm_approver3_email));

  const handleApproveButton = () => {
    if (
      (mmStatus.includes("acknowledgement") &&
        username === rowData.requested_by) ||
      isActionAllowed
    ) {
      handleApprove();
      onClose();
    } else {
      return;
    }
  };

  const handleRejectButton = () => {
    if (!isActionAllowed) return;
    handleReject();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="ld" fullWidth>
      <DialogContent sx={{ padding: "24px", position: "relative" }}>
        {}
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
            {mmStatus}
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
                  "locator_name",
                  "mm_status",
                  "requested_by",
                  "requested_at",

                  ...Object.keys(rowData).filter(
                    (key) =>
                      ![
                        "customer_id",
                        "customer_name",
                        "warehouse_id",
                        "warehouse_city",
                        "entry_date",
                        "dc_date",
                        "eway_bill_number",
                        "mrs_number",
                        "mrs_date",
                        "requested_by",
                        "requested_at",
                        "received_by",
                        "received_at",
                        "receiver_comments",
                        "approved_by",
                        "approved_at",
                        "approver_comments",
                      ].includes(key)
                  ),
                ].map((key) => (
                  <Grid item xs={6} key={key}>
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
            {mmMaterial && mmMaterial.length > 0 ? (
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material Code</TableCell>
                      <TableCell>Material Desc</TableCell>
                      <TableCell>UOM</TableCell>
                      <TableCell>Req QTY</TableCell>
                      <TableCell>CWO Bal QTY</TableCell>
                      <TableCell>Locator Stock</TableCell>
                      {mmStatus === "Pending with material head" && (
                        <TableCell>MRS QTY Approved</TableCell>
                      )}
                      {mmStatus.includes("acknowledgement") && (
                        <TableCell>Issued QTY</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mmMaterial.map((material, index) => (
                      <TableRow key={material.record_id}>
                        <TableCell>{material.material_id}</TableCell>
                        <TableCell>{material.material_desc}</TableCell>
                        <TableCell>{material.material_uom}</TableCell>
                        <TableCell>{material.material_req_qty}</TableCell>
                        <TableCell>{material.material_bal_qty}</TableCell>
                        <TableCell>{material.locator_stock}</TableCell>
                        {mmStatus === "Pending with material head" && (
                          <TableCell>
                            <TextField
                              type="number"
                              variant="outlined"
                              size="small"
                              sx={{ width: "100px" }}
                              value={
                                material.issued_qty !== null &&
                                material.issued_qty !== undefined
                                  ? material.issued_qty
                                  : ""
                              }
                              onChange={(e) =>
                                handleProvidedQtyChange(e, index)
                              }
                              fullWidth
                              error={
                                material.issued_qty > material.material_bal_qty
                              }
                              helperText={
                                material.issued_qty > material.material_bal_qty
                                  ? `Cannot exceed the balance quantity of ${material.material_bal_qty}`
                                  : ""
                              }
                            />
                          </TableCell>
                        )}
                        {mmStatus.includes("acknowledgement") && (
                          <TableCell>
                            {material.material_provided_qty}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No materials available.</Typography>
            )}
            {}
            {mmStatus.toLowerCase().includes("deployment head") && (
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
                      label="Material Incharge"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Box>
            )}
            {mmStatus.toLowerCase().includes("material incharge") && (
              <Box sx={{ marginTop: "16px" }}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={approvers}
                  getOptionLabel={(option) => option.approver2_email.toString()}
                  onChange={(event, newValue) => {
                    setSelectedApproverEmail(
                      newValue ? newValue.approver2_email : null
                    );
                    setApproverName(newValue ? newValue.approver2_name : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Material Head"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </Box>
            )}
            {}
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
        {mmStatus.toLowerCase().includes("acknowledgement") &&
          rowData.requested_by === username && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleApproveButton}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Recieved
            </Button>
          )}
        {mmStatus.toLowerCase().includes("acknowledgement") &&
          rowData.requested_by === username && (
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectButton}
              sx={{
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Not Recieved
            </Button>
          )}

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

export default MmModal;
