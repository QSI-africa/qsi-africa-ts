// admin-client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Redirect FLEET_DRIVER to their specific dashboard if they try to access the admin home
  if (user?.role === 'FLEET_DRIVER' && location.pathname === '/') {
    return <Navigate to="/driver-dashboard" replace />;
  }

  // User is authenticated, render the child route
  return <Outlet />;
};

export default ProtectedRoute;