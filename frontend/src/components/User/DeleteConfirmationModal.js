import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteConfirmationModal = ({
  show,
  handleClose,
  confirmDelete,
  isLastAdmin,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLastAdmin ? (
          <p>
            You are the last admin. Deleting your account will remove all users
            and data associated with this tenant. Are you sure you want to
            proceed?
          </p>
        ) : (
          <p>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmDelete}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
