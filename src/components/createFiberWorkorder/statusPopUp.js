import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorIcon from "@mui/icons-material/Error";

const StatusModal = ({
  open,
  status,
  onClose,
  success,
  woID,
  onFillFormAgain,
  onGoToDashboard,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Status</DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <CheckCircleOutlineIcon
            style={{ color: "green", fontSize: "40px" }}
          />
          <Typography sx={{ ml: 2 }}>Workorder details uploaded</Typography>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <CheckCircleOutlineIcon
            style={{ color: "green", fontSize: "40px" }}
          />
          <Typography sx={{ ml: 2 }}>Service details uploaded</Typography>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {status.materials ? (
            <CheckCircleOutlineIcon
              style={{ color: "green", fontSize: "40px" }}
            />
          ) : (
            <ErrorIcon style={{ color: "red", fontSize: "40px" }} />
          )}
          <Typography sx={{ ml: 2 }}>
            {status.materials
              ? "Material details uploaded"
              : "Material details failed"}
          </Typography>
        </div>

        {!status.materials && (
          <Typography color="red" variant="body2">
            Error details: Failed to upload materials.
          </Typography>
        )}

        {/* Success Message and Work Order ID */}
        {success && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Typography variant="h6" color="green">
              Success! Work Order ID: {woID}
            </Typography>
          </div>
        )}

        {/* Buttons */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {success ? (
            <Button
              variant="contained"
              color="primary"
              onClick={onGoToDashboard}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="secondary"
                onClick={onFillFormAgain}
              >
                Fill Form Again
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={onGoToDashboard}
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusModal;
