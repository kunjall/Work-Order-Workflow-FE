import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

const WorkorderDialog = ({ open, onClose, workorder }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Workorder Details</DialogTitle>
      <DialogContent>
        {workorder && (
          <div>
            <TextField
              margin="dense"
              label="Workorder Number"
              fullWidth
              value={workorder.workorder_number}
              InputProps={{ readOnly: true }}
            />
            <TextField
              margin="dense"
              label="GIS Code"
              fullWidth
              value={workorder.gis_code}
              InputProps={{ readOnly: true }}
            />
            <TextField
              margin="dense"
              label="Route Name"
              fullWidth
              value={workorder.route_name}
              InputProps={{ readOnly: true }}
            />
            <TextField
              margin="dense"
              label="Route Length"
              fullWidth
              value={workorder.route_length}
              InputProps={{ readOnly: true }}
            />
            {/* Add more fields as needed */}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkorderDialog;
