import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
} from "@coreui/react";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user", // Default role
  });

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      console.log("Token being sent on add user:", token);

      await axios.post(
        "/api/users/register-user",
        { ...form },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toggleModal();
      fetchUsers(); // Re-fetch users after adding a new one
    } catch (error) {
      console.error("Error adding user", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      console.log("Token being sent on fetch users:", token);

      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Layout>
      <div className="user-management">
        <h1>User Management</h1>
        <CButton color="primary" onClick={toggleModal}>
          Add User
        </CButton>
        <CModal visible={modal} onClose={toggleModal}>
          <CModalHeader>
            <CModalTitle>Add User</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleSubmit}>
            <CModalBody>
              <CFormLabel htmlFor="firstName">First Name</CFormLabel>
              <CFormInput
                type="text"
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
              <CFormInput
                type="text"
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CFormInput
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <CFormLabel htmlFor="password">Password</CFormLabel>
              <CFormInput
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <CFormLabel htmlFor="role">Role</CFormLabel>
              <CFormSelect
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </CFormSelect>
            </CModalBody>
            <CModalFooter>
              <CButton type="submit" color="primary">
                Add User
              </CButton>
              <CButton color="secondary" onClick={toggleModal}>
                Cancel
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
        <div className="table-container">
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Id</CTableHeaderCell>
                <CTableHeaderCell>First Name</CTableHeaderCell>
                <CTableHeaderCell>Last Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user) => (
                <CTableRow key={user._id}>
                  <CTableDataCell>{user._id}</CTableDataCell>
                  <CTableDataCell>{user.firstName}</CTableDataCell>
                  <CTableDataCell>{user.lastName}</CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>{user.role}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="info">Edit</CButton>
                    <CButton color="danger">Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      </div>
    </Layout>
  );
};

export default UserManagementPage;
