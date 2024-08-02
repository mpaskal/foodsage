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
  const setRefreshToken = useSetRecoilState(refreshTokenState);
  const setAuthLoading = useSetRecoilState(authLoadingState);
  const setSessionExpired = useSetRecoilState(sessionExpiredState);
  const authToken = useRecoilValue(authTokenState); // Make sure authToken is provided here
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAuth = useCallback(async () => {
    setAuthLoading(true);
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Initializing Auth:", { token, refreshToken, user });

    if (token && refreshToken && user) {
      setAuthToken(token);
      setRefreshToken(refreshToken);
      setLoggedInUser(user);
      try {
        const response = await api.get("/users/profile");
        console.log("Profile response:", response.data);
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
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setAuthToken("");
        setRefreshToken("");
        setLoggedInUser(null);
      }
    } else {
      console.log("No stored auth data found");
      setAuthToken("");
      setRefreshToken("");
      setLoggedInUser(null);
    }
    setAuthLoading(false);
    setIsInitialized(true);
  }, [
    setAuthToken,
    setRefreshToken,
    setLoggedInUser,
    setAuthLoading,
    setSessionExpired,
  ]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/users/login", { email, password });
      const { token, refreshToken, user } = response.data;

      console.log("Login response:", { token, refreshToken, user });

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      setAuthToken(token);
      setRefreshToken(refreshToken);
      setLoggedInUser(user);

      console.log("After login:", {
        storedToken: localStorage.getItem("token"),
        storedRefreshToken: localStorage.getItem("refreshToken"),
        storedUser: localStorage.getItem("user"),
      });

      return user;
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setAuthToken("");
    setRefreshToken("");
    setLoggedInUser(null);
    setSessionExpired(false);
    toast.info("You have been logged out.");
  }, [setAuthToken, setRefreshToken, setLoggedInUser, setSessionExpired]);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/users/register", userData);
      const { token, refreshToken, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      setRefreshToken(refreshToken);
      setLoggedInUser(user);
      toast.success("Registration successful! Welcome aboard!");
      return user;
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try again.");
      toast.error("Registration failed. Please try again.");
      throw error;
    }
  };

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem("token") && !!localStorage.getItem("user");
  }, []);

  return {
    login,
    logout,
    register,
    isAuthenticated,
    error,
    isInitialized,
    initializeAuth,
    authToken, // Make sure authToken is included in the return
  };
};

export default useAuth;
