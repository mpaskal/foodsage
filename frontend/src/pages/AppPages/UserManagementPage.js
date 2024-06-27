import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout/LayoutApp";
import UserTable from "../../components/User/UserTable";
import UserModal from "../../components/User/UserModal";
import DeleteConfirmationModal from "../../components/User/DeleteConfirmationModal";
import {
  Button,
  Toast,
  ToastContainer,
  Spinner,
  Pagination,
} from "react-bootstrap";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLastAdmin, setIsLastAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usersPerPage] = useState(10);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);

    if (user && user.token) {
      fetchUsers(user.token);
    } else {
      console.error("No token found");
      setToastMessage("No authentication token found. Please log in again.");
      setShowToast(true);
    }
  }, [page]);

  const fetchUsers = async (authToken) => {
    if (!authToken) {
      console.error("No token available for fetching users");
      setToastMessage("Authentication token not found. Please log in again.");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/users?page=${page}&limit=${usersPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setUsers(response.data);
      setTotalPages(response.data.totalPages);

      // Update isLastAdmin
      const adminUsers = response.data.filter((u) => u.role === "admin");
      setIsLastAdmin(
        adminUsers.length === 1 && adminUsers[0]._id === loggedInUser?._id
      );
    } catch (error) {
      console.error("Error fetching users", error);
      if (error.response && error.response.status === 401) {
        setToastMessage("Your session has expired. Please log in again.");
      } else {
        setToastMessage("Error fetching users");
      }
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        // Don't set password when editing
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
      const token = loggedInUser?.token;

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
      fetchUsers(token);
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
    const userToDelete = users.find((user) => user._id === userId);
    const adminCount = users.filter((user) => user.role === "admin").length;

    if (
      userToDelete.role === "admin" &&
      adminCount === 1 &&
      userId === loggedInUser._id
    ) {
      setToastMessage("Cannot delete the last admin user.");
      setShowToast(true);
    } else {
      setCurrentUser(userId);
      setConfirmModal(true);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = loggedInUser?.token;
      if (!token) {
        setToastMessage("No authentication token found. Please log in again.");
        setShowToast(true);
        setConfirmModal(false);
        return;
      }

      const userToDelete = users.find((user) => user._id === currentUser);
      const adminCount = users.filter((user) => user.role === "admin").length;

      if (
        userToDelete.role === "admin" &&
        adminCount === 1 &&
        currentUser === loggedInUser._id
      ) {
        setToastMessage("Cannot delete the last admin user.");
        setShowToast(true);
        setConfirmModal(false);
      } else if (isLastAdmin && currentUser === loggedInUser._id) {
        // Delete all users and tenant
        try {
          await axios.delete(`/api/tenants`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Clear local storage
          localStorage.clear();
          // Redirect to home page after deleting everything
          window.location.href = "/";
        } catch (error) {
          setToastMessage(
            error.response?.data?.msg || "Error deleting tenant and users"
          );
          setShowToast(true);
          setConfirmModal(false);
        }
      } else {
        // Regular user deletion
        try {
          await axios.delete(`/api/users/${currentUser}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          fetchUsers(token);
          setConfirmModal(false);
          setToastMessage("User deleted successfully.");
          setShowToast(true);
        } catch (error) {
          setToastMessage(error.response?.data?.msg || "Error deleting user");
          setShowToast(true);
          setConfirmModal(false);
        }
      }
    } catch (error) {
      console.error("Error deleting user", error);
      setToastMessage("Error deleting user");
      setShowToast(true);
      setConfirmModal(false);
    }
  };

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
          isLastAdmin={isLastAdmin && currentUser === loggedInUser?._id}
        />

        {isLoading ? (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <UserTable
            users={users}
            handleShowModal={handleShowModal}
            handleDelete={handleDelete}
            loggedInUser={loggedInUser}
            isLastAdmin={isLastAdmin}
          />
        )}
        <Pagination className="mt-3">
          {[...Array(totalPages).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === page}
              onClick={() => setPage(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
        </Pagination>
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
