import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutAdmin from "../../components/Layout/LayoutAdmin";
import "../../Admin.css";

const TenantManagementPage = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await axios.get("/api/tenants");
        setTenants(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tenants", error);
        setError("Error fetching tenants");
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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
              <tr key={tenant._id}>
                <td>{tenant._id}</td>
                <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                <td>{new Date(tenant.updatedAt).toLocaleDateString()}</td>
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
