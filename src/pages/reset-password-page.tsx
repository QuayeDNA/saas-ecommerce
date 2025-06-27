import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState, useEffect } from 'react';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../design-system';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { authState, resetPassword } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const validatePassword = (password: string, confirmPassword: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    const error = validatePassword(password, confirmPassword);
    if (error) {
      setPasswordError(error);
      return;
    }
    
    if (token) {
      try {
        await resetPassword(token, password);
        setIsSuccess(true);
      } catch (error) {
        console.error('Password reset failed:', error);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6">
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md" variant="elevated" size="lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Password reset successful!</h2>
            </CardHeader>
            
            <CardBody>
              <p className="text-center text-gray-600 mb-6">
                You can now log in with your new password.
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
            <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Create a strong password for your account
            </p>
          </CardHeader>
          
          <CardBody>
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
              
              {passwordError && (
                <Alert 
                  status="error" 
                  variant="left-accent"
                  className="flex items-start"
                >
                  <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>{passwordError}</span>
                </Alert>
              )}
              
              <div className="space-y-4">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="New Password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaLock className="text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                  helperText="Min 6 chars with uppercase, lowercase, and number"
                />
                
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm New Password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaLock className="text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                  helperText="Both passwords must match"
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
                {authState.isLoading ? 'Resetting...' : 'Reset password'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
