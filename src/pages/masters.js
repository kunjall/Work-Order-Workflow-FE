import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import MaterialsMaster from "../components/masters/materialMaster";
import ServiceMaster from "../components/masters/serviceMaster";
import VendorMaster from "../components/masters/vendorMaster";
import LocatorMaster from "../components/masters/locatorMaster";
import WarehouseMaster from "../components/masters/warehouseMaster";
import CustomerMaster from "../components/masters/customerMaster";
import CustomerWhMaster from "../components/masters/customerWhMaster";

// TabPanel component to handle tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`masters-tabpanel-${index}`}
      aria-labelledby={`masters-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Function to generate accessibility props for tabs
function a11yProps(index) {
  return {
    id: `masters-tab-${index}`,
    "aria-controls": `masters-tabpanel-${index}`,
  };
}

const Masters = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="masters tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Material" {...a11yProps(0)} />
          <Tab label="Service" {...a11yProps(1)} />
          <Tab label="Vendor" {...a11yProps(2)} />
          <Tab label="Locator" {...a11yProps(3)} />
          <Tab label="TPS WH" {...a11yProps(4)} />
          <Tab label="Customers" {...a11yProps(5)} />
          <Tab label="Cust WH" {...a11yProps(6)} />

          {/* Add more tabs here as needed for future master modules */}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <MaterialsMaster />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <ServiceMaster />{" "}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <VendorMaster />{" "}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <LocatorMaster />{" "}
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <WarehouseMaster />{" "}
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <CustomerMaster />{" "}
      </TabPanel>
      <TabPanel value={tabValue} index={6}>
        <CustomerWhMaster />{" "}
      </TabPanel>

      {/* Add more TabPanels here as needed for future master modules */}
    </Box>
  );
};

export default Masters;
