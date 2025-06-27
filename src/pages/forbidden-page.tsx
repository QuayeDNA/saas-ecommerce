// src/pages/ForbiddenPage.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Button, Card, CardHeader, CardBody } from '../design-system';

export const ForbiddenPage = () => {
  const { authState, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Access Forbidden</h2>
          </CardHeader>
          
          <CardBody>
            <p className="text-center text-sm text-gray-600 mb-6">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            
            <div className="space-y-3">
              {authState.dashboardUrl && (
                <Link to={authState.dashboardUrl}>
                  <Button variant="primary" colorScheme="default" size="lg" fullWidth>
                    Go to Dashboard
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                colorScheme="default" 
                size="lg" 
                fullWidth
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
