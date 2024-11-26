import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import RepositoryNav from "../components/repository/repositoryNav";

const Repository = () => {
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
        <RepositoryNav />
      </div>
    </div>
  );
};

export default Repository;
