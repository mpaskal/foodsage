// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  // Add authorization token
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Add timezone offset
  const timezoneOffset = new Date().getTimezoneOffset();
  config.headers["X-Timezone-Offset"] = timezoneOffset;

  return config;
});

export const getAllFoodItems = () => {
  return api.get("/food/items/all");
};

export default api;
