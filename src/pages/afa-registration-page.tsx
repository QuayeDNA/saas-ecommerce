import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks';
import { Button, Card, CardBody, Input, Alert } from '../design-system';
import type { AfaRegistrationData, AfaRegistration } from '../services/user.service';

export const AfaRegistrationPage: React.FC = () => {
  const { submitAfaRegistration, getAfaRegistration, isLoading } = useUser();
  const [formData, setFormData] = useState<AfaRegistrationData>({
    fullName: '',
    phone: '',
    userType: 'subscriber',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [afaRegistration, setAfaRegistration] = useState<AfaRegistration | null>(null);

  useEffect(() => {
    // Check if user already has AFA registration
    const checkAfaStatus = async () => {
      try {
        const registration = await getAfaRegistration();
        if (registration) {
          setAfaRegistration(registration);
        }
      } catch (err) {
        console.error('Failed to check AFA status:', err);
      }
    };

    checkAfaStatus();
  }, [getAfaRegistration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const result = await submitAfaRegistration(formData);
      setAfaRegistration(result);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Registration failed'
        : 'Registration failed';
      setError(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      userType: e.target.value as 'agent' | 'subscriber'
    }));
  };

  if (afaRegistration?.status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AFA Registration</h1>
                <p className="text-gray-600 mt-1">Complete your AFA registration process</p>
              </div>
              <div className="text-sm text-gray-500 hidden sm:block">
                <span className="mx-1">Home</span> &gt;
                <span className="mx-1">Dashboard</span> &gt;
                <span className="mx-1">AFA Registration</span>
              </div>
            </div>
          </div>
          
          {/* Success Card */}
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardBody className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-2 sm:mb-3">Registration Completed!</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Your AFA registration has been successfully completed.</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 text-left">
                    <h3 className="font-semibold mb-4 text-gray-900">Registration Details:</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-gray-600 text-sm sm:text-base">AFA ID:</span>
                        <span className="font-mono text-sm sm:text-base font-medium">{afaRegistration.afaId}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-gray-600 text-sm sm:text-base">Type:</span>
                        <span className="capitalize text-sm sm:text-base font-medium">{afaRegistration.registrationType}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-gray-600 text-sm sm:text-base">Registration Fee:</span>
                        <span className="text-sm sm:text-base font-medium">GH¢{afaRegistration.registrationFee}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="text-gray-600 text-sm sm:text-base">Date:</span>
                        <span className="text-sm sm:text-base font-medium">{new Date(afaRegistration.registrationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AFA Registration</h1>
              <p className="text-gray-600 mt-1">Complete your AFA registration process</p>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              <span className="mx-1">Home</span> &gt;
              <span className="mx-1">Dashboard</span> &gt;
              <span className="mx-1">AFA Registration</span>
            </div>
          </div>
        </div>
        
        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardBody className="p-6 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Register for AFA</h2>
                <p className="text-gray-600 text-sm sm:text-base">Complete the form below to register a new AFA account.</p>
              </div>
              
              {error && (
                <Alert status="error" className="mb-6">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert status="success" className="mb-6">
                  AFA registration completed successfully!
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6 sm:space-y-8">
                  {/* Full Name Field */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Phone Number Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Registration Type Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                      Registration Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className={`border-2 rounded-lg p-4 sm:p-6 transition-all duration-200 cursor-pointer ${
                        formData.userType === 'agent' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            id="agent"
                            name="userType"
                            value="agent"
                            checked={formData.userType === 'agent'}
                            onChange={handleUserTypeChange}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                            disabled={isLoading}
                          />
                          <div className="flex-1">
                            <label htmlFor="agent" className="font-medium text-gray-900 text-sm sm:text-base cursor-pointer">
                              Agent
                            </label>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">Registration Fee: GH¢3</p>
                            <p className="text-gray-400 text-xs mt-1">For business agents and resellers</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`border-2 rounded-lg p-4 sm:p-6 transition-all duration-200 cursor-pointer ${
                        formData.userType === 'subscriber' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            id="subscriber"
                            name="userType"
                            value="subscriber"
                            checked={formData.userType === 'subscriber'}
                            onChange={handleUserTypeChange}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                            disabled={isLoading}
                          />
                          <div className="flex-1">
                            <label htmlFor="subscriber" className="font-medium text-gray-900 text-sm sm:text-base cursor-pointer">
                              Subscriber
                            </label>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">Registration Fee: GH¢5.5</p>
                            <p className="text-gray-400 text-xs mt-1">For individual users</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4 sm:pt-6">
                    <Button
                      type="submit"
                      className="w-full py-3 sm:py-4 text-base sm:text-lg font-medium"
                      disabled={isLoading}
                      isLoading={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Submit Registration'}
                    </Button>
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

export default AfaRegistrationPage;
