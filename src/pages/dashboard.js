import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import DashboardRequests from "../components/dashboard/Inventory/dashboardRequestsInventory";
import DashboardRequestsMwo from "../components/dashboard/MWO/dashboardRequestsMwo";
import DashboardRequestsCwo from "../components/dashboard/CWO/dashboardRequestsCwo";
import DashboardRequestsMM from "../components/dashboard/MM/dashboardRequestsMM";
import DashboardRequestMB from "../components/dashboard/MB/dashboardRequestsMB";
import DashboardRequestsCR from "../components/dashboard/CR/dashboardRequestsCR";
import DashboardRequestsMwoCr from "../components/dashboard/MWO_CR/dashboardRequestsMwoCr";
import DashboardRequestsInvoice from "../components/dashboard/Invoice/dashboardRequestsInvoice";
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

  const renderComponent = () => {
    switch (activeTab) {
      case "Inventory":
        return <DashboardRequests key={refreshKey} />;
      case "MWO":
        return <DashboardRequestsMwo key={refreshKey} />;
      case "CWO":
        return <DashboardRequestsCwo key={refreshKey} />;
      case "MM":
        return <DashboardRequestsMM key={refreshKey} />;
      case "MB":
        return <DashboardRequestMB key={refreshKey} />;
      case "CR":
        return <DashboardRequestsCR key={refreshKey} />;
      case "CR MWO":
        return <DashboardRequestsMwoCr key={refreshKey} />;
      case "Invoice":
        return <DashboardRequestsInvoice key={refreshKey} />;
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "40px",
          paddingLeft: "20px",
          gap: "5px",
        }}
      >
        <Button
          onClick={() => setActiveTab("Inventory")}
          sx={{
            color: activeTab === "Inventory" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "Inventory" ? "black" : "#ec7c30",
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
          Inventory
        </Button>
        <Button
          onClick={() => setActiveTab("MWO")}
          sx={{
            color: activeTab === "MWO" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "MWO" ? "black" : "#ec7c30",
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
          MWO
        </Button>
        <Button
          onClick={() => setActiveTab("CWO")}
          sx={{
            color: activeTab === "CWO" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "CWO" ? "black" : "#ec7c30",
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
          CWO
        </Button>
        <Button
          onClick={() => setActiveTab("MM")}
          sx={{
            color: activeTab === "MM" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "MM" ? "black" : "#ec7c30",
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
          MM
        </Button>
        <Button
          onClick={() => setActiveTab("MB")}
          sx={{
            color: activeTab === "MB" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "MB" ? "black" : "#ec7c30",
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
          MB
        </Button>
        <Button
          onClick={() => setActiveTab("CR")}
          sx={{
            color: activeTab === "CR" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "CR" ? "black" : "#ec7c30",
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
          CR CWO
        </Button>
        <Button
          onClick={() => setActiveTab("CR MWO")}
          sx={{
            color: activeTab === "CR MWO" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "CR MWO" ? "black" : "#ec7c30",
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
          CR MWO
        </Button>
        <Button
          onClick={() => setActiveTab("Invoice")}
          sx={{
            color: activeTab === "Invoice" ? "#ec7c30" : "black",
            backgroundColor: activeTab === "Invoice" ? "black" : "#ec7c30",
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
          Invoice
        </Button>

        {}
        <IconButton
          onClick={handleRefresh}
          sx={{
            color: "black",
            backgroundColor: "#ec7c30",
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              backgroundColor: "black",
              color: "#ec7c30",
              cursor: "pointer",
            },
          }}
        >
          <CachedIcon />
        </IconButton>
      </div>

      {}
      <div style={{ marginTop: "10px", flex: "1" }}>{renderComponent()}</div>
    </div>
  );
};

export default Requests;
