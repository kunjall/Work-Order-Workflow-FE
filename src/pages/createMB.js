import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import MB from "../components/mbCreation/createMB";

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ top: 0, width: "100%", paddingTop: "200px" }}>
        <MB />
      </div>
    </div>
  );
};

export default Inventory;
