import React, { useState, useEffect } from "react";
import { useAuth, useUser, useWallet } from "../hooks";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Alert,
  Skeleton,
} from "../design-system";
import { EditProfileDialog } from "../components/common/edit-profile-dialog";
import { ChangePasswordDialog } from "../components/common/change-password-dialog";
import {
  FaEdit,
  FaKey,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaWallet,
  FaStore,
  FaWifi,
  FaSync,
  FaPalette,
  FaRedo,
} from "react-icons/fa";
import type { User } from "../types";
import { isBusinessUser } from "../utils/userTypeHelpers";
import { ColorSchemeSelector } from "../components/common/color-scheme-selector";

export const ProfilePage: React.FC = () => {
  const { authState, logout } = useAuth();
  const { getProfile } = useUser();
  const { walletBalance, connectionStatus, refreshWallet } = useWallet();
  const [profileData, setProfileData] = useState<User | null>(authState.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile);
    } catch (err) {
      setError("Failed to refresh profile data");
      console.error("Profile refresh error:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authState.user) {
        setIsLoading(true);
        try {
          const profile = await getProfile();
          setProfileData(profile);
        } catch (err) {
          setError("Failed to load profile data");
          console.error("Profile fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, [authState.user, getProfile]);

  const getUserTypeColor = (
    userType: string
  ): "blue" | "green" | "yellow" | "red" | "gray" => {
    switch (userType) {
      case "agent":
        return "blue";
      case "customer":
        return "green";
      case "super_admin":
        return "red";
      default:
        return "gray";
    }
  };

  const getConnectionStatusIndicator = () => {
    switch (connectionStatus) {
      case "websocket":
        return <FaWifi className="w-4 h-4 text-green-500" />;
      case "polling":
        return <FaSync className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "disconnected":
        return <FaWifi className="w-4 h-4 text-red-500" />;
      default:
        return <FaWifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "websocket":
        return "Live";
      case "polling":
        return "Syncing";
      case "disconnected":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleRefreshWallet = async () => {
    try {
      await refreshWallet();
    } catch (err) {
      console.error("Failed to refresh wallet:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <Skeleton
              variant="text"
              height="2.5rem"
              width="200px"
              className="mb-2"
            />
            <Skeleton variant="text" height="1rem" width="300px" />
          </div>

          {/* Mobile Layout Skeleton */}
          <div className="space-y-4 sm:space-y-6 lg:hidden">
            {/* Profile Header Card Skeleton */}
            <Card className="shadow-sm">
              <CardBody>
                <div className="flex items-center gap-4">
                  <Skeleton variant="circular" width="4rem" height="4rem" />
                  <div className="flex-1">
                    <Skeleton
                      variant="text"
                      height="1.5rem"
                      width="150px"
                      className="mb-1"
                    />
                    <Skeleton
                      variant="text"
                      height="1rem"
                      width="120px"
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Skeleton
                        variant="rectangular"
                        width="60px"
                        height="20px"
                      />
                      <Skeleton
                        variant="rectangular"
                        width="70px"
                        height="20px"
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contact Info Skeleton */}
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton variant="text" height="1.25rem" width="150px" />
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 gap-3">
                  <Skeleton variant="rectangular" height="3rem" />
                  <Skeleton variant="rectangular" height="3rem" />
                </div>
              </CardBody>
            </Card>

            {/* Wallet Skeleton */}
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton variant="text" height="1.25rem" width="120px" />
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <Skeleton
                    variant="text"
                    height="2.5rem"
                    width="100px"
                    className="mb-2 mx-auto"
                  />
                  <Skeleton
                    variant="text"
                    height="0.875rem"
                    width="80px"
                    className="mx-auto"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions Skeleton */}
            <Card className="shadow-sm">
              <CardHeader>
                <Skeleton variant="text" height="1.25rem" width="100px" />
              </CardHeader>
              <CardBody className="space-y-3">
                <Skeleton variant="rectangular" height="2.5rem" />
                <Skeleton variant="rectangular" height="2.5rem" />
                <Skeleton variant="rectangular" height="2.5rem" />
              </CardBody>
            </Card>
          </div>

          {/* Desktop Bento Grid Skeleton */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              <Card className="shadow-sm">
                <CardBody>
                  <div className="flex items-center gap-6">
                    <Skeleton variant="circular" width="5rem" height="5rem" />
                    <div className="flex-1">
                      <Skeleton
                        variant="text"
                        height="2rem"
                        width="200px"
                        className="mb-2"
                      />
                      <Skeleton
                        variant="text"
                        height="1rem"
                        width="150px"
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Skeleton
                          variant="rectangular"
                          width="80px"
                          height="24px"
                        />
                        <Skeleton
                          variant="rectangular"
                          width="90px"
                          height="24px"
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <Skeleton variant="text" height="1.25rem" width="150px" />
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton variant="rectangular" height="4rem" />
                    <Skeleton variant="rectangular" height="4rem" />
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <Skeleton variant="text" height="1.25rem" width="120px" />
                </CardHeader>
                <CardBody>
                  <div className="text-center">
                    <Skeleton
                      variant="text"
                      height="3rem"
                      width="120px"
                      className="mb-2 mx-auto"
                    />
                    <Skeleton
                      variant="text"
                      height="0.875rem"
                      width="60px"
                      className="mx-auto"
                    />
                  </div>
                </CardBody>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <Skeleton variant="text" height="1.25rem" width="100px" />
                </CardHeader>
                <CardBody className="space-y-3">
                  <Skeleton variant="rectangular" height="2.5rem" />
                  <Skeleton variant="rectangular" height="2.5rem" />
                  <Skeleton variant="rectangular" height="2.5rem" />
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
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

        {/* Mobile Layout - Stacked Cards */}
        <div className="space-y-4 sm:space-y-6 lg:hidden">
          {/* Profile Header Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg flex-shrink-0">
                  {profileData.fullName.charAt(0)}
                  {profileData.fullName.split(" ")[1]?.charAt(0) ?? ""}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {profileData.fullName}
                  </h2>
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {profileData.email}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      color={getUserTypeColor(profileData.userType)}
                      className="text-xs"
                    >
                      {profileData.userType.replace("_", " ")}
                    </Badge>
                    {profileData.isVerified && (
                      <Badge
                        color="green"
                        variant="outline"
                        className="text-xs"
                      >
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Contact Information Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaUser className="text-blue-600" />
                Contact Information
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profileData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profileData.phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Business Information Card - Only for business users */}
          {isBusinessUser(profileData.userType) && (
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaStore className="text-green-600" />
                  Business Information
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Business Name
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profileData.businessName ?? "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <p className="text-sm font-medium text-gray-900 capitalize truncate">
                      {profileData.businessCategory ?? "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Plan
                    </p>
                    <Badge color="blue" className="text-xs">
                      {profileData.subscriptionPlan ?? "Basic"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <Badge
                      color={
                        profileData.subscriptionStatus === "active"
                          ? "green"
                          : "yellow"
                      }
                      className="text-xs"
                    >
                      {profileData.subscriptionStatus ?? "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Wallet Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaWallet className="text-green-600" />
                  Wallet Balance
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshWallet}
                  className="p-1"
                  title="Refresh balance"
                >
                  <FaRedo className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  GH¢{walletBalance?.toFixed(2) ?? "0.00"}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                  {getConnectionStatusIndicator()}
                  <span>{getConnectionStatusText()}</span>
                </div>
                <p className="text-xs text-gray-500">Real-time balance</p>
              </div>
            </CardBody>
          </Card>

          {/* Account Details Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendar className="text-orange-600" />
                Account Details
              </h3>
            </CardHeader>
            <CardBody>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaCalendar className="text-orange-600 w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(profileData.createdAt || ""))}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h3>
            </CardHeader>
            <CardBody>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<FaEdit />}
                className="justify-start h-10"
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<FaKey />}
                className="justify-start h-10"
              >
                Change Password
              </Button>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Button
                  color="red"
                  variant="outline"
                  fullWidth
                  onClick={handleLogout}
                  className="justify-start h-10"
                >
                  Sign Out
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Appearance Settings */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaPalette className="text-purple-600" />
                Appearance
              </h3>
            </CardHeader>
            <CardBody>
              <ColorSchemeSelector />
            </CardBody>
          </Card>

          {/* Support Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Support & Community
              </h3>
            </CardHeader>
            <CardBody>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Need help? Contact support
                </p>
                <a
                  href="https://wa.me/+233548983019"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  +233 54 898 3019
                </a>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Join our community</p>
                <a
                  href="https://chat.whatsapp.com/EstSwEm3q9Z4sS42Ed5N8u?mode=ac_t"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  WhatsApp Community
                </a>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Desktop Bento Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Content - Spans 8 columns */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* Profile Header Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
                    {profileData.fullName.charAt(0)}
                    {profileData.fullName.split(" ")[1]?.charAt(0) ?? ""}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.fullName}
                    </h2>
                    <p className="text-gray-600 mb-3">{profileData.email}</p>
                    <div className="flex gap-2">
                      <Badge color={getUserTypeColor(profileData.userType)}>
                        {profileData.userType.replace("_", " ")}
                      </Badge>
                      {profileData.isVerified && (
                        <Badge color="green" variant="outline">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Contact Information Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Contact Information
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="text-blue-600 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profileData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-green-600 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Phone
                      </p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profileData.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Business Information Card - Only for business users */}
            {isBusinessUser(profileData.userType) && (
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaStore className="text-green-600" />
                    Business Information
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Business Name
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {profileData.businessName ?? "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Category
                      </p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {profileData.businessCategory ?? "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Plan
                      </p>
                      <Badge color="blue" className="text-xs">
                        {profileData.subscriptionPlan ?? "Basic"}
                      </Badge>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Status
                      </p>
                      <Badge
                        color={
                          profileData.subscriptionStatus === "active"
                            ? "green"
                            : "yellow"
                        }
                        className="text-xs"
                      >
                        {profileData.subscriptionStatus ?? "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar - Spans 4 columns */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Wallet Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaWallet className="text-green-600" />
                    Wallet Balance
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshWallet}
                    className="p-1"
                    title="Refresh balance"
                  >
                    <FaRedo className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    GH¢{walletBalance?.toFixed(2) ?? "0.00"}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    {getConnectionStatusIndicator()}
                    <span>{getConnectionStatusText()}</span>
                  </div>
                  <p className="text-xs text-gray-500">Real-time balance</p>
                </div>
              </CardBody>
            </Card>

            {/* Account Details Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaCalendar className="text-orange-600" />
                  Account Details
                </h3>
              </CardHeader>
              <CardBody>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaCalendar className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Member Since
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(profileData.createdAt || ""))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<FaEdit />}
                  className="justify-start h-10"
                  onClick={() => setIsEditProfileOpen(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<FaKey />}
                  className="justify-start h-10"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Button
                    color="red"
                    variant="outline"
                    fullWidth
                    onClick={handleLogout}
                    className="justify-start h-10"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Additional Cards Grid - Below Main Bento Grid */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* Appearance Settings */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaPalette className="text-purple-600" />
                Appearance
              </h3>
            </CardHeader>
            <CardBody>
              <ColorSchemeSelector />
            </CardBody>
          </Card>

          {/* Support Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Support & Community
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Need help? Contact support
                </p>
                <a
                  href="https://wa.me/+233548983019"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  +233 54 898 3019
                </a>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Join our community</p>
                <a
                  href="https://chat.whatsapp.com/EstSwEm3q9Z4sS42Ed5N8u?mode=ac_t"
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  WhatsApp Community
                </a>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Dialogs */}
        <EditProfileDialog
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={refreshProfile}
        />
        <ChangePasswordDialog
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
