import React, { useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { foodItemsState } from "../../recoil/foodItemsAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import {
  formatDateForDisplay,
  processDateInput,
  calculateExpirationDate,
} from "../../utils/dateUtils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { loggedInUserState } from "../../recoil/userAtoms"; // Import the logged-in user state

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Foods",
  "Frozen Goods",
  "Other",
];

const moveToOptions = ["Consume", "Consumed", "Donate", "Waste"];

const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];

const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Foods": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

const FoodItemTable = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const loggedInUser = useRecoilValue(loggedInUserState); // Access the logged-in user state

  const handleInputChange = (id, field, value) => {
    let updates = { [field]: value };

    // Process date input before setting state if the field is a date
    if (field === "purchasedDate" || field === "expirationDate") {
      updates[field] = processDateInput(value);
    }

    const itemToUpdate = foodItems.find((item) => item._id === id);
    if (!itemToUpdate) return; // Ensure itemToUpdate is not null

    // If the category changes, update the measurement to the first available option for the new category
    if (field === "category") {
      const defaultMeasurement = quantityMeasurementsByCategory[value][0];
      updates["quantityMeasurement"] = defaultMeasurement;
      // Recalculate expiration date
      updates["expirationDate"] = calculateExpirationDate(
        value,
        updates.storage || itemToUpdate.storage,
        itemToUpdate.purchasedDate
      );
    }

    if (field === "storage") {
      // Recalculate expiration date
      updates["expirationDate"] = calculateExpirationDate(
        itemToUpdate.category,
        value,
        itemToUpdate.purchasedDate
      );
    }

    if (field === "purchasedDate") {
      // Recalculate expiration date
      updates["expirationDate"] = calculateExpirationDate(
        itemToUpdate.category,
        itemToUpdate.storage,
        value
      );
    }

    const updatedItems = foodItems.map((item) =>
      item._id === id ? { ...item, ...updates } : item
    );
    setFoodItems(updatedItems);

    // Update all changed fields in the backend
    Object.keys(updates).forEach((updateField) => {
      saveChanges(id, updateField, updates[updateField]);
    });
  };

  const saveChanges = async (id, field, value) => {
    try {
      const response = await fetch("/api/fooditems/update/" + id, {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedInUser.token}`, // Include the token in the headers
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      const data = await response.json();
      console.log("Save successful:", data);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleDelete = (itemToDelete) => {
    setItemToDelete(itemToDelete);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch("/api/fooditems/delete", {
        method: "POST", // Changed to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedInUser.token}`, // Include the token in the headers
        },
        body: JSON.stringify({ _id: itemToDelete._id }), // Send the ID in the body
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      setFoodItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemToDelete._id)
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const getImageSrc = (image) => {
    return image
      ? `data:image/jpeg;base64,${image}`
      : "path_to_placeholder_image";
  };

  const getExpirationDateStyle = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const timeDiff = expDate - today;
    const daysToExpire = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return expDate < today
      ? { backgroundColor: "red", color: "white" }
      : daysToExpire <= 1
      ? { backgroundColor: "yellow", color: "black" }
      : { backgroundColor: "green", color: "white" };
  };

  const handleFileChange = (id, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedItems = foodItems.map((item) =>
        item._id === id ? { ...item, image: reader.result.split(",")[1] } : item
      );
      setFoodItems(updatedItems);
      saveChanges(id, "image", reader.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Meas</th>
            <th>Storage</th>
            <th>Cost</th>
            <th>Source</th>
            <th>Expiration Date</th>
            <th>Purchased Date</th>
            <th>Consumed (%)</th>
            <th>Move</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foodItems.map((item) => (
            <tr key={item._id}>
              <td>
                <InlineEditControl
                  type="file"
                  value={item.image || ""}
                  onChange={(e) =>
                    handleFileChange(item._id, e.target.files[0])
                  }
                />
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  style={{ width: "50px", height: "50px" }}
                />
              </td>
              <td>
                <InlineEditControl
                  value={item.name || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "name", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={categories}
                  value={item.category || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "category", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.quantity ? item.quantity.toString() : ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "quantity", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={quantityMeasurementsByCategory[item.category] || []}
                  value={item.quantityMeasurement || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "quantityMeasurement", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={storages}
                  value={item.storage || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "storage", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.cost ? item.cost.toString() : ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "cost", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  value={item.source || ""}
                  onChange={(value) =>
                    handleInputChange(item._id, "source", value)
                  }
                />
              </td>
              <td style={getExpirationDateStyle(item.expirationDate)}>
                <InlineEditControl
                  type="date"
                  value={
                    item.expirationDate
                      ? formatDateForDisplay(item.expirationDate)
                      : ""
                  }
                  onChange={(value) =>
                    handleInputChange(item._id, "expirationDate", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="date"
                  value={
                    item.purchasedDate
                      ? formatDateForDisplay(item.purchasedDate)
                      : ""
                  }
                  onChange={(value) =>
                    handleInputChange(item._id, "purchasedDate", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="number"
                  value={item.consumed ? item.consumed.toString() : "0"} // Default to '0' if undefined
                  onChange={(value) =>
                    handleInputChange(item._id, "consumed", value)
                  }
                />
              </td>
              <td>
                <InlineEditControl
                  type="select"
                  options={moveToOptions}
                  value={item.moveTo || "Consume"}
                  onChange={(value) =>
                    handleInputChange(item._id, "moveTo", value)
                  }
                />
              </td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(item)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

export default FoodItemTable;
