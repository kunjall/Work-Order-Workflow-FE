import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const Test = () => {
  const { user } = useContext(AuthContext);
  // console.log(user);
  // console.log(logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return <div>HI</div>;
};

export default Test;
