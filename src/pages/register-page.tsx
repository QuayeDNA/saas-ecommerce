// src/pages/register-page.tsx

/**
 * Modern Registration Page with Enhanced UX
 * 
 * Features:
 * - Mobile-first responsive design
 * - Multi-step registration flow
 * - Real-time validation
 * - Password strength indicator
 * - Clear user type selection
 * - Progress indicators
 * - Success states with agent code display
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
  FaCheck,
  FaCopy,
  FaStore,
  FaUsers,
} from 'react-icons/fa';
import { Button, Card, CardHeader, CardBody, Input, Alert, Container } from '../design-system';
import { useAuth } from '../hooks';
import type { RegisterAgentData, RegisterCustomerData } from '../services/auth.service';

type RegistrationType = 'agent' | 'customer';

export const RegisterPage = () => {
  const { authState, registerAgent, registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('customer');
  const [agentCode, setAgentCode] = useState<string>('');
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
    
    const commonData = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
    };
    
    try {
      if (registrationType === 'agent') {
        const agentData: RegisterAgentData = {
          ...commonData,
          businessName: formData.get('businessName') as string,
          businessCategory: formData.get('businessCategory') as 'electronics' | 'fashion' | 'food' | 'services' | 'other',
          subscriptionPlan: (formData.get('subscriptionPlan') as 'basic' | 'premium' | 'enterprise') || 'basic',
        };
        
        const result = await registerAgent(agentData);
        setAgentCode(result.agentCode);
      } else {
        const customerData: RegisterCustomerData = {
          ...commonData,
          agentCode: formData.get('agentCode') as string || undefined,
        };
        
        await registerCustomer(customerData);
        navigate('/login');
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAgentCode = async () => {
    if (agentCode) {
      await navigator.clipboard.writeText(agentCode);
      // You could add a toast notification here
    }
  };

  // Show agent code success screen
  if (agentCode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-100">
        <div className="flex-grow flex items-center justify-center px-4 sm:px-6">
          <Card className="w-full max-w-lg shadow-xl border-0" variant="elevated" size="lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Registration Submitted!
              </h1>
              <p className="text-gray-600">
                Your agent account is pending approval by a super admin.<br/>
                You will be notified by email once your account is approved and you can then log in.
              </p>
            </CardHeader>
            <CardBody className="text-center pt-0">
              <div className="space-y-4 mb-6">
                <Alert status="info" variant="left-accent">
                  <div className="text-sm">
                    <div className="font-medium">What happens next?</div>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-left">
                      <li>Your registration will be reviewed by a super admin.</li>
                      <li>You will receive an email once your account is approved.</li>
                      <li>After approval, you can log in and start using your agent dashboard.</li>
                    </ol>
                  </div>
                </Alert>
              </div>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="primary" size="lg" fullWidth>
                    Back to Login
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" fullWidth>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
  
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

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl border-0" variant="elevated" size="lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
                <FaUser className="text-blue-600 text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </CardHeader>
            
            <CardBody className="pt-0">
              {/* Registration Type Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose your account type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('customer')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      registrationType === 'customer'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaUsers className={`text-2xl mx-auto mb-2 ${
                      registrationType === 'customer' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="font-semibold text-gray-900">Customer</div>
                    <div className="text-sm text-gray-600">Buy airtime & data</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRegistrationType('agent')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      registrationType === 'agent'
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FaStore className={`text-2xl mx-auto mb-2 ${
                      registrationType === 'agent' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="font-semibold text-gray-900">Agent</div>
                    <div className="text-sm text-gray-600">Sell & earn commissions</div>
                  </button>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {(localError || authState.error) && (
                  <Alert 
                    status="error" 
                    variant="left-accent"
                    className="flex items-start"
                  >
                    <FaExclamationTriangle className="mt-0.5 mr-3 flex-shrink-0 text-red-500" />
                    <div>
                      <div className="font-medium text-red-800">Registration Failed</div>
                      <div className="text-red-700 text-sm mt-1">
                        {localError ?? authState.error}
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="233XXXXXXXXX"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Agent-specific fields */}
                  {registrationType === 'agent' && (
                    <>
                      <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <Input
                          id="businessName"
                          name="businessName"
                          type="text"
                          required
                          placeholder="Enter your business name"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700 mb-2">
                          Business Category
                        </label>
                        <select
                          id="businessCategory"
                          name="businessCategory"
                          required
                          disabled={isSubmitting}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select category</option>
                          <option value="electronics">Electronics</option>
                          <option value="fashion">Fashion</option>
                          <option value="food">Food & Beverages</option>
                          <option value="services">Services</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Customer-specific fields */}
                  {registrationType === 'customer' && (
                    <div>
                      <label htmlFor="agentCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Code <span className="text-gray-500">(Optional)</span>
                      </label>
                      <Input
                        id="agentCode"
                        name="agentCode"
                        type="text"
                        placeholder="Enter agent code to support them"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Have an agent code? Enter it to support your agent with commissions.
                      </p>
                    </div>
                  )}

                  {/* Password Fields */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder="Create a strong password"
                        className="pr-12"
                        disabled={isSubmitting}
                        onChange={handlePasswordChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>

                    {/* Password strength indicators */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-xs space-x-4">
                        <div className={`flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                          <FaCheck className="mr-1" size={10} />
                          8+ characters
                        </div>
                        <div className={`flex items-center ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                          <FaCheck className="mr-1" size={10} />
                          Uppercase
                        </div>
                        <div className={`flex items-center ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                          <FaCheck className="mr-1" size={10} />
                          Lowercase
                        </div>
                        <div className={`flex items-center ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                          <FaCheck className="mr-1" size={10} />
                          Number
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        placeholder="Confirm your password"
                        className="pr-12"
                        disabled={isSubmitting}
                        onChange={handleConfirmPasswordChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {passwordValidation.match && (
                      <div className="flex items-center text-xs text-green-600 mt-1">
                        <FaCheck className="mr-1" size={10} />
                        Passwords match
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting || authState.isLoading}
                  leftIcon={
                    (isSubmitting || authState.isLoading) ? (
                      <FaSpinner className="animate-spin" />
                    ) : undefined
                  }
                >
                  {isSubmitting || authState.isLoading 
                    ? 'Creating account...' 
                    : `Create ${registrationType} account`
                  }
                </Button>

                {/* Support */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">
                    Need help getting started?
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                    <a 
                      href="tel:+233559876543" 
                      className="text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      📞 +233 55 987 6543
                    </a>
                    <a 
                      href="https://t.me/telecomsaas" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      📱 Join our Telegram
                    </a>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
