import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./authContext";
import Loading from "../components/loading/loading";

const WithAuth = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  return !loading ? (
    user ? (
      role ? (
        user.role === role ? (
          children
        ) : (
          <Navigate to={`/dashboard/${user.role}`} />
        )
      ) : (
        children
      )
    ) : (
      <Navigate to="/login" />
    )
  ) : (
    <div>
      <Loading />
    </div>
  );
};

export default WithAuth;
