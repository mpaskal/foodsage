// src/components/Food/FoodItemsTable.js
import React from "react";
import { Table, Button } from "react-bootstrap";

const FoodItemTable = ({ items = [], handleInputChange, handleDelete }) => {
  return (
    <Table hover>
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item._id}>
            <td>{item._id}</td>
            <td>
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  handleInputChange(item._id, "name", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="text"
                value={item.category}
                onChange={(e) =>
                  handleInputChange(item._id, "category", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleInputChange(item._id, "quantity", e.target.value)
                }
              />
            </td>
            <td>
              <Button variant="danger" onClick={() => handleDelete(item._id)}>
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
