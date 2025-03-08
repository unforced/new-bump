import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that protects routes by checking if the user is authenticated.
 * If the user is not authenticated, they are redirected to the Auth page.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to Auth page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 