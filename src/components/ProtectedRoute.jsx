import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="full-page-loader">
        <span className="spinner" aria-hidden="true" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the path the user was trying to reach
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
