import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
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

  const [error, setError] = useState(null);
  const addOverheadRow = (cwoIndex) => {
    setChildWorkorders((prev) => {
      const updated = [...prev];
      updated[cwoIndex].overhead = [
        ...(updated[cwoIndex].overhead || []),
        { id: Date.now(), A: "", B: "", C: "", D: "", E: "" },
      ];
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

        console.log("Total Expense Response:", response);
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
    try {
      console.log(childWorkorders);

      // Ensure childWorkorders exists and at least one entry has overhead data
      if (
        !childWorkorders ||
        !childWorkorders.length ||
        !childWorkorders.some((cwo) => cwo.overhead?.length)
      ) {
        alert("No expense data to save.");
        return;
      }

      // Prepare data for submission
      const expenseData = childWorkorders
        .filter((cwo) => cwo.overhead?.length) // Only include CWOs with overhead data
        .flatMap((cwo) =>
          cwo.overhead.map((entry) => ({
            cwo_id: cwo.cwo_id, // Use correct cwo_id from each childWorkorder
            mwo_id: selectedWorkOrder.mwo_id,
            service: entry.A,
            vendor_name: entry.B,
            qty: entry.C,
            uom: entry.D,
            expense_amount: entry.E,
          }))
        );

      console.log(expenseData);

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
  // FIX: Now it tracks the entire `selectedWorkOrder` object

  useEffect(() => {
    if (selectedWorkOrder) {
      const fetchCWO = async () => {
        try {
          // Fetch Child Work Orders
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/workorder/find-invoice-cwo?mwo_id=${selectedWorkOrder.mwo_id}`,
            { headers: { Authorization: user.authToken } }
          );

          let childWorkordersData = response.data;

          // Fetch Material and Service Budgets concurrently
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

          console.log(materialResponse.data);
          console.log(serviceResponse.data);

          const materialBudgetData = materialResponse.data; // [{ cwo_id, material_budget }]
          const serviceBudgetData = serviceResponse.data; // [{ cwo_id, service_budget }]

          // Merge budgets with work orders
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
          console.log(childWorkorders);
        } catch (err) {
          setError("Failed to load work orders");
          console.error("Error fetching work orders and budgets:", err);
        }
      };

      fetchCWO();
    }
  }, [selectedWorkOrder]);

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
          mwo_id: formData.mwo_id, // Ensure you pass the correct MWO ID
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

    // Ensure overhead budget is either the new work order’s value or empty
  };

  useEffect(() => {
    if (!formData?.mwo_id) {
      setOverheadBudget(""); // Clear budget when no MWO is selected
      setIsSaved(false);
    } else if (formData?.mwo_id && formData?.overhead_budget) {
      // Ensure we are setting the budget for the currently selected work order
      const numericValue = formData.overhead_budget.replace(/[^0-9.]/g, "");
      setOverheadBudget(numericValue);
    } else {
      setOverheadBudget(""); // Ensure it's empty if no budget exists
    }
  }, [formData?.mwo_id]); // Depend only on MWO ID to reset correctly

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Payment Budget
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={workOrders}
                getOptionLabel={(option) => option.mwo_id?.toString() || ""}
                onChange={handleWorkOrderSelect}
                renderInput={(params) => (
                  <TextField {...params} label="MWO" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                label="Balance Material Cost"
                value={formData.bal_material_cost?.replace("$", "₹") || "₹0"}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiInputBase-input": { color: "red" } }}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                label="Balance Service Cost"
                value={formData.bal_service_cost?.replace("$", "₹") || "₹0"}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiInputBase-input": { color: "red" } }}
              />
            </Grid>
            <Grid item xs={12} sm={2.5}>
              <TextField
                label="Overhead Budget"
                value={overheadBudget}
                onChange={(event) => setOverheadBudget(event.target.value)}
                type="number"
                fullWidth
                variant="outlined"
                sx={{ "& .MuiInputBase-input": { color: "red" } }}
                disabled={isSaved || Boolean(formData.overhead_budget)} // Disable if saved or already exists
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
                } // Disable button after saving
                onClick={handleSave} // Handle save
              >
                Save
              </Button>
            </Grid>
            ;
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
                            label="Material Payment"
                            value={cwo.material_budget || "₹0"}
                            variant="outlined"
                            fullWidth
                            inputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField
                            label="Service Payment"
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
                                {["A", "B", "C", "D", "E"].map((letter) => (
                                  <Grid item xs={12} sm={2} key={letter}>
                                    <TextField
                                      label={`${letter}`}
                                      value={row[letter] || ""}
                                      onChange={(event) => {
                                        let newValue = event.target.value;

                                        // Allow only numbers in "D"
                                        if (letter === "E") {
                                          newValue = newValue.replace(
                                            /[^0-9]/g,
                                            ""
                                          ); // Remove non-numeric characters
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
                                      type={letter === "E" ? "number" : "text"} // Set type to number for D
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
                    label="Total Service Payment"
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
