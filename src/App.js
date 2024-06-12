// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import { GlobalStyles } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Background from "./assets/images/background.jpeg";

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
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/" element={<Home />} /> */}
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </React.Fragment>
  );
};

export default App;
