import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
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
} from "@mui/material";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

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
  const [allExpenseData, setAllExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);

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
        QTY: "",
        UOM: "",
        "Unit Price": "",
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
  }, [user, navigate]);
  const handleSubmit = async (cwoId) => {
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (!isConfirmed) return;
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
            cwo_id: cwo.cwo_id,
            mwo_id: selectedWorkOrder.mwo_id,
            service: entry["Activity"], // Ensure correct field mapping
            vendor_name: entry["Vendor Name"], // Match expected key
            qty: entry["QTY"],
            uom: entry["UOM"],
            expense_amount: entry["Amount"], // Correct field name
            unit_price: entry["Unit Price"],
            invoice_number: entry["Invoice Number"],
            invoice_date: entry["Invoice Date"], // Ensure invoice date is included
            remarks: entry["Remarks"],
          }))
        );

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

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          Object.keys(data[0]).join(","),
          ...data.map((row) => Object.values(row).join(",")),
        ].join("\n");

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

  const handleWorkOrderSelect = (event, newValue) => {
    setSelectedWorkOrder(newValue);
    setFormData({
      ...newValue,
      customer_approval_date: newValue?.customer_approval_date
        ? dayjs(newValue.customer_approval_date)
        : null,
    });
  };

  useEffect(() => {
    if (!formData?.mwo_id) {
      setOverheadBudget("");
      setIsSaved(false);
    } else if (formData?.mwo_id && formData?.overhead_budget) {
      const numericValue = formData.overhead_budget.replace(/[^0-9.]/g, "");
      setOverheadBudget(numericValue);
    } else {
      setOverheadBudget("");
    }
  }, [formData?.mwo_id]);

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  console.log(formData);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Grid item xs={12} sm={2} display="flex" gap={2} mb={2}>
          <Typography variant="h5" gutterBottom>
            Payment Budget
          </Typography>

          <Button
            justifyContent="flex-end"
            variant="contained"
            onClick={handleExport}
            sx={{
              backgroundColor: "#007bff",
              color: "white",

              "&:hover": { backgroundColor: "#0056b3" },
            }}
            startIcon={<FileDownloadIcon />}
            disabled={loading}
          >
            {loading ? "Fetching..." : "Export CSV"}
          </Button>
        </Grid>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2.5}>
              <Autocomplete
                options={workOrders}
                getOptionLabel={(option) => option.mwo_id?.toString() || ""}
                onChange={handleWorkOrderSelect}
                renderInput={(params) => (
                  <TextField {...params} label="MWO" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Budgeted Material Cost"
                value={formData.bal_material_cost?.replace("$", "₹") || "₹0"}
                // value={formData.total_material_cost}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiInputBase-input": { color: "red" } }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Budgeted Service Cost"
                value={formData.bal_service_cost?.replace("$", "₹") || "₹0"}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiInputBase-input": { color: "red" } }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Route Name"
                value={formData.route_name || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
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
                sx={{ "& .MuiInputBase-input": { color: "red" } }}
                disabled={isSaved || Boolean(formData.overhead_budget)}
                InputProps={{
                  startAdornment:
                    isSaved || formData.overhead_budget ? (
                      <span style={{ marginRight: "5px" }}>₹</span>
                    ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1} mt={1}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#ec7c30",
                  color: "white",
                  "&:hover": { backgroundColor: "black" },
                }}
                disabled={
                  !overheadBudget ||
                  isSaved ||
                  !formData.mwo_id ||
                  formData.overhead_budget
                }
                onClick={handleSave}
              >
                Save
              </Button>
            </Grid>
          </Grid>
          {selectedWorkOrder && (
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Card sx={{ p: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
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
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            label="Material MB Submitted"
                            value={cwo.material_budget || "₹0"}
                            variant="outlined"
                            fullWidth
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            label="Service MB Submitted"
                            value={cwo.service_budget || "₹0"}
                            variant="outlined"
                            fullWidth
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Button
                            variant="contained"
                            onClick={() => toggleOverheadInputs(cwo.cwo_id)}
                            sx={{
                              backgroundColor: "#ec7c30",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "black",
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
                              >
                                {[
                                  "Vendor Name",
                                  "Invoice Number",
                                  "Invoice Date",
                                  "Activity",
                                  "QTY",
                                  "UOM",
                                  "Unit Price",
                                  "Amount",
                                  "Remarks",
                                ].map((letter) => (
                                  <Grid item xs={12} sm={2} key={letter}>
                                    <TextField
                                      label={`${letter}`}
                                      value={row[letter] || ""}
                                      onChange={(event) => {
                                        let newValue = event.target.value;

                                        if (letter === "Unit Price") {
                                          newValue = newValue.replace(
                                            /[^0-9]/g,
                                            ""
                                          );
                                        }

                                        if (letter === "Amount") {
                                          newValue = newValue.replace(
                                            /[^0-9]/g,
                                            ""
                                          );
                                        }
                                        if (letter === "Invoice Date") {
                                          newValue = newValue.toUpperCase(); // Convert to uppercase for consistency
                                          newValue = newValue.replace(
                                            /[^0-9A-Z-]/g,
                                            ""
                                          ); // Allow only numbers, letters, and dashes

                                          // Automatically insert dashes at correct positions
                                          if (
                                            newValue.length > 2 &&
                                            newValue[2] !== "-"
                                          ) {
                                            newValue =
                                              newValue.slice(0, 2) +
                                              "-" +
                                              newValue.slice(2);
                                          }
                                          if (
                                            newValue.length > 6 &&
                                            newValue[6] !== "-"
                                          ) {
                                            newValue =
                                              newValue.slice(0, 6) +
                                              "-" +
                                              newValue.slice(6);
                                          }

                                          // Enforce max length of 9 characters (DD-MMM-YY)
                                          if (newValue.length > 9) {
                                            newValue = newValue.slice(0, 9);
                                          }

                                          // Validate if middle 3 characters are valid months
                                          const validMonths = [
                                            "JAN",
                                            "FEB",
                                            "MAR",
                                            "APR",
                                            "MAY",
                                            "JUN",
                                            "JUL",
                                            "AUG",
                                            "SEP",
                                            "OCT",
                                            "NOV",
                                            "DEC",
                                          ];

                                          if (newValue.length >= 6) {
                                            const monthPart = newValue.slice(
                                              3,
                                              6
                                            ); // Extract MMM part
                                            if (
                                              !validMonths.includes(monthPart)
                                            ) {
                                              newValue = newValue.slice(0, 3); // Remove incorrect month input
                                            }
                                          }
                                        }

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
                                      fullWidth
                                      variant="outlined"
                                      type={
                                        letter === "Unit Price" ||
                                        letter === "Amount"
                                          ? "number"
                                          : "text"
                                      }
                                    />
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
                            <Grid item xs={12}>
                              <IconButton
                                color="primary"
                                onClick={() => addOverheadRow(cwoIndex)}
                              >
                                <AddCircleOutline />
                                <Typography>Add Line Item</Typography>
                              </IconButton>
                            </Grid>
                          </Grid>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={2} md={4} mt={2}>
                  <TextField
                    label="Total Material Payment"
                    value={`₹${totalMaterialPayment.toLocaleString()}`}
                    variant="outlined"
                    fullWidth
                    inputProps={{ readOnly: true }}
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  />
                </Grid>
                <Grid item xs={6} sm={2} md={4} mt={2}>
                  <TextField
                    label="Total Service Payment"
                    value={`₹${totalServicePayment.toLocaleString()}`}
                    variant="outlined"
                    fullWidth
                    inputProps={{ readOnly: true }}
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  />
                </Grid>
                <Grid item xs={6} sm={2} md={4} mt={2}>
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
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  />
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                sm={2}
                display="flex"
                justifyContent="flex-end"
                mt={1}
              >
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    backgroundColor: "#ec7c30",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "black",
                    },
                  }}
                >
                  Submit
                </Button>
              </Grid>
            </Paper>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default InvoiceForm;
