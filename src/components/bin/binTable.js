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
  const [selectedLocator, setSelectedLocator] = useState(null);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchLocators = async () => {
      try {
        const internalExternal =
          user.company.toLowerCase() === "tps" ? "internal" : "external";

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/find-locators`,
          {
            params: {
              vendor_name: user.name,
              internal_external: internalExternal,
            },
            headers: {
              Authorization: user.authToken,
            },
          }
        );

        setLocators(response.data);
      } catch (err) {
        console.error("Error fetching locators:", err);
      }
    };

    fetchLocators();
  }, [user]);

  const handleLocatorChange = async (_, newValue) => {
    setSelectedLocator(newValue);

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

      setStockData(response.data);
    } catch (err) {
      console.error("Error fetching stock:", err);
    }
  };

  const exportData = stockData.map((item) => ({
    "Locator Name": selectedLocator?.locator_name || "N/A",
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

      {}
      <Autocomplete
        options={locators}
        getOptionLabel={(option) => option.locator_name || ""}
        value={selectedLocator}
        onChange={handleLocatorChange}
        renderInput={(params) => (
          <TextField {...params} label="Select Locator" fullWidth />
        )}
        isOptionEqualToValue={(option, value) =>
          option.locator_name === value?.locator_name
        }
      />

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
                    Material ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockData.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(even)": { backgroundColor: "#fafafa" },
                    }}
                  >
                    <TableCell sx={{ borderRight: "1px solid #ddd" }}>
                      {item.material_id}
                    </TableCell>
                    <TableCell>{item.stock_qty}</TableCell>
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
