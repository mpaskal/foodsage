import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import {
  Table,
  Button,
  Modal,
  Form,
  Toast,
  ToastContainer,
} from "react-bootstrap";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user", // Default role
  });

  const handleCloseModal = () => {
    setModal(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
    });
    setIsEdit(false);
    setCurrentUser(null);
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        role: user.role,
      });
      setCurrentUser(user);
      setIsEdit(true);
    }
    setModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      if (isEdit) {
        await axios.put(
          `/api/users/${currentUser._id}`,
          { ...form },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "/api/users/register-user",
          { ...form },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      handleCloseModal();
      fetchUsers(); // Re-fetch users after adding or editing a user
      setToastMessage(
        isEdit ? "User updated successfully." : "User added successfully."
      );
      setShowToast(true);
    } catch (error) {
      console.error("Error adding/editing user", error);
      setToastMessage("Error adding/editing user");
      setShowToast(true);
    }
  };

  const handleDelete = async (userId) => {
    setCurrentUser(userId);
    setConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;

      await axios.delete(`/api/users/${currentUser}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers(); // Re-fetch users after deleting a user
      setConfirmModal(false);
      setToastMessage("User deleted successfully.");
      setShowToast(true);
    } catch (error) {
      console.error("Error deleting user", error);
      setToastMessage("Error deleting user");
      setShowToast(true);
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
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add User
        </Button>
        <Modal show={modal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit User" : "Add User"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="role">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Control>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEdit ? "Save Changes" : "Add User"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal show={confirmModal} onHide={() => setConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="table-container">
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
                    <Button
                      variant="info"
                      onClick={() => handleShowModal(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <ToastContainer position="top-end" className="p-3">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
          >
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </Layout>
  );
};

export default UserManagementPage;
