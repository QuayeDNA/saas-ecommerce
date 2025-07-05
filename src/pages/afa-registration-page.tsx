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
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold">AFA Registration</h1>
          <div className="ml-4 text-sm text-gray-500">
            <span className="mx-1">Home</span> &gt;
            <span className="mx-1">Dashboard</span> &gt;
            <span className="mx-1">AFA Registration</span>
          </div>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardBody>
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Registration Completed!</h2>
                <p className="text-gray-600 mb-6">Your AFA registration has been successfully completed.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h3 className="font-semibold mb-3">Registration Details:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">AFA ID:</span>
                    <span className="font-mono">{afaRegistration.afaId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize">{afaRegistration.registrationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Fee:</span>
                    <span>GH¢{afaRegistration.registrationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(afaRegistration.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">AFA Registration</h1>
        <div className="ml-4 text-sm text-gray-500">
          <span className="mx-1">Home</span> &gt;
          <span className="mx-1">Dashboard</span> &gt;
          <span className="mx-1">AFA Registration</span>
        </div>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardBody>
          <h2 className="text-lg font-medium mb-2">Register for AFA</h2>
          <p className="text-gray-600 mb-6">Complete the form below to register a new AFA account.</p>
          
          {error && (
            <Alert status="error" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert status="success" className="mb-4">
              AFA registration completed successfully!
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="registrationType" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border rounded p-4 flex items-start">
                    <input
                      type="radio"
                      id="agent"
                      name="userType"
                      value="agent"
                      checked={formData.userType === 'agent'}
                      onChange={handleUserTypeChange}
                      className="mt-1"
                      disabled={isLoading}
                    />
                    <div className="ml-3">
                      <label htmlFor="agent" className="font-medium">Agent</label>
                      <p className="text-sm text-gray-500">Registration Fee: GH¢3</p>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4 flex items-start">
                    <input
                      type="radio"
                      id="subscriber"
                      name="userType"
                      value="subscriber"
                      checked={formData.userType === 'subscriber'}
                      onChange={handleUserTypeChange}
                      className="mt-1"
                      disabled={isLoading}
                    />
                    <div className="ml-3">
                      <label htmlFor="subscriber" className="font-medium">Subscriber</label>
                      <p className="text-sm text-gray-500">Registration Fee: GH¢5.5</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Submit Registration
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AfaRegistrationPage;
