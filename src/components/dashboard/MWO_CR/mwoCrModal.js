import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/authContext";
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
  Chip,
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

const MwoCrModal = ({
  open,
  onClose,
  rowData,
  crMaterials,
  crServices,
  setComment,
  comment,
  handleApprove,
  handleReject,
  crStatus,
  username,
  setSelectedApproverEmail,
  setApproverName,
  approvers,
}) => {
  const { user } = useContext(AuthContext);
  const [isFirstApprover, setIsFirstApprover] = useState(false);
  const [isSecondApprover, setIsSecondApprover] = useState(false);
  const [isThirdApprover, setIsThirdApprover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Check which approver level this is
  useEffect(() => {
    if (rowData && open && crStatus.toLowerCase().includes("pending")) {
      // Check approver level based on status
      const isPendingForX = crStatus === "Pending for approval X";
      const isPendingForY = crStatus === "Pending for approval Y";
      const isPendingForZ = crStatus === "Pending for approval Z";

      // Set approver level states
      setIsFirstApprover(isPendingForX);
      setIsSecondApprover(isPendingForY);
      setIsThirdApprover(isPendingForZ);
    } else {
      // Reset states if not in pending status
      setIsFirstApprover(false);
      setIsSecondApprover(false);
      setIsThirdApprover(false);
    }
  }, [rowData, open, crStatus]);

  const statusStyles = getStatusStyles(crStatus);
  // Check if the current user is allowed to take action on this CR
  const isActionAllowed = useMemo(() => {
    if (!rowData || !crStatus || !username) return false;

    // Check if status is pending
    const isPending = crStatus.toLowerCase().includes("pending");
    if (!isPending) return false;

    // Check if user is not the creator
    const isNotCreator = rowData.created_by !== username.name;
    if (!isNotCreator) return false;

    // Check if user is admin or one of the approvers
    const isAdmin = username.role === "admin";
    const isFirstApprover = username.username === rowData.cr_approver_email;
    const isSecondApprover =
      rowData.cr_approver2_email &&
      username.username === rowData.cr_approver2_email;
    const isThirdApprover =
      rowData.cr_approver3_email &&
      username.username === rowData.cr_approver3_email;

    console.log("Auth check:", {
      isPending,
      isNotCreator,
      isAdmin,
      isFirstApprover,
      isSecondApprover,
      isThirdApprover,
      username: username.username,
      approver1: rowData.cr_approver_email,
      approver2: rowData.cr_approver2_email,
      approver3: rowData.cr_approver3_email,
    });

    return isAdmin || isFirstApprover || isSecondApprover || isThirdApprover;
  }, [rowData, crStatus, username]);

  const handleApproveButton = () => {
    if (!isActionAllowed) return;
    handleApprove();
  };

  const handleRejectButton = () => {
    if (!isActionAllowed) return;
    handleReject();
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
            {crStatus}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Change Request Details
            </Typography>
            <Grid container spacing={2}>
              {rowData ? (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      CR ID:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.cr_mwo_id || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      MWO Number:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.mwo_number || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Customer Name:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.customer_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Total Material Cost:
                    </Typography>
                    <Typography variant="body1">
                      ₹{Number(rowData.total_material_cost || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Total Service Cost:
                    </Typography>
                    <Typography variant="body1">
                      ₹{Number(rowData.total_service_cost || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Created By:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.created_by || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      Created At:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.created_at || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      First Approver:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.cr_approver_name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      First Approver Email:
                    </Typography>
                    <Typography variant="body1">
                      {rowData.cr_approver_email || "N/A"}
                    </Typography>
                  </Grid>

                  {rowData.cr_approver2_name && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Second Approver:
                        </Typography>
                        <Typography variant="body1">
                          {rowData.cr_approver2_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Second Approver Email:
                        </Typography>
                        <Typography variant="body1">
                          {rowData.cr_approver2_email}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {rowData.cr_approver3_name && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Third Approver:
                        </Typography>
                        <Typography variant="body1">
                          {rowData.cr_approver3_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Third Approver Email:
                        </Typography>
                        <Typography variant="body1">
                          {rowData.cr_approver3_email}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {rowData.actioned_by && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Actioned By:
                        </Typography>
                        <Typography variant="body1">
                          {rowData.actioned_by}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Actioned At:
                        </Typography>
                        <Typography variant="body1">
                          {rowData.actioned_at}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {rowData.approver_comments && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Approver Comments:
                      </Typography>
                      <Typography variant="body1">
                        {rowData.approver_comments}
                      </Typography>
                    </Grid>
                  )}
                </>
              ) : (
                <Typography>Loading row data...</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Materials
            </Typography>
            {crMaterials && crMaterials.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>UOM</TableCell>
                      <TableCell>Original Qty</TableCell>
                      <TableCell>New Qty</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crMaterials.map((material) => (
                      <TableRow key={material.record_id}>
                        <TableCell>{material.material_id}</TableCell>
                        <TableCell>{material.material_desc}</TableCell>
                        <TableCell>{material.material_uom}</TableCell>
                        <TableCell>{material.material_old_qty}</TableCell>
                        <TableCell>{material.material_cr_qty}</TableCell>
                        <TableCell>
                          {material.is_removed ? (
                            <Chip label="Removed" color="error" size="small" />
                          ) : material.is_added ? (
                            <Chip label="Added" color="primary" size="small" />
                          ) : Number(material.material_old_qty) !==
                            Number(material.material_cr_qty) ? (
                            <Chip
                              label="Modified"
                              color="warning"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Unchanged"
                              color="success"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No materials available.</Typography>
            )}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, mt: 3 }}>
              Services
            </Typography>
            {crServices && crServices.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service ID</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>UOM</TableCell>
                      <TableCell>Original Qty</TableCell>
                      <TableCell>New Qty</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crServices.map((service) => (
                      <TableRow key={service.record_id}>
                        <TableCell>{service.service_id}</TableCell>
                        <TableCell>{service.service_desc}</TableCell>
                        <TableCell>{service.service_uom}</TableCell>
                        <TableCell>{service.service_old_qty}</TableCell>
                        <TableCell>{service.service_cr_qty}</TableCell>
                        <TableCell>
                          {service.is_removed ? (
                            <Chip label="Removed" color="error" size="small" />
                          ) : service.is_added ? (
                            <Chip label="Added" color="primary" size="small" />
                          ) : Number(service.service_old_qty) !==
                            Number(service.service_cr_qty) ? (
                            <Chip
                              label="Modified"
                              color="warning"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Unchanged"
                              color="success"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No services available.</Typography>
            )}

            {/* Second Approver Selection (only shown for first approver) */}
            {isFirstApprover && isActionAllowed && (
              <Box sx={{ marginTop: "16px" }}>
                <Autocomplete
                  sx={{
                    "& .MuiAutocomplete-listbox .MuiAutocomplete-option": {
                      color: "blue",
                    }, // Dropdown options color
                    "& .MuiOutlinedInput-root": { color: "blue" }, // Selected value color
                  }}
                  disablePortal
                  id="second-approver-select"
                  options={[...approvers].sort(
                    (a, b) =>
                      b.approver2_name?.localeCompare(a.approver2_name || "") ||
                      0
                  )}
                  getOptionLabel={(option) =>
                    option.approver2_email
                      ? `${option.approver2_name} (${option.approver2_email})`
                      : ""
                  }
                  onChange={(event, newValue) => {
                    setSelectedApproverEmail(
                      newValue ? newValue.approver2_email : null
                    );
                    setApproverName(newValue ? newValue.approver2_name : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Second Approver"
                      variant="outlined"
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "blue" }, // Ensures typed text stays blue
                      }}
                    />
                  )}
                />
              </Box>
            )}

            {/* Third Approver Selection (only shown for second approver) */}
            {isSecondApprover && isActionAllowed && (
              <Box sx={{ marginTop: "16px" }}>
                <Autocomplete
                  sx={{
                    "& .MuiAutocomplete-listbox .MuiAutocomplete-option": {
                      color: "blue",
                    }, // Dropdown options color
                    "& .MuiOutlinedInput-root": { color: "blue" }, // Selected value color
                  }}
                  disablePortal
                  id="third-approver-select"
                  options={[...approvers].sort(
                    (a, b) =>
                      b.approver3_name?.localeCompare(a.approver3_name || "") ||
                      0
                  )}
                  getOptionLabel={(option) =>
                    option.approver3_email
                      ? `${option.approver3_name} (${option.approver3_email})`
                      : ""
                  }
                  onChange={(event, newValue) => {
                    setSelectedApproverEmail(
                      newValue ? newValue.approver3_email : null
                    );
                    setApproverName(newValue ? newValue.approver3_name : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Third Approver"
                      variant="outlined"
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": { color: "blue" }, // Ensures typed text stays blue
                      }}
                    />
                  )}
                />
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <TextField
                label="Add Comment"
                fullWidth
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isActionAllowed}
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

export default MwoCrModal;
