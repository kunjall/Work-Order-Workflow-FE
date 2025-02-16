import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
// import ChildNav from "../components/createFiberWorkorder/child/childNav";
// import InventoryInward from "../components/inventoryInward/inventory";
import InvoiceCreate from "../components/invoice/invoiceCreation";
// import "../assets/styles/childNav.css";

const Invoice = () => {
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
      <div style={{ marginTop: "5rem", width: "100%" }}>
        <InvoiceCreate />
      </div>
    </div>
  );
};

export default Invoice;
