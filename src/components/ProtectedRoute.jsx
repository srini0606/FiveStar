// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, check }) => {
  const { authState } = useAuth();
  const condition = authState[check];

  if (!condition) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
