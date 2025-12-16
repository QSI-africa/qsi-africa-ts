// client/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // We need to update AuthContext to fetch the user *with* their profile
  // Add this check once the context is updated
  if (user && !user.frequencyProfile) {
    // User is logged in but hasn't onboarded
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated (and presumably onboarded)
  return <Outlet />;
};

export default ProtectedRoute;
