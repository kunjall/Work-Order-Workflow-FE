import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import CreateW2S from "../components/mrsCreation/createW2S";
import CreateS2W from "../components/mrsCreation/createS2W";
import { Box, lighten, Typography, Button, IconButton } from "@mui/material";

const Requests = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("W2S"); // Default set to W2S
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Function to render components based on the active tab
  const renderComponent = () => {
    switch (activeTab) {
      case "W2S":
        return <CreateW2S key={refreshKey} />; // Current inventory component
      case "D2S":
        return "D2S";
      case "S2W":
        return <CreateS2W key={refreshKey} />; // Current inventory component
      default:
        return null;
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "90px",
          paddingLeft: "20px",
          gap: "5px",
        }}
      >
        <Button
          onClick={() => setActiveTab("W2S")}
          sx={{
            color: activeTab === "W2S" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "W2S" ? "black" : "#ec7c30",
            height: "40px",
            padding: "10px 20px",
            borderRadius: "5px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black",
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          W2S
        </Button>

        <Button
          onClick={() => setActiveTab("S2W")}
          sx={{
            color: activeTab === "S2W" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "S2W" ? "black" : "#ec7c30",
            height: "40px",
            padding: "10px 20px",
            borderRadius: "5px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "black",
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          S2W
        </Button>
        <Button
          onClick={() => setActiveTab("D2S")}
          sx={{
            color: activeTab === "D2S" ? "white" : "white",
            backgroundColor: activeTab === "D2S" ? "black" : "red",
            height: "40px",
            padding: "10px 20px",
            borderRadius: "5px",
            fontWeight: "bold",
            // marginLeft: "70px",
            "&:hover": {
              backgroundColor: "black",
              color: "white",
              cursor: "pointer",
            },
          }}
        >
          D2S
        </Button>
      </div>

      {/* Render the selected component */}
      <div style={{ marginTop: "10px", flex: "1" }}>{renderComponent()}</div>
    </div>
  );
};

export default Requests;
