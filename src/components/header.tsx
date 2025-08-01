import { useState, useEffect } from "react";
import { useAuth, useWallet } from "../hooks";
import { useSiteStatus } from "../contexts/site-status-context";
import { settingsService } from "../services/settings.service";
import { useToast } from "../design-system/components/toast";
import { Button } from "../design-system";
import { Link } from "react-router-dom";
import { FaPowerOff, FaCheck, FaBars, FaUser, FaSignOutAlt, FaWallet, FaSync, FaStar } from "react-icons/fa";
import { NotificationDropdown } from "./notifications/NotificationDropdown";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { authState, logout } = useAuth();
  const { walletBalance, refreshWallet, isLoading } = useWallet();
  const { siteStatus, refreshSiteStatus } = useSiteStatus();
  const { addToast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSiteMessage, setShowSiteMessage] = useState(false);
  const [isTogglingSite, setIsTogglingSite] = useState(false);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Handle site toggle for super admins
  const handleSiteToggle = async () => {
    if (!authState.user || authState.user.userType !== "super_admin") return;

    setIsTogglingSite(true);
    try {
      await settingsService.toggleSiteStatus();

      // Refresh site status immediately
      await refreshSiteStatus();
    } catch (error) {
      console.error("Failed to toggle site status:", error);
    } finally {
      setIsTogglingSite(false);
    }
  };

  // Show site message animation for agents and toast notifications for all users
  useEffect(() => {
    if (authState.user?.userType === "agent" && siteStatus) {
      setShowSiteMessage(true);
      const timer = setTimeout(() => {
        setShowSiteMessage(false);
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [siteStatus, authState.user?.userType]);

  // Track previous site status to show toast only on changes
  const [prevSiteStatus, setPrevSiteStatus] = useState<boolean | null>(null);

  // Show toast notification when site status changes (for all users)
  useEffect(() => {
    if (
      siteStatus &&
      authState.user &&
      prevSiteStatus !== null &&
      prevSiteStatus !== siteStatus.isSiteOpen
    ) {
      if (siteStatus.isSiteOpen) {
        addToast("Site is now open for business! 🎉", "success", 3000);
      } else {
        addToast("Site is currently under maintenance 🔧", "warning", 4000);
      }
    }
    setPrevSiteStatus(siteStatus?.isSiteOpen ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStatus?.isSiteOpen, authState.user, addToast, prevSiteStatus]);

  // Get site message for agents
  const getSiteMessage = () => {
    if (!siteStatus) return "";
    return siteStatus.isSiteOpen
      ? "Hi! We are currently open for business! 🎉"
      : "Sorry, store is currently closed for business 😔";
  };

  // Check if user is an agent
  const isAgent = authState.user?.userType === "agent";
  const isAdmin =
    authState.user?.userType === "super_admin" ||
    authState.user?.userType === "admin";

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Top row: Menu, Greeting, Site Toggle, Notifications, User Avatar */}
        <div className="flex justify-between items-center min-w-0 mb-2">
          {/* Left side: Menu button and Greeting */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {/* Menu button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden p-1.5"
              aria-label="Open sidebar menu"
            >
              <FaBars className="w-5 h-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 truncate flex items-center">
                <div className="bg-blue-50 text-blue-600 p-1 rounded-md mr-2 hidden sm:flex flex-shrink-0">
                  <FaStar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="relative overflow-hidden">
                  {showSiteMessage && isAgent ? (
                    <div className="animate-slide-up">
                      <span className="text-wrap truncate text-green-600">
                        {getSiteMessage()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-wrap truncate">
                      {getGreeting()}, {authState.user?.fullName.split(" ")[0]}{" "}
                      👋
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Site Toggle, Notifications, User Avatar */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Site Toggle - Only show for super admins */}
            {isAdmin && (
              <Button
                variant={siteStatus?.isSiteOpen ? "success" : "danger"}
                size="sm"
                onClick={handleSiteToggle}
                disabled={isTogglingSite}
                className="text-xs sm:text-sm"
                title={
                  isTogglingSite
                    ? "Updating..."
                    : siteStatus?.isSiteOpen
                    ? "Close Site"
                    : "Open Site"
                }
              >
                {isTogglingSite ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                ) : siteStatus?.isSiteOpen ? (
                  <FaCheck className="w-3 h-3 mr-1" />
                ) : (
                  <FaPowerOff className="w-3 h-3 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isTogglingSite
                    ? "Updating..."
                    : siteStatus?.isSiteOpen
                    ? "Site Open"
                    : "Site Closed"}
                </span>
              </Button>
            )}

            {/* Notifications dropdown */}
            <NotificationDropdown />

            {/* User dropdown menu */}
            <div className="relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-1"
                aria-label="User menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-medium shadow-sm text-xs sm:text-sm">
                  {authState.user?.fullName.charAt(0)}
                  {authState.user?.fullName.split(" ")[1]?.charAt(0) ?? ""}
                </div>
              </Button>

              {isDropdownOpen && (
                <>
                  <button
                    aria-label="Close menu overlay"
                    className="fixed inset-0 z-10 cursor-default border-0 bg-transparent"
                    onClick={() => setIsDropdownOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setIsDropdownOpen(false);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl py-1 z-20 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-sm truncate">
                        {authState.user?.fullName}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {authState.user?.email}
                      </div>
                    </div>

                    {/* Profile Link - Only show for agents */}
                    {isAgent && (
                      <Link
                        to="/agent/dashboard/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="truncate">My Profile</span>
                      </Link>
                    )}

                    {/* AFA Registration - Only show for agents */}
                    {isAgent && (
                      <Link
                        to="/agent/dashboard/afa-registration"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        <span className="truncate">AFA Registration</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <FaSignOutAlt className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                      <span className="truncate">Logout</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: Wallet Widget (only for agents) */}
        {isAgent && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-md text-sm sm:text-base shadow-sm relative group min-w-0">
              <div className="hidden sm:block text-xs font-medium text-green-100 mb-1">
                Wallet Balance
              </div>
              <div className="font-bold flex items-center justify-center sm:justify-start">
                <FaWallet className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-100 flex-shrink-0" />
                <span className="truncate">GH¢{walletBalance.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshWallet();
                  }}
                  disabled={isLoading}
                  className="ml-2 sm:ml-3 rounded-full opacity-70 hover:opacity-100 hover:bg-green-700 transition-opacity flex-shrink-0 text-white"
                  aria-label="Refresh wallet balance"
                  title="Refresh balance"
                >
                  <FaSync
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
