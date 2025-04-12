import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Stack,
  Typography,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { AuthContext } from "../../context/authContext";
import dayjs from "dayjs";

const ParentWorkOrder = () => {
  const { user } = AuthContext();
  const [childWorkorders, setChildWorkorders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [formData, setFormData] = useState({});
  const [overheadBudget, setOverheadBudget] = useState("");
  const [totalExpense, setTotalExpense] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch master work orders
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/workorder/find-parent-mwo`,
          { headers: { Authorization: user.authToken } }
        );
        setWorkOrders(response.data);
      } catch (err) {
        console.error("Error fetching work orders:", err);
        setError("Failed to load work orders");
      }
    };

    fetchWorkOrders();
  }, [user.authToken]);

  // Function to refresh data
  const refreshWorkOrderData = async (workOrder) => {
    try {
      if (!workOrder || !workOrder.mwo_id) return;
      setLoading(true);
      setError("");

      // 🔹 Fetch latest parent work order (to get updated overhead_budget)
      const mwoRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/workorder/find-one-mwo?mwo_id=${workOrder.mwo_id}`,
        { headers: { Authorization: user.authToken } }
      );

      const updatedWorkOrder = mwoRes.data;
      setSelectedWorkOrder(updatedWorkOrder); // update with latest data
      setFormData({
        ...updatedWorkOrder,
        customer_approval_date: updatedWorkOrder?.customer_approval_date
          ? dayjs(updatedWorkOrder.customer_approval_date)
          : null,
      });

      // 🔹 Update overhead budget
      const numericValue =
        updatedWorkOrder.overhead_budget?.replace(/[^0-9.]/g, "") || "0";
      setOverheadBudget(numericValue);

      // 🔹 Fetch total expense
      const expenseRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/invoice/find-total-overhead?mwo_id=${workOrder.mwo_id}`,
        { headers: { Authorization: user.authToken } }
      );
      setTotalExpense(expenseRes.data || 0);

      // 🔹 Fetch child work orders
      const cwoRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/workorder/find-invoice-cwo?mwo_id=${workOrder.mwo_id}`,
        { headers: { Authorization: user.authToken } }
      );
      const childWorkordersData = cwoRes.data;

      // 🔹 Fetch budgets
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

      // 🔹 Merge budget data
      const updatedChildWorkorders = childWorkordersData.map((cwo) => {
        const materialBudget =
          materialBudgetData.find((b) => b.cwo_id === cwo.cwo_id.toString()) ||
          {};
        const serviceBudget =
          serviceBudgetData.find((b) => b.cwo_id === cwo.cwo_id.toString()) ||
          {};

        return {
          ...cwo,
          material_budget: materialBudget.material_budget || "₹0",
          service_budget: serviceBudget.service_budget || "₹0",
        };
      });

      setChildWorkorders(updatedChildWorkorders);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a work order
  const handleWorkOrderSelect = (event, newValue) => {
    setSelectedWorkOrder(newValue);
    setFormData({
      ...newValue,
      customer_approval_date: newValue?.customer_approval_date
        ? dayjs(newValue.customer_approval_date)
        : null,
    });

    if (newValue?.overhead_budget) {
      const numericValue = newValue.overhead_budget.replace(/[^0-9.]/g, "");
      setOverheadBudget(numericValue);
    } else {
      setOverheadBudget("");
    }

    refreshWorkOrderData(newValue);
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={workOrders}
            getOptionLabel={(option) =>
              `${option?.mwo_id} - ${option?.mwo_description}`
            }
            value={selectedWorkOrder}
            onChange={handleWorkOrderSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Parent Work Order"
                variant="outlined"
              />
            )}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            onClick={() => refreshWorkOrderData(selectedWorkOrder)}
            disabled={!selectedWorkOrder || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Refresh"}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {selectedWorkOrder && (
        <Box mt={4}>
          <Typography variant="h6">
            Overhead Budget: ₹{overheadBudget}
          </Typography>
          <Typography variant="h6">Total Expense: ₹{totalExpense}</Typography>

          <Typography variant="h6" mt={2}>
            Child Work Orders:
          </Typography>
          <Stack spacing={1}>
            {childWorkorders.map((cwo) => (
              <Box
                key={cwo.cwo_id}
                p={2}
                border="1px solid #ccc"
                borderRadius={2}
              >
                <Typography>CWO ID: {cwo.cwo_id}</Typography>
                <Typography>Material Budget: {cwo.material_budget}</Typography>
                <Typography>Service Budget: {cwo.service_budget}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ParentWorkOrder;
