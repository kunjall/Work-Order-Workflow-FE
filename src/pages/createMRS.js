import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import CreateMRS from "../components/mrsCreation/createMRS";

const Test = () => {
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
      <div style={{ marginTop: "5rem", width: "100%" }}> </div>
      <CreateMRS />
    </div>
  );
};

export default Test;
