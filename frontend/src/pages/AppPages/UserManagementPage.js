import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import Layout from "../../components/Layout/LayoutApp";
import UserTable from "../../components/User/UserTable";
import UserModal from "../../components/User/UserModal";
import DeleteConfirmationModal from "../../components/User/DeleteConfirmationModal";
import api from "../../utils/api";
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
import { useDeleteUser } from "../../hooks/useUserManagement";
import { useAuth } from "../../hooks/useAuth";

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
  const setUsers = useSetRecoilState(usersState);
  const setIsLoading = useSetRecoilState(isLoadingState);
  const setTotalPages = useSetRecoilState(totalPagesState);
  const setCurrentPage = useSetRecoilState(currentPageState);
  const setAdminUsers = useSetRecoilState(adminUsersState);

  const [confirmModal, setConfirmModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const usersPerPage = 10;
  const deleteUser = useDeleteUser();
  const { authToken, isAuthenticated } = useAuth(); // Use the useAuth hook

  const fetchUsers = async () => {
    if (!isAuthenticated()) {
      setToastMessage("You are not authenticated. Please log in.");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const usersResponse = await api.get(`/users`, {
        params: {
          page: currentPage,
          limit: usersPerPage,
        },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
        const filteredUsers = usersResponse.data.users;
        const adminUsersList = filteredUsers.filter((u) => u.role === "admin");

        setUsers(filteredUsers);
        setAdminUsers(adminUsersList);
        setTotalPages(usersResponse.data.totalPages);
        setCurrentPage(currentPage);
        setShowToast(false);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setToastMessage(
        "Error fetching users: " + (error.message || "Unknown error")
      );
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, isAuthenticated]);

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

  const confirmDelete = async (userId) => {
    if (!isAuthenticated()) {
      setToastMessage("You are not authenticated. Please log in.");
      setShowToast(true);
      return;
    }

    try {
      const result = await deleteUser(userId, authToken);
      if (result.success) {
        setToastMessage("User deleted successfully.");
        setShowToast(true);
        // Refresh users after deletion
        fetchUsers();
      } else {
        setToastMessage(result.error);
        setShowToast(true);
      }
      setConfirmModal(false);
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
    }
  };

  if (!isAuthenticated()) {
    return (
      <Layout>
        <div className="user-management">
          <h1>User Management</h1>
          <p>You need to be authenticated to view this page. Please log in.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="user-management">
        <h1>User Management</h1>

        <UserModal
          show={isUserModalOpen}
          handleClose={() => setIsUserModalOpen(false)}
          fetchUsers={fetchUsers}
          page={currentPage}
          usersPerPage={usersPerPage}
        />

        <DeleteConfirmationModal
          userId={selectedUser?._id}
          show={confirmModal}
          handleClose={() => setConfirmModal(false)}
          confirmDelete={confirmDelete}
          isLastAdmin={
            adminUsers.length === 1 && selectedUser?.id === loggedInUser?.id
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
