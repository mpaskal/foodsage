import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  currentItemState,
  foodItemsWithExpirationState,
} from "../../recoil/foodItemsAtoms";
import {
  formatDateForDisplay,
  calculateExpirationDate,
} from "../../utils/dateUtils";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Donations",
  "Frozen Goods",
  "Other",
];
const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];
const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Donations": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
  Fridge: ["L", "Oz", "Item", "Gr", "Kg", "Lb"],
  Freezer: ["Kg", "Lb", "Item"],
  Pantry: ["Item", "Box", "Kg", "Lb", "Gr"],
  Cellar: ["L", "Item", "Box"],
};

const DonationItemModal = ({ show, handleClose, handleSubmit }) => {
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const wasteItemsWithExpiration = useRecoilValue(foodItemsWithExpirationState);
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
    image: null,
  });

  useEffect(() => {
    if (currentItem) {
      const itemWithExpiration = wasteItemsWithExpiration.find(
        (item) => item._id === currentItem._id
      );
      if (itemWithExpiration) {
        setForm({
          ...itemWithExpiration,
          purchasedDate:
            formatDateForDisplay(itemWithExpiration.purchasedDate) ||
            getCurrentDate(),
          expirationDate:
            formatDateForDisplay(itemWithExpiration.expirationDate) || "",
        });
      }
    } else {
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
        image: null,
      });
    }
  }, [currentItem, wasteItemsWithExpiration]);

  const calculateAndSetExpirationDate = (category, storage, purchasedDate) => {
    const expirationDate = calculateExpirationDate(
      category,
      storage,
      purchasedDate
    );
    setForm((prevForm) => ({
      ...prevForm,
      expirationDate: formatDateForDisplay(expirationDate),
    }));
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
        calculateAndSetExpirationDate(
          name === "category" ? value : updatedForm.category,
          name === "storage" ? value : updatedForm.storage,
          name === "purchasedDate" ? value : updatedForm.purchasedDate
        );
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
    ];
    const missingFields = requiredFields.filter((field) => !form[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      await handleSubmit(form);
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while submitting the form."
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
        <Modal.Title>
          {currentItem ? "Edit Donation Item" : "Add Donation Item"}
        </Modal.Title>
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
          <Form.Group controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              onChange={handleFileChange}
            />
          </Form.Group>
          <Form.Group controlId="expirationDate">
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
              type="date"
              name="expirationDate"
              value={form.expirationDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {currentItem ? "Save Changes" : "Add Donation Item"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DonationItemModal;
