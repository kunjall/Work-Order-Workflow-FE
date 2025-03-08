import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Fiber from "./Mother";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: "100%", overflowY: "auto" }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Verticals() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ marginTop: "60px", height: "calc(100vh - 60px)" }}>
      {" "}
      {}
      <Box sx={{ width: "100%", height: "100%" }}>
        {" "}
        {}
        <Box>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            TabIndicatorProps={{
              sx: {
                backgroundColor: "#bf504d",
              },
            }}
            sx={{
              display: "flex",
              justifyContent: "center",
              "& .MuiTabs-scroller": {
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
              },
              "& .MuiTabs-flexContainer": {
                justifyContent: "center",
              },
              "& .MuiTab-root": {
                color: "#808080",
              },
              "& .MuiTab-root.Mui-selected": {
                color: "black",
              },
            }}
          >
            <Tab
              style={{ fontSize: "18px", fontWeight: "bold" }}
              label="Fiber Rollout"
              {...a11yProps(0)}
            />
            <Tab
              style={{ fontSize: "18px", fontWeight: "bold" }}
              label="Tower"
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
        <div style={{ height: "calc(100vh - 120px)", overflowY: "auto" }}>
          {" "}
          {}
          <CustomTabPanel value={value} index={0}>
            <Fiber />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            {}
          </CustomTabPanel>
        </div>
      </Box>
    </div>
  );
}
