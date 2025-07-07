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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex justify-center items-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <Alert status="error" className="mb-4">
            Failed to load profile data. Please try refreshing the page.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                My Profile
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage your account information and settings
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert status="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="p-4 sm:p-6 pb-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile Information</h2>
              </CardHeader>
              <CardBody className="p-4 sm:p-6 pt-0">
                {/* Profile Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg mx-auto sm:mx-0">
                    {profileData.fullName.charAt(0)}{profileData.fullName.split(' ')[1]?.charAt(0) ?? ''}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                      {profileData.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Badge color={getUserTypeColor(profileData.userType)}>
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

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
                        <p className="text-gray-900 font-medium">{profileData.fullName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                        <p className="text-gray-900 font-medium break-all">{profileData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaPhone className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                        <p className="text-gray-900 font-medium">{profileData.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaWallet className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Wallet Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                          GH¢{profileData.walletBalance?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaCalendar className="text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Member Since</p>
                        <p className="text-gray-900 font-medium">
                          {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent-specific information */}
                {profileData.userType === 'agent' && (
                  <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaStore className="text-blue-600" />
                      </div>
                      Business Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Business Name</p>
                        <p className="text-gray-900 font-medium">{profileData.businessName ?? 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Business Category</p>
                        <p className="text-gray-900 font-medium capitalize">{profileData.businessCategory ?? 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Subscription Plan</p>
                        <Badge color="blue">
                          {profileData.subscriptionPlan ?? 'Basic'}
                        </Badge>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Subscription Status</p>
                        <Badge 
                          color={profileData.subscriptionStatus === 'active' ? 'green' : 'yellow'}
                        >
                          {profileData.subscriptionStatus ?? 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* AFA Registration Info */}
                {profileData.afaRegistration && (
                  <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaBriefcase className="text-purple-600" />
                      </div>
                      AFA Registration
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">AFA ID</p>
                        <p className="text-gray-900 font-medium font-mono">{profileData.afaRegistration.afaId}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Registration Type</p>
                        <p className="text-gray-900 font-medium capitalize">{profileData.afaRegistration.registrationType}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Registration Fee</p>
                        <p className="text-gray-900 font-medium">GH¢{profileData.afaRegistration.registrationFee?.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                        <Badge 
                          color={profileData.afaRegistration.status === 'completed' ? 'green' : 'yellow'}
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
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="p-6 sm:p-8 pb-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardBody className="p-6 sm:p-8 pt-6 space-y-3">
                <Button 
                  variant="outline" 
                  fullWidth
                  leftIcon={<FaEdit />}
                  className="justify-start"
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth
                  leftIcon={<FaKey />}
                  className="justify-start"
                >
                  Change Password
                </Button>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Button 
                    color="red"
                    variant="outline"
                    fullWidth
                    onClick={handleLogout}
                    className="justify-start"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Support Card */}
            <Card className="shadow-lg">
              <CardHeader className="p-6 sm:p-8 pb-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Support & Community</h2>
              </CardHeader>
              <CardBody className="p-6 sm:p-8 pt-6 space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Need help? Contact support</p>
                  <p className="font-medium text-gray-900">+233 55 987 6543</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Join our community</p>
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
    </div>
  );
};

export default ProfilePage;
