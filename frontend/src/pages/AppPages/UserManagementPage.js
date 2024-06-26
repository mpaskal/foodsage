import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import UserTable from "../../components/User/UserTable";
import UserModal from "../../components/User/UserModal";
import DeleteConfirmationModal from "../../components/User/DeleteConfirmationModal";
import { Button, Toast, ToastContainer } from "react-bootstrap";

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
    role: "user",
  });

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
    } else {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
      });
      setIsEdit(false);
    }
    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
    setCurrentUser(null);
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
      fetchUsers();
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

  const handleDelete = (userId) => {
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
      fetchUsers();
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

        <UserModal
          show={modal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          form={form}
          isEdit={isEdit}
        />

        <DeleteConfirmationModal
          show={confirmModal}
          handleClose={() => setConfirmModal(false)}
          confirmDelete={confirmDelete}
        />

        <UserTable
          users={users}
          handleShowModal={handleShowModal}
          handleDelete={handleDelete}
        />

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
