// UserTable.js
import React from "react";
import { Table, Button } from "react-bootstrap";

const UserTable = ({
  users,
  handleShowModal,
  handleDelete,
  loggedInUser,
  isLastAdmin,
}) => {
  return (
    <Table hover>
      <thead>
        <tr>
          <th>Id</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Role</th>
          <th class="actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users?.map((user) => (
          <tr key={user._id}>
            <td>{user._id}</td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <Button className="btn-edit" variant="info" onClick={() => handleShowModal(user)}>
                Edit
              </Button>
              <Button className="btn-delete"
                variant="danger"
                onClick={() => handleDelete(user._id)}
                disabled={
                  (loggedInUser._id === user._id &&
                    user.role === "admin" &&
                    !isLastAdmin) ||
                  (loggedInUser._id !== user._id &&
                    user.role === "admin" &&
                    isLastAdmin)
                }
              >
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
