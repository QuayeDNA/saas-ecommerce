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
  const [showGreeting, setShowGreeting] = useState(true);
  const [isTogglingSite, setIsTogglingSite] = useState(false);

  // Get greeting based on time of day with emoji
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "☀️" };
    if (hour < 18) return { text: "Good afternoon", emoji: "☀️" };
    return { text: "Good evening", emoji: "🌙" };
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
      setShowGreeting(false);
      setTimeout(() => {
        setShowSiteMessage(true);
      }, 300); // Wait for greeting to slide out
      
      const timer = setTimeout(() => {
        setShowSiteMessage(false);
        setTimeout(() => {
          setShowGreeting(true);
        }, 300); // Wait for site message to slide out
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
      <div className="px-2 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Section: Menu + Greeting */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden flex-shrink-0"
              aria-label="Open sidebar menu"
            >
              <FaBars className="w-5 h-5" />
            </Button>

            {/* Greeting Section */}
            <div className="min-w-0 flex-1">
              <div className="relative overflow-hidden">
                {showSiteMessage && isAgent ? (
                  <div className="transform transition-all duration-500 ease-in-out animate-slide-up">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-50 text-green-600 p-1.5 rounded-md flex-shrink-0">
                        <FaStar className="w-4 h-4" />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-green-700 truncate">
                        {getSiteMessage()}
                      </span>
                    </div>
                  </div>
                ) : showGreeting ? (
                  <div className="transform transition-all duration-500 ease-in-out animate-slide-in-from-bottom">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md flex-shrink-0">
                        <span className="text-lg sm:text-xl">
                          {getGreeting().emoji}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">
                          {getGreeting().text}, {authState.user?.fullName.split(" ")[0]}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">
                          Welcome back! 👋
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Section: Actions + User */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
            {/* Site Toggle - Only for admins */}
            {isAdmin && (
              <div className="hidden sm:block">
                <Button
                  variant={siteStatus?.isSiteOpen ? "success" : "danger"}
                  size="sm"
                  onClick={handleSiteToggle}
                  disabled={isTogglingSite}
                  className="text-xs"
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
                    <FaCheck className="w-3 h-3" />
                  ) : (
                    <FaPowerOff className="w-3 h-3" />
                  )}
                  <span className="ml-1">
                    {isTogglingSite
                      ? "Updating..."
                      : siteStatus?.isSiteOpen
                      ? "Site Open"
                      : "Site Closed"}
                  </span>
                </Button>
              </div>
            )}

            {/* Notifications */}
            <div className="flex-shrink-0">
              <NotificationDropdown />
            </div>

            {/* User Menu */}
            <div className="relative flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-1.5"
                aria-label="User menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-medium shadow-sm text-sm">
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
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-lg shadow-xl py-1 z-20 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-sm truncate">
                        {authState.user?.fullName}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {authState.user?.email}
                      </div>
                    </div>

                    {/* Profile Link - Only for agents */}
                    {isAgent && (
                      <Link
                        to="/agent/dashboard/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
                        <span className="truncate">My Profile</span>
                      </Link>
                    )}

                    {/* AFA Registration - Only for agents */}
                    {isAgent && (
                      <Link
                        to="/agent/dashboard/afa-registration"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0"
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
                      <FaSignOutAlt className="w-4 h-4 mr-3 text-red-500 flex-shrink-0" />
                      <span className="truncate">Logout</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Section - Only for agents */}
        {isAgent && (
          <div className="mt-2">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-1 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-400 bg-opacity-30 rounded-full">
                    <FaWallet className="w-5 h-5 text-green-100" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-green-100 mb-1">
                      Wallet Balance
                    </div>
                    <div className="text-lg sm:text-xl font-bold">
                      GH¢{walletBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshWallet();
                  }}
                  disabled={isLoading}
                  className="rounded-full opacity-70 hover:opacity-100 hover:bg-green-700 transition-opacity flex-shrink-0 text-white p-2"
                  aria-label="Refresh wallet balance"
                  title="Refresh balance"
                >
                  <FaSync
                    className={`w-4 h-4 ${
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
