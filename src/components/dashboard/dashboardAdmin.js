import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const DashboardAdmin = () => {
  const { user, logout } = useContext(AuthContext);
  // console.log(user);
  // console.log(logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default DashboardAdmin;
