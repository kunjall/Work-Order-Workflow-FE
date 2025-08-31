import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";

import InvoiceForm from "../components/invoice/invoiceCreationSP";

const InvoiceFormSP = () => {
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
        <InvoiceFormSP />
      </div>
    </div>
  );
};

export default InvoiceForm;
