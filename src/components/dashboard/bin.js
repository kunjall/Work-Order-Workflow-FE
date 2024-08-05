import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import Example from "../bin/binTable";

const Bin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div style={{ marginTop: "100px" }}>
      <Example />
    </div>
  );
};

export default Bin;
