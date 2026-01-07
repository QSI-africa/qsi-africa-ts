// admin-client/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child route
  return <Outlet />;
};

export default ProtectedRoute;