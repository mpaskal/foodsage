import { useState, useEffect, useCallback } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  loggedInUserState,
  authTokenState,
  authLoadingState,
} from "../recoil/userAtoms";
import api from "../utils/api";

export const useAuth = () => {
  const setLoggedInUser = useSetRecoilState(loggedInUserState);
  const setAuthToken = useSetRecoilState(authTokenState);
  const setAuthLoading = useSetRecoilState(authLoadingState);
  const authToken = useRecoilValue(authTokenState);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAuth = useCallback(async () => {
    setAuthLoading(true);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Token from localStorage:", token);
    console.log("User from localStorage:", user);
    if (token && user) {
      setAuthToken(token);
      setLoggedInUser(user);
      try {
        const response = await api.get("/users/profile");
        setLoggedInUser(response.data);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthToken("");
        setLoggedInUser(null);
      }
    } else {
      setAuthToken("");
      setLoggedInUser(null);
    }
    setAuthLoading(false);
    setIsInitialized(true);
  }, [setAuthToken, setLoggedInUser, setAuthLoading]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/users/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      setLoggedInUser(user);
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken("");
    setLoggedInUser(null);
  }, [setAuthToken, setLoggedInUser]);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/users/register", userData);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      setLoggedInUser(user);
      return user;
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try again.");
      throw error;
    }
  };

  const isAuthenticated = useCallback(() => {
    return !!authToken;
  }, [authToken]);

  return {
    login,
    logout,
    register,
    isAuthenticated,
    error,
    isInitialized,
    initializeAuth,
  };
};
export default useAuth;
