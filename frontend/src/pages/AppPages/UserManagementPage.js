import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Layout from "../../components/Layout/LayoutApp";
import UserTable from "../../components/User/UserTable";
import UserModal from "../../components/User/UserModal";
import DeleteConfirmationModal from "../../components/User/DeleteConfirmationModal";
import axios from "axios";
import {
  Button,
  Toast,
  ToastContainer,
  Spinner,
  Pagination,
} from "react-bootstrap";
import {
  isUserModalOpenState,
  selectedUserState,
  loggedInUserState,
  adminUsersState,
  isLoadingState,
  totalPagesState,
  currentPageState,
  usersState,
} from "../../recoil/userAtoms";
import { useFetchUsers, useDeleteUser } from "../../actions/userActions";

const UserManagementPage = () => {
  const [isUserModalOpen, setIsUserModalOpen] =
    useRecoilState(isUserModalOpenState);
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  const loggedInUser = useRecoilValue(loggedInUserState);
  const isLoading = useRecoilValue(isLoadingState);
  const totalPages = useRecoilValue(totalPagesState);
  const currentPage = useRecoilValue(currentPageState);
  const users = useRecoilValue(usersState);
  const adminUsers = useRecoilValue(adminUsersState);

  const [confirmModal, setConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const usersPerPage = 10;

  const fetchUsers = useFetchUsers();
  const deleteUser = useDeleteUser();

  const loadUsers = async () => {
    if (loggedInUser?.token) {
      try {
        console.log("Fetching users in loadUsers...");
        const result = await fetchUsers(
          loggedInUser.token,
          currentPage,
          usersPerPage,
          loggedInUser.id
        );
        if (!result.success) {
          setToastMessage("Error fetching users in loadUsers");
          setShowToast(true);
        } else {
          setShowToast(false); // Hide the error toast if the fetch is successful
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setToastMessage("Error fetching users in loadUsers setToastMessage");
        setShowToast(true);
      }
    } else {
      console.error("No token found");
      setToastMessage("No authentication token found. Please log in again.");
      setShowToast(true);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleShowModal = (user = null) => {
    setSelectedUser(
      user
        ? { ...user }
        : {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "user",
          }
    );
    setIsUserModalOpen(true);
  };

  const handleDelete = (userId) => {
    const userToDelete = users.find((user) => user._id === userId);
    const adminCount = adminUsers.length;

    if (
      userToDelete.role === "admin" &&
      adminCount === 1 &&
      userId === loggedInUser?.id
    ) {
      setToastMessage("Cannot delete the last admin user.");
      setShowToast(true);
    } else {
      setSelectedUser(userToDelete);
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

      const userToDelete = users.find((user) => user._id === selectedUser?._id);
      const adminCount = adminUsers.length;

      if (
        userToDelete?.role === "admin" &&
        adminCount === 1 &&
        userToDelete._id === loggedInUser.id
      ) {
        const userConfirmed = window.confirm(
          "Deleting the last admin will remove all users, the tenant, and all associated data. Are you sure you want to proceed?"
        );
        if (!userConfirmed) {
          setConfirmModal(false);
          return;
        }

        try {
          await axios.delete(`/api/tenants/${userToDelete.tenantId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.clear();
          window.location.href = "/";
        } catch (error) {
          setToastMessage(
            error.response?.data?.msg || "Error deleting tenant and users"
          );
          setShowToast(true);
          setConfirmModal(false);
        }
      } else if (userToDelete?._id === loggedInUser.id) {
        await deleteUser(userToDelete._id, token);
        localStorage.clear();
        window.location.href = "/";
      } else {
        await deleteUser(userToDelete?._id, token);
        loadUsers();
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

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      loadUsers();
    }
  };

  return (
    <Layout>
      <div className="user-management">
        <h1>User Management</h1>

        <UserModal
          show={isUserModalOpen}
          handleClose={() => setIsUserModalOpen(false)}
          fetchUsers={loadUsers}
          page={currentPage}
          usersPerPage={usersPerPage}
        />

        <DeleteConfirmationModal
          show={confirmModal}
          handleClose={() => setConfirmModal(false)}
          confirmDelete={confirmDelete}
          isLastAdmin={
            adminUsers.length === 1 && selectedUser?._id === loggedInUser?.id
          }
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
            isLastAdmin={adminUsers.length === 1}
          />
        )}

        <Pagination className="mt-3">
          {[...Array(totalPages).keys()].map((number) => (
            <Pagination.Item
              key={number + 1}
              active={number + 1 === currentPage}
              onClick={() => handlePageChange(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
        </Pagination>

        <Button variant="primary" onClick={() => handleShowModal()}>
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
