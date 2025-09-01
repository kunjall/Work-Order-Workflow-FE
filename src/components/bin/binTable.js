import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import {
  Autocomplete,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { CSVLink } from "react-csv";

const LocatorStock = () => {
  const { user } = useContext(AuthContext);
  const [locators, setLocators] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedLocator, setSelectedLocator] = useState(null);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchLocators = async () => {
      try {
        const internalExternal =
          user.company.toLowerCase() === "tps" ? "internal" : "external";

        // Check if user role contains "admin" (case insensitive)
        const isAdmin = user.role && user.role.toLowerCase().includes("admin");

        const params = {
          internal_external: internalExternal,
        };

        // Only add vendor_name filter if user is not an admin
        if (!isAdmin) {
          params.vendor_name = user.name;
        }

        console.log("Fetching locators with params:", params);
        console.log("User details:", {
          company: user.company,
          role: user.role,
          name: user.name,
          isAdmin,
        });

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-locators`,
          {
            params: params,
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        console.log("Locators received from API:", response.data);
        console.log("Number of locators:", response.data.length);

        setLocators(response.data);

        // Extract unique customers from locator names
        const customerSet = new Set();
        response.data.forEach((locator) => {
          const parts = locator.locator_name.split("_");
          if (parts.length >= 3) {
            // Customer name is between first and second underscore
            const customerName = parts[1];
            customerSet.add(customerName);
          }
        });

        const customerList = Array.from(customerSet).map((customer) => ({
          customer_name: customer,
          display_name: customer.toLowerCase(),
        }));

        setCustomers(customerList);
      } catch (err) {
        console.error("Error fetching locators:", err);
      }
    };

    fetchLocators();
  }, [user]);

  const handleCustomerChange = async (_, newValue) => {
    setSelectedCustomer(newValue);
    setSelectedLocator(null); // Clear locator selection when customer is selected

    if (!newValue) {
      setStockData([]);
      return;
    }

    try {
      // Find all locators for the selected customer
      const customerLocators = locators.filter((locator) => {
        const parts = locator.locator_name.split("_");
        return parts.length >= 3 && parts[1] === newValue.customer_name;
      });

      // Fetch stock data for all customer locators
      const allStockData = [];
      for (const locator of customerLocators) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/master/find-locator-stock`,
            {
              params: { locator_name: locator.locator_name },
              headers: { Authorization: user.authToken },
            }
          );

          // Add locator name to each stock item
          const stockWithLocator = response.data.map((item) => ({
            ...item,
            locator_name: locator.locator_name,
          }));

          allStockData.push(...stockWithLocator);
        } catch (err) {
          console.error(
            `Error fetching stock for ${locator.locator_name}:`,
            err
          );
        }
      }

      setStockData(allStockData);
    } catch (err) {
      console.error("Error fetching customer stock:", err);
    }
  };

  const handleLocatorChange = async (_, newValue) => {
    setSelectedLocator(newValue);
    setSelectedCustomer(null); // Clear customer selection when locator is selected

    if (!newValue) {
      setStockData([]);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/master/find-locator-stock`,
        {
          params: { locator_name: newValue.locator_name },
          headers: { Authorization: user.authToken },
        }
      );

      // Add locator name to each stock item for consistency
      const stockWithLocator = response.data.map((item) => ({
        ...item,
        locator_name: newValue.locator_name,
      }));

      setStockData(stockWithLocator);
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  const exportData = stockData.map((item) => ({
    Customer:
      selectedCustomer?.customer_name ||
      (selectedLocator
        ? selectedLocator.locator_name.split("_")[1] || "N/A"
        : "N/A"),
    "Locator Name": item.locator_name || "N/A",
    "Material ID": item.material_id,
    "Stock Quantity": item.stock_qty,
  }));

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "#2c3e50",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          Locator Stock
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Autocomplete
          options={customers}
          getOptionLabel={(option) => option.customer_name || ""}
          value={selectedCustomer}
          onChange={handleCustomerChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Customer" />
          )}
          isOptionEqualToValue={(option, value) =>
            option.customer_name === value?.customer_name
          }
          sx={{ flex: 1 }}
        />
        <Typography
          variant="body1"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: "#666",
            px: 1,
          }}
        >
          OR
        </Typography>
        <Autocomplete
          options={locators}
          getOptionLabel={(option) => option.locator_name || ""}
          value={selectedLocator}
          onChange={handleLocatorChange}
          renderInput={(params) => (
            <TextField {...params} label="Select Individual Locator" />
          )}
          isOptionEqualToValue={(option, value) =>
            option.locator_name === value?.locator_name
          }
          sx={{ flex: 1 }}
        />
      </Box>

      {}
      {stockData.length > 0 && (
        <Box mt={2} display="flex" justifyContent="flex-end">
          <CSVLink
            data={exportData}
            filename="locator_stock.csv"
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="primary">
              Export CSV
            </Button>
          </CSVLink>
        </Box>
      )}

      {}
      <Box mt={1}>
        {stockData.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{ border: "1px solid #ccc", borderRadius: "8px" }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", borderRight: "1px solid #ddd" }}
                  >
                    Locator Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", borderRight: "1px solid #ddd" }}
                  >
                    Material ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockData
                  ?.filter((item) => Number(item.stock_qty) > 0)
                  .map((item, index) => (
                    <TableRow
                      key={`${item.material_id}-${index}`}
                      sx={{
                        "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                      }}
                    >
                      <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                        {item.locator_name || "-"}
                      </TableCell>
                      <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                        {item.material_id || "-"}
                      </TableCell>
                      <TableCell>{item.stock_qty ?? 0}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" mt={2} color="textSecondary">
            No stock data available
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LocatorStock;
