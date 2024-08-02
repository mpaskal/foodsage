import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  selectedUserState,
  isUserModalOpenState,
  loggedInUserState,
  authTokenState,
  authLoadingState,
} from "../../recoil/userAtoms";
import { useUpdateUser, useAddUser } from "../../hooks/useUserManagement";
import { currentPageState, usersPerPageState } from "../../recoil/userAtoms";
import { toast } from "react-toastify";

const UserModal = ({
  fetchUsers,
  page: propPage,
  usersPerPage: propUsersPerPage,
}) => {
  const page = useRecoilValue(currentPageState);
  const usersPerPage = useRecoilValue(usersPerPageState);
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  const authToken = useRecoilValue(authTokenState);
  const authLoading = useRecoilValue(authLoadingState);
  const [error, setError] = useState(null);
  const loggedInUser = useRecoilValue(loggedInUserState);
  const [loading, setLoading] = useState(true);
  const updateUser = useUpdateUser();
  const addUser = useAddUser();
  const [isUserModalOpen, setIsUserModalOpen] =
    useRecoilState(isUserModalOpenState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken || !loggedInUser) {
      setError("No authentication token or user information found");
      toast.error("Authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      if (selectedUser?._id) {
        await updateUser(selectedUser, authToken);
      } else {
        await addUser(selectedUser, authToken);
        fetchUsers(authToken, page, usersPerPage);
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Error saving user. Please try again.");
      toast.error("Error saving user. Please try again.");
    }
  };

  // Provide default values to prevent errors
  const user = selectedUser || {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  };

  return (
    <Modal show={isUserModalOpen} onHide={() => setIsUserModalOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{user._id ? "Edit User" : "Add User"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={user.firstName || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={user.lastName || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>
          {!user._id && (
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={user.password || ""}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={user.role || "user"}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {user._id ? "Save Changes" : "Save User"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
