import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function PrivateRoute({ children, adminOnly = false }) {
  const { token, user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists but user state is decoding, show loading
  if (adminOnly && token && user === null) {
    return <LoadingSpinner text="Đang xác thực thông tin..." />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
