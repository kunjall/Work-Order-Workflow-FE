import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

export default function Loading() {
  return (
    <div>
      <Box sx={{ display: "flex" }}>
        <CircularProgress sx={{ color: "#EC7C30" }} />
      </Box>
      <Typography>Please wait loading...</Typography>
    </div>
  );
}
