import { useRecoilCallback } from "recoil";
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
  return useRecoilCallback(({ set }) => async (page, usersPerPage) => {
    try {
      set(isLoadingState, true);
      const response = await api.get(
        `/users?page=${page}&limit=${usersPerPage}`
      );

      if (response.data && Array.isArray(response.data.users)) {
        const filteredUsers = response.data.users;
        const adminUsersList = filteredUsers.filter((u) => u.role === "admin");

        set(usersState, filteredUsers);
        set(adminUsersState, adminUsersList);
        set(totalPagesState, response.data.totalPages);
        set(currentPageState, page);

        return { success: true };
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error fetching users", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch users",
      };
    } finally {
      set(isLoadingState, false);
    }
  });
};

export const useAddUser = () => {
  return useRecoilCallback(({ snapshot, set }) => async (user) => {
    const release = snapshot.retain();
    try {
      console.log("Sending user data to backend:", user);
      const response = await api.post("/users/register", user);
      console.log("Response from backend:", response.data.user);
      console.log("User id", response.data.user.id);

      if (response.data.user && response.data.user.id) {
        const users = await snapshot.getPromise(usersState);
        const adminUsers = await snapshot.getPromise(adminUsersState);

        set(usersState, [...users, response.data.user]);
        if (response.data.user === "admin") {
          set(adminUsersState, [...adminUsers, response.data.user]);
        }
        set(selectedUserState, null);

        return { success: true, user: response.data.user };
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error adding user", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to add user",
      };
    } finally {
      release();
    }
  });
};

export const useUpdateUser = () => {
  return useRecoilCallback(({ snapshot, set }) => async (user) => {
    const release = snapshot.retain();
    try {
      console.log("Sending updated user data to backend:", user);
      const response = await api.put(`/users/${user._id}`, user);
      console.log("Response from backend:", response.data);

      if (response.data && response.data._id) {
        const users = await snapshot.getPromise(usersState);
        const adminUsers = await snapshot.getPromise(adminUsersState);

        set(
          usersState,
          users.map((u) => (u._id === response.data._id ? response.data : u))
        );
        set(
          adminUsersState,
          adminUsers.map((u) =>
            u._id === response.data._id ? response.data : u
          )
        );
        set(selectedUserState, null);

        return { success: true, user: response.data };
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error updating user", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to update user",
      };
    } finally {
      release();
    }
  });
};

export const useDeleteUser = () => {
  return useRecoilCallback(({ snapshot, set }) => async (userId) => {
    const release = snapshot.retain();
    try {
      const users = await snapshot.getPromise(usersState);
      const adminUsers = await snapshot.getPromise(adminUsersState);

      const userToDelete = users.find((user) => user._id === userId);
      if (!userToDelete) {
        throw new Error("User not found");
      }

      if (userToDelete.role === "admin" && adminUsers.length === 1) {
        throw new Error("Cannot delete the last admin user");
      }

      await api.delete(`/users/${userId}`);

      set(
        usersState,
        users.filter((user) => user._id !== userId)
      );
      set(
        adminUsersState,
        adminUsers.filter((user) => user._id !== userId)
      );

      return { success: true };
    } catch (error) {
      console.error("Error deleting user", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete user",
      };
    } finally {
      release();
    }
  });
};
