import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
// import ChildNav from "../components/createFiberWorkorder/child/childNav";
import ChildNav from "../components/createFiberWorkorder/child/Child";
// import "../assets/styles/childNav.css";

const Find = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div style={{ display: "fixed", flexDirection: "column", height: "100%" }}>
      {/* <div style={{ flexDirection: "column", height: "100%" }}> */}
      <div style={{ marginTop: "5rem", width: "100%" }}>
        <ChildNav />
      </div>
    </div>
  );
};

export default Find;
