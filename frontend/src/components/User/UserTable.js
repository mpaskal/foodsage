import React from "react";
import { Table, Button } from "react-bootstrap";

const UserTable = ({ users, handleShowModal, handleDelete }) => {
  return (
    <Table hover>
      <thead>
        <tr>
          <th>Id</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user._id}</td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <Button variant="info" onClick={() => handleShowModal(user)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(user._id)}>
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default UserTable;
