import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import {
  isUserModalOpenState,
  selectedUserState,
  loggedInUserState,
} from "../../recoil/atoms";
import { useAddUser, useUpdateUser } from "../../actions/userActions";

const UserModal = () => {
  const [isUserModalOpen, setIsUserModalOpen] =
    useRecoilState(isUserModalOpenState);
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  const loggedInUser = useRecoilValue(loggedInUserState);

  const addUser = useAddUser();
  const updateUser = useUpdateUser();

  if (!selectedUser) {
    return null; // or return a loading state, or an empty modal, etc.
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = loggedInUser?.token;
      if (!token) {
        console.error("No token found for submitting user form");
        return;
      }

      if (selectedUser._id) {
        await updateUser(selectedUser, token);
      } else {
        // Ensure password is provided for new users
        if (!selectedUser.password) {
          console.error("Password is required for new users");
          return;
        }
        await addUser(selectedUser, token);
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <Modal show={isUserModalOpen} onHide={() => setIsUserModalOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{selectedUser._id ? "Edit User" : "Add User"}</Modal.Title>
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
                  value={selectedUser.firstName}
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
                  value={selectedUser.lastName}
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
              value={selectedUser.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          {!selectedUser._id && (
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={selectedUser.password}
                onChange={handleChange}
                required={!selectedUser._id}
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={selectedUser.role}
              onChange={handleChange}
              required
              disabled={
                selectedUser._id && loggedInUser?.id === selectedUser._id
              }
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
            {selectedUser._id ? "Save Changes" : "Add User"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
