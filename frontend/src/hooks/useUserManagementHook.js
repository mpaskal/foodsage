// In a new file, e.g., src/hooks/useUserManagement.js

import { useSetRecoilState } from "recoil";
import { userManagementState } from "../../recoil/userAtoms";
import { useUserManagementHook } from "../hooks/useUserManagementHook";
import axios from "axios";

export const useUserManagement = () => {
  const setUserManagement = useSetRecoilState(userManagementState);

  return async (token, page, usersPerPage, loggedInUserId, tenantId) => {
    try {
      const response = await axios.get("/api/users", {
        params: { page, limit: usersPerPage },
        headers: { Authorization: `Bearer ${token}` },
      });

      const { users, totalPages, currentPage, total } = response.data;

      setUserManagement((prev) => ({
        ...prev,
        users,
        totalPages,
        currentPage,
        total,
      }));

      return { success: true, users, totalPages, currentPage, total };
    } catch (error) {
      console.error("Error fetching users", error);
      return {
        success: false,
        error: error.response?.data?.message || "Error fetching users",
      };
    }
  };
};
