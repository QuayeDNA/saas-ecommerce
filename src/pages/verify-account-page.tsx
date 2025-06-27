// src/pages/VerifyAccountPage.tsx
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState, useEffect } from 'react';
import { Button, Alert, Card, CardHeader, CardBody } from '../design-system';

export const VerifyAccountPage = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyAccount } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userType, setUserType] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setVerificationError('Invalid verification link');
      setIsVerifying(false);
      return;
    }

    const performVerification = async () => {
      try {
        const result = await verifyAccount(token);
        setUserType(result.userType);
        setIsSuccess(true);
      } catch (error) {
        setVerificationError(error instanceof Error ? error.message : 'Verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    performVerification();
  }, [token, verifyAccount]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md w-full" variant="elevated" size="lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Verifying your account</h2>
            </CardHeader>
            
            <CardBody>
              <p className="text-center text-sm text-gray-600">
                Please wait while we verify your account...
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md w-full" variant="elevated" size="lg">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Account verified!</h2>
            </CardHeader>
            
            <CardBody>
              <p className="text-center text-sm text-gray-600 mb-6">
                Your {userType} account has been successfully verified. You can now log in and start using the platform.
              </p>
              <Link to="/login">
                <Button variant="primary" colorScheme="default" size="lg" fullWidth>
                  Go to Login
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-gray-900">Verification failed</h2>
          </CardHeader>
          
          <CardBody>
            {verificationError && (
              <Alert status="error" variant="left-accent" className="mb-6">
                {verificationError}
              </Alert>
            )}
            
            <p className="text-center text-sm text-gray-600 mb-6">
              The verification link may be invalid or expired. Please try registering again or contact support.
            </p>
            
            <div className="space-y-3">
              <Link to="/register">
                <Button variant="primary" colorScheme="default" size="lg" fullWidth>
                  Register Again
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" colorScheme="default" size="lg" fullWidth>
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
