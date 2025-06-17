import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import WOW from "../../assets/images/wow.png";
import "../../assets/styles/navbar.css";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import EngineeringIcon from "@mui/icons-material/Engineering";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RouterIcon from "@mui/icons-material/Router";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import StraightenIcon from "@mui/icons-material/Straighten";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import SaveAsIcon from "@mui/icons-material/SaveAs";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpenDrawer(open);
  };

  const getActiveStyle = (path) => ({
    color: location.pathname === path ? "#40E0D0" : "white",
    textDecoration: location.pathname === path ? "underline" : "none",
  });

  const admin1MenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },

    { text: "Create MWO", icon: <EngineeringIcon />, path: "/create-mwo" },
    {
      text: "CR MWO",
      icon: <InventoryIcon />,
      path: "/change-request-mwo",
    },
    // { text: "Modify MWO", icon: <EngineeringIcon />, path: "/modify-mwo" },
    { text: "Create CWO", icon: <RouterIcon />, path: "/create-cwo" },
    {
      text: "CR CWO",
      icon: <InventoryIcon />,
      path: "/change-request-cwo",
    },
    {
      text: "Inventory Inward",
      icon: <WarehouseIcon />,
      path: "/inventory-inward",
    },
    { text: "MRS", icon: <LocalShippingIcon />, path: "/MRS" },
    { text: "MB", icon: <StraightenIcon />, path: "/MB" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
    { text: "Budget", icon: <MenuBookIcon />, path: "/budget" },
    { text: "Access", icon: <VpnKeyIcon />, path: "/user-access" },
    { text: "Masters", icon: <SaveAsIcon />, path: "/update-masters" },
  ];

  const adminMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },

    { text: "Create MWO", icon: <EngineeringIcon />, path: "/create-mwo" },
    {
      text: "CR MWO",
      icon: <InventoryIcon />,
      path: "/change-request-mwo",
    },
    // { text: "Modify MWO", icon: <EngineeringIcon />, path: "/modify-mwo" },
    { text: "Create CWO", icon: <RouterIcon />, path: "/create-cwo" },
    {
      text: "CR CWO",
      icon: <InventoryIcon />,
      path: "/change-request-cwo",
    },
    {
      text: "Inventory Inward",
      icon: <WarehouseIcon />,
      path: "/inventory-inward",
    },
    { text: "Mat Mov", icon: <LocalShippingIcon />, path: "/MRS" },
    { text: "MB", icon: <StraightenIcon />, path: "/MB" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
    { text: "Budget", icon: <MenuBookIcon />, path: "/budget" },
    { text: "Access", icon: <VpnKeyIcon />, path: "/user-access" },
  ];

  const cwoMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    { text: "Create CWO", icon: <RouterIcon />, path: "/create-cwo" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
  ];

  const crcMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
    {
      text: "Change Request CWO",
      icon: <InventoryIcon />,
      path: "/change-request-cwo",
    },
  ];

  const mwoMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    { text: "Create MWO", icon: <EngineeringIcon />, path: "/create-mwo" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
    {
      text: "Change Request MWO",
      icon: <InventoryIcon />,
      path: "/change-request-mwo",
    },
  ];
  const crmMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
    {
      text: "Change Request MWO",
      icon: <InventoryIcon />,
      path: "/change-request-mwo",
    },
  ];

  const mbMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    { text: "MB", icon: <StraightenIcon />, path: "/MB" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
  ];
  const invMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    {
      text: "Inventory Inward",
      icon: <WarehouseIcon />,
      path: "/inventory-inward",
    },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
  ];

  const mmMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
    { text: "Mat Mov", icon: <LocalShippingIcon />, path: "/MRS" },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "Warehouse", icon: <InventoryIcon />, path: "/warehouse-stock" },
  ];
  const actionsMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/actions" },
  ];

  const expenseMenuItems = [
    { text: "Budget", icon: <MenuBookIcon />, path: "/budget" },
  ];

  let menuItems = [];

  if (user?.role) {
    const roles = user.role.trim().toLowerCase().split(" "); // Split roles into an array

    roles.forEach((r) => {
      if (r.includes("admin1")) menuItems = [...menuItems, ...admin1MenuItems];
      if (r.includes("admin")) menuItems = [...menuItems, ...adminMenuItems];
      if (r.includes("cwo")) menuItems = [...menuItems, ...cwoMenuItems];
      if (r.includes("crc")) menuItems = [...menuItems, ...crcMenuItems];
      if (r.includes("crm")) menuItems = [...menuItems, ...crmMenuItems];
      if (r.includes("mwo")) menuItems = [...menuItems, ...mwoMenuItems];
      if (r.includes("mb")) menuItems = [...menuItems, ...mbMenuItems];
      if (r.includes("inv")) menuItems = [...menuItems, ...invMenuItems];
      if (r.includes("mm")) menuItems = [...menuItems, ...mmMenuItems];
      if (r.includes("actions"))
        menuItems = [...menuItems, ...actionsMenuItems];
      if (r.includes("expense"))
        menuItems = [...menuItems, ...expenseMenuItems];
    });

    // Remove duplicates based on path
    menuItems = menuItems.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.path === item.path)
    );
  }

  return user ? (
    <>
      {}
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar>
          {}
          {menuItems.length > 0 && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          {}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={WOW} alt="logo" style={{ height: "30px" }} />
          </Box>

          {/* Center text */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
              The Pinnacle Search
            </Typography>
          </Box>

          {}
          <IconButton color="inherit" component={Link} to="/profile">
            <AccountCircleIcon sx={{ fontSize: 35 }} />
            <p style={{ fontSize: "16px" }}>{user.name}</p>
          </IconButton>
        </Toolbar>
      </AppBar>

      {}
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#222",
            width: 250,
          },
        }}
      >
        <Box
          sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#222" }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#fff", p: 2, textAlign: "center" }}
          >
            Menu
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                onClick={toggleDrawer(false)}
                sx={{
                  color: "white",
                  "&:hover": { backgroundColor: "#444" },
                  ...getActiveStyle(item.path),
                }}
              >
                <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  ) : null;
};

export default Navbar;
