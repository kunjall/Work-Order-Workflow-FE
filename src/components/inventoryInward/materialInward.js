import React, { useState, useEffect } from "react";
import {
  TextField,
  IconButton,
  Box,
  Grid,
  Typography,
  Autocomplete,
  Divider,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import axios from "axios";

const AddMaterials = ({ materialCodes, onUpdate, customerName, authToken }) => {
  const [lineItems, setLineItems] = useState([
    {
      materialCode: "",
      itemName: "",
      itemUom: "",
      itemQTY: "",
      supplierName: "",
    },
  ]);
  const [suppliers, setSuppliers] = useState([]);

  // Fetch suppliers when component mounts
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/master/supplier`,
          {
            headers: { Authorization: authToken },
          }
        );
        setSuppliers(response.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };

    if (authToken) {
      fetchSuppliers();
    }
  }, [authToken]);

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
        supplierName: "",
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
    if (field === "itemQTY" && parseFloat(value) < 0) return; // Prevent negative values

    const updatedLineItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  const handleMaterialChange = (index, material) => {
    const materialCode = material ? material.id : "";
    const itemName = material ? material.description : "";
    const itemUom = material ? material.uom : "";

    const updatedLineItems = lineItems.map((item, i) =>
      i === index ? { ...item, materialCode, itemName, itemUom } : item
    );
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems);
  };

  return (
    <Box sx={{ flex: 1, padding: 2 }}>
      {lineItems.map((item, index) => (
        <Box key={index}>
          <Grid container spacing={0.5} sx={{ marginBottom: 0.5 }}>
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

            <Grid item xs={12} sm={6} md={2.5}>
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

            <Grid item xs={6} sm={3} md={1}>
              <TextField
                label="UOM"
                value={item.itemUom}
                onChange={(e) => handleChange(index, "itemUom", e.target.value)}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={6} sm={3} md={1.5}>
              <TextField
                label="QTY"
                value={item.itemQTY}
                onChange={(e) => handleChange(index, "itemQTY", e.target.value)}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                onInput={(e) => {
                  if (e.target.value < 0) e.target.value = 0; // Reset negative input
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.supplier_name || ""}
                value={
                  suppliers.find(
                    (sup) => sup.supplier_name === item.supplierName
                  ) || null
                }
                onChange={(e, newValue) => {
                  handleChange(
                    index,
                    "supplierName",
                    newValue ? newValue.supplier_name : ""
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Supplier (Optional)"
                    fullWidth
                    placeholder={`Default: ${customerName}`}
                  />
                )}
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

      <Box mt={0.5}>
        <IconButton color="primary" onClick={handleAddLineItem}>
          <AddCircleOutline />
          <Typography>Add Line Item</Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default AddMaterials;
