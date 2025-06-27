import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState, useEffect } from 'react';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../design-system';
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle 
} from 'react-icons/fa';

export const LoginPage = () => {
  const { authState, login, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.dashboardUrl) {
      navigate(authState.dashboardUrl);
    }
  }, [authState, navigate]);

  // Clear errors on mount
  useEffect(() => {
    clearErrors();
    setLocalError(null);
  }, [clearErrors]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    clearErrors();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('remember_me') === 'on';
    
    try {
      await login(email, password, rememberMe);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Login failed');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6">      
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaLock className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
                Sign up now
              </Link>
            </p>
          </CardHeader>
          
          <CardBody>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {(localError || authState.error) && (
                <Alert 
                  status="error" 
                  variant="left-accent"
                  className="flex items-start"
                >
                  <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>{localError ?? authState.error}</span>
                </Alert>
              )}
            
              <div className="space-y-4">
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
                
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  autoComplete="current-password"
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
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={authState.isLoading}
                isLoading={authState.isLoading}
                variant="primary"
                colorScheme="default"
                size="lg"
                fullWidth
                className="mt-4"
              >
                {authState.isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 transition">
                  ← Back to home
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
