// client/src/api.js
import axios from "axios";

// Use environment variable or fallback
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.qsi.africa/api";
  // "http://localhost:3001";

const api = axios.create({
  baseURL: baseURL,
});

// Callback for auto-logout
let onUnauthorizedCallback = () => {};
export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

// Interceptor to handle 401 errors (e.g., expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      onUnauthorizedCallback();
    }
    return Promise.reject(error);
  }
);

export default api;
