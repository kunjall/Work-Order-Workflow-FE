import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import DashboardAdmin from "./components/dashboard/dashboardAdmin";

import Enter from "./pages/createMother";
import { GlobalStyles } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Background from "./assets/images/background.jpeg";
import { AuthProvider } from "./context/authContext";
import WithAuth from "./context/withAuth";
import Navbar from "./components/navbar/navbar";
import Bin from "./components/dashboard/bin";
import CreateChild from "./pages/createChild";
import Inventory from "./pages/inventoryInward";
import Repository from "./pages/repository";
import { Repeat } from "@mui/icons-material";

// import Test from "./components/dashboard/test";

const App = () => {
  return (
    <React.Fragment>
      <GlobalStyles
        styles={{
          body: {
            // backgroundImage: `url(${Background})`,
            backgroundRepeat: "repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            margin: 0,
            height: "100%",
          },
          html: {
            height: "100%",
          },
          "#root": {
            height: "100%",
          },
        }}
      />
      <Router>
        <AuthProvider>
          <div className="App">
            <Navbar />

            <Routes>
              <Route path="/" element={<WithAuth></WithAuth>} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard-admin"
                element={
                  <WithAuth role="admin">
                    <DashboardAdmin />
                  </WithAuth>
                }
              />
              <Route
                path="/inventory-inward"
                element={
                  <WithAuth role="admin">
                    <Inventory />
                  </WithAuth>
                }
              />
              <Route
                path="/create"
                element={
                  <WithAuth role="admin">
                    {/* <DashboardAdmin /> */}
                    <Enter />
                  </WithAuth>
                }
              />
              <Route
                path="/find"
                element={
                  <WithAuth role="admin">
                    {/* <DashboardAdmin /> */}
                    <CreateChild />
                  </WithAuth>
                }
              />

              <Route
                path="/bin"
                element={
                  <WithAuth role="admin">
                    <Bin />
                  </WithAuth>
                }
              />
              <Route
                path="/repository"
                element={
                  <WithAuth role="admin">
                    <Repository />
                  </WithAuth>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
      <ToastContainer />
    </React.Fragment>
  );
};

export default App;
