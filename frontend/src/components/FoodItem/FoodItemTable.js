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

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Id</th>
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
            <td>{item._id}</td>
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
            <td>{new Date(item.expirationDate).toLocaleDateString()}</td>
            <td>{new Date(item.purchasedDate).toLocaleDateString()}</td>
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
