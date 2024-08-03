import axios from "axios";
axios.defaults.baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:5000/api");
