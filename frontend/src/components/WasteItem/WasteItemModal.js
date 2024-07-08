import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { foodItemsState, currentItemState } from "../../recoil/foodItemsAtoms";

const WasteItemModal = ({ show, handleClose, handleMove }) => {
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const wasteItems = useRecoilValue(foodItemsState);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    moveTo: "Consume",
  });

  useEffect(() => {
    if (currentItem) {
      setForm({
        moveTo: currentItem.moveTo || "Consume",
      });
    } else {
      setForm({
        moveTo: "Consume",
      });
    }
  }, [currentItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await handleMove(currentItem._id, form.moveTo);
      handleClose();
    } catch (error) {
      console.error("Error moving waste item:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while moving the waste item."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Move Waste Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="moveTo">
            <Form.Label>Move To</Form.Label>
            <Form.Control
              as="select"
              name="moveTo"
              value={form.moveTo}
              onChange={handleChange}
              required
            >
              <option value="Consume">Consume</option>
              <option value="Archive">Archive</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Move
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WasteItemModal;
