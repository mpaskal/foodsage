import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const categories = [
  "Meat",
  "Fish",
  "Dairy",
  "Vegetables",
  "Fruits",
  "Berries",
  "Pastries",
  "Bakery",
  "Grains",
  "Packaged Food",
  "Other",
];

const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];

// Define the relevant quantity measurements for each category
const quantityMeasurementsByCategory = {
  Meat: ["Kg", "Lb"],
  Fish: ["Kg", "Lb"],
  Dairy: ["L", "Oz"],
  Vegetables: ["Kg", "Lb", "Gr", "Item"],
  Fruits: ["Kg", "Lb", "Item"],
  Berries: ["Gr", "Item"],
  Pastries: ["Item", "Box"],
  Bakery: ["Item", "Box"],
  Grains: ["Kg", "Lb", "Gr"],
  "Packaged Food": ["Item", "Box"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

// Define the relevant quantity measurements for each storage
const quantityMeasurementsByStorage = {
  Fridge: ["Kg", "Lb", "L", "Oz", "Item"],
  Freezer: ["Kg", "Lb", "L", "Oz", "Item"],
  Pantry: ["Item", "Box", "Kg", "Lb", "Gr"],
  Cellar: ["Item", "Box", "Kg", "Lb", "Gr"],
};

const FoodItemModal = ({
  show,
  handleClose,
  handleSubmit,
  handleChange,
  handleFileChange,
  form,
  isEdit,
}) => {
  const [quantityMeasurements, setQuantityMeasurements] = useState([]);

  useEffect(() => {
    updateQuantityMeasurements(form.category, form.storage);
  }, [form.category, form.storage]);

  const updateQuantityMeasurements = (category, storage) => {
    const categoryMeasurements = quantityMeasurementsByCategory[category] || [];
    const storageMeasurements = quantityMeasurementsByStorage[storage] || [];
    const combinedMeasurements = [
      ...new Set([...categoryMeasurements, ...storageMeasurements]),
    ];
    setQuantityMeasurements(combinedMeasurements);

    // Set default value for quantity measurement if not already set
    if (!form.quantityMeasurement && combinedMeasurements.length > 0) {
      handleChange({
        target: { name: "quantityMeasurement", value: combinedMeasurements[0] },
      });
    }
  };

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
                  as="select"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Control>
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
                  {quantityMeasurements.map((measurement, index) => (
                    <option key={index} value={measurement}>
                      {measurement}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="storage">
                <Form.Label>Storage</Form.Label>
                <Form.Control
                  as="select"
                  name="storage"
                  value={form.storage}
                  onChange={handleChange}
                  required
                >
                  {storages.map((storage, index) => (
                    <option key={index} value={storage}>
                      {storage}
                    </option>
                  ))}
                </Form.Control>
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
