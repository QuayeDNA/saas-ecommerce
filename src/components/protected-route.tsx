// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { PageLoader } from './page-loader';

interface ProtectedRouteProps {
  allowedUserTypes?: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  allowedUserTypes = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!authState.isInitialized) {
    return <PageLoader />;
  }

  // If not authenticated, redirect to login with return URL
  if (!authState.isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user type restrictions exist, check them
  if (allowedUserTypes.length > 0 && authState.user) {
    if (!allowedUserTypes.includes(authState.user.userType)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};
