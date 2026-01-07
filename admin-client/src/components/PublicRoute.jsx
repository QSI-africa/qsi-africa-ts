// admin-client/src/components/PublicRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * A route guard component.
 * If the user IS authenticated, it redirects them away from the child route (e.g., login page)
 * to the main dashboard ('/').
 * If the user IS NOT authenticated, it renders the child route (e.g., LoginPage).
 */
const PublicRoute = () => {
  const { isAuthenticated } = useAuth(); // Get authentication status from context

  if (isAuthenticated) {
    // User is logged in, redirect them away from the public route (e.g., /login)
    // The 'replace' prop prevents adding the login page to the browser history
    return <Navigate to="/" replace />;
  }

  // User is not logged in, allow access to the child route (e.g., LoginPage)
  return <Outlet />;
};

export default PublicRoute;
