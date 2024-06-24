import React from "react";
import LayoutAdmin from "../../components/Layout/LayoutAdmin";
import "../../Admin.css";

const tenants = [
  { id: 1, createdDate: "2023-01-01", updatedDate: "2023-01-05" },
  { id: 2, createdDate: "2023-02-01", updatedDate: "2023-02-05" },
  // Add more tenant data here
];

const TenantManagementPage = () => {
  return (
    <LayoutAdmin>
      <div className="tenant-management">
        <h1>Tenant Management</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Created Date</th>
              <th>Updated Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>{tenant.id}</td>
                <td>{tenant.createdDate}</td>
                <td>{tenant.updatedDate}</td>
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

export default TenantManagementPage;
