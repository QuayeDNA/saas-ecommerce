// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { PageLoader } from './page-loader';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  allowedUserTypes?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  allowedUserTypes = [],
  redirectTo = '/login',
  requireAuth = true
}: ProtectedRouteProps) => {
  const { authState, refreshAuth } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);

  // Verify auth state when component mounts
  useEffect(() => {
    const verifyAuthState = async () => {
      if (authState.isInitialized && !authState.isAuthenticated && authState.isAuthenticated !== false) {
        setIsVerifying(true);
        try {
          await refreshAuth();
            } catch (error) {
      // Auth verification failed
    } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyAuthState();
  }, [authState.isAuthenticated, authState.isInitialized, refreshAuth]);

  // Show loading while auth is initializing or verifying
  if (!authState.isInitialized || authState.isLoading || isVerifying) {
    return <PageLoader />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !authState.isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // If user type restrictions exist, check them
  if (authState.isAuthenticated && authState.user && allowedUserTypes.length > 0) {
    if (!allowedUserTypes.includes(authState.user.userType)) {
      let dashboardUrl = "/";
      if (authState.user.userType === 'super_admin') {
        dashboardUrl = '/superadmin';
      } else if (authState.user.userType === 'agent') {
        dashboardUrl = '/agent/dashboard';
      } else {
        dashboardUrl = '/customer/dashboard';
      }
      return <Navigate to={dashboardUrl} replace />;
    }
  }

  return <Outlet />;
};


// Additional component for public routes (login, register, etc.)
export const PublicRoute = ({ redirectTo }: { redirectTo?: string }) => {
  const { authState } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!authState.isInitialized) {
    return <PageLoader />;
  }

  // If user is authenticated, redirect to dashboard or intended page
  if (authState.isAuthenticated && authState.user) {
    const from = (location.state)?.from?.pathname;
    let defaultDashboard = "/";
    if (authState.user.userType === 'super_admin') {
      defaultDashboard = '/superadmin';
    } else if (authState.user.userType === 'agent') {
      defaultDashboard = '/agent/dashboard';
    } else {
      defaultDashboard = '/customer/dashboard';
    }
    const destination = redirectTo ?? from ?? defaultDashboard;
    return <Navigate to={destination} replace />;
  }

  // If not authenticated, render the public route
  return <Outlet />;
};

// Route wrapper for role-based access
export const RoleBasedRoute = ({ 
  allowedRoles, 
  fallbackComponent: FallbackComponent,
  children 
}: { 
  allowedRoles: string[];
  fallbackComponent?: React.ComponentType;
  children: React.ReactNode;
}) => {
  const { authState } = useAuth();

  if (!authState.isInitialized) {
    return <PageLoader />;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (authState.user && !allowedRoles.includes(authState.user.userType)) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    
    // Redirect to user's appropriate dashboard
    const dashboardUrl = authState.user.userType === 'agent' 
      ? '/agent/dashboard' 
      : '/customer/dashboard';
    
    return <Navigate to={dashboardUrl} replace />;
  }

  return <>{children}</>;
};