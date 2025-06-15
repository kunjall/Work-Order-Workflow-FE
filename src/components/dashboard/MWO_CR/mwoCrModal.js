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
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";

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
      return {
        color: "#ec7c30",
        backgroundColor: "rgba(236, 124, 48, 0.1)",
        borderColor: "#ec7c30",
      };
    } else if (status.toLowerCase().includes("rejected")) {
      return {
        color: "#d32f2f",
        backgroundColor: "rgba(211, 47, 47, 0.1)",
        borderColor: "#d32f2f",
      };
    } else if (status.toLowerCase().includes("approved")) {
      return {
        color: "#2e7d32",
        backgroundColor: "rgba(46, 125, 50, 0.1)",
        borderColor: "#2e7d32",
      };
    }
    return {
      color: "#757575",
      backgroundColor: "rgba(117, 117, 117, 0.1)",
      borderColor: "#757575",
    };
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

  const getStatusIcon = (status) => {
    if (status.toLowerCase().includes("approved")) {
      return <CheckCircleIcon fontSize="small" />;
    } else if (status.toLowerCase().includes("rejected")) {
      return <CancelIcon fontSize="small" />;
    } else if (status.toLowerCase().includes("pending")) {
      return <InfoIcon fontSize="small" />;
    }
    return null;
  };

  const getChangeStatusIcon = (status) => {
    if (status === "Removed") {
      return <RemoveCircleIcon fontSize="small" sx={{ mr: 0.5 }} />;
    } else if (status === "Added") {
      return <AddCircleIcon fontSize="small" sx={{ mr: 0.5 }} />;
    } else if (status === "Modified") {
      return <EditIcon fontSize="small" sx={{ mr: 0.5 }} />;
    } else if (status === "Unchanged") {
      return <DoneIcon fontSize="small" sx={{ mr: 0.5 }} />;
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
          Change Request Details
          {rowData?.cr_mwo_id && (
            <Chip
              label={`CR #${rowData.cr_mwo_id}`}
              size="small"
              sx={{
                ml: 2,
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                color: "#1976d2",
                fontWeight: 600,
                borderRadius: "4px",
              }}
            />
          )}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={getStatusIcon(crStatus)}
            label={crStatus}
            sx={{
              fontWeight: "bold",
              borderWidth: "1px",
              borderStyle: "solid",
              ...statusStyles,
            }}
            variant="outlined"
          />
          <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <DialogContent sx={{ padding: "24px", position: "relative" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  "&:after": {
                    content: '""',
                    display: "block",
                    height: "2px",
                    background: "#ec7c30",
                    flexGrow: 1,
                    ml: 2,
                  },
                }}
              >
                Request Information
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "8px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#fff",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                {rowData ? (
                  <Grid container spacing={2}>
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
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            Second Approver:
                          </Typography>
                          <Typography variant="body1">
                            {rowData.cr_approver2_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
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
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            Third Approver:
                          </Typography>
                          <Typography variant="body1">
                            {rowData.cr_approver3_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
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
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            Actioned By:
                          </Typography>
                          <Typography variant="body1">
                            {rowData.actioned_by}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
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
                  </Grid>
                ) : (
                  <Typography>Loading row data...</Typography>
                )}
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "#333",
                display: "flex",
                alignItems: "center",
                "&:after": {
                  content: '""',
                  display: "block",
                  height: "2px",
                  background: "#ec7c30",
                  flexGrow: 1,
                  ml: 2,
                },
              }}
            >
              Materials Changes
            </Typography>
            {crMaterials && crMaterials.length > 0 ? (
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "8px",
                  mb: 3,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: "rgba(236, 124, 48, 0.08)" }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Material ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        UOM
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Original Qty
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        New Qty
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crMaterials.map((material) => (
                      <TableRow
                        key={material.record_id}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(236, 124, 48, 0.04)",
                          },
                        }}
                      >
                        <TableCell>{material.material_id}</TableCell>
                        <TableCell>{material.material_desc}</TableCell>
                        <TableCell>{material.material_uom}</TableCell>
                        <TableCell>{material.material_old_qty}</TableCell>
                        <TableCell>{material.material_cr_qty}</TableCell>
                        <TableCell>
                          {material.is_removed ? (
                            <Chip
                              icon={getChangeStatusIcon("Removed")}
                              label="Removed"
                              size="small"
                              sx={{
                                color: "#d32f2f",
                                backgroundColor: "rgba(211, 47, 47, 0.1)",
                                borderColor: "#d32f2f",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          ) : material.is_added ? (
                            <Chip
                              icon={getChangeStatusIcon("Added")}
                              label="Added"
                              size="small"
                              sx={{
                                color: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                                borderColor: "#1976d2",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          ) : Number(material.material_old_qty) !==
                            Number(material.material_cr_qty) ? (
                            <Chip
                              icon={getChangeStatusIcon("Modified")}
                              label="Modified"
                              size="small"
                              sx={{
                                color: "#ec7c30",
                                backgroundColor: "rgba(236, 124, 48, 0.1)",
                                borderColor: "#ec7c30",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              icon={getChangeStatusIcon("Unchanged")}
                              label="Unchanged"
                              size="small"
                              sx={{
                                color: "#2e7d32",
                                backgroundColor: "rgba(46, 125, 50, 0.1)",
                                borderColor: "#2e7d32",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: "8px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  mb: 3,
                  color: "#666",
                }}
              >
                <Typography>
                  No material changes in this change request.
                </Typography>
              </Paper>
            )}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                mt: 3,
                color: "#333",
                display: "flex",
                alignItems: "center",
                "&:after": {
                  content: '""',
                  display: "block",
                  height: "2px",
                  background: "#ec7c30",
                  flexGrow: 1,
                  ml: 2,
                },
              }}
            >
              Services Changes
            </Typography>
            {crServices && crServices.length > 0 ? (
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: "8px",
                  mb: 3,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: "rgba(236, 124, 48, 0.08)" }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Service ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        UOM
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Original Qty
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        New Qty
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crServices.map((service) => (
                      <TableRow
                        key={service.record_id}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(236, 124, 48, 0.04)",
                          },
                        }}
                      >
                        <TableCell>{service.service_id}</TableCell>
                        <TableCell>{service.service_desc}</TableCell>
                        <TableCell>{service.service_uom}</TableCell>
                        <TableCell>{service.service_old_qty}</TableCell>
                        <TableCell>{service.service_cr_qty}</TableCell>
                        <TableCell>
                          {service.is_removed ? (
                            <Chip
                              icon={getChangeStatusIcon("Removed")}
                              label="Removed"
                              size="small"
                              sx={{
                                color: "#d32f2f",
                                backgroundColor: "rgba(211, 47, 47, 0.1)",
                                borderColor: "#d32f2f",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          ) : service.is_added ? (
                            <Chip
                              icon={getChangeStatusIcon("Added")}
                              label="Added"
                              size="small"
                              sx={{
                                color: "#1976d2",
                                backgroundColor: "rgba(25, 118, 210, 0.1)",
                                borderColor: "#1976d2",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          ) : Number(service.service_old_qty) !==
                            Number(service.service_cr_qty) ? (
                            <Chip
                              icon={getChangeStatusIcon("Modified")}
                              label="Modified"
                              size="small"
                              sx={{
                                color: "#ec7c30",
                                backgroundColor: "rgba(236, 124, 48, 0.1)",
                                borderColor: "#ec7c30",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              icon={getChangeStatusIcon("Unchanged")}
                              label="Unchanged"
                              size="small"
                              sx={{
                                color: "#2e7d32",
                                backgroundColor: "rgba(46, 125, 50, 0.1)",
                                borderColor: "#2e7d32",
                                fontWeight: "bold",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }}
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: "8px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  mb: 3,
                  color: "#666",
                }}
              >
                <Typography>
                  No service changes in this change request.
                </Typography>
              </Paper>
            )}

            {/* Approver Selection Section */}
            {(isFirstApprover || isSecondApprover) && isActionAllowed && (
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: "#333",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isFirstApprover
                    ? "Select Next Approver"
                    : "Select Final Approver"}
                </Typography>

                <Autocomplete
                  disablePortal
                  id={
                    isFirstApprover
                      ? "second-approver-select"
                      : "third-approver-select"
                  }
                  options={approvers}
                  getOptionLabel={(option) =>
                    isFirstApprover
                      ? option.approver2_email
                        ? `${option.reviewer_name} (${option.reviewer_email})`
                        : ""
                      : option.approver3_email
                      ? `${option.reviewer_name} (${option.reviewer_email})`
                      : ""
                  }
                  onChange={(event, newValue) => {
                    setSelectedApproverEmail(
                      newValue ? newValue.reviewer_email : null
                    );
                    setApproverName(newValue ? newValue.reviewer_name : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={
                        isFirstApprover ? "Second Approver" : "Third Approver"
                      }
                      placeholder={`Select ${
                        isFirstApprover ? "second" : "third"
                      } approver...`}
                      variant="outlined"
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "rgba(0, 0, 0, 0.01)",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.12)",
                        },
                        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ec7c30 !important",
                          borderWidth: "1px",
                        },
                      }}
                    />
                  )}
                  sx={{
                    "& .MuiAutocomplete-endAdornment": {
                      color: "#666",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  {isFirstApprover
                    ? "Select the second approver who will review this change request after your approval."
                    : "Select the final approver who will give the final approval for this change request."}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Approval Comments
              </Typography>
              <TextField
                label="Add your comments here"
                placeholder="Enter your comments regarding this change request..."
                fullWidth
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isActionAllowed}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: isActionAllowed
                      ? "rgba(0, 0, 0, 0.01)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.12)",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ec7c30 !important",
                    borderWidth: "1px",
                  },
                }}
              />
              {!isActionAllowed && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 1,
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  You don't have permission to add comments for this change
                  request.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "flex-end",
          padding: "16px 24px",
          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={handleApproveButton}
          disabled={!isActionAllowed}
          startIcon={<CheckCircleIcon />}
          sx={{
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(46, 125, 50, 0.2)",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
            },
          }}
        >
          Approve
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleRejectButton}
          disabled={!isActionAllowed}
          startIcon={<CancelIcon />}
          sx={{
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(211, 47, 47, 0.2)",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
            },
            ml: 2,
          }}
        >
          Reject
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            ml: 2,
            fontWeight: 600,
            borderColor: "rgba(0, 0, 0, 0.23)",
            color: "#555",
            "&:hover": {
              borderColor: "rgba(0, 0, 0, 0.5)",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MwoCrModal;
