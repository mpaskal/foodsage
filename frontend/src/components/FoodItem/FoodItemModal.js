import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { calculateExpirationDate } from "../../utils/dateUtils";
import { formatISO, parseISO, isBefore } from "date-fns";

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

const FoodItemModal = ({ show, handleClose, handleChange, form, isEdit }) => {
  const [quantityMeasurements, setQuantityMeasurements] = useState([]);

  useEffect(() => {
    updateQuantityMeasurements(form.category, form.storage);
  }, [form.category, form.storage]);

  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    handleChange(e);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDates(form.purchasedDate, form.expirationDate)) {
      alert("Check the dates.");
      return;
    }
    if (!validateCost(form.cost)) {
      alert("Check the cost.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Assume `submitForm` is an async function that handles the actual submission logic
      await submitForm(form);
      handleClose(); // Close the modal on successful submission
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Please try again.");
    }
    setIsSubmitting(false);
  };

  const validateCost = (value) => {
    if (value <= 0) {
      alert("Cost must be greater than zero.");
      return false;
    }
    return true;
  };

  const validateDates = (purchasedDate, expirationDate) => {
    if (new Date(expirationDate) <= new Date(purchasedDate)) {
      alert("Expiration date must be after the purchased date.");
      return false;
    }
    return true;
  };

  const updateQuantityMeasurements = (category, storage) => {
    const categoryMeasurements = quantityMeasurementsByCategory[category] || [];
    const storageMeasurements = quantityMeasurementsByStorage[storage] || [];
    const combinedMeasurements = [
      ...new Set([...categoryMeasurements, ...storageMeasurements]),
    ];
    setQuantityMeasurements(combinedMeasurements);

    if (!form.quantityMeasurement && combinedMeasurements.length > 0) {
      handleChange({
        target: {
          name: "quantityMeasurement",
          value: combinedMeasurements[0],
        },
      });
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newDateValue = formatISO(new Date(value), { representation: "date" });

    if (name === "expirationDate" && form.purchasedDate) {
      if (isBefore(new Date(newDateValue), new Date(form.purchasedDate))) {
        alert("Expiration date cannot be before the purchased date.");
        return; // Prevent updating the state if the validation fails
      }
    }

    handleChange({
      target: {
        name,
        value: newDateValue,
      },
    });
  };

  useEffect(() => {
    if (!form.expirationDate && form.purchasedDate) {
      const defaultExpirationDate = calculateExpirationDate(
        form.category || "Dairy",
        form.storage || "Fridge",
        form.purchasedDate
      );
      handleChange({
        target: {
          name: "expirationDate",
          value: formatDateForInput(defaultExpirationDate),
        },
      });
    }
  }, [form.category, form.storage, form.purchasedDate, handleChange]);

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
                  min="0.01" // Ensures no zero or negative values are entered
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
              value={formatDateForInput(form.expirationDate)}
              onChange={handleDateChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="purchasedDate">
            <Form.Label>Purchased Date</Form.Label>
            <Form.Control
              type="date"
              name="purchasedDate"
              value={formatDateForInput(form.purchasedDate)}
              onChange={handleDateChange}
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
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100%", marginTop: "10px" }}
              />
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Save Changes"
              : "Add Food Item"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FoodItemModal;
