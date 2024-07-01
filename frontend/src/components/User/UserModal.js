import React from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  isUserModalOpenState,
  selectedUserState,
  userState,
} from "../../recoil/atoms";
import { useUpdateUser, useAddUser } from "../../actions/userActions";

const UserModal = () => {
  const [isUserModalOpen, setIsUserModalOpen] =
    useRecoilState(isUserModalOpenState);
  const [selectedUser, setSelectedUser] = useRecoilState(selectedUserState);
  const loggedInUser = useRecoilValue(userState);

  const updateUser = useUpdateUser();
  const addUser = useAddUser();

  const handleClose = () => setIsUserModalOpen(false);

  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser?._id) {
        await updateUser(selectedUser, loggedInUser.token);
      } else {
        await addUser(selectedUser, loggedInUser.token);
      }
      handleClose();
    } catch (error) {
      console.error("Error submitting user:", error);
      // Handle error (e.g., show a toast message)
    }
  };

  return (
    <Modal show={isUserModalOpen} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedUser?._id ? "Edit User" : "Add User"}
        </Modal.Title>
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
                  value={selectedUser?.firstName || ""}
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
                  value={selectedUser?.lastName || ""}
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
              value={selectedUser?.email || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>
          {!selectedUser?._id && (
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={selectedUser?.password || ""}
                onChange={handleChange}
                required={!selectedUser?._id}
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={selectedUser?.role || "user"}
              onChange={handleChange}
              required
              disabled={
                selectedUser?._id &&
                loggedInUser?.role === "admin" &&
                loggedInUser?.id === selectedUser?._id
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {selectedUser?._id ? "Save Changes" : "Add User"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
