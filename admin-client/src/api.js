// admin-client/src/api.js
import axios from "axios";

// Create a central API instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://api.qsi.africa/api",
});

// This setup allows our AuthContext to tell the API instance
// what to do when a 401 error happens.
let onUnauthorizedCallback = () => {};

export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

// Add a response interceptor (the global error handler)
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Call the logout function that our context will provide
      onUnauthorizedCallback();
    }
    return Promise.reject(error);
  }
);

export default api;
