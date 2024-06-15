import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import DashboardAdmin from "./components/dashboard/dashboardAdmin";
import DashboardWhinch from "./components/inventory/inventoryInward";

import Test from "./components/dashboard/test";
import { GlobalStyles } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Background from "./assets/images/background.jpeg";
import { AuthProvider } from "./context/authContext";
import WithAuth from "./context/withAuth";
import Navbar from "./components/navbar/navbar";
// import Test from "./components/dashboard/test";

const App = () => {
  return (
    <React.Fragment>
      <GlobalStyles
        styles={{
          body: {
            backgroundImage: `url(${Background})`,
            backgroundRepeat: "no-repeat",
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
                path="/test"
                element={
                  <WithAuth role="admin">
                    {/* <DashboardAdmin /> */}
                    <Test />
                  </WithAuth>
                }
              />
              <Route
                path="/dashboard-whinch"
                element={
                  <WithAuth role="whinch">
                    <DashboardWhinch />
                  </WithAuth>
                }
              />
              <Route
                path="/test2"
                element={
                  <WithAuth role="whinch">
                    <Test />
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
