import React from "react";
import { Table, Button } from "react-bootstrap";
import { useRecoilState } from "recoil";
import { foodItemsState } from "../../recoil/foodItemsAtoms";
import InlineEditControl from "../Common/InlineEditControl";

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

const FoodItemTable = () => {
  const [foodItems, setFoodItems] = useRecoilState(foodItemsState);

  const handleInputChange = (id, field, value) => {
    const updatedItems = foodItems.map((item) =>
      item._id === id ? { ...item, [field]: value } : item
    );
    setFoodItems(updatedItems);
  };

  const handleDelete = (itemToDelete) => {
    setFoodItems((prevItems) =>
      prevItems.filter((item) => item._id !== itemToDelete._id)
    );
  };

  const getImageSrc = (image) => {
    return image
      ? `data:image/jpeg;base64,${image}`
      : "path_to_placeholder_image";
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
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
        {foodItems.map((item) => (
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
                value={formatDateForInput(item.expirationDate)}
                onChange={(value) =>
                  handleInputChange(item._id, "expirationDate", value)
                }
              />
            </td>
            <td>{formatDateForInput(item.purchasedDate)}</td>
            <td>{item.consumed || "N/A"}</td>
            <td>{item.move || "N/A"}</td>
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

export default FoodItemTable;
