// src/pages/register-page.tsx

/**
 * Modern Agent Registration Page with Enhanced UX
 * 
 * Features:
 * - Mobile-first responsive design
 * - Agent-only registration
 * - Real-time validation
 * - Password strength indicator
 * - Progress indicators
 * - Success states with approval flow
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft, 
  FaPhoneAlt, 
  FaExclamationTriangle, 
  FaSpinner,
  FaStore,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import { Button, Card, CardHeader, CardBody, Input, Alert, Container } from '../design-system';
import { useAuth } from '../hooks';
import type { RegisterAgentData } from '../services/auth.service';

export const RegisterPage = () => {
  const { registerAgent } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  // Password validation
  const validatePassword = (password: string, confirmPassword: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const confirmPassword = (document.querySelector('input[name="confirmPassword"]') as HTMLInputElement)?.value || '';
    validatePassword(password, confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    const password = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value || '';
    validatePassword(password, confirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const agentData: RegisterAgentData = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      businessName: formData.get('businessName') as string,
      businessCategory: formData.get('businessCategory') as 'electronics' | 'fashion' | 'food' | 'services' | 'other',
      subscriptionPlan: (formData.get('subscriptionPlan') as 'basic' | 'premium' | 'enterprise') || 'basic',
    };
    
    try {
      await registerAgent(agentData);
      // Navigate to success page
      navigate('/register/success');
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Container>
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <FaPhoneAlt className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-900 hidden sm:block">TelecomSaaS</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8">
        <Card className="w-full max-w-2xl shadow-xl border-0" variant="elevated" size="lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
              <FaStore className="text-blue-600 text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agent Registration
            </h1>
            <p className="text-gray-600">
              Join our platform as a telecom agent and start earning commissions
            </p>
          </CardHeader>

          <CardBody>
            {localError && (
              <Alert status="error" variant="left-accent" className="mb-6">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  {localError}
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    leftIcon={<FaUser className="text-gray-400" />}
                  />
                  
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    leftIcon={<FaEnvelope className="text-gray-400" />}
                  />
                </div>
                
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  leftIcon={<FaPhoneAlt className="text-gray-400" />}
                />
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaBuilding className="mr-2 text-blue-600" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Name"
                    name="businessName"
                    type="text"
                    required
                    placeholder="Enter your business name"
                    leftIcon={<FaBuilding className="text-gray-400" />}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Category
                    </label>
                    <select
                      name="businessCategory"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="electronics">Electronics</option>
                      <option value="fashion">Fashion</option>
                      <option value="food">Food & Beverages</option>
                      <option value="services">Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    name="subscriptionPlan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basic">Basic - Free</option>
                    <option value="premium">Premium - $29/month</option>
                    <option value="enterprise">Enterprise - $99/month</option>
                  </select>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaLock className="mr-2 text-blue-600" />
                  Security
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a strong password"
                      leftIcon={<FaLock className="text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      }
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm your password"
                      leftIcon={<FaLock className="text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      }
                      onChange={handleConfirmPasswordChange}
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h4>
                  <div className="space-y-2">
                    <div className={`flex items-center text-sm ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <FaCheckCircle className={`mr-2 ${passwordValidation.length ? 'text-green-500' : 'text-gray-400'}`} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center text-sm ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <FaCheckCircle className={`mr-2 ${passwordValidation.uppercase ? 'text-green-500' : 'text-gray-400'}`} />
                      One uppercase letter
                    </div>
                    <div className={`flex items-center text-sm ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <FaCheckCircle className={`mr-2 ${passwordValidation.lowercase ? 'text-green-500' : 'text-gray-400'}`} />
                      One lowercase letter
                    </div>
                    <div className={`flex items-center text-sm ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                      <FaCheckCircle className={`mr-2 ${passwordValidation.number ? 'text-green-500' : 'text-gray-400'}`} />
                      One number
                    </div>
                    <div className={`flex items-center text-sm ${passwordValidation.match ? 'text-green-600' : 'text-gray-500'}`}>
                      <FaCheckCircle className={`mr-2 ${passwordValidation.match ? 'text-green-500' : 'text-gray-400'}`} />
                      Passwords match
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <FaShieldAlt className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Important Information:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Your account will be reviewed by a super admin</li>
                      <li>• You will receive an email once approved</li>
                      <li>• After approval, you can log in and start earning</li>
                      <li>• By registering, you agree to our terms of service</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isPasswordValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FaStore className="mr-2" />
                    Register as Agent
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardBody>
        </Card>
      </main>
    </div>
  );
};
