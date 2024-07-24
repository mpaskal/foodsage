import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import {
  formatDateForDisplay,
  calculateExpirationDate,
  getCurrentDate,
} from "../../utils/dateUtils";
import {
  categories,
  storages,
  statusOptions,
  quantityMeasurementsByCategory,
} from "../../utils/constants";

const FoodItemModal = ({ show, handleClose, handleSubmit }) => {
  const [localError, setLocalError] = useState(null);
  const [userChangedExpiration, setUserChangedExpiration] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  const initialForm = {
    name: "",
    category: "Dairy",
    quantity: "",
    quantityMeasurement: "L",
    storage: "Fridge",
    cost: "",
    source: "",
    purchasedDate: getCurrentDate(),
    expirationDate: "",
    image: null,
    consumed: 0,
    status: "Active",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const expirationDate = calculateExpirationDate(
      form.category,
      form.storage,
      form.purchasedDate
    );
    setForm((prevForm) => ({
      ...prevForm,
      expirationDate,
    }));

    return () => {
      setIsMounted(false);
    };
  }, []);

  const safeSetLocalError = useCallback(
    (error) => {
      if (isMounted) {
        setLocalError(error);
      }
    },
    [isMounted]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      let updatedForm = { ...prevForm, [name]: value };

      if (name === "expirationDate") {
        setUserChangedExpiration(true);
      }

      if (
        (name === "category" ||
          name === "storage" ||
          name === "purchasedDate") &&
        !userChangedExpiration
      ) {
        const calculatedExpirationDate = calculateExpirationDate(
          updatedForm.category,
          updatedForm.storage,
          updatedForm.purchasedDate
        );
        updatedForm.expirationDate = calculatedExpirationDate;
      }

      return updatedForm;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prevForm) => ({
          ...prevForm,
          image: reader.result.split(",")[1],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    safeSetLocalError(null);

    const requiredFields = [
      "name",
      "quantity",
      "cost",
      "purchasedDate",
      "quantityMeasurement",
      "status",
    ];
    const missingFields = requiredFields.filter((field) => !form[field]);

    if (missingFields.length > 0) {
      safeSetLocalError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (
      !form.expirationDate ||
      isNaN(new Date(form.expirationDate).getTime())
    ) {
      safeSetLocalError("Please provide a valid expiration date.");
      return;
    }

    try {
      const formattedItem = {
        ...form,
        consumed: parseInt(form.consumed, 10),
        purchasedDate: formatDateForDisplay(new Date(form.purchasedDate)),
        expirationDate: formatDateForDisplay(new Date(form.expirationDate)),
        statusChangeDate: new Date().toISOString(),
      };

      if (!formattedItem.source.trim()) {
        formattedItem.source = "N/A";
      }

      console.log("Submitting item from modal:", formattedItem);

      await handleSubmit(formattedItem);
      if (isMounted) {
        handleClose();
        setForm(initialForm);
      }
    } catch (error) {
      console.error("Error submitting form in modal:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while submitting the form.";
      safeSetLocalError(errorMessage);
      // Log the full error object
      console.log("Full error object:", error);
      // If there's a response object, log it as well
      if (error.response) {
        console.log("Error response:", error.response);
      }
    }
  };

  const quantityMeasurements = useMemo(() => {
    return quantityMeasurementsByCategory[form.category] || [];
  }, [form.category]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Food Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Modal.Body>
          {localError && <Alert variant="danger">{localError}</Alert>}
          <Row>
            <Col md={6}>
              <Form.Group controlId="name">
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
              <Form.Group controlId="category">
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
              <Form.Group controlId="quantity">
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
              <Form.Group controlId="quantityMeasurement">
                <Form.Label>Measurement</Form.Label>
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
              <Form.Group controlId="storage">
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
              <Form.Group controlId="cost">
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
          <Form.Group controlId="source">
            <Form.Label>Source (Optional)</Form.Label>
            <Form.Control
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="purchasedDate">
            <Form.Label>Purchased Date</Form.Label>
            <Form.Control
              type="date"
              name="purchasedDate"
              value={form.purchasedDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="expirationDate">
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
              type="date"
              name="expirationDate"
              value={form.expirationDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={handleFileChange}
            />
          </Form.Group>
          <Form.Group controlId="consumed">
            <Form.Label>Consumed (%)</Form.Label>
            <Form.Control
              type="number"
              name="consumed"
              value={form.consumed}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </Form.Group>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              {statusOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Food Item
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FoodItemModal;
