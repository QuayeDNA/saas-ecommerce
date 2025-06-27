import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState } from 'react';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../design-system';
import { FaEnvelope, FaArrowLeft, FaCheck, FaExclamationTriangle, FaLock } from 'react-icons/fa';

export const ForgotPasswordPage = () => {
  const { authState, forgotPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6">
      <div className="mb-4">
        <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition">
          <FaArrowLeft className="mr-1" />
          Back to Login
        </Link>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaLock className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Enter your email and we'll send you a reset link
            </p>
          </CardHeader>
          
          <CardBody>
            {isSubmitted ? (
              <div className="text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-gray-500 text-sm">
                  We've sent a password reset link to your email address.
                </p>
                <div className="mt-6">
                  <Link to="/login">
                    <Button variant="primary" colorScheme="default" size="md" fullWidth>
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {authState.error && (
                  <Alert 
                    status="error" 
                    variant="left-accent"
                    className="flex items-start"
                  >
                    <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                    <span>{authState.error}</span>
                  </Alert>
                )}
                
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email address"
                    autoComplete="email"
                    required
                    placeholder="your@email.com"
                    size="md"
                    variant="outline"
                    colorScheme="default"
                    fullWidth
                    leftIcon={<FaEnvelope className="text-gray-400" />}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={authState.isLoading}
                  isLoading={authState.isLoading}
                  variant="primary"
                  colorScheme="default"
                  size="lg"
                  fullWidth
                >
                  {authState.isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
                
                <div className="mt-4 text-center text-sm text-gray-600">
                  <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 transition">
                    ← Back to home
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
