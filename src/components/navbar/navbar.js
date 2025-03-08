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

  const adminMenuItems = [
    { text: "Actions", icon: <PendingActionsIcon />, path: "/dashboard-admin" },

    { text: "Create MWO", icon: <EngineeringIcon />, path: "/create" },
    { text: "Create CWO", icon: <RouterIcon />, path: "/find" },
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

  const whinchMenuItems = [
    {
      text: "Inventory Inward",
      icon: <WarehouseIcon />,
      path: "/inventory-inward",
    },
    { text: "Locator", icon: <FolderOpenIcon />, path: "/locator" },
    { text: "MM", icon: <LocalShippingIcon />, path: "/MRS" },
  ];

  let menuItems = [];
  if (user?.role === "admin") {
    menuItems = adminMenuItems;
  } else if (user?.role === "whinch") {
    menuItems = whinchMenuItems;
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
          <Box sx={{ flexGrow: 1 }}>
            <img src={WOW} alt="logo" style={{ height: "30px" }} />
          </Box>

          {}
          <IconButton color="inherit" component={Link} to="/profile">
            <AccountCircleIcon sx={{ fontSize: "35px" }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {}
      <Drawer anchor="left" open={openDrawer} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, backgroundColor: "#222", height: "100%" }}>
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
