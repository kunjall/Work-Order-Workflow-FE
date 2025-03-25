import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import Profile from "../components/profile/profile";

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div style={{ display: "fixed", flexDirection: "column", height: "100%" }}>
      {}
      <div>
        <Profile />
      </div>
    </div>
  );
};

export default Inventory;
