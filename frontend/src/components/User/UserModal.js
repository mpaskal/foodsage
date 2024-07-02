import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  selectedUserState,
  isUserModalOpenState,
  loggedInUserState,
} from "../../recoil/atoms";
import { useUpdateUser, useAddUser } from "../../actions/userActions";

const UserModal = () => {
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  const [isUserModalOpen, setIsUserModalOpen] =
    useRecoilState(isUserModalOpenState);
  const loggedInUser = useRecoilValue(loggedInUserState);
  const updateUser = useUpdateUser();
  const addUser = useAddUser();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = loggedInUser?.token;
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      if (selectedUser._id) {
        await updateUser(selectedUser, token);
      } else {
        await addUser(selectedUser, token);
      }
      setIsUserModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
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
                  value={user.firstName}
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
                  value={user.lastName}
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
              value={user.email}
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
                value={user.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={user.role}
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
            {user._id ? "Save Changes" : "Add User"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
