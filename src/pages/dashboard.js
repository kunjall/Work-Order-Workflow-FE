import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import DashboardRequests from "../components/dashboard/dashboardRequests";
import CachedIcon from "@mui/icons-material/Cached";
import { Box, lighten, Typography, Button, IconButton } from "@mui/material";

const Requests = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Inventory");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Function to render components based on the active tab
  const renderComponent = () => {
    switch (activeTab) {
      case "Inventory":
        return <DashboardRequests key={refreshKey} />; // Current inventory component
      case "MWO":
        return "mwo";
      case "CWO":
        return "CWO";
      default:
        return null;
    }
  };

  // Refresh function
  const handleRefresh = () => {
    // Logic to refresh the component or data, for now, we just toggle activeTab
    setRefreshKey((prevKey) => prevKey + 1); // This will trigger a re-render
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start", // Align buttons to the left
          marginTop: "90px",
          paddingLeft: "20px",
          gap: "5px", // Add padding to the left for spacing
        }}
      >
        <Button
          onClick={() => setActiveTab("Inventory")}
          sx={{
            color: activeTab === "Inventory" ? "#ec7c30" : "black", // Text color
            backgroundColor: activeTab === "Inventory" ? "black" : "#ec7c30",
            height: "40px", // Ensure height is fixed
            padding: "10px 20px", // Add padding for better spacing
            borderRadius: "5px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black", // Keep the orange background on hover
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          Inventory
        </Button>
        <Button
          onClick={() => setActiveTab("MWO")}
          sx={{
            color: activeTab === "MWO" ? "#ec7c30" : "black", // Text color
            backgroundColor: activeTab === "MWO" ? "black" : "#ec7c30",
            height: "40px", // Ensure height is fixed
            padding: "10px 20px", // Add padding for better spacing
            borderRadius: "5px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black", // Keep the orange background on hover
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          MWO
        </Button>
        <Button
          onClick={() => setActiveTab("CWO")}
          sx={{
            color: activeTab === "CWO" ? "#ec7c30" : "black", // Text color
            backgroundColor: activeTab === "CWO" ? "black" : "#ec7c30",
            height: "40px", // Ensure height is fixed
            padding: "10px 20px", // Add padding for better spacing
            borderRadius: "5px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black", // Keep the orange background on hover
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          CWO
        </Button>

        {/* Refresh Button */}
        <IconButton
          onClick={handleRefresh}
          sx={{
            color: "black", // Text color
            backgroundColor: "#ec7c30", // Orange background
            width: "35px", // Equal width and height for a perfect circle
            height: "35px", // Equal width and height for a perfect circle
            borderRadius: "50%", // Perfectly round shape
            fontWeight: "bold",
            display: "flex", // Center the icon inside the button
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundColor: "black", // Change background to black on hover
              color: "#ec7c30", // Change icon color to orange on hover
              cursor: "pointer",
            },
          }}
        >
          <CachedIcon />
        </IconButton>
      </div>

      {/* Render the selected component */}
      <div style={{ marginTop: "10px", flex: "1" }}>{renderComponent()}</div>
    </div>
  );
};

export default Requests;
