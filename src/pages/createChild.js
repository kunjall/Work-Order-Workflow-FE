import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import ChildNav from "../components/createFiberWorkorder/child/childNav";

const Find = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ position: "fixed", top: 0, width: "100%" }}>
        <ChildNav />
      </div>
    </div>
  );
};

export default Find;
