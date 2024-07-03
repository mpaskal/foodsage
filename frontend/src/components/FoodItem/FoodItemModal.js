import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { calculateExpirationDate } from "../../utils/dateUtils";
import { formatISO, isBefore } from "date-fns";

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

  useEffect(() => {
    updateQuantityMeasurements(form.category, form.storage);
  }, [form.category, form.storage]);

  const [imagePreview, setImagePreview] = useState(null);

  handleFileChange = (e) => {
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

  handleSubmit = async (e) => {
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
      await handleSubmit(form); // Assume handleSubmit is passed as a prop that handles form submission
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
        target: { name: "quantityMeasurement", value: combinedMeasurements[0] },
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
        return;
      }
    }

    handleChange({
      target: { name, value: newDateValue },
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
          <Row>{/* Form fields */}</Row>
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
