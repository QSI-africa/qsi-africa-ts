// client/src/components/OnboardingRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin } from "antd";

const OnboardingRoute: React.FC = () => {
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
    // User not authenticated, cannot onboard, send to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // user.frequencyProfile is included from the /api/auth/me backend call
  if (user && user.frequencyProfile) {
    // User is authenticated AND already onboarded, redirect away
    return <Navigate to="/" replace />;
  }

  // User is authenticated and does NOT have a profile, show the OnboardingPage
  return <Outlet />;
};

export default OnboardingRoute;
