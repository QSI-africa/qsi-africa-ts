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
export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Interceptor to handle 401 errors (e.g., expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register-user");
      if (!isAuthEndpoint) {
        onUnauthorizedCallback();
        window.location.href = "/login";
        return new Promise(() => {}); // Halt the promise chain to prevent page catch blocks from showing pop-up errors
      }
    }
    return Promise.reject(error);
  }
);

export default api;
