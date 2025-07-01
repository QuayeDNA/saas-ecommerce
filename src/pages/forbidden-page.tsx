// src/pages/ForbiddenPage.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Button, Card, CardHeader, CardBody, Badge } from '../design-system';

export const ForbiddenPage = () => {
  const { authState, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-accent-50 bg-200% animate-gradient-slow">
      <div className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full mx-4 sm:mx-auto overflow-hidden" variant="elevated" size="lg">
          {/* Top accent bar */}
          <div className={`h-2 w-full bg-gradient-to-r from-system-warning to-system-error`}></div>
          
          <CardHeader className="text-center pt-8 pb-4">
            <div className="relative mx-auto">
              <div className="absolute inset-0 bg-system-warning/20 rounded-full blur-xl transform animate-pulse"></div>
              <div className="relative mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 border-4 border-yellow-50 shadow-lg">
                <svg className="h-10 w-10 text-system-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <Badge variant="subtle" colorScheme="warning" className="mt-4 mb-2 mx-auto">Error 403</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Access Forbidden</h2>
          </CardHeader>
          
          <CardBody className="pb-8 px-6">
            <div className="text-center mb-8">
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Your current permissions don't allow access to this resource.
              </p>
            </div>
            
            <div className="space-y-4 flex flex-col items-center">
              {authState.dashboardUrl && (
                <Link to={authState.dashboardUrl} className="block">
                  <Button variant="primary" size="lg" fullWidth className="shadow-md hover:shadow-lg transition-all">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Go to Dashboard
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline"
                size="lg" 
                fullWidth
                className="group"
                onClick={() => logout()}
              >
                <svg className="w-5 h-5 mr-2 text-system-error group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-3">Need help? Contact support:</p>
                <div className="flex justify-center">
                  <Button 
                    variant="ghost"
                    size="sm" 
                    className="text-xs flex items-center text-accent-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@telepay.example.com
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
