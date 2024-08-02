import { useState, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import {
  loggedInUserState,
  sessionExpiredState,
  authTokenState,
  refreshTokenState,
} from "../recoil/userAtoms";
import api from "../utils/api";

export const useSessionManager = () => {
  const setUser = useSetRecoilState(loggedInUserState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const setAuthToken = useSetRecoilState(authTokenState);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("No refresh token available");
        setIsRefreshing(false);
        return false;
      }
      const response = await api.post("/auth/refresh-token", { refreshToken });
      const { token, refreshToken: newRefreshToken, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      setRefreshToken(newRefreshToken);
      setUser(user);
      setSessionExpired(false);
      setIsRefreshing(false);
      return true;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setIsRefreshing(false);
      return false;
    }
  }, [setUser, setSessionExpired, setAuthToken, setRefreshToken]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAuthToken("");
    setRefreshToken("");
    setUser(null);
    setSessionExpired(false);
  }, [setAuthToken, setRefreshToken, setUser, setSessionExpired]);

  return { refreshSession, logout, isRefreshing };
};
