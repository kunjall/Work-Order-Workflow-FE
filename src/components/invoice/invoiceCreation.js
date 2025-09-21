import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SendIcon from "@mui/icons-material/Send";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

// Helper function to convert DD-MMM-YY to ISO format for DatePicker
const formatDateStringToISO = (dateString) => {
  if (!dateString || dateString.length !== 9) return null;

  const day = dateString.substring(0, 2);
  const month = dateString.substring(3, 6);
  const year = dateString.substring(7, 9);

  // Convert month abbreviation to month number
  const monthMap = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  const monthNum = monthMap[month];
  if (!monthNum) return null;

  // Assume 20xx for the year
  return `20${year}-${monthNum}-${day}`;
};

const InvoiceForm = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [childWorkorders, setChildWorkorders] = useState([]);
  const [expandedCwo, setExpandedCwo] = useState({});
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [overheadBudget, setOverheadBudget] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [totalExpense, setTotalExpense] = useState(null);
  const [selectedApproverEmail, setSelectedApproverEmail] = useState(null);
  const [allExpenseData, setAllExpenseData] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [approverName, setApproverName] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const addOverheadRow = (cwoIndex) => {
    setChildWorkorders((prev) => {
      const updated = [...prev];

      // Define the new row with the correct structure
      const newRow = {
        id: Date.now(),
        "Vendor Name": "",
        "Invoice Number": "",
        "Invoice Date": "",
        Activity: "",
        Category: "",
        QTY: "",
        UOM: "",
        "Unit Price": "",
        "GST Amount": "",
        Amount: "",
        Remarks: "",
      };

      // Ensure overhead exists before adding a new row
      if (!updated[cwoIndex].overhead) {
        updated[cwoIndex].overhead = [];
      }

      updated[cwoIndex].overhead = [...updated[cwoIndex].overhead, newRow];
      return updated;
    });
  };

  const removeOverheadRow = (cwoIndex, rowId) => {
    setChildWorkorders((prev) => {
      const updated = [...prev];
      updated[cwoIndex].overhead = updated[cwoIndex].overhead.filter(
        (row) => row.id !== rowId
      );
      return updated;
    });
  };
  useEffect(() => {
    const fetchTotalExpense = async () => {
      try {
        if (!selectedWorkOrder || !selectedWorkOrder.mwo_id) {
          console.warn("No valid work order selected.");
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/invoice/find-total-overhead?mwo_id=${selectedWorkOrder.mwo_id}`,
          { headers: { Authorization: user.authToken } }
        );

        setTotalExpense(response.data || 0);
      } catch (error) {
        console.error("Error fetching total expense:", error);
        setTotalExpense(0);
      }
    };

    if (selectedWorkOrder) {
      fetchTotalExpense();
    }
  }, [selectedWorkOrder]);

  const toggleOverheadInputs = (cwoId) => {
    setExpandedCwo((prev) => ({
      ...prev,
      [cwoId]: !prev[cwoId],
    }));
  };
  useEffect(() => {
    if (!user) navigate("/login");
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-workorder`,
          { headers: { Authorization: user.authToken } }
        );
        setWorkOrders(response.data);
      } catch (err) {
        setError("Failed to load work orders");
      }
    };
    fetchWorkOrders();
  }, [user, navigate, selectedWorkOrder]);
  const handleSubmit = async () => {
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (!isConfirmed) return;
    const actionedBy = user.name || "unknown";
    const actionedAt = new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "IST",
    });
    try {
      if (
        !childWorkorders ||
        !childWorkorders.length ||
        !childWorkorders.some((cwo) => cwo.overhead?.length)
      ) {
        alert("No expense data to save.");
        return;
      }

      const expenseData = childWorkorders
        .filter((cwo) => cwo.overhead?.length) // Filter only those with overhead entries
        .flatMap((cwo) =>
          cwo.overhead.map((entry) => ({
            cwo_id: cwo.cwo_id.toString(),
            route_name: cwo.route_name,
            mwo_id: selectedWorkOrder.mwo_id.toString(),
            expense_status: "Pending for approval",
            service: entry["Activity"], // Ensure correct field mapping
            vendor_name: entry["Vendor Name"], // Match expected key
            qty: entry["QTY"],
            uom: entry["UOM"],
            expense_amount: entry["Amount"], // Correct field name
            unit_price: entry["Unit Price"],
            gst_amount: entry["GST Amount"], // Add GST field
            invoice_number: entry["Invoice Number"],
            invoice_date: entry["Invoice Date"], // Ensure invoice date is included
            remarks: entry["Remarks"],
            category: entry["Category"], // Add category field
            created_by: actionedBy,
            created_at: actionedAt,
            expense_approver1_email: selectedApproverEmail,
            expense_approver1_name: approverName,
          }))
        );

      // Budget validation
      try {
        const validationResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/invoice/validate-budget`,
          {
            expenses: expenseData,
            cwo_id: childWorkorders[0]?.cwo_id?.toString(),
            budgeted_service_cost: parseFloat(
              formData.bal_service_cost?.replace(/[^0-9.]/g, "") || 0
            ),
            misc_budget: parseFloat(overheadBudget || 0),
          },
          { headers: { Authorization: user.authToken } }
        );

        if (!validationResponse.data.valid) {
          alert(`Validation failed: ${validationResponse.data.message}`);
          return;
        }
      } catch (validationError) {
        console.error("Budget validation error:", validationError);
        alert("Validation failed. Please check your expenses and try again.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/invoice/add-overhead-expense`,
        { expenses: expenseData },
        { headers: { Authorization: user.authToken } }
      );

      if (response.status === 200) {
        alert("Expenses saved successfully!");
      } else {
        alert("Failed to save expenses.");
      }
    } catch (error) {
      console.error("Error saving expenses:", error);
      alert("An error occurred while saving expenses.");
    }
  };

  useEffect(() => {
    if (selectedWorkOrder) {
      const fetchCWO = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-invoice-cwo?mwo_id=${selectedWorkOrder.mwo_id}`,
            { headers: { Authorization: user.authToken } }
          );

          let childWorkordersData = response.data;

          const [materialResponse, serviceResponse] = await Promise.all([
            axios.get(
              `${process.env.REACT_APP_API_URL}/invoice/find-material-budget`,
              {
                headers: { Authorization: user.authToken },
              }
            ),
            axios.get(
              `${process.env.REACT_APP_API_URL}/invoice/find-service-budget`,
              {
                headers: { Authorization: user.authToken },
              }
            ),
          ]);

          const materialBudgetData = materialResponse.data;
          const serviceBudgetData = serviceResponse.data;

          const updatedChildWorkorders = childWorkordersData.map((cwo) => {
            const materialBudget =
              materialBudgetData.find(
                (b) => b.cwo_id === cwo.cwo_id.toString()
              ) || {};
            const serviceBudget =
              serviceBudgetData.find(
                (b) => b.cwo_id === cwo.cwo_id.toString()
              ) || {};

            return {
              ...cwo,
              material_budget: materialBudget.material_budget || "₹0",
              service_budget: serviceBudget.service_budget || "₹0",
            };
          });

          setChildWorkorders(updatedChildWorkorders);
        } catch (err) {
          setError("Failed to load work orders");
          console.error("Error fetching work orders and budgets:", err);
        }
      };

      fetchCWO();
    }
  }, [selectedWorkOrder]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/approver/find-reviewers?type=EXP`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        const reviewerArray = response.data.map((reviewer) => ({
          id: reviewer.record_id,
          type: reviewer.type,
          reviewer_email: reviewer.approver_email,
          city: reviewer.city,
          reviewer_name: reviewer.approver_name,
        }));
        setApprovers(reviewerArray);
      } catch (err) {
        console.error("Error fetching reviewer:", err);
        setError("Failed to load reviewer");
      }
    };

    if (formData.execution_city) fetchApprovers();
  }, [formData.execution_city, selectedWorkOrder, user.authToken]);

  useEffect(() => {
    if (selectedApproverEmail) {
      const selectedReviewer = approvers.find(
        (reviewer) => reviewer.reviewer_email === selectedApproverEmail
      );
      setApproverName(selectedReviewer ? selectedReviewer.reviewer_name : "");
    } else {
      setApproverName("");
    }
  }, [selectedApproverEmail, approvers]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/invoice/find-all-expense`,
        { headers: { Authorization: user.authToken } }
      );

      const data = response.data || [];

      if (data.length === 0) {
        console.warn("No data available for export.");
        return;
      }

      // Escape and format each field
      const escapeCSVValue = (value) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (/["\n,]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","), // Header row
        ...data.map((row) =>
          headers.map((field) => escapeCSVValue(row[field])).join(",")
        ),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);

      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "expenses_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalMaterialPayment = childWorkorders.reduce(
    (sum, item) => sum + (parseFloat(item.material_budget) || 0),
    0
  );

  const totalServicePayment = childWorkorders.reduce(
    (sum, item) => sum + (parseFloat(item.service_budget) || 0),
    0
  );

  const handleSave = async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/invoice/update-overhead-budget`,
        {
          overhead_budget: overheadBudget,
          mwo_id: formData.mwo_id,
        },
        {
          headers: { Authorization: user.authToken },
        }
      );

      if (response.status === 200) {
        setIsSaved(true);
        alert("Overhead budget updated successfully!");
      }
    } catch (error) {
      console.error("Error updating overhead budget:", error);
      alert("Failed to update overhead budget. Please try again.");
    }
  };

  // const handleWorkOrderSelect = (event, newValue) => {
  //   setSelectedWorkOrder(newValue);
  //   setFormData({
  //     ...newValue,
  //     customer_approval_date: newValue?.customer_approval_date
  //       ? dayjs(newValue.customer_approval_date)
  //       : null,
  //   });
  // };

  const handleWorkOrderSelect = (event, newValue) => {
    setSelectedWorkOrder(newValue);
    setFormData({
      ...newValue,
      customer_approval_date: newValue?.customer_approval_date
        ? dayjs(newValue.customer_approval_date)
        : null,
    });

    // Use newValue directly
    if (newValue?.overhead_budget) {
      const numericValue = newValue.overhead_budget.replace(/[^0-9.]/g, "");
      setOverheadBudget(numericValue);
    } else {
      setOverheadBudget("");
    }
  };

  // useEffect(() => {
  //   if (!formData?.mwo_id) {
  //     setOverheadBudget("");
  //     setIsSaved(false);
  //   } else if (formData?.overhead_budget) {
  //     const numericValue = formData.overhead_budget.replace(/[^0-9.]/g, "");
  //     setOverheadBudget(numericValue);
  //   } else {
  //     setOverheadBudget("");
  //   }
  // }, [formData]);

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4, backgroundColor: "#f8f9fa" }}>
        <Paper
          elevation={3}
          sx={{ p: 3, mb: 4, borderRadius: "8px", backgroundColor: "#fff" }}
        >
          <Grid container spacing={2} alignItems="center" mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" fontWeight="600" color="#333">
                Payment Budget
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="contained"
                onClick={handleExport}
                sx={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": { backgroundColor: "#0056b3" },
                }}
                startIcon={<FileDownloadIcon />}
                disabled={loading}
              >
                {loading ? "Fetching..." : "Export CSV"}
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={2.5}>
              <Autocomplete
                options={[...workOrders].sort((a, b) => b.mwo_id - a.mwo_id)}
                getOptionLabel={(option) => option.mwo_id?.toString() || ""}
                onChange={handleWorkOrderSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="MWO"
                    fullWidth
                    sx={{
                      backgroundColor: "#f9f9f9",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        "&:hover fieldset": {
                          borderColor: "#007bff",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Budgeted Material Cost"
                value={formData.bal_material_cost?.replace("$", "₹") || "₹0"}
                InputProps={{
                  readOnly: true,
                  style: { fontWeight: "500" },
                }}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "#f9f9f9",
                  "& .MuiInputBase-input": { color: "#d32f2f" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Budgeted Service Cost"
                value={formData.bal_service_cost?.replace("$", "₹") || "₹0"}
                InputProps={{
                  readOnly: true,
                  style: { fontWeight: "500" },
                }}
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "#f9f9f9",
                  "& .MuiInputBase-input": { color: "#d32f2f" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Route Name"
                value={formData.route_name || ""}
                InputProps={{
                  readOnly: true,
                  style: { fontWeight: "500" },
                }}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: "#f9f9f9",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                label="MISC. Budget"
                value={overheadBudget}
                onChange={(event) => setOverheadBudget(event.target.value)}
                type="number"
                fullWidth
                variant="outlined"
                sx={{
                  backgroundColor: "#f9f9f9",
                  "& .MuiInputBase-input": {
                    color: "#d32f2f",
                    fontWeight: "500",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    "&:hover fieldset": {
                      borderColor: "#007bff",
                    },
                  },
                }}
                disabled={
                  !user.role.includes("admin") &&
                  (isSaved || Boolean(formData.overhead_budget))
                }
                InputProps={{
                  startAdornment:
                    isSaved || formData.overhead_budget ? (
                      <span style={{ marginRight: "5px", fontWeight: "bold" }}>
                        ₹
                      </span>
                    ) : null,
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={1}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#ec7c30",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: "6px",
                  fontWeight: "500",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": { backgroundColor: "#d65a00" },
                }}
                disabled={
                  !user.role.includes("admin") &&
                  (!overheadBudget ||
                    isSaved ||
                    !formData.mwo_id ||
                    formData.overhead_budget)
                }
                onClick={handleSave}
              >
                Save
              </Button>
            </Grid>
          </Grid>
          {selectedWorkOrder && (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mt: 3,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color="#333"
                gutterBottom
                sx={{ mb: 3, borderBottom: "1px solid #eee", pb: 1 }}
              >
                Work Order Details
              </Typography>
              <Grid container spacing={2} mt={1}>
                {childWorkorders.map((cwo, cwoIndex) => (
                  <Grid container spacing={2} key={cwo.cwo_id} mt={1}>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="CWO"
                        value={cwo.cwo_id}
                        variant="outlined"
                        fullWidth
                        inputProps={{ readOnly: true }}
                        sx={{
                          backgroundColor: "#f9f9f9",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                          },
                        }}
                        InputProps={{
                          style: { fontWeight: "500" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Material MB Submitted"
                        value={cwo.material_budget || "₹0"}
                        variant="outlined"
                        fullWidth
                        inputProps={{ readOnly: true }}
                        sx={{
                          backgroundColor: "#f9f9f9",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                          },
                          "& .MuiInputBase-input": {
                            color: "#2e7d32",
                            fontWeight: "500",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Service MB Submitted"
                        value={cwo.service_budget || "₹0"}
                        variant="outlined"
                        fullWidth
                        inputProps={{ readOnly: true }}
                        sx={{
                          backgroundColor: "#f9f9f9",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                          },
                          "& .MuiInputBase-input": {
                            color: "#2e7d32",
                            fontWeight: "500",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        label="Route Name"
                        value={cwo.route_name || "N/A"}
                        variant="outlined"
                        fullWidth
                        inputProps={{ readOnly: true }}
                        sx={{
                          backgroundColor: "#f9f9f9",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "6px",
                          },
                          "& .MuiInputBase-input": {
                            color: "#2e7d32",
                            fontWeight: "500",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        onClick={() => toggleOverheadInputs(cwo.cwo_id)}
                        sx={{
                          backgroundColor: "#ec7c30",
                          color: "white",
                          padding: "10px 15px",
                          borderRadius: "6px",
                          fontWeight: "500",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          "&:hover": {
                            backgroundColor: "#d65a00",
                          },
                        }}
                        disabled={!formData.overhead_budget}
                      >
                        Enter Expenses
                      </Button>
                    </Grid>
                    {expandedCwo[cwo.cwo_id] && (
                      <Grid container spacing={2} mt={2} ml={2}>
                        {cwo.overhead?.map((row, rowIndex) => (
                          <Grid
                            container
                            spacing={2}
                            key={row.id}
                            alignItems="center"
                            sx={{
                              mb: 2,
                              pb: 2,
                              borderBottom: "1px solid #eaeaea",
                              "&:last-child": {
                                borderBottom: "none",
                                mb: 0,
                                pb: 0,
                              },
                            }}
                          >
                            {[
                              "Vendor Name",
                              "Invoice Number",
                              "Invoice Date",
                              "Activity",
                              "Category",
                              "QTY",
                              "UOM",
                              "Unit Price",
                              "GST Amount",
                              "Amount",
                              "Remarks",
                            ].map((letter) => (
                              <Grid item xs={12} sm={2} key={letter}>
                                {letter === "UOM" ? (
                                  <FormControl
                                    fullWidth
                                    variant="outlined"
                                    sx={{ backgroundColor: "#f9f9f9" }}
                                  >
                                    <InputLabel sx={{ fontWeight: "500" }}>
                                      {letter}
                                    </InputLabel>
                                    <Select
                                      value={row[letter] || ""}
                                      onChange={(event) => {
                                        const newValue = event.target.value;
                                        const updatedRows = [...cwo.overhead];
                                        updatedRows[rowIndex][letter] =
                                          newValue;

                                        setChildWorkorders((prev) => {
                                          const updated = [...prev];
                                          updated[cwoIndex].overhead =
                                            updatedRows;
                                          return updated;
                                        });
                                      }}
                                      label={letter}
                                      sx={{
                                        backgroundColor: "#f9f9f9",
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: "6px",
                                          "&:hover fieldset": {
                                            borderColor: "#007bff",
                                          },
                                          "&.Mui-focused fieldset": {
                                            borderColor: "#007bff",
                                            borderWidth: "2px",
                                          },
                                        },
                                        "& .MuiInputBase-input": {
                                          fontWeight: "500",
                                          padding: "12px 14px",
                                        },
                                        "& .MuiInputLabel-root": {
                                          color: "#555",
                                          fontWeight: "500",
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                          color: "#007bff",
                                        },
                                      }}
                                    >
                                      <MenuItem value="">
                                        <em>None</em>
                                      </MenuItem>
                                      <MenuItem value="EAC">EAC</MenuItem>
                                      <MenuItem value="MTR">MTR</MenuItem>
                                      <MenuItem value="KMS">KMS</MenuItem>
                                      <MenuItem value="DAY">DAY</MenuItem>
                                      <MenuItem value="PKT">PKT</MenuItem>
                                      <MenuItem value="CuM">CuM</MenuItem>
                                      <MenuItem value="LTR">LTR</MenuItem>
                                    </Select>
                                  </FormControl>
                                ) : letter === "Category" ? (
                                  <FormControl
                                    fullWidth
                                    variant="outlined"
                                    sx={{ backgroundColor: "#f9f9f9" }}
                                  >
                                    <InputLabel sx={{ fontWeight: "500" }}>
                                      {letter}
                                    </InputLabel>
                                    <Select
                                      value={row[letter] || ""}
                                      onChange={(event) => {
                                        const newValue = event.target.value;
                                        const updatedRows = [...cwo.overhead];
                                        updatedRows[rowIndex][letter] =
                                          newValue;

                                        setChildWorkorders((prev) => {
                                          const updated = [...prev];
                                          updated[cwoIndex].overhead =
                                            updatedRows;
                                          return updated;
                                        });
                                      }}
                                      label={letter}
                                      sx={{
                                        backgroundColor: "#f9f9f9",
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: "6px",
                                          "&:hover fieldset": {
                                            borderColor: "#007bff",
                                          },
                                          "&.Mui-focused fieldset": {
                                            borderColor: "#007bff",
                                            borderWidth: "2px",
                                          },
                                        },
                                        "& .MuiInputBase-input": {
                                          fontWeight: "500",
                                          padding: "12px 14px",
                                        },
                                        "& .MuiInputLabel-root": {
                                          color: "#555",
                                          fontWeight: "500",
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                          color: "#007bff",
                                        },
                                      }}
                                    >
                                      <MenuItem value="">
                                        <em>Select Category</em>
                                      </MenuItem>
                                      <MenuItem value="budgeted">
                                        Budgeted
                                      </MenuItem>
                                      <MenuItem value="expense">
                                        Expense
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                ) : letter === "Invoice Date" ? (
                                  <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                  >
                                    <DatePicker
                                      label="Invoice Date"
                                      value={
                                        row[letter]
                                          ? dayjs(
                                              formatDateStringToISO(row[letter])
                                            )
                                          : null
                                      }
                                      onChange={(newDate) => {
                                        const updatedRows = [...cwo.overhead];

                                        // Format date as DD-MMM-YY
                                        const formattedDate = newDate
                                          ? newDate
                                              .format("DD-MMM-YY")
                                              .toUpperCase()
                                          : "";

                                        updatedRows[rowIndex]["Invoice Date"] =
                                          formattedDate;

                                        setChildWorkorders((prev) => {
                                          const updated = [...prev];
                                          updated[cwoIndex].overhead =
                                            updatedRows;
                                          return updated;
                                        });
                                      }}
                                      maxDate={dayjs()} // Prevent future dates
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          variant: "outlined",
                                          sx: {
                                            backgroundColor: "#f9f9f9",
                                            "& .MuiOutlinedInput-root": {
                                              borderRadius: "6px",
                                              "&:hover fieldset": {
                                                borderColor: "#007bff",
                                              },
                                              "&.Mui-focused fieldset": {
                                                borderColor: "#007bff",
                                                borderWidth: "2px",
                                              },
                                            },
                                            "& .MuiInputBase-input": {
                                              fontWeight: "500",
                                              padding: "12px 14px",
                                            },
                                            "& .MuiInputLabel-root": {
                                              color: "#555",
                                              fontWeight: "500",
                                            },
                                            "& .MuiInputLabel-root.Mui-focused":
                                              {
                                                color: "#007bff",
                                              },
                                          },
                                        },
                                      }}
                                    />
                                  </LocalizationProvider>
                                ) : (
                                  <TextField
                                    label={`${letter}`}
                                    value={row[letter] || ""}
                                    sx={{
                                      backgroundColor: "#f9f9f9",
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: "6px",
                                        "&:hover fieldset": {
                                          borderColor: "#007bff",
                                        },
                                        "&.Mui-focused fieldset": {
                                          borderColor: "#007bff",
                                          borderWidth: "2px",
                                        },
                                      },
                                      "& .MuiInputBase-input": {
                                        fontWeight: "500",
                                        padding: "12px 14px",
                                      },
                                      "& .MuiInputLabel-root": {
                                        color: "#555",
                                        fontWeight: "500",
                                      },
                                      "& .MuiInputLabel-root.Mui-focused": {
                                        color: "#007bff",
                                      },
                                    }}
                                    onChange={(event) => {
                                      let newValue = event.target.value;
                                      const updatedRows = [...cwo.overhead];

                                      if (letter === "Unit Price") {
                                        newValue = newValue.replace(
                                          /[^0-9.]/g,
                                          ""
                                        ); // Remove all non-numeric except '.'

                                        // Ensure only one decimal point
                                        const parts = newValue.split(".");
                                        if (parts.length > 2) {
                                          newValue = parts[0] + "." + parts[1]; // Keep only the first decimal point
                                        }

                                        // Limit to 2 decimal places
                                        if (parts.length === 2) {
                                          parts[1] = parts[1].slice(0, 2);
                                          newValue = parts[0] + "." + parts[1];
                                        }

                                        // Calculate Amount when Unit Price changes
                                        const qty =
                                          updatedRows[rowIndex]["QTY"] || 0;
                                        const gstAmount =
                                          updatedRows[rowIndex]["GST Amount"] ||
                                          0;
                                        if (qty && newValue) {
                                          const baseAmount =
                                            parseFloat(qty) *
                                            parseFloat(newValue);
                                          updatedRows[rowIndex]["Amount"] = (
                                            baseAmount + parseFloat(gstAmount)
                                          ).toFixed(2);
                                        }
                                      }
                                      if (letter === "Amount") {
                                        return;

                                        // Calculate Amount when Unit Price changes
                                      }

                                      if (letter === "QTY") {
                                        newValue = newValue.replace(
                                          /[^0-9.]/g,
                                          ""
                                        );
                                        if (
                                          (newValue.match(/\./g) || []).length >
                                          1
                                        )
                                          return;

                                        const unitPrice =
                                          updatedRows[rowIndex]["Unit Price"] ||
                                          0;
                                        const gstAmount =
                                          updatedRows[rowIndex]["GST Amount"] ||
                                          0;
                                        if (unitPrice && newValue) {
                                          const baseAmount =
                                            parseFloat(newValue) *
                                            parseFloat(unitPrice);
                                          updatedRows[rowIndex]["Amount"] = (
                                            baseAmount + parseFloat(gstAmount)
                                          ).toFixed(2);
                                        }
                                      }

                                      if (letter === "GST Amount") {
                                        newValue = newValue.replace(
                                          /[^0-9.]/g,
                                          ""
                                        );
                                        if (
                                          (newValue.match(/\./g) || []).length >
                                          1
                                        )
                                          return;

                                        const qty =
                                          updatedRows[rowIndex]["QTY"] || 0;
                                        const unitPrice =
                                          updatedRows[rowIndex]["Unit Price"] ||
                                          0;
                                        if (qty && unitPrice) {
                                          const baseAmount =
                                            parseFloat(qty) *
                                            parseFloat(unitPrice);
                                          updatedRows[rowIndex]["Amount"] = (
                                            baseAmount + parseFloat(newValue)
                                          ).toFixed(2);
                                        }
                                      }

                                      updatedRows[rowIndex][letter] = newValue;

                                      setChildWorkorders((prev) => {
                                        const updated = [...prev];
                                        updated[cwoIndex].overhead =
                                          updatedRows;
                                        return updated;
                                      });
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    type={
                                      letter === "Unit Price" ||
                                      letter === "Amount"
                                        ? "number"
                                        : "text"
                                    }
                                  />
                                )}
                              </Grid>
                            ))}

                            <Grid item xs={12} sm={1}>
                              <IconButton
                                color="error"
                                onClick={() =>
                                  removeOverheadRow(cwoIndex, row.id)
                                }
                              >
                                <RemoveCircleOutline color="error" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}
                        <Grid item xs={12} sx={{ mt: 2, mb: 1 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              backgroundColor: "#f0f7ff",
                              borderRadius: "6px",
                              border: "1px dashed #007bff",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "#e1f0ff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              },
                            }}
                            onClick={() => addOverheadRow(cwoIndex)}
                          >
                            <AddCircleOutline
                              sx={{ color: "#007bff", mr: 1 }}
                            />
                            <Typography
                              sx={{ color: "#007bff", fontWeight: "500" }}
                            >
                              Add New Expense Line Item
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                ))}
              </Grid>
              <Grid container spacing={2} mt={3}>
                <Grid item xs={6} sm={2} md={4}>
                  <TextField
                    label="Total Material Payment"
                    value={`₹${totalMaterialPayment.toLocaleString()}`}
                    variant="outlined"
                    fullWidth
                    inputProps={{ readOnly: true }}
                    InputProps={{
                      style: { fontWeight: "600" },
                    }}
                    sx={{
                      backgroundColor: "#e8f4f8",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        borderColor: "#007bff",
                      },
                      "& .MuiInputBase-input": {
                        color: "#0277bd",
                        fontSize: "1.05rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: "#0277bd",
                        fontWeight: "500",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={2} md={4}>
                  <TextField
                    label="Total Service Payment"
                    value={`₹${totalServicePayment.toLocaleString()}`}
                    variant="outlined"
                    fullWidth
                    inputProps={{ readOnly: true }}
                    InputProps={{
                      style: { fontWeight: "600" },
                    }}
                    sx={{
                      backgroundColor: "#e8f4f8",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        borderColor: "#007bff",
                      },
                      "& .MuiInputBase-input": {
                        color: "#0277bd",
                        fontSize: "1.05rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: "#0277bd",
                        fontWeight: "500",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={2} md={4}>
                  <TextField
                    label="Total Overhead Payment"
                    value={
                      totalExpense !== null
                        ? `₹${totalExpense.toLocaleString()}`
                        : "Loading..."
                    }
                    variant="outlined"
                    fullWidth
                    inputProps={{ readOnly: true }}
                    InputProps={{
                      style: { fontWeight: "600" },
                    }}
                    sx={{
                      backgroundColor: "#e8f4f8",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        borderColor: "#007bff",
                      },
                      "& .MuiInputBase-input": {
                        color: "#0277bd",
                        fontSize: "1.05rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: "#0277bd",
                        fontWeight: "500",
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} mt={2}>
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    value={
                      selectedApproverEmail && approvers.length > 0
                        ? approvers.find(
                            (approver) =>
                              approver.reviewer_email === selectedApproverEmail
                          ) || null
                        : null
                    }
                    options={[...approvers].sort(
                      (a, b) =>
                        b.reviewer_name?.localeCompare(a.reviewer_name || "") ||
                        0
                    )}
                    getOptionLabel={(option) =>
                      option.reviewer_email.toString() || ""
                    }
                    onChange={(event, newValue) => {
                      setSelectedApproverEmail(
                        newValue ? newValue.reviewer_email : null
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Approver Email"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    sx={{ backgroundColor: "#f9f9f9" }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    id="approver-name"
                    label="Approver Name"
                    value={approverName}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      style: {
                        color: "#dc004e",
                        fontWeight: "bold",
                      },
                    }}
                    fullWidth
                    sx={{ backgroundColor: "#f9f9f9" }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={2}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    fullWidth
                    sx={{
                      backgroundColor: "#ec7c30",
                      color: "white",
                      padding: "12px",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "black",
                      },
                    }}
                    startIcon={<SendIcon />}
                  >
                    Save Expenses
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default InvoiceForm;
