import React from "react";
import { Table, Button } from "react-bootstrap";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  usersState,
  userState, // Changed from loggedInUserState to userState
  isLastAdminState,
  selectedUserState,
  isUserModalOpenState,
} from "../../recoil/atoms";

const UserTable = () => {
  const users = useRecoilValue(usersState);
  const loggedInUser = useRecoilValue(userState); // Changed from loggedInUserState to userState
  const isLastAdmin = useRecoilValue(isLastAdminState);
  const setSelectedUser = useSetRecoilState(selectedUserState);
  const setIsUserModalOpen = useSetRecoilState(isUserModalOpenState);

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDelete = (userId) => {
    // Implement your delete logic here
  };

  return (
    <Table hover>
      <thead>
        <tr>
          <th>Id</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users?.map((user) => (
          <tr key={user._id}>
            <td>{user._id}</td>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <Button variant="info" onClick={() => handleShowModal(user)}>
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(user._id)}
                disabled={
                  (loggedInUser._id === user._id &&
                    user.role === "admin" &&
                    !isLastAdmin) ||
                  (loggedInUser._id !== user._id &&
                    user.role === "admin" &&
                    isLastAdmin)
                }
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default UserTable;
