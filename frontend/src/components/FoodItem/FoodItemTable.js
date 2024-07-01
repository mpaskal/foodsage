import React, { memo } from "react";
import { Table, Button } from "react-bootstrap";
import { debounce } from "lodash";

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

const getImageSrc = (image) => {
  if (!image)
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  return `data:image/jpeg;base64,${image}`;
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

  if (expDate < today) {
    return { backgroundColor: "red", color: "white" };
  } else if (daysToExpire <= 1) {
    return { backgroundColor: "yellow", color: "black" };
  } else {
    return { backgroundColor: "green", color: "white" };
  }
};

const formatLocalDate = (date) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toLocaleDateString();
};

const maxLength = (string, maxLength) => {
  if (string.length > maxLength) {
    return string.substring(0, maxLength) + "...";
  }
  return string;
};

const handleInputChangeDebounced = debounce(
  (handleInputChange, id, name, value) => {
    handleInputChange(id, name, value);
  },
  300
);

const FoodItemTable = memo(
  ({
    foodItems,
    handleInputChange,
    handleDelete,
    handleMoveItem,
    handleConsumeItem,
  }) => {
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
                  width="50"
                  height="50"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={maxLength(item.name, 15)}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "name",
                      e.target.value
                    )
                  }
                  maxLength={15}
                  style={{ width: "100px" }}
                />
              </td>
              <td>
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "category",
                      e.target.value
                    )
                  }
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {maxLength(category, 15)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "quantity",
                      e.target.value
                    )
                  }
                  maxLength={5}
                  style={{ width: "60px" }}
                />
              </td>
              <td>
                <select
                  value={item.quantityMeasurement}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "quantityMeasurement",
                      e.target.value
                    )
                  }
                >
                  {(quantityMeasurementsByCategory[item.category] || []).map(
                    (measurement, index) => (
                      <option key={index} value={measurement}>
                        {measurement}
                      </option>
                    )
                  )}
                </select>
              </td>
              <td>
                <select
                  value={item.storage}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "storage",
                      e.target.value
                    )
                  }
                >
                  {storages.map((storage, index) => (
                    <option key={index} value={storage}>
                      {storage}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={item.cost}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "cost",
                      e.target.value
                    )
                  }
                  maxLength={7}
                  style={{ width: "80px" }}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={maxLength(item.source, 15)}
                  onChange={(e) =>
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "source",
                      e.target.value
                    )
                  }
                  maxLength={15}
                  style={{ width: "100px" }}
                />
              </td>
              <td style={getExpirationDateStyle(item.expirationDate)}>
                <input
                  type="date"
                  value={formatDateForInput(item.expirationDate)}
                  onChange={(e) => {
                    handleInputChangeDebounced(
                      handleInputChange,
                      item._id,
                      "expirationDate",
                      e.target.value
                    );
                  }}
                  readOnly // Make it read-only since it's calculated
                />
              </td>
              <td>{formatLocalDate(item.purchasedDate)}</td>
              <td>
                {getExpirationDateStyle(item.expirationDate).backgroundColor ===
                "yellow" ? (
                  <input
                    type="number"
                    value={item.consumed || 0}
                    onChange={(e) =>
                      handleConsumeItem(item._id, e.target.value)
                    }
                    max={100}
                    maxLength={5}
                    style={{ width: "60px" }}
                  />
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {getExpirationDateStyle(item.expirationDate).backgroundColor ===
                "yellow" ? (
                  <select
                    value={item.move || ""}
                    onChange={(e) => handleMoveItem(item._id, e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="consume">Consume</option>
                    <option value="consumed">Consumed</option>
                    <option value="donate">Donate</option>
                    <option value="waste">Waste</option>
                  </select>
                ) : (
                  "N/A"
                )}
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
  }
);

export default FoodItemTable;
