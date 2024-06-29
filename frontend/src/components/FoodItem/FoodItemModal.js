import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const FoodItemModal = ({
  show,
  handleClose,
  handleSubmit,
  handleChange,
  handleFileChange,
  form,
  isEdit,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit Food Item" : "Add Food Item"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="quantity">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="quantityMeasurement">
                <Form.Label>Quantity Measurement</Form.Label>
                <Form.Control
                  as="select"
                  name="quantityMeasurement"
                  value={form.quantityMeasurement}
                  onChange={handleChange}
                  required
                >
                  <option value="item">Item</option>
                  <option value="kg">Kg</option>
                  <option value="lb">Lb</option>
                  <option value="L">L</option>
                  <option value="oz">Oz</option>
                  <option value="g">G</option>
                  <option value="box">Box</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="storage">
                <Form.Label>Storage</Form.Label>
                <Form.Control
                  type="text"
                  name="storage"
                  value={form.storage}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="cost">
                <Form.Label>Cost</Form.Label>
                <Form.Control
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="source">
            <Form.Label>Source</Form.Label>
            <Form.Control
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="expirationDate">
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
              type="date"
              name="expirationDate"
              value={
                form.expirationDate
                  ? new Date(form.expirationDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="purchasedDate">
            <Form.Label>Purchased Date</Form.Label>
            <Form.Control
              type="date"
              name="purchasedDate"
              value={
                form.purchasedDate
                  ? new Date(form.purchasedDate).toISOString().substring(0, 10)
                  : ""
              }
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={handleFileChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEdit ? "Save Changes" : "Add Food Item"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FoodItemModal;
