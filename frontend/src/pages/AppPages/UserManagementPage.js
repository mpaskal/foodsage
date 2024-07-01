import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
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
import {
  isUserModalOpenState,
  selectedUserState,
  adminUsersState,
  usersState,
  userState,
  isLastAdminState,
} from "../../recoil/atoms";
import {
  useFetchUsers,
  useAddUser,
  useUpdateUser,
  useDeleteUser,
  useFetchSingleUser,
  useClearSelectedUser,
} from "../../actions/userActions";

const UserManagementPage = () => {
  const [isUserModalOpen, setIsUserModalOpen] =
    useRecoilState(isUserModalOpenState);
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  const [adminUsers, setAdminUsers] = useRecoilState(adminUsersState);
  const [users, setUsers] = useRecoilState(usersState);
  const loggedInUser = useRecoilValue(userState);
  const [isLastAdmin, setIsLastAdmin] = useRecoilState(isLastAdminState);

  const [confirmModal, setConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10; // define usersPerPage

  const fetchUsers = useFetchUsers();

  useEffect(() => {
    if (loggedInUser && loggedInUser.token) {
      fetchUsers(loggedInUser.token, page, usersPerPage, loggedInUser._id)
        .then((result) => {
          if (result.success) {
            setTotalPages(result.totalPages);
          } else {
            setToastMessage("Error fetching users");
            setShowToast(true);
          }
        })
        .catch((error) => {
          setToastMessage("Error fetching users");
          setShowToast(true);
        });
    } else {
      console.error("No token found");
      setToastMessage("No authentication token found. Please log in again.");
      setShowToast(true);
    }
  }, [page, loggedInUser]);

  const handleShowModal = (user = null) => {
    setSelectedUser(
      user
        ? { ...user }
        : { firstName: "", lastName: "", email: "", password: "", role: "user" }
    );
    setIsUserModalOpen(true);
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
      const adminCount = users.filter((user) => user.role === "admin").length;

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
        await axios.delete(`/api/users/${userToDelete._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.clear();
        window.location.href = "/";
      } else {
        await axios.delete(`/api/users/${userToDelete?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers(token, page, usersPerPage, loggedInUser._id);
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
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add User
        </Button>

        <UserModal />

        <DeleteConfirmationModal
          show={confirmModal}
          handleClose={() => setConfirmModal(false)}
          confirmDelete={confirmDelete}
          isLastAdmin={isLastAdmin && selectedUser?._id === loggedInUser?.id}
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
