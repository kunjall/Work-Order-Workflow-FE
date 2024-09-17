import React, { useState, useEffect } from "react";
import {
  TextField,
  IconButton,
  Box,
  Grid,
  Typography,
  Autocomplete,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

const AddMaterials = ({ materialCodes, onUpdate }) => {
  const [lineItems, setLineItems] = useState([
    {
      materialCode: "",
      itemName: "",
      itemUom: "",
      itemQTY: "",
    },
  ]);

  useEffect(() => {
    onUpdate(lineItems); // Send the initial items to the parent on load
  }, [lineItems, onUpdate]); // Ensure it sends updated items every time lineItems change

  const handleAddLineItem = () => {
    const newLineItems = [
      ...lineItems,
      {
        materialCode: "",
        itemName: "",
        itemUom: "",
        itemQTY: "",
      },
    ];
    setLineItems(newLineItems);
    onUpdate(newLineItems); // Send updated items to parent
  };

  const handleRemoveLineItem = (index) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems); // Send updated items to parent
    console.log("Updated Line Items after removal:", updatedLineItems);
  };

  const handleChange = (index, field, value) => {
    const updatedLineItems = lineItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems); // Send updated items to parent
    console.log("Updated Line Items:", updatedLineItems);
  };

  const handleMaterialChange = (index, material) => {
    const materialCode = material ? material.id : "";
    const itemName = material ? material.description : "";
    const itemUom = material ? material.uom : "";

    const updatedLineItems = lineItems.map((item, i) =>
      i === index ? { ...item, materialCode, itemName, itemUom } : item
    );
    setLineItems(updatedLineItems);
    onUpdate(updatedLineItems); // Send updated items to parent
    console.log("Updated Line Items after Material Change:", updatedLineItems);
  };

  return (
    <Box sx={{ flex: 1, padding: 2 }}>
      {lineItems.map((item, index) => (
        <Grid container spacing={2} key={index} sx={{ marginBottom: 2 }}>
          <Grid item xs={4}>
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

          <Grid item xs={4}>
            <TextField
              label="Material Desc"
              value={item.itemName}
              onChange={(e) => handleChange(index, "itemName", e.target.value)}
              fullWidth
              disabled // Automatically populated based on materialCode selection
            />
          </Grid>

          <Grid item xs={1.5}>
            <TextField
              label="UOM"
              value={item.itemUom}
              onChange={(e) => handleChange(index, "itemUom", e.target.value)}
              fullWidth
              disabled // Automatically populated based on materialCode selection
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label="W/O QTY"
              value={item.itemQTY}
              onChange={(e) => handleChange(index, "itemQTY", e.target.value)}
              fullWidth
              type="number"
              inputProps={{ step: "0.01", min: "0" }} // Allows decimals
            />
          </Grid>

          <Grid item xs={0.5}>
            <IconButton onClick={() => handleRemoveLineItem(index)}>
              <RemoveCircleOutline color="error" />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Box mt={2}>
        <IconButton color="primary" onClick={handleAddLineItem}>
          <AddCircleOutline />
          <Typography>Add Line Item</Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default AddMaterials;
