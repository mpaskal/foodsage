import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  currentItemState,
  activeFoodItemsSelector,
} from "../../recoil/foodItemsAtoms";
import {
  formatDateForDisplay,
  calculateExpirationDate,
} from "../../utils/dateUtils";

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
  Fridge: ["L", "Oz", "Item", "Gr", "Kg", "Lb"],
  Freezer: ["Kg", "Lb", "Item"],
  Pantry: ["Item", "Box", "Kg", "Lb", "Gr"],
  Cellar: ["L", "Item", "Box"],
};
const statusOptions = [
  "Active",
  "Inactive",
  "Consumed",
  "Waste",
  "Donation",
  "Donated",
];

const FoodItemModal = ({ show, handleClose, handleSubmit, setError }) => {
  const [currentItem, setCurrentItem] = useRecoilState(currentItemState);
  const foodItemsWithExpiration = useRecoilValue(activeFoodItemsSelector);
  const [localError, setLocalError] = useState(null);

  const getCurrentDate = () => new Date().toISOString().slice(0, 10);

  const formatDateForInput = (dateString) => {
    if (!dateString) return getCurrentDate();
    try {
      return dateString.slice(0, 10); // This will work for both ISO strings and 'yyyy-MM-dd' formats
    } catch {
      return getCurrentDate();
    }
  };

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
    consumed: 0,
    status: "Active",
    donationDate: null,
    wasteDate: null,
  });

  useEffect(() => {
    if (currentItem) {
      const itemWithExpiration = foodItemsWithExpiration.find(
        (item) => item._id === currentItem._id
      );
      if (itemWithExpiration) {
        setForm({
          ...itemWithExpiration,
          purchasedDate:
            formatDateForInput(itemWithExpiration.purchasedDate) ||
            getCurrentDate(),
          expirationDate:
            formatDateForInput(itemWithExpiration.expirationDate) || "",
          consumed: itemWithExpiration.consumed || 0,
          status: itemWithExpiration.status || "Active",
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
        consumed: 0,
        status: "Active",
      });
    }
  }, [currentItem, foodItemsWithExpiration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => {
      let updatedValue = value;

      if (name === "purchasedDate" || name === "expirationDate") {
        updatedValue = value; // Keep the value as is for date inputs
      }

      const updatedForm = { ...prevForm, [name]: updatedValue };

      if (name === "status") {
        if (value === "Active") {
          const fourDaysFromNow = new Date();
          fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
          const calculatedExpirationDate = calculateExpirationDate(
            updatedForm.category,
            updatedForm.storage,
            updatedForm.purchasedDate
          );
          if (new Date(calculatedExpirationDate) < fourDaysFromNow) {
            setLocalError(
              "When moving an item back to Active, the expiration date must be at least 4 days from now. Please adjust the category, storage, or purchased date."
            );
          } else {
            setLocalError(null);
          }
        } else {
          setLocalError(null);
        }

        if (value === "Consumed") {
          updatedForm.consumed = 100;
        } else if (value === "Donation" || value === "Donated") {
          updatedForm.donationDate = new Date().toISOString();
        } else if (value === "Waste") {
          updatedForm.wasteDate = new Date().toISOString();
        }
      }

      if (
        name === "category" ||
        name === "storage" ||
        name === "purchasedDate"
      ) {
        updatedForm.expirationDate = calculateExpirationDate(
          updatedForm.category,
          updatedForm.storage,
          updatedForm.purchasedDate
        );
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
    setLocalError(null);
    if (setError) setError(null); // Only call setError if it's provided

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
      setLocalError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      await handleSubmit({
        ...form,
        consumed: parseInt(form.consumed, 10),
        status: form.consumed === 100 ? "Consumed" : form.status,
        purchasedDate: new Date(form.purchasedDate),
        expirationDate: new Date(form.expirationDate),
      });
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while submitting the form.";
      if (setError) {
        setError(errorMessage); // Set parent error if setError is provided
      } else {
        setLocalError(errorMessage); // Otherwise, set local error
      }
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
          {currentItem ? "Edit Food Item" : "Add Food Item"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Modal.Body>
          {localError && <Alert variant="danger">{localError}</Alert>}
          {/* Form fields */}
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
          {/* Add other form fields here */}
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
              value={formatDateForInput(form.purchasedDate)}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="expirationDate">
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
              type="date"
              name="expirationDate"
              value={formatDateForInput(form.expirationDate)}
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
            {currentItem ? "Save Changes" : "Add Food Item"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FoodItemModal;
