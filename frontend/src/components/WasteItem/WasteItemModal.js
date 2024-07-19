import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  currentItemState,
  wasteItemsSelector,
} from "../../recoil/foodItemsAtoms";
import {
  formatDateForDisplay,
  calculateExpirationDate,
} from "../../utils/dateUtils";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Wastes",
  "Frozen Goods",
  "Other",
];
const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];
const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Wastes": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
  Fridge: ["L", "Oz", "Item", "Gr", "Kg", "Lb"],
  Freezer: ["Kg", "Lb", "Item"],
  Pantry: ["Item", "Box", "Kg", "Lb", "Gr"],
  Cellar: ["L", "Item", "Box"],
};

const reasons = [
  "Expired",
  "Spoiled",
  "Overproduction",
  "Quality Issues",
  "Other",
];

const WasteItemModal = ({ show, handleClose, handleSubmit }) => {
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const wasteItems = useRecoilValue(wasteItemsSelector);
  const [error, setError] = useState(null);

  const getCurrentDate = () => new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    category: "Dairy",
    quantity: "",
    quantityMeasurement: "L",
    storage: "Fridge",
    cost: "",
    source: "",
    purchasedDate: getCurrentDate(),
    expirationDate: "",
    dateRecorded: getCurrentDate(),
    reason: "Expired",
    wasteCost: "",
    percentWasted: "",
    image: null,
  });

  useEffect(() => {
    if (currentItem) {
      const wasteItem = wasteItems.find((item) => item._id === currentItem._id);
      if (wasteItem) {
        setForm({
          ...wasteItem,
          purchasedDate:
            formatDateForDisplay(wasteItem.purchasedDate) || getCurrentDate(),
          expirationDate: formatDateForDisplay(wasteItem.expirationDate) || "",
          dateRecorded:
            formatDateForDisplay(wasteItem.dateRecorded) || getCurrentDate(),
        });
      }
    } else {
      resetForm();
    }
  }, [currentItem, wasteItems]);

  const resetForm = () => {
    const category = "Dairy";
    const storage = "Fridge";
    const purchasedDate = getCurrentDate();
    const expirationDate = calculateExpirationDate(
      category,
      storage,
      purchasedDate
    );
    setForm({
      name: "",
      category: category,
      quantity: "",
      quantityMeasurement: "L",
      storage: storage,
      cost: "",
      source: "",
      purchasedDate: purchasedDate,
      expirationDate: formatDateForDisplay(expirationDate),
      dateRecorded: getCurrentDate(),
      reason: "Expired",
      wasteCost: "",
      percentWasted: "",
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

      if (
        name === "category" ||
        name === "storage" ||
        name === "purchasedDate"
      ) {
        const expirationDate = calculateExpirationDate(
          updatedForm.category,
          updatedForm.storage,
          updatedForm.purchasedDate
        );
        updatedForm.expirationDate = formatDateForDisplay(expirationDate);
      }

      if (name === "category") {
        const newMeasurements = quantityMeasurementsByCategory[value] || [];
        if (!newMeasurements.includes(updatedForm.quantityMeasurement)) {
          updatedForm.quantityMeasurement = newMeasurements[0] || "";
        }
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
    setError(null);

    const requiredFields = [
      "name",
      "quantity",
      "cost",
      "purchasedDate",
      "quantityMeasurement",
      "reason",
      "wasteCost",
      "percentWasted",
    ];
    const missingFields = requiredFields.filter((field) => !form[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      await handleSubmit(currentItem._id, form);
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while updating the waste item."
      );
    }
  };

  const quantityMeasurements = useMemo(() => {
    const categoryMeasurements =
      quantityMeasurementsByCategory[form.category] || [];
    return [...categoryMeasurements];
  }, [form.category]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Waste Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
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
            <Form.Label>Source</Form.Label>
            <Form.Control
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
            />
          </Form.Group>
          <Row>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
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
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="reason">
                <Form.Label>Reason</Form.Label>
                <Form.Control
                  as="select"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  required
                >
                  {reasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="dateRecorded">
                <Form.Label>Date Recorded</Form.Label>
                <Form.Control
                  type="date"
                  name="dateRecorded"
                  value={form.dateRecorded}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="wasteCost">
                <Form.Label>Waste Cost</Form.Label>
                <Form.Control
                  type="number"
                  name="wasteCost"
                  value={form.wasteCost}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="percentWasted">
                <Form.Label>Percent Wasted</Form.Label>
                <Form.Control
                  type="number"
                  name="percentWasted"
                  value={form.percentWasted}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group controlId="image">
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
            {currentItem ? "Save Changes" : "Add Waste Item"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WasteItemModal;
