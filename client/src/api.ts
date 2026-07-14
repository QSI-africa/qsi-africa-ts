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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor to handle 401 errors (e.g., expired token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401) {
      const url = originalRequest?.url || "";
      const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register-user") || url.includes("/auth/refresh");
      
      if (!isAuthEndpoint && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
            const newToken = data.token;
            const newRefreshToken = data.refreshToken;
            
            localStorage.setItem("token", newToken);
            if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
            
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            
            processQueue(null, newToken);
            isRefreshing = false;
            
            return api(originalRequest);
          } catch (err: any) {
            processQueue(err, null);
            isRefreshing = false;
            onUnauthorizedCallback();
            window.location.href = "/login";
            return Promise.reject(err);
          }
        } else {
          isRefreshing = false;
          onUnauthorizedCallback();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
