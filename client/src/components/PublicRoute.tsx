// client/src/components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

const PublicRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

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

  // console.log("isAuthenticated", isAuthenticated);

  // if (isAuthenticated) {
  //   // User is authenticated, redirect them away from public pages
  //   return <Navigate to="/" replace />;
  // }

  // User is not authenticated, render the child (e.g., LoginPage, RegisterPage)
  return <Outlet />;
};

export default PublicRoute;
