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
            <Grid item xs={12} sm={6} md={3}>
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

            <Grid item xs={6} sm={3} md={3}>
              <TextField
                label="QTY"
                value={item.itemQTY}
                onChange={(e) => handleChange(index, "itemQTY", e.target.value)}
                fullWidth
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
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
        <IconButton color="primary" onClick={handleAddLineItem}>
          <AddCircleOutline />
          <Typography>Add Line Item</Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default AddMaterials;
