import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

console.log("API Base URL:", API_BASE_URL); // Keep this for debugging

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response interceptor error:", error);
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new CustomEvent("sessionExpired"));
    }
    return Promise.reject(error);
  }
);

export default api;
