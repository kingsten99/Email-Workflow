import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const user = localStorage.getItem('user');

  // Check if user is authenticated and has valid user data
  if (!isAuthenticated || !user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  try {
    // Verify that user data is valid JSON
    const userData = JSON.parse(user);
    if (!userData.id || !userData.name) {
      // Clear invalid data and redirect to login
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Clear corrupted data and redirect to login
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;