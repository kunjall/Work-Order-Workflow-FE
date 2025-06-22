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

const CrModal = ({
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
  const [isLoading, setIsLoading] = useState(false);

  console.log(approvers);

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

  // Check if this is the first approver
  useEffect(() => {
    if (rowData && open && crStatus.toLowerCase().includes("pending")) {
      // Check if this is the first approver
      const isPendingForX = crStatus === "Pending for approval X";
      const isPendingForY = crStatus === "Pending for approval Y";

      // First approver handles status X, second approver handles status Y
      setIsFirstApprover(isPendingForX);
    }
  }, [rowData, open, crStatus]);

  const statusStyles = getStatusStyles(crStatus);
  const isActionAllowed =
    crStatus.toLowerCase().includes("pending") &&
    rowData &&
    rowData.created_by !== username.name &&
    (username.role === "admin" ||
      username.username === rowData.cr_approver_email ||
      (rowData.cr_approver2_email &&
        username.username === rowData.cr_approver2_email));

  const handleApproveButton = () => {
    if (!isActionAllowed) return;
    handleApprove();
  };

  const handleRejectButton = () => {
    if (!isActionAllowed) return;
    handleReject();
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
          {rowData?.cr_cwo_id && (
            <Chip
              label={`CR #${rowData.cr_cwo_id}`}
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
                      <>
                        <TableRow
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
                            CR ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: "500" }}>
                            {rowData.cr_cwo_id || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:nth-of-type(even)": {
                              backgroundColor: "#ffffff",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "500",
                              textTransform: "capitalize",
                              color: "#555",
                            }}
                          >
                            CWO Number
                          </TableCell>
                          <TableCell sx={{ fontWeight: "500" }}>
                            {rowData.cwo_number || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow
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
                            }}
                          >
                            Customer Name
                          </TableCell>
                          <TableCell sx={{ color: "#d32f2f" }}>
                            {rowData.customer_name || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:nth-of-type(even)": {
                              backgroundColor: "#ffffff",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "500",
                              textTransform: "capitalize",
                              color: "#555",
                            }}
                          >
                            Total Material Cost
                          </TableCell>
                          <TableCell sx={{ color: "#d32f2f" }}>
                            ₹
                            {Number(rowData.total_material_cost || 0).toFixed(
                              2
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow
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
                            }}
                          >
                            Total Service Cost
                          </TableCell>
                          <TableCell sx={{ color: "#d32f2f" }}>
                            ₹
                            {Number(rowData.total_service_cost || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:nth-of-type(even)": {
                              backgroundColor: "#ffffff",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "500",
                              textTransform: "capitalize",
                              color: "#555",
                            }}
                          >
                            Created By
                          </TableCell>
                          <TableCell>{rowData.created_by || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow
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
                            }}
                          >
                            Created At
                          </TableCell>
                          <TableCell>
                            {formatDate(rowData.created_at) || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow
                          sx={{
                            "&:nth-of-type(even)": {
                              backgroundColor: "#ffffff",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "500",
                              textTransform: "capitalize",
                              color: "#555",
                            }}
                          >
                            Approver
                          </TableCell>
                          <TableCell>
                            {rowData.cr_approver_name || "N/A"}
                          </TableCell>
                        </TableRow>
                        <TableRow
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
                            }}
                          >
                            Approver Email
                          </TableCell>
                          <TableCell>
                            {rowData.cr_approver_email || "N/A"}
                          </TableCell>
                        </TableRow>
                        {rowData.actioned_by && (
                          <>
                            <TableRow
                              sx={{
                                "&:nth-of-type(even)": {
                                  backgroundColor: "#ffffff",
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: "500",
                                  textTransform: "capitalize",
                                  color: "#555",
                                }}
                              >
                                Actioned By
                              </TableCell>
                              <TableCell>{rowData.actioned_by}</TableCell>
                            </TableRow>
                            <TableRow
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
                                }}
                              >
                                Actioned At
                              </TableCell>
                              <TableCell>
                                {formatDate(rowData.actioned_at)}
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                        {rowData.approver_comments && (
                          <TableRow
                            sx={{
                              "&:nth-of-type(even)": {
                                backgroundColor: "#ffffff",
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                fontWeight: "500",
                                textTransform: "capitalize",
                                color: "#555",
                              }}
                            >
                              Approver Comments
                            </TableCell>
                            <TableCell>{rowData.approver_comments}</TableCell>
                          </TableRow>
                        )}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography sx={{ color: "#666" }}>
                            Loading row data...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

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
            </Box>

            <Box sx={{ mb: 3 }}>
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
            </Box>

            {/* Second Approver Selection (only shown for first approver) */}
            {isFirstApprover && isActionAllowed && (
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
                  Select Next Approver
                </Typography>
                <Autocomplete
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
                      placeholder="Select second approver..."
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
                  Select the second approver who will review this change request
                  after your approval.
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

export default CrModal;
