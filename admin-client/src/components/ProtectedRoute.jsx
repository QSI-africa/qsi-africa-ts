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

  // Strict guard: Block GENERAL_USER and CLIENT from accessing the admin portal
  const restrictedRoles = ['GENERAL_USER', 'CLIENT'];
  if (user?.role && restrictedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '100px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <h2 style={{ color: '#ff4d4f', fontSize: '24px', marginBottom: '16px' }}>Access Denied</h2>
        <p style={{ color: '#595959', marginBottom: '24px' }}>Your account ({user.role}) does not have permission to access the admin portal.</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.href='/login'; }}
          style={{ padding: '8px 24px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign Out & Return to Login
        </button>
      </div>
    );
  }

  // User is authenticated and allowed, render the child route
  return <Outlet />;
};

export default ProtectedRoute;