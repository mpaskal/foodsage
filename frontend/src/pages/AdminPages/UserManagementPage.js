import React from "react";
import LayoutAdmin from "../../components/Layout/LayoutAdmin";
import "../../Admin.css";

const users = [
  {
    id: 1,
    email: "user1@example.com",
    firstName: "John",
    lastName: "Doe",
    tenantId: 1,
    adminId: 2,
    role: "User",
  },
  {
    id: 2,
    email: "user2@example.com",
    firstName: "Jane",
    lastName: "Doe",
    tenantId: 1,
    adminId: 2,
    role: "Admin",
  },
  // Add more user data here
];

const UserManagementPage = () => {
  return (
    <LayoutAdmin>
      <div className="user-management">
        <h1>User Management</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>TenantId</th>
              <th>AdminId</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.tenantId}</td>
                <td>{user.adminId}</td>
                <td>{user.role}</td>
                <td className="admin-actions">
                  <button className="admin-button edit">Edit</button>
                  <button className="admin-button delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LayoutAdmin>
  );
};

export default UserManagementPage;
