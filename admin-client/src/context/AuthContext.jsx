// admin-client/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Spin } from "antd";
import api, { setOnUnauthorizedCallback } from "../api"; // <-- Import our new api instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // Start loading, must verify token

  // We define logout first, wrapped in useCallback to prevent re-renders
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  // On mount, tell our api instance to call logout() whenever it gets a 401
  useEffect(() => {
    setOnUnauthorizedCallback(() => logout());
  }, [logout]);

  // This effect runs once on app load to verify an existing token
  useEffect(() => {
    const verifyToken = async (tokenToVerify) => {
      try {
        // Set the header for our verification call
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenToVerify}`;

        // Make the API call to our new /auth/me endpoint
        const response = await api.get("/auth/me");

        // Token is valid! Set the user from the API response.
        setUser(response.data);
      } catch (e) {
        console.error("Token verification failed", e);
        // The token was invalid (expired, etc.). Log the user out.
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken(token);
    } else {
      setLoading(false); // No token, just stop loading
    }
  }, [token, logout]);

  const login = async (email, password) => {
    // Use the central 'api' instance
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setToken(token);
    setUser(user);
    return user;
  };

  const value = {
    user,
    token,
    login,
    logout,
    // Base authentication on the *user object*, not just the presence of a token
    isAuthenticated: !!user,
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
