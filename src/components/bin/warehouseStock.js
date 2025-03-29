import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { CSVLink } from "react-csv";

const StockTable = () => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/inventory/get-inventory-stock`,
          {
            headers: {
              Authorization: user.authToken,
            },
          }
        );
        setStockData(response.data);
      } catch (error) {
        console.error("Error fetching inventory stock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const exportData = [];
  Object.keys(stockData).forEach((warehouse) => {
    stockData[warehouse].forEach((item) => {
      exportData.push({
        Warehouse: warehouse,
        MaterialID: item.material_id,
        MaterialDescription: item.material_desc,
        Stock: item.material_stock,
        UOM: item.material_uom,
        Company: item.company,
        Rate: item.material_rate,
      });
    });
  });

  return (
    <div className="flex flex-col items-center min-h-screen p-5">
      <Card sx={{ width: "90%", padding: 2 }}>
        <CardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Inventory Stock
            </Typography>
            <CSVLink
              data={exportData}
              filename="inventory_stock.csv"
              style={{ textDecoration: "none" }}
            >
              <Button variant="contained" color="primary">
                Export CSV
              </Button>
            </CSVLink>
          </div>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            Object.keys(stockData).map((warehouse) => (
              <div key={warehouse} style={{ marginBottom: "24px" }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: 1 }}
                >
                  Warehouse: {warehouse}
                </Typography>
                <Table sx={{ border: "1px solid #ddd" }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>
                        <strong>Material ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Description</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Stock</strong>
                      </TableCell>
                      <TableCell>
                        <strong>UOM</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Company</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Price</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockData[warehouse].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.material_id}</TableCell>
                        <TableCell>{item.material_desc}</TableCell>
                        <TableCell>{item.material_stock}</TableCell>
                        <TableCell>{item.material_uom}</TableCell>
                        <TableCell>{item.company}</TableCell>
                        <TableCell>{item.material_rate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockTable;
