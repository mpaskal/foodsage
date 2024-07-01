import { useRecoilCallback } from "recoil";
import {
  usersState,
  selectedUserState,
  adminUsersState,
  isLastAdminState,
} from "../recoil/atoms";
import axios from "axios";

export const useUpdateUser = () => {
  return useRecoilCallback(({ set }) => async (user, token) => {
    try {
      const response = await axios.put(`/api/users/${user._id}`, user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(usersState, (oldUsers) =>
        oldUsers.map((u) => (u._id === user._id ? response.data : u))
      );
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
      const response = await axios.post("/api/users", user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(usersState, (oldUsers) => [...oldUsers, response.data]);
      set(selectedUserState, null);
    } catch (error) {
      console.error("Error adding user", error);
      throw error;
    }
  });
};

export const useFetchUsers = () => {
  return useRecoilCallback(
    ({ set }) =>
      async (authToken, page, usersPerPage, loggedInUserId) => {
        try {
          const response = await axios.get(
            `/api/users?page=${page}&limit=${usersPerPage}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );

          if (response.data && Array.isArray(response.data.users)) {
            set(usersState, response.data.users);
            const adminUsersList = response.data.users.filter(
              (u) => u.role === "admin"
            );
            set(adminUsersState, adminUsersList);
            set(
              isLastAdminState,
              adminUsersList.length === 1 &&
                adminUsersList[0]._id === loggedInUserId
            );
            return { success: true, totalPages: response.data.totalPages };
          } else {
            throw new Error("Invalid response structure");
          }
        } catch (error) {
          console.error("Error fetching users", error);
          throw error;
        }
      }
  );
};

export const useFetchSingleUser = () => {
  return useRecoilCallback(({ set }) => async (userId, token) => {
    try {
      const response = await axios.get(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(selectedUserState, response.data);
      return { success: true };
    } catch (error) {
      console.error("Error fetching single user", error);
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
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const currentUsers = await snapshot.getPromise(usersState);
      set(
        usersState,
        currentUsers.filter((user) => user._id !== userId)
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting user", error);
      throw error;
    }
  });
};
