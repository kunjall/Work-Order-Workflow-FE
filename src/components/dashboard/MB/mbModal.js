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
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import AttachmentIcon from "@mui/icons-material/Attachment";

const formatDate = (isoDateString) => {
  if (!isoDateString) return "N/A";

  // Check if the string is actually a date string
  if (
    typeof isoDateString !== "string" ||
    !/\d{4}-\d{2}-\d{2}|^\d{4}\/\d{2}\/\d{2}/.test(isoDateString)
  ) {
    return isoDateString;
  }

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata", // Using standard timezone identifier for IST
  }).format(date);
};

// Helper function to format field names for display
const formatFieldName = (key) => {
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const MbModal = ({
  open,
  onClose,
  rowData,
  childMaterial,
  setComment,
  childService,
  comment,
  handleApprove,
  handleReject,
  mbStatus,
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

  const statusStyles = getStatusStyles(mbStatus);

  const isActionAllowed =
    mbStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.requested_by !== username.name &&
    ((mbStatus.toLowerCase().includes("pending with deployment head") &&
      username.username === rowData?.mb_approver1_email) ||
      (mbStatus.toLowerCase().includes("pending with material head") &&
        username.username === rowData?.mb_approver2_email) ||
      (mbStatus.toLowerCase().includes("pending with billing spoc") &&
        username.username === rowData?.mb_approver3_email));

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

  // List of important fields to display first
  const priorityFields = [
    "mb_id",
    "mb_sheet_number",
    "mb_status",
    "route_name",
    "requested_by",
    "requested_at",
    "attachment_url",
  ];

  // Get all fields to display
  const getFieldsToDisplay = () => {
    if (!rowData) return [];

    // Start with priority fields
    const fields = [...priorityFields];

    // Add remaining fields that aren't in the excluded list
    Object.keys(rowData).forEach((key) => {
      if (
        !priorityFields.includes(key) &&
        !["record_id", "__v", "_id"].includes(key)
      ) {
        fields.push(key);
      }
    });

    // Debug log to check if route_name exists in rowData

    return fields;
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
          Measurement Book Details
          {rowData?.mb_sheet_number && (
            <Chip
              label={`Sheet #${rowData.mb_sheet_number}`}
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
            icon={getStatusIcon(mbStatus)}
            label={mbStatus}
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
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderRadius: "10px",
                  overflow: "visible",
                  border: "1px solid #eaeaea",
                  width: "100%",
                  maxHeight: "500px",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          backgroundColor: "#f5f5f5",
                          fontWeight: "600",
                          color: "#555",
                        }}
                      >
                        Field
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: "#f5f5f5",
                          fontWeight: "600",
                          color: "#555",
                        }}
                      >
                        Value
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rowData ? (
                      getFieldsToDisplay().map((key, index) => (
                        <TableRow
                          key={key}
                          sx={{
                            "&:nth-of-type(odd)": {
                              backgroundColor: "#fafafa",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "500",
                              textTransform: "capitalize",
                              color:
                                key === "attachment_url" ? "#1976d2" : "#555",
                              width: "40%",
                            }}
                          >
                            {formatFieldName(key)}
                          </TableCell>
                          <TableCell>
                            {key.toLowerCase() === "attachment_url" &&
                            rowData[key] ? (
                              <Link
                                href={rowData[key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color: "#1976d2",
                                  textDecoration: "none",
                                  fontWeight: 500,
                                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  "&:hover": {
                                    backgroundColor: "rgba(25, 118, 210, 0.12)",
                                    textDecoration: "underline",
                                  },
                                }}
                              >
                                <AttachmentIcon
                                  sx={{ mr: 0.5, fontSize: "1rem" }}
                                />
                                View Attachment
                              </Link>
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    key.toLowerCase().includes("customer") ||
                                    key.toLowerCase().includes("budget") ||
                                    key.toLowerCase().includes("cost")
                                      ? "#d32f2f"
                                      : "inherit",
                                  fontWeight:
                                    key.includes("id") ||
                                    key.includes("number") ||
                                    key === "mb_status"
                                      ? "500"
                                      : "normal",
                                  display: "block",
                                }}
                              >
                                {key.toLowerCase() === "requested_at" ||
                                key.toLowerCase() === "approved_at" ||
                                key.toLowerCase() === "received_at" ||
                                (key.toLowerCase().includes("_date") &&
                                  !key.toLowerCase().includes("mb_status")) ||
                                (key.toLowerCase().includes("time") &&
                                  !key.toLowerCase().includes("status"))
                                  ? formatDate(rowData[key])
                                  : rowData[key] !== null &&
                                    rowData[key] !== undefined &&
                                    rowData[key] !== ""
                                  ? rowData[key]
                                  : "N/A"}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography sx={{ color: "#666" }}>
                            Loading MB details...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          {/* Materials and Services Section */}
          <Grid item xs={12} md={7}>
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
              {childMaterial && childMaterial.length > 0 ? (
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
                          MB QTY
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {childMaterial.map((material, index) => (
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
                          <TableCell>{material.material_log_qty}</TableCell>
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
                    No materials available for this measurement book.
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
              {childService && childService.length > 0 ? (
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
                          MB QTY
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {childService.map((service, index) => (
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
                          <TableCell>{service.service_log_qty}</TableCell>
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
                    No services available for this measurement book.
                  </Typography>
                </Paper>
              )}

              {/* Approver Selection Section */}
              {mbStatus.toLowerCase().includes("deployment head") && (
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
                    Select Material Head
                  </Typography>
                  <Autocomplete
                    disablePortal
                    id="material-head-select"
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
                        label="Material Head"
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
                </Box>
              )}

              {mbStatus.toLowerCase().includes("material head") && (
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
                    Select Billing SPOC
                  </Typography>
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
                      setApproverName(newValue ? newValue.approver2_name : "");
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
                </Box>
              )}
            </Box>

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
                placeholder="Enter any notes or comments about this measurement book..."
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
          </Grid>
        </Grid>
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
              ? "You don't have permission to approve this measurement book"
              : "Approve this measurement book"
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
              ? "You don't have permission to reject this measurement book"
              : "Reject this measurement book"
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

export default MbModal;
