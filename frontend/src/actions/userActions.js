import { useRecoilCallback } from "recoil";
import {
  usersState,
  selectedUserState,
  userManagementState,
} from "../recoil/userAtoms";
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
      const response = await axios.post("/api/users/register-user", user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(usersState, (oldUsers) => [...oldUsers, response.data]);
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

export const useFetchUsers = () => {
  console.log("useFetchUsers called");
  return useRecoilCallback(
    ({ set }) =>
      async (authToken, page, usersPerPage, loggedInUserId) => {
        try {
          console.log("Fetching users...");
          const [usersResponse, adminResponse] = await Promise.all([
            axios.get(`/api/users?page=${page}&limit=${usersPerPage}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            }),
            axios.get("/api/users/admin", {
              headers: { Authorization: `Bearer ${authToken}` },
            }),
          ]);

          console.log("Users Response:", usersResponse.data);
          console.log("Admin Response:", adminResponse.data);

          if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
            const adminTenantId = adminResponse.data.tenantId;

            const filteredUsers = usersResponse.data.users.filter(
              (user) => user.tenantId === adminTenantId
            );

            console.log("Filtered Users:", filteredUsers);

            const adminUsersList = filteredUsers.filter(
              (u) => u.role === "admin"
            );

            console.log("Admin Users List:", adminUsersList);

            set(userManagementState, (prevState) => {
              const newState = {
                ...prevState,
                users: filteredUsers,
                adminUsers: adminUsersList,
                isLastAdmin:
                  adminUsersList.length === 1 &&
                  adminUsersList[0]._id === loggedInUserId,
              };
              console.log("New User Management State:", newState);
              return newState;
            });

            return {
              success: true,
              totalPages: Math.ceil(filteredUsers.length / usersPerPage),
            };
          } else {
            throw new Error("Invalid response structure");
          }
        } catch (error) {
          console.error(
            "Error fetching users",
            error.response?.data || error.message
          );
          set(userManagementState, (prevState) => ({
            ...prevState,
            error: error.response?.data?.message || "Failed to fetch users",
          }));
          return {
            success: false,
            error: error.response?.data?.message || "Failed to fetch users",
          };
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
    const release = snapshot.retain(); // Retain the snapshot
    try {
      const currentUsers = await snapshot.getPromise(usersState);
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      set(
        usersState,
        currentUsers.filter((user) => user._id !== userId)
      );
    } catch (error) {
      console.error("Error deleting user", error);
      throw error;
    } finally {
      release(); // Release the snapshot
    }
  });
};
