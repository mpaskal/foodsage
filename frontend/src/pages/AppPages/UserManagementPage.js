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

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);

        // Update isLastAdmin
        const adminUsers = response.data.users.filter(
          (u) => u.role === "admin"
        );
        setIsLastAdmin(
          adminUsers.length === 1 && adminUsers[0]._id === loggedInUser?.id
        );
      } else {
        console.error("Invalid response structure:", response.data);
        setToastMessage("Error fetching users");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error fetching users", error);
      if (error.response && error.response.status === 404) {
        setToastMessage("Endpoint not found. Please check the API endpoint.");
      } else if (error.response && error.response.status === 401) {
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
        // Prevent the logged-in user from changing their own role
        if (
          currentUser._id === loggedInUser.id &&
          form.role !== currentUser.role
        ) {
          setToastMessage("You cannot change your own role.");
          setShowToast(true);
          return;
        }

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

    console.log(`Trying to delete user: ${userToDelete?._id}`);
    console.log(`Logged in user: ${loggedInUser?.id}`);
    console.log(`Is last admin: ${isLastAdmin}`);

    if (
      userToDelete.role === "admin" &&
      adminCount === 1 &&
      userId === loggedInUser?.id
    ) {
      setToastMessage("Cannot delete the last admin user.");
      setShowToast(true);
    } else {
      setCurrentUser(userToDelete);
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

      const userToDelete = users.find((user) => user._id === currentUser?._id);
      const adminCount = users.filter((user) => user.role === "admin").length;

      if (
        userToDelete?.role === "admin" &&
        adminCount === 1 &&
        userToDelete._id === loggedInUser.id
      ) {
        // Show special warning message
        const userConfirmed = window.confirm(
          "Deleting the last admin will remove all users, the tenant, and all associated data. Are you sure you want to proceed?"
        );
        if (!userConfirmed) {
          setConfirmModal(false);
          return;
        }

        // Confirm the deletion of all users and tenant
        try {
          await axios.delete(`/api/tenants/${userToDelete.tenantId}`, {
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
      } else if (userToDelete?._id === loggedInUser.id) {
        // Self-deletion
        await axios.delete(`/api/users/${userToDelete._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Clear local storage
        localStorage.clear();
        // Redirect to home page
        window.location.href = "/";
      } else {
        // Regular user deletion
        await axios.delete(`/api/users/${userToDelete?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers(token);
        setConfirmModal(false);
        setToastMessage("User deleted successfully.");
        setShowToast(true);
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
     

        <UserModal
          show={modal}
          handleClose={handleCloseModal}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          form={form}
          isEdit={isEdit}
          loggedInUser={loggedInUser}
          currentUserId={currentUser?._id}
        />

        <DeleteConfirmationModal
          show={confirmModal}
          handleClose={() => setConfirmModal(false)}
          confirmDelete={confirmDelete}
          isLastAdmin={isLastAdmin && currentUser?._id === loggedInUser?.id}
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
        <Button  variant="primary" onClick={() => handleShowModal()}>
          Add User
        </Button>
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
