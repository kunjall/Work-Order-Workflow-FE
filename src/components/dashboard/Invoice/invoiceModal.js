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
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

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

const InvoiceModal = ({
  open,
  onClose,
  rowData,
  invoiceExpenses,
  setComment,
  comment,
  handleApprove,
  handleReject,
  setSelectedApproverEmail,
  approvers,
  setApproverName,
  invoiceStatus,
  username,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
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
  console.log(approvers);
  const statusStyles = getStatusStyles(invoiceStatus);

  const isActionAllowed =
    invoiceStatus.toLowerCase().includes("pending") &&
    rowData &&
    username.name !== rowData.created_by &&
    (invoiceStatus.toLowerCase() !== "pending for approval" ||
      username.username === rowData.expense_approver1_email);

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

  // Calculate total expense amount
  const totalExpenseAmount =
    invoiceExpenses?.reduce(
      (sum, expense) => sum + parseFloat(expense.expense_amount || 0),
      0
    ) || 0;

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
          Expense Details
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={getStatusIcon(invoiceStatus)}
            label={invoiceStatus}
            sx={{
              fontWeight: "bold",
              borderWidth: "1px",
              borderStyle: "solid",
              color: statusStyles.color,
              backgroundColor: statusStyles.backgroundColor,
              borderColor: statusStyles.backgroundColor,
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
          backgroundColor: "#f8f9fa",
        }}
      >
        <Grid container spacing={isFullscreen ? 3 : isMobile ? 2 : 3}>
          <Grid
            item
            xs={12}
            md={isFullscreen ? 8 : 7}
            lg={isFullscreen ? 8 : 7}
          >
            {rowData ? (
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderRadius: "10px",
                  overflow: "visible",
                  border: "1px solid #eaeaea",
                  width: "100%",
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
                    {[
                      "expense_id",
                      "vendor_name",
                      "route_name",
                      "service",
                      "cwo_id",
                      "mwo_id",
                      "expense_amount",
                      "qty",
                      "uom",
                      "unit_price",
                      "invoice_number",
                      "invoice_date",
                      "remarks",
                      "expense_status",
                      "expense_approver1_email",
                      "expense_approver1_name",
                      "expense_approver2_email",
                      "expense_approver2_name",
                      "actioned_at",
                      "actioned_by",
                      ...Object.keys(rowData).filter(
                        (key) =>
                          ![
                            "expense_id",
                            "vendor_name",
                            "route_name",
                            "service",
                            "cwo_id",
                            "mwo_id",
                            "expense_amount",
                            "qty",
                            "uom",
                            "unit_price",
                            "invoice_number",
                            "invoice_date",
                            "remarks",
                            "expense_status",
                            "expense_approver1_email",
                            "expense_approver1_name",
                            "expense_approver2_email",
                            "expense_approver2_name",
                            "actioned_at",
                            "actioned_by",
                            "invoice_reviewer_name",
                            "invoice_approver_email",
                          ].includes(key)
                      ),
                    ].map((key) => (
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
                          {key.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell
                          sx={{
                            color:
                              key.toLowerCase().includes("cost") ||
                              key.toLowerCase().includes("budget") ||
                              key.toLowerCase().includes("amount")
                                ? "#d32f2f"
                                : "inherit",
                            fontWeight:
                              key.toLowerCase().includes("cost") ||
                              key.toLowerCase().includes("budget") ||
                              key.toLowerCase().includes("amount") ||
                              key === "expense_id" ||
                              key === "cwo_id" ||
                              key === "mwo_id"
                                ? "500"
                                : "normal",
                          }}
                        >
                          {key.toLowerCase().includes("date") ||
                          key.toLowerCase().includes("time")
                            ? formatDate(rowData[key])
                            : key.toLowerCase().includes("cost") ||
                              key.toLowerCase().includes("budget") ||
                              key.toLowerCase().includes("amount")
                            ? `₹${parseFloat(
                                rowData[key] || 0
                              ).toLocaleString()}`
                            : rowData[key] || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>Loading row data...</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                padding: "24px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "1px solid #eaeaea",
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "600",
                  marginBottom: "20px",
                  borderBottom: "2px solid #ec7c30",
                  paddingBottom: "8px",
                  color: "#333",
                  display: "inline-block",
                }}
              >
                Action Center
              </Typography>

              {rowData && (
                <Box sx={{ marginTop: "24px" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "500",
                      marginBottom: "12px",
                      color: "#333",
                    }}
                  >
                    Invoice Summary
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      backgroundColor: "#f0f7ff",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography sx={{ fontWeight: "500", color: "#555" }}>
                      Expense ID:
                    </Typography>
                    <Typography sx={{ fontWeight: "600", color: "#333" }}>
                      {rowData.expense_id || "N/A"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      backgroundColor: "#f0f7ff",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography sx={{ fontWeight: "500", color: "#555" }}>
                      Route Name:
                    </Typography>
                    <Typography sx={{ fontWeight: "600", color: "#333" }}>
                      {rowData.route_name || "N/A"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      backgroundColor: "#fff8e1",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <Typography sx={{ fontWeight: "500", color: "#555" }}>
                      Amount:
                    </Typography>
                    <Typography sx={{ fontWeight: "600", color: "#d32f2f" }}>
                      ₹
                      {parseFloat(rowData.expense_amount || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px",
                      backgroundColor: "#f0f7ff",
                      borderRadius: "6px",
                    }}
                  >
                    <Typography sx={{ fontWeight: "500", color: "#555" }}>
                      Created By:
                    </Typography>
                    <Typography sx={{ fontWeight: "600", color: "#333" }}>
                      {rowData.created_by || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          padding: "16px 24px",
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #eaeaea",
        }}
      >
        <Button
          variant="contained"
          color="success"
          onClick={handleApproveButton}
          sx={{
            fontWeight: "600",
            textTransform: "none",
            padding: "8px 24px",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: "#2e7d32",
            "&:hover": {
              backgroundColor: "#1b5e20",
            },
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
            fontWeight: "600",
            textTransform: "none",
            padding: "8px 24px",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: "#d32f2f",
            "&:hover": {
              backgroundColor: "#b71c1c",
            },
            marginLeft: "12px",
          }}
          disabled={!isActionAllowed}
        >
          Reject
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            fontWeight: "600",
            textTransform: "none",
            padding: "8px 24px",
            borderRadius: "6px",
            color: "#ec7c30",
            borderColor: "#ec7c30",
            "&:hover": {
              borderColor: "#ec7c30",
              backgroundColor: "rgba(236, 124, 48, 0.08)",
            },
            marginLeft: "12px",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceModal;
