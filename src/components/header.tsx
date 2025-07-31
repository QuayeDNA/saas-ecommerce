import { useState, useEffect } from 'react';
import { useAuth, useWallet } from '../hooks';
import { useSiteStatus } from '../contexts/site-status-context';
import { settingsService } from '../services/settings.service';
import { useToast } from '../design-system/components/toast';
import { Link } from 'react-router-dom';
import { FaPowerOff, FaCheck } from 'react-icons/fa';

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
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Handle site toggle for super admins
  const handleSiteToggle = async () => {
    if (!authState.user || authState.user.userType !== 'super_admin') return;
    
    setIsTogglingSite(true);
    try {
      await settingsService.toggleSiteStatus();
      
      // Refresh site status immediately
      await refreshSiteStatus();
      
      // Show success toast based on new status
      const newStatus = !siteStatus?.isSiteOpen;
      if (newStatus) {
        addToast('Site opened successfully! 🎉', 'success', 4000);
      } else {
        addToast('Site closed for maintenance 🔧', 'warning', 4000);
      }
    } catch (error) {
      console.error('Failed to toggle site status:', error);
      addToast('Failed to update site status. Please try again.', 'error', 5000);
    } finally {
      setIsTogglingSite(false);
    }
  };

  // Show site message animation for agents and toast notifications for all users
  useEffect(() => {
    if (authState.user?.userType === 'agent' && siteStatus) {
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
    if (siteStatus && authState.user && prevSiteStatus !== null && prevSiteStatus !== siteStatus.isSiteOpen) {
      if (siteStatus.isSiteOpen) {
        addToast('Site is now open for business! 🎉', 'success', 3000);
      } else {
        addToast('Site is currently under maintenance 🔧', 'warning', 4000);
      }
    }
    setPrevSiteStatus(siteStatus?.isSiteOpen ?? null);
  }, [siteStatus?.isSiteOpen, authState.user, addToast, prevSiteStatus]);

  // Get site message for agents
  const getSiteMessage = () => {
    if (!siteStatus) return '';
    return siteStatus.isSiteOpen 
      ? "Hi! We are currently open for business! 🎉"
      : "Sorry, store is currently closed for business 😔";
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center min-w-0">
          {/* Left side: Menu button and Greeting */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            {/* Menu button for mobile */}
            <button
              aria-label="Open sidebar menu"
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-1.5 flex-shrink-0 md:hidden"
              onClick={onMenuClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 truncate flex items-center">
                <span className="bg-blue-50 text-blue-600 p-1 rounded-md mr-2 hidden sm:flex flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </span>
                <div className="relative overflow-hidden">
                  {showSiteMessage && authState.user?.userType === 'agent' ? (
                    <div className="animate-slide-up">
                      <span className="truncate text-green-600">
                        {getSiteMessage()}
                      </span>
                    </div>
                  ) : (
                    <span className="truncate">
                      {getGreeting()}, {authState.user?.fullName.split(' ')[0]} 👋
                    </span>
                  )}
                </div>
              </div>        
            </div>
          </div>

          {/* Right side: Wallet & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
                         {/* Site Toggle - Only show for super admins */}
             {authState.user?.userType === 'super_admin' && (
               <button
                 onClick={handleSiteToggle}
                 disabled={isTogglingSite}
                 className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                   siteStatus?.isSiteOpen
                     ? 'bg-green-100 text-green-700 hover:bg-green-200'
                     : 'bg-red-100 text-red-700 hover:bg-red-200'
                 } ${isTogglingSite ? 'opacity-50 cursor-not-allowed' : ''}`}
                 title={isTogglingSite ? 'Updating...' : (siteStatus?.isSiteOpen ? 'Close Site' : 'Open Site')}
               >
                 {isTogglingSite ? (
                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                 ) : siteStatus?.isSiteOpen ? (
                   <FaCheck className="w-3 h-3" />
                 ) : (
                   <FaPowerOff className="w-3 h-3" />
                 )}
                 <span className="hidden sm:inline">
                   {isTogglingSite ? 'Updating...' : (siteStatus?.isSiteOpen ? 'Site Open' : 'Site Closed')}
                 </span>
               </button>
             )}
            
            {/* Wallet - Only show for agents */}
            {authState.user?.userType === 'agent' && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm shadow-sm relative group min-w-0">
                <div className="hidden sm:block text-xs font-medium text-green-100 mb-0.5">Wallet Balance</div>
                <div className="font-bold flex items-center justify-center sm:justify-start">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="truncate">
                    GH¢{walletBalance.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshWallet();
                    }}
                    disabled={isLoading}
                    className="ml-1 sm:ml-2 p-0.5 sm:p-1 rounded-full opacity-70 hover:opacity-100 focus:outline-none hover:bg-green-700 transition-opacity flex-shrink-0"
                    aria-label="Refresh wallet balance"
                    title="Refresh balance"
                  >
                    <svg 
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isLoading ? 'animate-spin' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Notifications button - Hidden on mobile */}
            <button className="relative p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hidden sm:block flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User dropdown menu */}
            <div className="relative flex-shrink-0">
              <button
                aria-label="User menu"
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full p-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-medium shadow-sm text-xs sm:text-sm">
                  {authState.user?.fullName.charAt(0)}{authState.user?.fullName.split(' ')[1]?.charAt(0) ?? ''}
                </div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 hidden sm:block text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <>
                  <button 
                    aria-label="Close menu overlay"
                    className="fixed inset-0 z-10 cursor-default border-0 bg-transparent"
                    onClick={() => setIsDropdownOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsDropdownOpen(false);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl py-1 z-20 border border-gray-200 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-sm truncate">{authState.user?.fullName}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{authState.user?.email}</div>
                    </div>
                    
                    <Link 
                      to="/dashboard/profile" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">My Profile</span>
                    </Link>
                    
                    <Link 
                      to="/dashboard/afa" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="truncate">AFA Registration</span>
                    </Link>
                    

                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                      className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                    >
                      <svg className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="truncate">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
