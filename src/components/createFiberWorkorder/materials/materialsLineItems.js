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

const AddMaterials = ({ materialCodes, onUpdate, onAmountUpdate }) => {
  const [lineItems, setLineItems] = useState([
    {
      materialCode: "",
      itemName: "",
      itemUom: "",
      itemQTY: "",
      itemRate: "",
      itemPrice: "",
      totalAmount: "",
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    const total = lineItems.reduce((sum, item) => {
      return sum + parseFloat(item.itemPrice || 0);
    }, 0);
    setTotalAmount(total.toFixed(2));
    onAmountUpdate(total.toFixed(2));
  };

  useEffect(() => {
    calculateTotal();
  }, [lineItems]);

  useEffect(() => {
    onUpdate(lineItems);
  }, [lineItems, onUpdate]);

  const handleAddLineItem = () => {
    const newLineItems = [
      ...lineItems,
      {
        materialCode: "",
        itemName: "",
        itemUom: "",
        itemQTY: "",
        itemRate: "",
        itemPrice: "",
        totalAmount: "",
      },
    ];
    setLineItems(newLineItems);
    onUpdate(newLineItems);
  };

  const handleRemoveLineItem = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  const handleChange = (index, field, value) => {
    const updatedLineItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  const handleMaterialChange = (index, material) => {
    const materialCode = material ? material.id : "";

    const isMaterialCodeDuplicate = lineItems.some(
      (item, i) => i !== index && item.materialCode === materialCode
    );

    if (isMaterialCodeDuplicate) {
      setError("This material has already been added.");
      return;
    } else {
      setError(null);
    }

    const itemName = material ? material.description : "";
    const itemUom = material ? material.uom : "";
    const itemRate = material ? material.rate : "";

    const updatedLineItems = lineItems.map((item, i) =>
      i === index
        ? { ...item, materialCode, itemName, itemUom, itemRate }
        : item
    );
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  const handleQuantityChange = (index, value) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index].itemQTY = value;

    const itemRate = updatedLineItems[index].itemRate;
    const itemPrice = value * itemRate;
    const totalAmount = itemPrice;

    updatedLineItems[index].itemPrice = itemPrice;
    updatedLineItems[index].totalAmount = totalAmount;

    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  const handleRateChange = (index, value) => {
    const updatedLineItems = [...lineItems];
    updatedLineItems[index].itemRate = value;

    const itemQTY = updatedLineItems[index].itemQTY;
    const itemPrice = itemQTY * value;
    const totalAmount = itemPrice;

    updatedLineItems[index].itemPrice = itemPrice;
    updatedLineItems[index].totalAmount = totalAmount;

    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  const isAddDisabled = lineItems.some(
    (item) =>
      !item.itemRate ||
      !item.itemQTY ||
      !item.materialCode ||
      !item.itemName ||
      !item.itemUom
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
          {index !== 0 && <Divider sx={{ my: 2 }} />}
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
                options={materialCodes}
                getOptionLabel={(option) => `${option.id}`}
                value={
                  materialCodes.find((mat) => mat.id === item.materialCode) ||
                  null
                }
                onChange={(e, newValue) => {
                  handleMaterialChange(index, newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Material Code" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                label="Material Desc"
                value={item.itemName}
                onChange={(e) =>
                  handleChange(index, "itemName", e.target.value)
                }
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                label="UOM"
                value={item.itemUom}
                onChange={(e) => handleChange(index, "itemUom", e.target.value)}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
              <TextField
                label="Rate"
                value={item.itemRate}
                onChange={(e) => handleRateChange(index, e.target.value)}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                disabled
              />
            </Grid>

            <Grid item xs={6} sm={3} md={1}>
              <TextField
                label="QTY"
                value={item.itemQTY}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                label="Price"
                value={item.itemPrice}
                fullWidth
                disabled
              />
            </Grid>

            <Grid item xs={1} sm={1} md={0.5}>
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
          Budget Amount:
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          ₹{totalAmount}
        </Typography>
      </Box>
    </Box>
  );
};

export default AddMaterials;
