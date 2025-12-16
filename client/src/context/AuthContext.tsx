// client/src/context/AuthContext.jsx
import React, { createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
 } from 'react';
import { Spin } from "antd";
import api, { setOnUnauthorizedCallback } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  const refetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
        const response = await api.get("/auth/me"); // Get updated user data
        setUser(response.data);
      } catch (e) {
        console.error("Token refetch failed", e);
        logout(); // Token is invalid
      }
    }
  }, [logout]);

  useEffect(() => {
    setOnUnauthorizedCallback(() => logout());
  }, [logout]);

  useEffect(() => {
    const verifyToken = async (tokenToVerify) => {
      try {
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenToVerify}`;
        const response = await api.get("/auth/me"); // Verify token
        setUser(response.data); // Set user data (id, email, role)
      } catch (e) {
        console.error("Token verification failed", e);
        logout(); // Token is invalid
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register-user", {
      name,
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
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    refetchUser,
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
