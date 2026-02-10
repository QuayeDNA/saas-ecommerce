// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody, Badge } from '../design-system';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-accent-50 bg-200% animate-gradient-slow">
      <div className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full mx-4 sm:mx-auto overflow-hidden" variant="elevated" size="lg">
          {/* Top accent bar */}
          <div className="h-2 w-full bg-gradient-to-r from-primary-500 to-secondary-500"></div>
          
          <CardHeader className="text-center pt-8 pb-4">
            <div className="relative mx-auto">
              <div className="absolute inset-0 bg-system-error/20 rounded-full blur-xl transform animate-pulse"></div>
              <div className="relative mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 border-4 border-red-50 shadow-lg">
                <svg className="h-10 w-10 text-system-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <Badge variant="subtle" colorScheme="error" className="mt-4 mb-2 mx-auto">Error 404</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Page Not Found</h2>
          </CardHeader>
          
          <CardBody>
            <div className="text-center mb-8">
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Check the URL or navigate to one of our main pages below.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link to="/" className="block">
                <Button variant="primary" size="lg" fullWidth className="shadow-md hover:shadow-lg transition-all">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Home
                </Button>
              </Link>
              <Link to="/login" className="block">
                <Button 
                  variant="outline"
                  size="lg" 
                  fullWidth
                  className="group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Go to Login
                </Button>
              </Link>
              
              {/* Search box - Optional, can be removed if not needed */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-3">Lost? Try our quick links:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/dashboard" className="px-3 py-1.5 text-xs bg-primary-100 text-primary-800 rounded-full hover:bg-primary-200 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/products" className="px-3 py-1.5 text-xs bg-accent-100 text-accent-800 rounded-full hover:bg-accent-200 transition-colors">
                    Products
                  </Link>
                  <Link to="/support" className="px-3 py-1.5 text-xs bg-secondary-100 text-secondary-800 rounded-full hover:bg-secondary-200 transition-colors">
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
