import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";

import ChildNav from "../components/createFiberWorkorder/child/Child";

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
      {}
      <div
        style={{
          marginTop: "2rem",
          marginLeft: "2rem",
          marginRight: "2rem",
          width: "95%",
        }}
      >
        <ChildNav />
      </div>
    </div>
  );
};

export default Find;
