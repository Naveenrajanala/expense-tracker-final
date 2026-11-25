import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role = 'user' }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner-card">
          <div className="spinner-ring" />
          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (role === 'admin') {
    if (!isAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    if (!currentUser) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
