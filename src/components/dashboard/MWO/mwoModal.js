import React, { useState, useEffect, useContext } from "react";
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
  Link,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AttachmentIcon from "@mui/icons-material/Attachment";
import InfoIcon from "@mui/icons-material/Info";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";
import { AuthContext } from "../../../context/authContext";

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
    formattedKey = formattedKey.replace(/email/gi, "id");
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
  setAttachmentLink,
  attachmentLink,
  handleReject,
  // handleReturn,
  mwoStatus,
  username,
  setSelectedApproverEmail,
  approvers,
  setApproverName,
  attachmentFiles,
  setAttachmentFiles,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const { user } = useContext(AuthContext);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
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

  const handleApproveButton = async () => {
    if (!isActionAllowed) return;
    try {
      await handleApprove();
      onClose();
    } catch (error) {
      console.error("Error in approval:", error);
    }
  };

  const handleRejectButton = async () => {
    if (!isActionAllowed) return;
    try {
      await handleReject();
      onClose();
    } catch (error) {
      console.error("Error in rejection:", error);
    }
  };

  // Fetch existing attachments when modal opens
  useEffect(() => {
    const fetchAttachments = async () => {
      if (open && rowData?.mwo_id) {
        setLoadingAttachments(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/mwo-attachments`,
            {
              params: { mwo_id: rowData.mwo_id },
              headers: { Authorization: user.authToken },
            }
          );
          setExistingAttachments(response.data);
        } catch (error) {
          console.error("Error fetching attachments:", error);
        } finally {
          setLoadingAttachments(false);
        }
      }
    };

    fetchAttachments();
  }, [open, rowData?.mwo_id, user.authToken]);

  // Helper function to get file type icon
  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) {
      return <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />;
    } else if (fileType?.includes("image")) {
      return <ImageIcon sx={{ color: "#2e7d32" }} />;
    } else {
      return <DescriptionIcon sx={{ color: "#1976d2" }} />;
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file download
  const handleDownload = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/workorder/mwo-attachments/${attachmentId}/download`,
        {
          headers: { Authorization: user.authToken },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    }
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
      maxWidth={isFullscreen ? false : "lg"}
      fullWidth={!isFullscreen}
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          borderRadius: isFullscreen ? 0 : "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          width: isFullscreen ? "100vw" : "auto",
          height: isFullscreen ? "100vh" : "auto",
          maxWidth: isFullscreen ? "none" : "lg",
          maxHeight: isFullscreen ? "none" : "90vh",
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
          Mother Work Order
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
          <Tooltip
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <DialogContent
        sx={{
          padding: isFullscreen ? "24px" : isMobile ? "16px" : "24px",
          position: "relative",
          height: isFullscreen ? "calc(100vh - 140px)" : "auto",
          overflow: "auto",
        }}
      >
        <Grid container spacing={isFullscreen ? 3 : isMobile ? 2 : 4}>
          {/* Details Section */}
          <Grid
            item
            xs={12}
            md={isFullscreen ? 6 : 6}
            lg={isFullscreen ? 4 : 6}
          >
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
                      Object.keys(rowData)
                        .filter(
                          (key) => !key.includes("__") && key !== "record_id"
                        )
                        .map((key) => (
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
                            <TableCell
                              sx={{
                                color:
                                  key.toLowerCase().includes("customer") ||
                                  key.toLowerCase().includes("budget") ||
                                  key.toLowerCase().includes("cost")
                                    ? "#d32f2f"
                                    : "inherit",
                                fontWeight:
                                  key.includes("id") ||
                                  key === "mwo_status" ||
                                  key === "mwo_number"
                                    ? "500"
                                    : "normal",
                              }}
                            >
                              {(() => {
                                const value = rowData[key];

                                if (!value) return "N/A";

                                const isURL =
                                  typeof value === "string" &&
                                  /^https?:\/\/[^\s]+$/.test(value);

                                if (isURL) {
                                  return (
                                    <Link
                                      href={value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        color: "#1976d2",
                                        textDecoration: "none",
                                        fontWeight: 500,
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                      }}
                                    >
                                      Attachment Link
                                    </Link>
                                  );
                                }

                                if (
                                  key.toLowerCase().includes("date") ||
                                  key.toLowerCase().includes("time")
                                ) {
                                  return formatDate(value);
                                }

                                if (typeof value === "string") {
                                  return value.replace(/\$/g, "") || "N/A";
                                }

                                return value;
                              })()}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography sx={{ color: "#666" }}>
                            Loading work order details...
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
          <Grid
            item
            xs={12}
            md={isFullscreen ? 6 : 6}
            lg={isFullscreen ? 8 : 6}
          >
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
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Material Rate
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Material Price
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
                          <TableCell>
                            {Number(material.material_rate).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {Number(material.material_price).toFixed(2)}
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
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Service Rate
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#555" }}>
                          Service Price
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
                          <TableCell>
                            {Number(service.service_rate).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {Number(service.service_price).toFixed(2)}
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
              <Box sx={{ mt: "2rem" }}>
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
              {/* File Upload Section - Only for deployment head */}
              {mwoStatus?.toLowerCase().includes("deployment") && (
                <Box sx={{ mt: "2rem" }}>
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
                    Upload Attachments
                  </Typography>
                  <Box
                    sx={{
                      border: `1px dashed ${
                        attachmentFiles.length > 0 ? "#4caf50" : "#ccc"
                      }`,
                      borderRadius: "4px",
                      padding: "6px 12px",
                      textAlign: "center",
                      backgroundColor:
                        attachmentFiles.length > 0
                          ? "rgba(76, 175, 80, 0.04)"
                          : "#fafafa",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        borderColor:
                          attachmentFiles.length > 0 ? "#4caf50" : "#ec7c30",
                        backgroundColor:
                          attachmentFiles.length > 0
                            ? "rgba(76, 175, 80, 0.08)"
                            : "rgba(236, 124, 48, 0.04)",
                      },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      multiple
                      accept=".jpeg,.jpg,.png,.pdf,.doc,.docx,.xls,.xlsx,.xlsb"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 5) {
                          alert("Maximum 5 files are allowed");
                          return;
                        }
                        setAttachmentFiles(files);
                      }}
                      style={{ display: "none" }}
                    />

                    {attachmentFiles.length > 0 ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CheckCircleIcon
                          sx={{
                            fontSize: 16,
                            color: "#4caf50",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: "#4caf50",
                            fontSize: "0.875rem",
                          }}
                        >
                          {attachmentFiles.length} file(s) selected
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CloudUploadIcon
                          sx={{
                            fontSize: 16,
                            color: "#999",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 400,
                            color: "#666",
                            fontSize: "0.875rem",
                          }}
                        >
                          Upload Attachments (Max 5)
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {attachmentFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontWeight: 500,
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Selected Files:
                      </Typography>
                      <Box sx={{ maxHeight: 120, overflowY: "auto" }}>
                        {attachmentFiles.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1,
                              mb: 0.5,
                              backgroundColor: "#f5f5f5",
                              borderRadius: "6px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <AttachmentIcon
                              sx={{ fontSize: 16, color: "#666" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                flex: 1,
                                color: "#333",
                                fontSize: "0.75rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {file.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#999",
                                fontSize: "0.7rem",
                              }}
                            >
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Existing Attachments Section */}
              <Box sx={{ mt: "2rem" }}>
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
                  Attachments
                </Typography>
                {loadingAttachments ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 3,
                    }}
                  >
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2, color: "#666" }}>
                      Loading attachments...
                    </Typography>
                  </Box>
                ) : existingAttachments.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                    {existingAttachments.map((attachment) => (
                      <Paper
                        key={attachment.attachment_id}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: "1px solid rgba(0, 0, 0, 0.08)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          "&:hover": {
                            backgroundColor: "rgba(236, 124, 48, 0.04)",
                          },
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          {getFileIcon(attachment.file_type)}
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#333" }}
                            >
                              {attachment.file_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {formatFileSize(attachment.file_size)}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDownload(
                              attachment.attachment_id,
                              attachment.file_name
                            )
                          }
                          sx={{
                            color: "#1976d2",
                            "&:hover": {
                              backgroundColor: "rgba(25, 118, 210, 0.08)",
                            },
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      color: "#666",
                    }}
                  >
                    <AttachmentIcon
                      sx={{ fontSize: 48, color: "#ccc", mb: 1 }}
                    />
                    <Typography>No attachments available</Typography>
                  </Paper>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Comments Section */}
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
