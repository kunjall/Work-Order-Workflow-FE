import React from "react";
import { Modal, Icon } from "@mui/material";

const StatusModal = ({ isOpen, onClose, content }) => {
  const { title, message, icon } = content || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        {icon === "success" ? (
          <Icon name="check-circle" color="green" size="large" />
        ) : (
          <Icon name="error" color="red" size="large" />
        )}
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </Modal>
  );
};

export default StatusModal;
