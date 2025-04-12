import React, { useState, useEffect } from "react";
import {
  TextField,
  IconButton,
  Box,
  Grid,
  Typography,
  Autocomplete,
  Divider,
  Alert,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

const AddServices = ({ services, onLineItemUpdate, onAmountUpdate }) => {
  const [lineItems, setLineItems] = useState([
    {
      serviceId: "",
      serviceDescription: "",
      serviceUOM: "",
      serviceRate: "",
      serviceQTY: "",
      servicePrice: "",
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    onLineItemUpdate(lineItems);
    calculateTotal();
  }, [lineItems, onLineItemUpdate]);

  const handleAddLineItem = () => {
    const newLineItems = [
      ...lineItems,
      {
        serviceId: "",
        serviceDescription: "",
        serviceUOM: "",
        serviceRate: "",
        serviceQTY: "",
        servicePrice: "",
      },
    ];
    setLineItems(newLineItems);
  };

  const handleRemoveLineItem = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const handleChange = (index, field, value) => {
    const updatedLineItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updatedLineItems);

    if (field === "serviceQTY" || field === "serviceRate") {
      const qty = parseFloat(updatedLineItems[index].serviceQTY || 0);
      const rate = parseFloat(updatedLineItems[index].serviceRate || 0);
      const servicePrice = qty * rate;
      updatedLineItems[index].servicePrice = servicePrice.toFixed(2);
      setLineItems(updatedLineItems);
    }
  };

  const handleServiceChange = (index, service) => {
    if (service) {
      const {
        id: serviceId,
        description: serviceDescription,
        uom: serviceUOM,
        rate: serviceRate,
      } = service;

      const isDuplicate = lineItems.some(
        (item, i) => i !== index && item.serviceId === serviceId
      );

      if (isDuplicate) {
        setError("This service has already been added.");
        return;
      } else {
        setError(null);
      }

      const updatedLineItems = lineItems.map((item, i) =>
        i === index
          ? { ...item, serviceId, serviceDescription, serviceUOM, serviceRate }
          : item
      );
      setLineItems(updatedLineItems);
    } else {
      const updatedLineItems = lineItems.map((item, i) =>
        i === index
          ? {
              ...item,
              serviceId: "",
              serviceDescription: "",
              serviceUOM: "",
              serviceRate: "",
              serviceQTY: "",
              servicePrice: "",
            }
          : item
      );
      setLineItems(updatedLineItems);
    }
  };

  const calculateTotal = () => {
    const total = lineItems.reduce((sum, item) => {
      return sum + parseFloat(item.servicePrice || 0);
    }, 0);
    setTotalAmount(total.toFixed(2));
    onAmountUpdate(total.toFixed(2));
  };

  useEffect(() => {
    calculateTotal();
  }, [lineItems]);

  const isAddDisabled = lineItems.some(
    (item) =>
      !item.serviceId ||
      !item.serviceQTY ||
      !item.servicePrice ||
      !item.serviceRate ||
      !item.serviceUOM ||
      !item.serviceDescription
  );

  return (
    <Box sx={{ flex: 1, padding: 2 }}>
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}
      {lineItems.map((item, index) => (
        <Box key={index}>
          {index !== 0 && <Divider sx={{ my: 2 }} />} {}
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid
              item
              xs={10}
              sm={2}
              md={0.1}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "regular" }}>
                {index + 1}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <Autocomplete
                options={services}
                getOptionLabel={(option) => `${option.id}`}
                value={
                  services.find((service) => service.id === item.serviceId) ||
                  null
                }
                onChange={(e, newValue) => {
                  handleServiceChange(index, newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Service Code" fullWidth />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
              />
            </Grid>

            <Grid item xs={12} sm={8} md={2.5}>
              <TextField
                label="Service Desc"
                value={item.serviceDescription}
                onChange={(e) =>
                  handleChange(index, "serviceDescription", e.target.value)
                }
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <TextField
                label="UOM"
                value={item.serviceUOM}
                onChange={(e) =>
                  handleChange(index, "serviceUOM", e.target.value)
                }
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <TextField
                label="Price"
                value={item.serviceRate}
                onChange={(e) =>
                  handleChange(index, "serviceRate", e.target.value)
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <TextField
                label="QTY"
                value={item.serviceQTY}
                onChange={(e) =>
                  handleChange(index, "serviceQTY", e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault(); // prevents negative values and exponential notation
                  }
                }}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                label="Amount"
                value={item.servicePrice}
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6} md={0.5}>
              <IconButton onClick={() => handleRemoveLineItem(index)}>
                <RemoveCircleOutline color="error" />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      ))}
      <Box mt={2}>
        <IconButton
          color="primary"
          onClick={handleAddLineItem}
          disabled={isAddDisabled}
        >
          <AddCircleOutline />
          <Typography>Add Line Item</Typography>
        </IconButton>
      </Box>
      {}
      <Box
        mt={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Total Services Cost:
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          ₹{totalAmount}
        </Typography>
      </Box>
    </Box>
  );
};

export default AddServices;
