import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./authContext";
import Loading from "../components/loading/loading";

const WithAuth = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" />;

  // Split user roles into an array
  const userRoles = user.role ? user.role.split(";") : [];

  // Check if the role prop matches any of the user's roles
  const hasRequiredRole = Array.isArray(role)
    ? role.some((r) => userRoles.includes(r))
    : userRoles.includes(role);

  if (role && !hasRequiredRole) {
    <div>
      <h2>403 - Unauthorized</h2>
      <p>You don't have permission to view this page.</p>
    </div>;
  }

  return children;
};

export default WithAuth;
