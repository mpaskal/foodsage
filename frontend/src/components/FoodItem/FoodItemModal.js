import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { calculateExpirationDate } from "../../utils/dateUtils";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Foods",
  "Frozen Goods",
  "Other",
];

const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];

const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Foods": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

const quantityMeasurementsByStorage = {
  Fridge: ["L", "Lb", "Oz", "Item", "Kg"],
  Freezer: ["Kg", "Lb", "Item", "L", "Oz"],
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
  const [manualExpiration, setManualExpiration] = useState(false);

  const updateQuantityMeasurements = useCallback(
    (category, storage) => {
      const categoryMeasurements =
        quantityMeasurementsByCategory[category] || [];
      const storageMeasurements = quantityMeasurementsByStorage[storage] || [];
      const combinedMeasurements = [
        ...new Set([...categoryMeasurements, ...storageMeasurements]),
      ];
      setQuantityMeasurements(combinedMeasurements);

      // Set default value for quantity measurement if not already set
      if (!form.quantityMeasurement && combinedMeasurements.length > 0) {
        handleChange({
          target: {
            name: "quantityMeasurement",
            value: combinedMeasurements[0],
          },
        });
      }
    },
    [form.quantityMeasurement, handleChange]
  );

  const handleExpirationDateChange = (e) => {
    setManualExpiration(true);
    handleChange(e);
  };

  useEffect(() => {
    if (!form.category) {
      handleChange({ target: { name: "category", value: "Dairy" } });
    }
    updateQuantityMeasurements(
      form.category || "Dairy",
      form.storage || "Fridge"
    );
    if (!form.quantityMeasurement) {
      handleChange({
        target: {
          name: "quantityMeasurement",
          value: quantityMeasurementsByCategory["Dairy"][0],
        },
      });
    }
    if (!manualExpiration && form.purchasedDate) {
      const defaultExpirationDate = calculateExpirationDate(
        form.category || "Dairy",
        form.storage || "Fridge",
        form.purchasedDate
      );
      handleChange({
        target: {
          name: "expirationDate",
          value: defaultExpirationDate.toISOString().substring(0, 10),
        },
      });
    }
  }, [
    form.category,
    form.storage,
    form.purchasedDate,
    handleChange,
    manualExpiration,
    updateQuantityMeasurements,
  ]);

  useEffect(() => {
    if (
      !manualExpiration &&
      form.category &&
      form.storage &&
      form.purchasedDate
    ) {
      const defaultExpirationDate = calculateExpirationDate(
        form.category,
        form.storage,
        form.purchasedDate
      );
      handleChange({
        target: {
          name: "expirationDate",
          value: defaultExpirationDate.toISOString().substring(0, 10),
        },
      });
    }
  }, [
    form.category,
    form.storage,
    form.purchasedDate,
    manualExpiration,
    handleChange,
  ]);

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
              onChange={handleExpirationDateChange}
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
