import axios from "axios";
import { useRecoilCallback } from "recoil";
import { selectedUserState, userManagementState } from "../recoil/userAtoms";

export const useFetchUsers = () => {
  return useRecoilCallback(
    ({ set }) =>
      async (authToken, page, usersPerPage, loggedInUserId) => {
        try {
          console.log("Fetching users...");
          const usersResponse = await axios.get(
            `/api/users?page=${page}&limit=${usersPerPage}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );

          console.log("Users Response:", usersResponse.data);

          if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
            const filteredUsers = usersResponse.data.users;
            const adminUsersList = filteredUsers.filter(
              (u) => u.role === "admin"
            );

            const newState = {
              users: filteredUsers,
              adminUsers: adminUsersList,
              isLastAdmin:
                adminUsersList.length === 1 &&
                adminUsersList[0]._id === loggedInUserId,
              totalPages: usersResponse.data.totalPages,
              currentPage: page,
              isLoading: false,
              error: null,
            };

            set(userManagementState, newState);

            console.log("New User Management State:", newState);
            return { success: true, ...newState };
          } else {
            throw new Error("Invalid response structure");
          }
        } catch (error) {
          console.error(
            "Error fetching users in userActions",
            error.response?.data || error.message
          );
          const errorState = {
            error: error.response?.data?.message || "Failed to fetch users",
            isLoading: false,
          };
          set(userManagementState, (prevState) => ({
            ...prevState,
            ...errorState,
          }));
          return { success: false, ...errorState };
        }
      }
  );
};

export const useUpdateUser = () => {
  return useRecoilCallback(({ set }) => async (user, token) => {
    try {
      const response = await axios.put(`/api/users/${user._id}`, user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(userManagementState, (prevState) => ({
        ...prevState,
        users: prevState.users.map((u) =>
          u._id === user._id ? response.data : u
        ),
        adminUsers: prevState.adminUsers.map((u) =>
          u._id === user._id ? response.data : u
        ),
      }));
      set(selectedUserState, null);
    } catch (error) {
      console.error("Error updating user", error);
      throw error;
    }
  });
};

export const useAddUser = () => {
  return useRecoilCallback(({ set }) => async (user, token) => {
    try {
      const response = await axios.post("/api/users/register-user", user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(userManagementState, (prevState) => ({
        ...prevState,
        users: [...prevState.users, response.data],
        adminUsers:
          response.data.role === "admin"
            ? [...prevState.adminUsers, response.data]
            : prevState.adminUsers,
      }));
      set(selectedUserState, null);
    } catch (error) {
      console.error(
        "Error adding user",
        error.response ? error.response.data : error
      );
      throw error;
    }
  });
};

export const useClearSelectedUser = () => {
  return useRecoilCallback(({ set }) => () => {
    set(selectedUserState, null);
  });
};

export const useDeleteUser = () => {
  return useRecoilCallback(({ snapshot, set }) => async (userId, authToken) => {
    const release = snapshot.retain();
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      set(userManagementState, (prevState) => ({
        ...prevState,
        users: prevState.users.filter((user) => user._id !== userId),
        adminUsers: prevState.adminUsers.filter((user) => user._id !== userId),
      }));
    } catch (error) {
      console.error("Error deleting user", error);
      throw error;
    } finally {
      release();
    }
  });
};
