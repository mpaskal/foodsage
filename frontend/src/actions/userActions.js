import { useRecoilCallback } from "recoil";
import axios from "axios";
import api from "../utils/api";
import {
  usersState,
  adminUsersState,
  isLoadingState,
  totalPagesState,
  currentPageState,
  selectedUserState,
} from "../recoil/userAtoms";

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

            set(usersState, filteredUsers);
            set(adminUsersState, adminUsersList);
            set(isLoadingState, false);
            set(totalPagesState, usersResponse.data.totalPages);
            set(currentPageState, page);

            return { success: true };
          } else {
            throw new Error("Invalid response structure");
          }
        } catch (error) {
          console.error(
            "Error fetching users",
            error.response?.data || error.message
          );
          set(isLoadingState, false);
          return {
            success: false,
            error: error.response?.data?.message || "Failed to fetch users",
          };
        }
      }
  );
};

export const useUpdateUser = () => {
  return useRecoilCallback(({ set, snapshot }) => async (user, token) => {
    try {
      const response = await axios.put(`/api/users/${user._id}`, user, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = await snapshot.getPromise(usersState);
      const adminUsers = await snapshot.getPromise(adminUsersState);

      set(
        usersState,
        users.map((u) => (u._id === user._id ? response.data : u))
      );
      set(
        adminUsersState,
        adminUsers.map((u) => (u._id === user._id ? response.data : u))
      );
      set(selectedUserState, null);
    } catch (error) {
      console.error("Error updating user", error);
      throw error;
    }
  });
};

export const useAddUser = () => {
  return useRecoilCallback(({ set, snapshot }) => async (user, token) => {
    try {
      const response = await axios.post("/api/users/register-user", user, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = await snapshot.getPromise(usersState);
      const adminUsers = await snapshot.getPromise(adminUsersState);

      set(usersState, [...users, response.data]);
      if (response.data.role === "admin") {
        set(adminUsersState, [...adminUsers, response.data]);
      }
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
    try {
      const users = await snapshot.getPromise(usersState);
      const adminUsers = await snapshot.getPromise(adminUsersState);

      const userToDelete = users.find((user) => user._id === userId);
      if (!userToDelete) {
        throw new Error("User not found");
      }

      const adminCount = adminUsers.length;
      if (userToDelete.role === "admin" && adminCount === 1) {
        throw new Error("Cannot delete the last admin user");
      }

      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const newUsers = users.filter((user) => user._id !== userId);
      const newAdminUsers = adminUsers.filter((user) => user._id !== userId);

      set(usersState, newUsers);
      set(adminUsersState, newAdminUsers);

      return { success: true };
    } catch (error) {
      console.error(
        "Error deleting user",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete user",
      };
    }
  });
};
