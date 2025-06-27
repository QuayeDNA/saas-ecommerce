import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useState } from 'react';
import { Button, Input, Alert, Card, CardHeader, CardBody } from '../design-system';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, 
  FaBriefcase, FaCheck, FaExclamationTriangle 
} from 'react-icons/fa';

type RegistrationType = 'agent' | 'customer';

export const RegisterPage = () => {
  const { authState, registerAgent, registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('customer');
  const [agentCode, setAgentCode] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const commonData = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
    };
    
    try {
      if (registrationType === 'agent') {
        const agentData = {
          ...commonData,
          businessName: formData.get('businessName') as string,
          businessCategory: formData.get('businessCategory') as 'electronics' | 'fashion' | 'food' | 'services' | 'other',
          subscriptionPlan: (formData.get('subscriptionPlan') as 'basic' | 'premium' | 'enterprise') || 'basic',
        };
        
        const result = await registerAgent(agentData);
        setAgentCode(result.agentCode);
      } else {
        const customerData = {
          ...commonData,
          agentCode: formData.get('agentCode') as string || undefined,
        };
        
        await registerCustomer(customerData);
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Show agent code success screen
  if (agentCode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6">
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-lg" variant="elevated" size="lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Agent Account Created!</h2>
            </CardHeader>
            
            <CardBody className="text-center">
              <p className="text-gray-600 mb-4">
                Please check your email for verification instructions.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Your Agent Code</h3>
                <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-3 font-mono text-xl font-bold text-blue-600">
                  {agentCode}
                </div>
                <p className="text-blue-700 mt-2 text-sm">
                  Share this code with customers to register under your business
                </p>
              </div>
              
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
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-lg" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaUser className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">
                Sign in now
              </Link>
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
              
              {/* Registration Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('customer')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      registrationType === 'customer'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Customer</div>
                    <div className="text-sm text-gray-500">Shop and buy products</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRegistrationType('agent')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      registrationType === 'agent'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Business Agent</div>
                    <div className="text-sm text-gray-500">Manage your business</div>
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Common Fields */}
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  label="Full Name"
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaUser className="text-gray-400" />}
                />
                
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
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  autoComplete="tel"
                  required
                  placeholder="+1234567890"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaPhone className="text-gray-400" />}
                />
                
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
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

                {/* Agent-specific fields */}
                {registrationType === 'agent' && (
                  <>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      label="Business Name"
                      required
                      placeholder="Your business name"
                      size="md"
                      variant="outline"
                      colorScheme="default"
                      fullWidth
                      leftIcon={<FaBriefcase className="text-gray-400" />}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Category
                      </label>
                      <select
                        name="businessCategory"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a category</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="food">Food & Beverage</option>
                        <option value="services">Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subscription Plan
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'basic', label: 'Basic', price: 'Free' },
                          { value: 'premium', label: 'Premium', price: '$29/mo' },
                          { value: 'enterprise', label: 'Enterprise', price: '$99/mo' }
                        ].map((plan) => (
                          <label key={plan.value} className="relative">
                            <input
                              type="radio"
                              name="subscriptionPlan"
                              value={plan.value}
                              defaultChecked={plan.value === 'basic'}
                              className="sr-only peer"
                            />
                            <div className="p-3 border-2 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50">
                              <div className="text-sm font-medium">{plan.label}</div>
                              <div className="text-xs text-gray-500">{plan.price}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Customer-specific fields */}
                {registrationType === 'customer' && (
                  <Input
                    id="agentCode"
                    name="agentCode"
                    type="text"
                    label="Agent Code (Optional)"
                    placeholder="Enter agent code if you have one"
                    size="md"
                    variant="outline"
                    colorScheme="default"
                    fullWidth
                    leftIcon={<FaUser className="text-gray-400" />}
                    helperText="Get this code from your business agent"
                  />
                )}
              </div>
              
              <Button
                type="submit"
                disabled={authState.isLoading}
                isLoading={authState.isLoading}
                variant="primary"
                colorScheme="default"
                size="lg"
                fullWidth
                className="mt-2"
              >
                {authState.isLoading 
                  ? 'Creating account...' 
                  : `Create ${registrationType} account`
                }
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
