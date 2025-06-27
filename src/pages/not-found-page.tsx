// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody } from '../design-system';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <span className="text-2xl font-bold text-red-600">404</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Page not found</h2>
          </CardHeader>
          
          <CardBody>
            <p className="text-center text-sm text-gray-600 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="space-y-3">
              <Link to="/">
                <Button variant="primary" colorScheme="default" size="lg" fullWidth>
                  Go to Home
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" colorScheme="default" size="lg" fullWidth>
                  Go to Login
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
