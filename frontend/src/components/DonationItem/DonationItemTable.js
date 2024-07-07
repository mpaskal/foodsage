import React from "react";
import { Table, Button } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { donationItemsState } from "../../recoil/donationItemsAtoms";
import InlineEditControl from "../Common/InlineEditControl";
import { formatDateForDisplay, processDateInput } from "../../utils/dateUtils";

const categories = [
  "Dairy",
  "Fresh",
  "Grains and Bread",
  "Packaged and Snack Wastes",
  "Frozen Goods",
  "Other",
];

const moveToOptions = ["Consume", "Consumed", "Donate", "Waste"];

const storages = ["Fridge", "Freezer", "Pantry", "Cellar"];

const quantityMeasurementsByCategory = {
  Dairy: ["L", "Oz", "Item"],
  Fresh: ["Gr", "Oz", "Item", "Kg", "Lb"],
  "Grains and Bread": ["Item", "Kg", "Lb", "Gr", "Box"],
  "Packaged and Snack Wastes": ["Item", "Box", "Kg", "Lb", "Gr"],
  "Frozen Goods": ["Kg", "Lb", "Item"],
  Other: ["Item", "Kg", "Lb", "L", "Oz", "Gr", "Box"],
};

const WasteItemTable = () => {
  const [donationItems, setWasteItems] = useRecoilState(donationItemsState);

  const handleInputChange = (id, field, value) => {
    let updates = { [field]: value };

    // Process date input before setting state if the field is a date
    if (field === "purchasedDate" || field === "expirationDate") {
      updates[field] = processDateInput(value);
    }

    // If the category changes, update the measurement to the first available option for the new category
    if (field === "category") {
      const defaultMeasurement = quantityMeasurementsByCategory[value][0];
      updates["quantityMeasurement"] = defaultMeasurement;
    }

    const updatedItems = donationItems.map((item) =>
      item._id === id ? { ...item, ...updates } : item
    );
    setWasteItems(updatedItems);

    // Update all changed fields in the backend
    Object.keys(updates).forEach((updateField) => {
      saveChanges(id, updateField, updates[updateField]);
    });
  };

  const saveChanges = async (id, field, value) => {
    try {
      const response = await fetch("/api/donationitems/" + id, {
        method: "POST", // Assuming a REST API, adjust according to your API setup
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!response.ok) {
        throw new Error("Failed to save changes");
      }
      // Optionally handle response data
      const data = await response.json();
      console.log("Save successful:", data);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleDelete = (itemToDelete) => {
    setWasteItems((prevItems) =>
      prevItems.filter((item) => item._id !== itemToDelete._id)
    );
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

  return (
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
        {donationItems.map((item) => (
          <tr key={item._id}>
            <td>
              <img
                src={getImageSrc(item.image)}
                alt={item.name}
                style={{ width: "50px", height: "50px" }}
              />
            </td>
            <td>
              <InlineEditControl
                value={item.name}
                onChange={(value) => handleInputChange(item._id, "name", value)}
              />
            </td>
            <td>
              <InlineEditControl
                type="select"
                options={categories}
                value={item.category}
                onChange={(value) =>
                  handleInputChange(item._id, "category", value)
                }
              />
            </td>
            <td>
              <InlineEditControl
                type="number"
                value={item.quantity.toString()}
                onChange={(value) =>
                  handleInputChange(item._id, "quantity", value)
                }
              />
            </td>
            <td>
              <InlineEditControl
                type="select"
                options={quantityMeasurementsByCategory[item.category] || []}
                value={item.quantityMeasurement}
                onChange={(value) =>
                  handleInputChange(item._id, "quantityMeasurement", value)
                }
              />
            </td>
            <td>
              <InlineEditControl
                type="select"
                options={storages}
                value={item.storage}
                onChange={(value) =>
                  handleInputChange(item._id, "storage", value)
                }
              />
            </td>
            <td>
              <InlineEditControl
                type="number"
                value={item.cost.toString()}
                onChange={(value) => handleInputChange(item._id, "cost", value)}
              />
            </td>
            <td>
              <InlineEditControl
                value={item.source}
                onChange={(value) =>
                  handleInputChange(item._id, "source", value)
                }
              />
            </td>
            <td style={getExpirationDateStyle(item.expirationDate)}>
              <InlineEditControl
                type="date"
                value={formatDateForDisplay(item.expirationDate)}
                onChange={(value) =>
                  handleInputChange(item._id, "expirationDate", value)
                }
              />
            </td>
            <td>
              <InlineEditControl
                type="date"
                value={formatDateForDisplay(item.purchasedDate)}
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
  );
};

export default WasteItemTable;
