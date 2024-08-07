import { useState, useEffect, useCallback } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  loggedInUserState,
  authTokenState,
  authLoadingState,
  refreshTokenState,
  sessionExpiredState,
} from "../recoil/userAtoms";
import api from "../utils/api";
import { toast } from "react-toastify";

export const useAuth = () => {
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const setAuthToken = useSetRecoilState(authTokenState);
  const authToken = useRecoilValue(authTokenState);
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setAuthLoading = useSetRecoilState(authLoadingState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const storeAuthData = useCallback(
    (token, refreshToken, user, rememberMe) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("refreshToken", refreshToken);
      storage.setItem("user", JSON.stringify(user));
      storage.setItem("rememberMe", JSON.stringify(rememberMe));
      setAuthToken(token);
      setRefreshToken(refreshToken);
      setLoggedInUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
    [setAuthToken, setRefreshToken, setLoggedInUser]
  );

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("rememberMe");
    setAuthToken(null);
    setRefreshToken(null);
    setLoggedInUser(null);
    delete api.defaults.headers.common["Authorization"];
  }, [setAuthToken, setRefreshToken, setLoggedInUser]);

  const initializeAuth = useCallback(async () => {
    setAuthLoading(true);
    const rememberedUser = localStorage.getItem("rememberMe") === "true";
    const storage = rememberedUser ? localStorage : sessionStorage;

    const token = storage.getItem("token");
    const refreshToken = storage.getItem("refreshToken");
    const user = JSON.parse(storage.getItem("user") || "null");

    if (token && refreshToken && user) {
      setAuthToken(token);
      setRefreshToken(refreshToken);
      setLoggedInUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/users/profile");
        setLoggedInUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response && error.response.status === 401) {
          setSessionExpired(true);
        } else {
          toast.error(
            "Failed to fetch user profile. Please try logging in again."
          );
        }
        clearAuthData();
      }
    } else {
      clearAuthData();
    }
    setAuthLoading(false);
    setIsInitialized(true);
  }, [
    setAuthToken,
    setRefreshToken,
    setLoggedInUser,
    setAuthLoading,
    setSessionExpired,
    clearAuthData,
  ]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(
    async (email, password, rememberMe) => {
      try {
        setError(null);
        const response = await api.post("/users/login", { email, password });
        const { token, refreshToken, user } = response.data;
        storeAuthData(token, refreshToken, user, rememberMe);
        setSessionExpired(false); // Reset session expired state
        return user;
      } catch (error) {
        console.error("Login failed:", error);
        setError(
          error.response?.data?.msg ||
            "Login failed. Please check your credentials."
        );
        throw error;
      }
    },
    [storeAuthData, setSessionExpired]
  );

  const register = useCallback(
    async (userData) => {
      try {
        setError(null);
        const response = await api.post("/users/register", userData);
        const { token, refreshToken, user } = response.data;
        storeAuthData(token, refreshToken, user, true); // Assume remember me for registration
        setSessionExpired(false); // Reset session expired state
        return user;
      } catch (error) {
        console.error("Registration failed:", error);
        setError(
          error.response?.data?.msg || "Registration failed. Please try again."
        );
        throw error;
      }
    },
    [storeAuthData, setSessionExpired]
  );

  const logout = useCallback(() => {
    clearAuthData();
    setSessionExpired(false);
    toast.info("You have been logged out.");
  }, [clearAuthData, setSessionExpired]);

  const isAuthenticated = useCallback(() => {
    return !!authToken;
  }, [authToken]);

  return {
    login,
    register,
    logout,
    isAuthenticated,
    error,
    isInitialized,
    initializeAuth,
    storeAuthData,
    clearAuthData,
  };
};

export default useAuth;
