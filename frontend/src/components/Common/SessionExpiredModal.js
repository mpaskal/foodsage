import React from "react";
import { Modal, Button } from "react-bootstrap";

const SessionExpiredModal = ({ show, onContinue, onLogout }) => {
  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Session Expired</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Your session has expired. Would you like to continue and refresh your
        session, or log out?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onLogout}>
          Log Out
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionExpiredModal;
