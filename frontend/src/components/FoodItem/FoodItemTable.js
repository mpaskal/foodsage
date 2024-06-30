import React from "react";
import { Table, Button } from "react-bootstrap";

const FoodItemTable = ({
  foodItems,
  handleShowModal,
  handleDelete,
  loggedInUser,
}) => {
  const getImageSrc = (image) => {
    if (!image) return "placeholder_image_url"; // Replace with a path to a placeholder image
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
    } else if (daysToExpire <= 3) {
      return { backgroundColor: "yellow", color: "black" };
    } else {
      return { backgroundColor: "green", color: "white" };
    }
  };

  const formatLocalDate = (date) => {
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    );
    return localDate.toLocaleDateString();
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Measurement</th>
          <th>Storage</th>
          <th>Cost</th>
          <th>Source</th>
          <th>Expiration Date</th>
          <th>Purchased Date</th>
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
            <td>{item.name}</td>
            <td>{item.category}</td>
            <td>{item.quantity}</td>
            <td>{item.quantityMeasurement}</td>
            <td>{item.storage}</td>
            <td>{item.cost}</td>
            <td>{item.source}</td>
            <td style={getExpirationDateStyle(item.expirationDate)}>
              {formatLocalDate(item.expirationDate)}
            </td>
            <td>{formatLocalDate(item.purchasedDate)}</td>
            <td>
              <Button variant="primary" onClick={() => handleShowModal(item)}>
                Edit
              </Button>
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
