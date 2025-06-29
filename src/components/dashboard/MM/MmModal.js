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
import ReceiptIcon from "@mui/icons-material/Receipt";

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
  // Custom field name mappings
  const customFieldNames = {
    mm_id: "MRS ID",
    mm_status: "MRS Status",
    mm_approver1_email: "MRS Approver1 id",
    mm_approver2_email: "MRS Approver2 id",
    mm_approver3_email: "MRS Approver3 id",
    mm_approver1_name: "MRS Approver1 Name",
    mm_approver2_name: "MRS Approver2 Name",
    mm_approver3_name: "MRS Approver3 Name",
    customer_dc_number: "TPS DC Number",
  };

  // Check if we have a custom name for this field
  if (customFieldNames[key]) {
    return customFieldNames[key];
  }

  // Default formatting for other fields
  return key
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
    } else if (status.toLowerCase().includes("acknowledgement")) {
      return {
        color: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        borderColor: "#1976d2",
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
    } else if (status.toLowerCase().includes("acknowledgement")) {
      return <ReceiptIcon fontSize="small" />;
    }
    return null;
  };

  const statusStyles = getStatusStyles(mmStatus);
  const isActionAllowed =
    mmStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.requested_by !== username.name &&
    ((mmStatus.toLowerCase().includes("pending with deployment head") &&
      username.username === rowData?.mm_approver1_email) ||
      (mmStatus.toLowerCase().includes("pending with material incharge") &&
        username.username === rowData?.mm_approver2_email) ||
      (mmStatus.toLowerCase().includes("pending with material head") &&
        username.username === rowData?.mm_approver3_email));

  const isAcknowledgementAllowed =
    mmStatus.toLowerCase().includes("acknowledgement") &&
    ((rowData?.transaction_type?.toLowerCase() === "w2s" &&
      rowData?.requested_by === username.name) ||
      (rowData?.transaction_type?.toLowerCase() === "s2w" &&
        username.role?.includes("inv")));

  const handleApproveButton = () => {
    if (isAcknowledgementAllowed || isActionAllowed) {
      handleApprove();
      onClose();
    }
  };

  const handleRejectButton = () => {
    if (isAcknowledgementAllowed || isActionAllowed) {
      handleReject();
      onClose();
    }
  };

  // List of important fields to display first
  const priorityFields = [
    "customer_name",
    "locator_name",
    "mm_status",
    "transaction_type",
    "requested_by",
    "requested_at",
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
        ![
          "customer_id",
          "warehouse_id",
          "warehouse_city",
          "entry_date",
          "dc_date",
          "eway_bill_number",
          "mrs_number",
          "mrs_date",
          "received_by",
          "received_at",
          "receiver_comments",
          "approved_by",
          "approved_at",
          "approver_comments",
        ].includes(key)
      ) {
        fields.push(key);
      }
    });

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
          Material Requisition Slip
          {rowData?.transaction_type && (
            <Chip
              label={rowData.transaction_type}
              size="small"
              sx={{
                ml: 2,
                backgroundColor:
                  rowData.transaction_type.toLowerCase() === "w2s"
                    ? "rgba(25, 118, 210, 0.1)"
                    : "rgba(236, 124, 48, 0.1)",
                color:
                  rowData.transaction_type.toLowerCase() === "w2s"
                    ? "#1976d2"
                    : "#ec7c30",
                fontWeight: 600,
                borderRadius: "4px",
              }}
            />
          )}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={getStatusIcon(mmStatus)}
            label={mmStatus}
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
          {/* Details Section - Left Column */}
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
                              color: "#555",
                              width: "40%",
                            }}
                          >
                            {formatFieldName(key)}
                          </TableCell>
                          <TableCell
                            sx={{
                              color:
                                key.toLowerCase().includes("customer") ||
                                key.toLowerCase().includes("amount") ||
                                key.toLowerCase().includes("qty")
                                  ? "#d32f2f"
                                  : "inherit",
                              fontWeight:
                                key.includes("id") ||
                                key === "transaction_type" ||
                                key === "mm_status"
                                  ? "500"
                                  : "normal",
                            }}
                          >
                            {key.toLowerCase() === "requested_at" ||
                            key.toLowerCase() === "approved_at" ||
                            key.toLowerCase() === "received_at" ||
                            key.toLowerCase().includes("_date") ||
                            key.toLowerCase() === "entry_time" ||
                            (key.toLowerCase().includes("time") &&
                              !key.toLowerCase().includes("locator"))
                              ? formatDate(rowData[key])
                              : rowData[key] || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography sx={{ color: "#666" }}>
                            Loading request details...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          {/* Materials Section - Right Column */}
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
                Materials Transaction
                {rowData?.transaction_type && (
                  <Typography
                    component="span"
                    sx={{
                      ml: 1,
                      color:
                        rowData.transaction_type.toLowerCase() === "w2s"
                          ? "#1976d2"
                          : "#ec7c30",
                      fontWeight: 600,
                    }}
                  >
                    ({rowData.transaction_type})
                  </Typography>
                )}
              </Typography>
              {mmMaterial && mmMaterial.length > 0 ? (
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
                          Material Code
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Description
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          UOM
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Req QTY
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          CWO Bal QTY
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Locator Stock
                        </TableCell>
                        {mmStatus.toLowerCase() ===
                          "pending with material head" && (
                          <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                            MRS QTY Approved
                          </TableCell>
                        )}
                        {mmStatus.toLowerCase().includes("acknowledgement") && (
                          <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                            MRS QTY Received
                          </TableCell>
                        )}
                        {mmStatus.toLowerCase().includes("acknowledgement") && (
                          <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                            Issued QTY
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mmMaterial.map((material, index) => (
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
                          <TableCell>{material.material_req_qty}</TableCell>
                          <TableCell>{material.material_bal_qty}</TableCell>
                          <TableCell>{material.locator_stock}</TableCell>
                          {(mmStatus.toLowerCase() ===
                            "pending with material head" ||
                            mmStatus
                              .toLowerCase()
                              .includes("acknowledgement")) && (
                            <TableCell>
                              <TextField
                                type="number"
                                variant="outlined"
                                size="small"
                                sx={{
                                  width: "100px",
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
                                value={
                                  material.issued_qty !== null &&
                                  material.issued_qty !== undefined
                                    ? material.issued_qty
                                    : material.material_provided_qty
                                }
                                onChange={(e) =>
                                  handleProvidedQtyChange(e, index)
                                }
                                fullWidth
                                error={
                                  material.issued_qty >
                                  material.material_req_qty
                                }
                                helperText={
                                  material.issued_qty >
                                  material.material_req_qty
                                    ? `Cannot exceed ${material.material_req_qty}`
                                    : ""
                                }
                                inputProps={{
                                  step: "0.001",
                                  min: 0,
                                  inputMode: "decimal",
                                }}
                                onKeyDown={(e) => {
                                  if (["e", "E", "-", "+"].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </TableCell>
                          )}
                          {mmStatus.includes("acknowledgement") && (
                            <TableCell
                              sx={{ fontWeight: 500, color: "#1976d2" }}
                            >
                              {material.material_provided_qty}
                            </TableCell>
                          )}
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
                    No materials available for this transaction.
                  </Typography>
                </Paper>
              )}
            </Box>
            <Box>
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
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "8px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  backgroundColor: "#fff",
                }}
              >
                <TextField
                  label="Add your comments"
                  placeholder="Enter any notes or comments about this material transaction..."
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
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Approver Selection and Comments - New Row */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            {/* Approver Selection Section */}
            {mmStatus.toLowerCase().includes("deployment head") && (
              <Box sx={{ mb: 4, mt: 2 }}>
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
                  Select Material Incharge
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
                  <Autocomplete
                    disablePortal
                    id="material-incharge-select"
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
                        label="Material Incharge"
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
                </Paper>
              </Box>
            )}

            {mmStatus.toLowerCase().includes("material incharge") && (
              <Box sx={{ mb: 4, mt: 2 }}>
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
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "8px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    backgroundColor: "#fff",
                  }}
                >
                  <Autocomplete
                    disablePortal
                    id="material-head-select"
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
                </Paper>
              </Box>
            )}

            {/* Comments Section */}
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
        {isAcknowledgementAllowed && (
          <>
            <Tooltip title="Confirm that you have received the materials">
              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={handleApproveButton}
                sx={{
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
                }}
              >
                Received
              </Button>
            </Tooltip>
            <Tooltip title="Indicate that you have not received the materials">
              <Button
                variant="contained"
                startIcon={<CancelIcon />}
                onClick={handleRejectButton}
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
                Not Received
              </Button>
            </Tooltip>
          </>
        )}

        {!isAcknowledgementAllowed && (
          <>
            <Tooltip
              title={
                !isActionAllowed
                  ? "You don't have permission to accept this request"
                  : "Accept this material request"
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
                  Accept
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                !isActionAllowed
                  ? "You don't have permission to reject this request"
                  : "Reject this material request"
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
          </>
        )}

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

export default MmModal;
