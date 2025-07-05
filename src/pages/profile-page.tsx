import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '../hooks';
import { Card, CardBody, CardHeader, Button, Badge, Alert } from '../design-system';
import { FaEdit, FaKey, FaUser, FaEnvelope, FaPhone, FaCalendar, FaWallet, FaStore, FaBriefcase } from 'react-icons/fa';
import type { User } from '../types';

export const ProfilePage: React.FC = () => {
  const { authState, logout } = useAuth();
  const { getProfile } = useUser();
  const [profileData, setProfileData] = useState<User | null>(authState.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authState.user) {
        setIsLoading(true);
        try {
          const profile = await getProfile();
          setProfileData(profile);
        } catch (err) {
          setError('Failed to load profile data');
          console.error('Profile fetch error:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [authState.user, getProfile]);

  const getUserTypeColor = (userType: string): "blue" | "green" | "yellow" | "red" | "gray" => {
    switch (userType) {
      case 'agent': return 'blue';
      case 'customer': return 'green';
      case 'super_admin': return 'red';
      default: return 'gray';
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert color="red" className="mb-4">
          Failed to load profile data. Please try refreshing the page.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information and settings
        </p>
      </div>

      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Profile Information</h2>
            </CardHeader>
            <CardBody>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {profileData.fullName.charAt(0)}{profileData.fullName.split(' ')[1]?.charAt(0) ?? ''}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {profileData.fullName}
                  </h3>
                  <div className="flex items-center mt-1">
                    <Badge color={getUserTypeColor(profileData.userType)} className="mr-2">
                      {profileData.userType}
                    </Badge>
                    {profileData.isVerified && (
                      <Badge color="green" variant="outline">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-gray-900 dark:text-white">{profileData.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white">{profileData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white">{profileData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaWallet className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Balance</p>
                      <p className="text-xl font-semibold text-green-600">
                        GH¢{profileData.walletBalance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</p>
                      <p className="text-gray-900 dark:text-white">
                        {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent-specific information */}
              {profileData.userType === 'agent' && (
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-md font-semibold mb-4 flex items-center">
                    <FaStore className="mr-2" />
                    Business Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</p>
                      <p className="text-gray-900 dark:text-white">{profileData.businessName ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Category</p>
                      <p className="text-gray-900 dark:text-white capitalize">{profileData.businessCategory ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Plan</p>
                      <Badge color="blue" className="mt-1">
                        {profileData.subscriptionPlan ?? 'Basic'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Status</p>
                      <Badge 
                        color={profileData.subscriptionStatus === 'active' ? 'green' : 'yellow'} 
                        className="mt-1"
                      >
                        {profileData.subscriptionStatus ?? 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* AFA Registration Info */}
              {profileData.afaRegistration && (
                <div className="border-t pt-6 mt-6">
                  <h4 className="text-md font-semibold mb-4 flex items-center">
                    <FaBriefcase className="mr-2" />
                    AFA Registration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AFA ID</p>
                      <p className="text-gray-900 dark:text-white font-mono">{profileData.afaRegistration.afaId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Type</p>
                      <p className="text-gray-900 dark:text-white capitalize">{profileData.afaRegistration.registrationType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Fee</p>
                      <p className="text-gray-900 dark:text-white">GH¢{profileData.afaRegistration.registrationFee?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <Badge 
                        color={profileData.afaRegistration.status === 'completed' ? 'green' : 'yellow'} 
                        className="mt-1"
                      >
                        {profileData.afaRegistration.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Actions Card */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button 
                variant="outline" 
                fullWidth
                leftIcon={<FaEdit />}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                fullWidth
                leftIcon={<FaKey />}
              >
                Change Password
              </Button>
              <div className="border-t pt-3 mt-3">
                <Button 
                  color="red"
                  variant="outline"
                  fullWidth
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Support Card */}
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Support & Community</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Need help? Contact support</p>
                <p className="font-medium text-gray-900 dark:text-white">+233 55 987 6543</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Join our community</p>
                <a 
                  href="https://t.me/ecommerce-group" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Telegram Group Link
                </a>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
