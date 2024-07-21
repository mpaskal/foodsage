import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ActionNeededModal = ({ show, onHide, expiredCount, donationCount }) => {
  const navigate = useNavigate();

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Actions Needed</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Expired Items: {expiredCount}</p>
        <p>Items to Mark as Donated: {donationCount}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => navigate("/fooditems")}>
          Go to Expired Items
        </Button>
        <Button variant="primary" onClick={() => navigate("/donationitems")}>
          Go to Donation Items
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActionNeededModal;
