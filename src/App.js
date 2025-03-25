import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Requests from "./pages/dashboard";

import Enter from "./pages/createMother";
import { GlobalStyles } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Background from "./assets/images/background.jpeg";
import { AuthProvider } from "./context/authContext";
import WithAuth from "./context/withAuth";
import Navbar from "./components/navbar/navbar";
import Bin from "./pages/bin";
import WarehouseStock from "./pages/warehouseStock";
import Profile from "./pages/profile";
import CreateChild from "./pages/createChild";
import ModifyMwo from "./pages/modifyMother";
import Inventory from "./pages/inventoryInward";
import MRS from "./pages/createMRS";
import MB from "./components/mbCreation/createMB";
import UserAccess from "./components/profile/userAccess";
import Invoice from "./pages/createInvoice";
import { Repeat } from "@mui/icons-material";

const App = () => {
  return (
    <React.Fragment>
      <GlobalStyles
        styles={{
          body: {
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
                path="/actions"
                element={
                  <WithAuth role="admin">
                    <Requests />
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
                path="/create-mwo"
                element={
                  <WithAuth role="admin">
                    {}
                    <Enter />
                  </WithAuth>
                }
              />
              {/* <Route
                path="/modify-mwo"
                element={
                  <WithAuth role="admin">
                    {}
                    <ModifyMwo />
                  </WithAuth>
                }
              /> */}
              <Route
                path="/create-cwo"
                element={
                  <WithAuth role="admin">
                    {}
                    <CreateChild />
                  </WithAuth>
                }
              />

              <Route
                path="/locator"
                element={
                  <WithAuth role="admin">
                    <Bin />
                  </WithAuth>
                }
              />
              <Route
                path="/warehouse-stock"
                element={
                  <WithAuth role="admin">
                    <WarehouseStock />
                  </WithAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <WithAuth>
                    <Profile />
                  </WithAuth>
                }
              />
              <Route
                path="/user-access"
                element={
                  <WithAuth role="admin">
                    <UserAccess />
                  </WithAuth>
                }
              />
              <Route
                path="/MRS"
                element={
                  <WithAuth role="admin">
                    <MRS />
                  </WithAuth>
                }
              />
              <Route
                path="/MB"
                element={
                  <WithAuth role="admin">
                    <MB />
                  </WithAuth>
                }
              />
              {/* <Route
                path="/repository"
                element={
                  <WithAuth role="admin">
                    <Repository />
                  </WithAuth>
                }
              /> */}
              <Route
                path="/budget"
                element={
                  <WithAuth role="admin">
                    <Invoice />
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
