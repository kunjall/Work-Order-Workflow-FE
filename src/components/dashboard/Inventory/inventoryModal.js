import React, { useState, useEffect } from "react";
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
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";

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
  // Special case for mrs_number field
  if (key.toLowerCase() === "mrs_number") {
    return "MO No/DC No";
  }

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [loadingAttachment, setLoadingAttachment] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  // File validation constants
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const ALLOWED_EXTENSIONS = ["pdf", "jpeg", "jpg", "png", "xls", "xlsx"];

  // API function to upload attachment
  const uploadAttachment = async (inventoryId, file) => {
    const formData = new FormData();
    formData.append("attachment", file);
    formData.append("inventory_id", inventoryId);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/inventory-attachment/upload`,
      {
        method: "POST",
        headers: {
          Authorization: username.authToken,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload attachment");
    }

    return await response.json();
  };

  // Fetch existing attachments when modal opens
  useEffect(() => {
    const fetchAttachment = async () => {
      if (open && rowData?.inventory_id) {
        setLoadingAttachment(true);
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/inventory-attachment/${rowData.inventory_id}`,
            {
              headers: { Authorization: username.authToken },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setExistingAttachment(data.attachment);
          } else {
            setExistingAttachment(null);
          }
        } catch (error) {
          console.error("Error fetching attachment:", error);
          setExistingAttachment(null);
        } finally {
          setLoadingAttachment(false);
        }
      }
    };

    fetchAttachment();
  }, [open, rowData?.inventory_id, username.authToken]);

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

  // Handle file download
  const handleDownload = async (inventoryId, fileName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/inventory-attachment/${inventoryId}/download`,
        {
          headers: { Authorization: username.authToken },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
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

  const statusStyles = getStatusStyles(inventoryStatus);

  const isActionAllowed =
    inventoryStatus.toLowerCase().includes("pending") &&
    rowData &&
    username.name !== rowData.created_by &&
    (inventoryStatus.toLowerCase() !== "pending for approval" ||
      username.username === rowData.inventory_approver_email);

  const handleApproveButton = async () => {
    if (!canApprove) {
      // Check specific validation failures and show appropriate messages

      if (!selectedFile && isActionAllowed) {
        alert("Please upload an attachment before accepting this inventory.");
        return;
      }
      return;
    }

    // Upload file first if selected
    if (selectedFile && rowData?.inventory_id) {
      try {
        await uploadAttachment(rowData.inventory_id, selectedFile);
      } catch (error) {
        console.error("Failed to upload attachment:", error);
        setFileError("Failed to upload attachment. Please try again.");
        return;
      }
    }

    handleApprove();
    onClose();
  };

  const handleRejectButton = () => {
    if (!isActionAllowed) return;
    handleReject();
    onClose();
  };

  // File handling functions
  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 2MB";
    }

    // Check file type
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return "File type not allowed. Please upload PDF, JPEG, JPG, PNG, XLS, or XLSX files only";
    }

    // Check MIME type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Invalid file format";
    }

    return null;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      event.target.value = ""; // Clear the input
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileError("");
    // Clear the file input
    const fileInput = document.getElementById("inventory-file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Check if user can approve (must have file uploaded and approver selected if needed)
  const canApprove =
    isActionAllowed &&
    ((inventoryStatus.toLowerCase() === "pending for receipt" &&
      selectedFile !== null) ||
      inventoryStatus.toLowerCase() === "pending for approval");
  // List of important fields to display first
  const priorityFields = [
    "customer_name",
    "inventory_id",
    "client_warehouse_city",
    "mrs_number",
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
          Inventory Inward
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
                                key.toLowerCase().includes("quantity")
                                  ? "#d32f2f"
                                  : "inherit",
                              fontWeight:
                                key.includes("id") ||
                                key === "inventory_inward_status"
                                  ? "500"
                                  : "normal",
                            }}
                          >
                            {key.toLowerCase().includes("date") ||
                            key.toLowerCase().includes("time") ||
                            (key.toLowerCase().includes("_at") &&
                              !key.toLowerCase().includes("status") &&
                              !key.toLowerCase().includes("created_by"))
                              ? formatDate(rowData[key])
                              : rowData[key] || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography sx={{ color: "#666" }}>
                            Loading inventory details...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
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
            <Box sx={{ mt: 6 }}>
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

            {/* File Upload Section - Only show for receivers who can approve */}
            {inventoryStatus.toLowerCase() === "pending for receipt" && (
              <Box sx={{ mt: 3 }}>
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
                  Attachment Required *
                </Typography>

                {/* File Upload Area */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `2px dashed ${fileError ? "#d32f2f" : "#ec7c30"}`,
                    borderRadius: "8px",
                    textAlign: "center",
                    backgroundColor: fileError
                      ? "rgba(211, 47, 47, 0.05)"
                      : "rgba(236, 124, 48, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: fileError
                        ? "rgba(211, 47, 47, 0.08)"
                        : "rgba(236, 124, 48, 0.08)",
                    },
                  }}
                  onClick={() =>
                    document.getElementById("inventory-file-upload").click()
                  }
                >
                  <input
                    id="inventory-file-upload"
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png,.xls,.xlsx"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />

                  <AttachFileIcon
                    sx={{
                      fontSize: 48,
                      color: fileError ? "#d32f2f" : "#ec7c30",
                      mb: 1,
                    }}
                  />

                  <Typography
                    variant="h6"
                    sx={{ mb: 1, color: fileError ? "#d32f2f" : "#333" }}
                  >
                    {selectedFile ? "File Selected" : "Upload Attachment"}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                    Click to browse or drag and drop your file here
                  </Typography>

                  <Typography variant="caption" sx={{ color: "#888" }}>
                    Supported formats: PDF, JPEG, JPG, PNG, XLS, XLSX (Max 2MB)
                  </Typography>
                </Paper>

                {/* File Error Display */}
                {fileError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {fileError}
                  </Alert>
                )}

                {/* Selected File Display */}
                {selectedFile && (
                  <Paper
                    elevation={1}
                    sx={{
                      mt: 2,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(46, 125, 50, 0.05)",
                      border: "1px solid rgba(46, 125, 50, 0.2)",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", flex: 1 }}
                    >
                      <AttachFileIcon sx={{ color: "#2e7d32", mr: 1 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          {formatFileSize(selectedFile.size)}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={handleFileRemove}
                      size="small"
                      sx={{ color: "#d32f2f" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                )}

                {/* Requirement Notice */}
                {!selectedFile && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    You must upload an attachment before approving this
                    inventory.
                  </Alert>
                )}
              </Box>
            )}

            {/* Existing Attachments Section */}
            <Box sx={{ mt: 3 }}>
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
              {loadingAttachment ? (
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
                    Loading attachment...
                  </Typography>
                </Box>
              ) : existingAttachment ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {getFileIcon(existingAttachment.file_type)}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#333" }}
                      >
                        {existingAttachment.file_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {formatFileSize(existingAttachment.file_size)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownload(
                        rowData.inventory_id,
                        existingAttachment.file_name
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
                  <AttachFileIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                  <Typography>No attachments available</Typography>
                </Paper>
              )}
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
              ? "You don't have permission to accept this inventory"
              : !selectedFile && isActionAllowed
              ? "Please upload an attachment before accepting"
              : "Accept this inventory"
          }
        >
          <span>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleApproveButton}
              disabled={!canApprove}
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
