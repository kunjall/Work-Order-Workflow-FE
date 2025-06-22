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

  const statusStyles = getStatusStyles(inventoryStatus);

  const isActionAllowed =
    inventoryStatus.toLowerCase().includes("pending") &&
    rowData &&
    username.name !== rowData.created_by &&
    (inventoryStatus.toLowerCase() !== "pending for approval" ||
      username.username === rowData.inventory_approver_email);

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
    "customer_name",
    "inventory_id",
    "client_warehouse_city",
    "customer_dc_number",
    "dc_date",
    "warehouse_id",
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
  ];

  // Fields to exclude from display
  const excludedFields = [
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
  ];

  // Get all fields to display
  const getFieldsToDisplay = () => {
    if (!rowData) return [];

    // Start with priority fields
    const fields = [...priorityFields];

    // Add remaining fields that aren't in the excluded list
    Object.keys(rowData).forEach((key) => {
      if (!excludedFields.includes(key) && !fields.includes(key)) {
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
          Inventory Details
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={getStatusIcon(inventoryStatus)}
            label={inventoryStatus}
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
                Inventory Information
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
                    {getFieldsToDisplay().map((key) => (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: key.toLowerCase().includes("customer")
                                ? "#d32f2f"
                                : "#666",
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
                                : key.toLowerCase().includes("customer")
                                ? "rgba(211, 47, 47, 0.05)"
                                : "transparent",
                              p:
                                key.includes("id") ||
                                key.toLowerCase().includes("customer")
                                  ? 0.5
                                  : 0,
                              borderRadius:
                                key.includes("id") ||
                                key.toLowerCase().includes("customer")
                                  ? 1
                                  : 0,
                              display:
                                key.includes("id") ||
                                key.toLowerCase().includes("customer")
                                  ? "inline-block"
                                  : "block",
                            }}
                          >
                            {key.toLowerCase().includes("date") ||
                            key.toLowerCase().includes("time") ||
                            (key.toLowerCase().includes("_at") &&
                              !key.toLowerCase().includes("status") &&
                              !key.toLowerCase().includes("created_by"))
                              ? formatDate(rowData[key])
                              : rowData[key] || "—"}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <Typography sx={{ color: "#666" }}>
                      Loading inventory details...
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>

          {/* Materials Section */}
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
                Materials Inward
              </Typography>
              {inventoryMaterial && inventoryMaterial.length > 0 ? (
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
                          Quantity
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryMaterial.map((material, index) => (
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
                    No materials available for this inventory.
                  </Typography>
                </Paper>
              )}

              {/* Approver Selection Section */}
              {inventoryStatus.toLowerCase() === "pending for receipt" && (
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
                    Select Approver
                  </Typography>
                  <Autocomplete
                    disablePortal
                    id="approver-select"
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
                        label="Approver Email"
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
            placeholder="Enter any notes or comments about this inventory..."
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
              ? "You don't have permission to accept this inventory"
              : "Accept this inventory"
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
              ? "You don't have permission to reject this inventory"
              : "Reject this inventory"
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

export default InventoryModal;
