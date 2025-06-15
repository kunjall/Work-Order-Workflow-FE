import React from "react";
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
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";

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

// Helper function to format field names for display
const formatFieldName = (key) => {
  let formattedKey = key.replace(/_/g, " ");

  // Special handling for email fields
  if (formattedKey.toLowerCase().includes("email")) {
    formattedKey = formattedKey.replace(/email/gi, "mobile");
  }

  return formattedKey
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const MwoModal = ({
  open,
  onClose,
  rowData,
  motherMaterial,
  setComment,
  motherService,
  comment,
  handleApprove,
  handleReject,
  // handleReturn,
  mwoStatus,
  username,
  setSelectedApproverEmail,
  approvers,
  setApproverName,
}) => {
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

  const statusStyles = getStatusStyles(mwoStatus);
  const isActionAllowed =
    mwoStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.created_by !== username.name &&
    ((mwoStatus.toLowerCase().includes("pending with deployment head") &&
      username.username === rowData?.mwo_approver_email) ||
      (mwoStatus.toLowerCase().includes("pending with acquisition manager") &&
        username.username === rowData?.mwo_approver1_email) ||
      (mwoStatus.toLowerCase().includes("pending with billing spoc") &&
        username.username === rowData?.mwo_approver2_email));

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

  // const handleReturnButton = () => {
  //   if (
  //     (mwoStatus.includes("returned") && username === rowData.created_by) ||
  //     isActionAllowed
  //   ) {
  //     handleReturn();
  //     onClose();
  //   } else {
  //     return;
  //   }
  // };

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
          Mother Work Order Details
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={getStatusIcon(mwoStatus)}
            label={mwoStatus}
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
        <Grid container spacing={4}>
          {/* Details Section */}
          <Grid item xs={12} md={6}>
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
                Work Order Information
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "8px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#fff",
                }}
              >
                <Grid container spacing={2}>
                  {rowData ? (
                    Object.keys(rowData)
                      .filter(
                        (key) => !key.includes("__") && key !== "record_id"
                      ) // Filter out internal fields
                      .map((key) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: "#666",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              {formatFieldName(key)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#333",
                                fontWeight: key.includes("id") ? 600 : 400,
                                backgroundColor: key.includes("id")
                                  ? "rgba(236, 124, 48, 0.08)"
                                  : "transparent",
                                p: key.includes("id") ? 0.5 : 0,
                                borderRadius: key.includes("id") ? 1 : 0,
                                display: key.includes("id")
                                  ? "inline-block"
                                  : "block",
                              }}
                            >
                              {key.toLowerCase().includes("date") ||
                              key.toLowerCase().includes("time")
                                ? formatDate(rowData[key])
                                : typeof rowData[key] === "string"
                                ? rowData[key].replace(/\$/g, "") // Removes `$` from values
                                : rowData[key] || "—"}
                            </Typography>
                          </Box>
                        </Grid>
                      ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", justifyContent: "center", p: 3 }}
                      >
                        <Typography sx={{ color: "#666" }}>
                          Loading work order details...
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          </Grid>

          {/* Materials and Services Section */}
          <Grid item xs={12} md={6}>
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
                Materials
              </Typography>
              {motherMaterial && motherMaterial.length > 0 ? (
                <TableContainer
                  component={Paper}
                  sx={{
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    borderRadius: "8px",
                    mb: 3,
                    maxHeight: 300,
                    overflowY: "auto",
                  }}
                >
                  <Table size="small">
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
                          WO QTY
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Bal QTY
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {motherMaterial.map((material, index) => (
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
                          <TableCell sx={{ fontWeight: 500 }}>
                            {material.material_id}
                          </TableCell>
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
                    No materials available for this work order.
                  </Typography>
                </Paper>
              )}

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
                Services
              </Typography>
              {motherService && motherService.length > 0 ? (
                <TableContainer
                  component={Paper}
                  sx={{
                    boxShadow: "none",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    borderRadius: "8px",
                    mb: 3,
                    maxHeight: 300,
                    overflowY: "auto",
                  }}
                >
                  <Table size="small">
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
                          W/O QTY
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Bal QTY
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {motherService.map((service, index) => (
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
                          <TableCell sx={{ fontWeight: 500 }}>
                            {service.service_id}
                          </TableCell>
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
                    No services available for this work order.
                  </Typography>
                </Paper>
              )}

              {/* Approver Selection Section */}
              {(mwoStatus.toLowerCase().includes("deployment head") ||
                mwoStatus.toLowerCase().includes("acquisition")) && (
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
                    {mwoStatus.toLowerCase().includes("deployment head")
                      ? "Select Acquisition Manager"
                      : "Select Billing SPOC"}
                  </Typography>

                  {mwoStatus.toLowerCase().includes("deployment head") && (
                    <Autocomplete
                      disablePortal
                      id="acquisition-manager-select"
                      options={approvers}
                      getOptionLabel={(option) =>
                        option.approver_email.toString()
                      }
                      onChange={(event, newValue) => {
                        setSelectedApproverEmail(
                          newValue ? newValue.approver_email : null
                        );
                        setApproverName(newValue ? newValue.approver_name : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Acquisition Manager"
                          variant="outlined"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              "&:hover fieldset": {
                                borderColor: "#ec7c30",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#ec7c30",
                              },
                            },
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          color: "#333",
                        },
                      }}
                    />
                  )}

                  {mwoStatus.toLowerCase().includes("acquisition") && (
                    <Autocomplete
                      disablePortal
                      id="billing-spoc-select"
                      options={approvers}
                      getOptionLabel={(option) =>
                        option.approver2_email.toString()
                      }
                      onChange={(event, newValue) => {
                        setSelectedApproverEmail(
                          newValue ? newValue.approver2_email : null
                        );
                        setApproverName(
                          newValue ? newValue.approver2_name : ""
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Billing SPOC"
                          variant="outlined"
                          fullWidth
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                              "&:hover fieldset": {
                                borderColor: "#ec7c30",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#ec7c30",
                              },
                            },
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-inputRoot": {
                          color: "#333",
                        },
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Comments Section */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 3 }} />
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
            Comments
          </Typography>
          <TextField
            label="Add your comments"
            placeholder="Enter any notes or comments about this work order..."
            fullWidth
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": {
                  borderColor: "#ec7c30",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ec7c30",
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          padding: "16px 24px",
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Tooltip
          title={
            !isActionAllowed
              ? "You don't have permission to approve this work order"
              : "Approve this work order"
          }
        >
          <span>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleApproveButton}
              disabled={!isActionAllowed}
              sx={{
                backgroundColor: "#2e7d32",
                "&:hover": {
                  backgroundColor: "#1b5e20",
                },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(46, 125, 50, 0.2)",
              }}
            >
              Approve
            </Button>
          </span>
        </Tooltip>
        <Tooltip
          title={
            !isActionAllowed
              ? "You don't have permission to reject this work order"
              : "Reject this work order"
          }
        >
          <span>
            <Button
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={handleRejectButton}
              disabled={!isActionAllowed}
              sx={{
                backgroundColor: "#d32f2f",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.2)",
                ml: 2,
              }}
            >
              Reject
            </Button>
          </span>
        </Tooltip>
        {/* Commented out Return button
        <Button
          variant="contained"
          color="error"
          // onClick={handleReturnButton}
          disabled={!isActionAllowed}
        >
          Return
        </Button> 
        */}
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderColor: "#757575",
            color: "#757575",
            "&:hover": {
              borderColor: "#424242",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            ml: 2,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MwoModal;
