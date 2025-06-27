import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import type { ReactNode } from 'react';

// Nav item type definition
interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  
  // Navigation items
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      label: 'MTN',
      path: '/dashboard/mtn',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Vodafone',
      path: '/dashboard/vodafone',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'AirtelTigo',
      path: '/dashboard/airteltigo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'History',
      path: '/dashboard/history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Profile',
      path: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      label: 'AFA Registration',
      path: '/dashboard/afa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    }
  ];
  
  // Check if a path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
    return (
    <>
      {/* Sidebar - slide in on mobile, fixed on desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:h-screen md:flex-shrink-0`}
      >{/* Logo and close button */}
        <div className="flex items-center justify-between px-4 py-5 bg-gray-800 shadow-md">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 bg-blue-600 rounded-md flex items-center justify-center shadow-sm">
              <span className="text-lg font-bold">ST</span>
            </div>
            <div className="text-xl font-bold">SaaS Telecom</div>
          </div>
          <button 
            aria-label="Close sidebar"
            className="text-gray-300 hover:text-white md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-1"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
          {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-6 py-2 mb-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</p>
          </div>
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-md text-sm transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => onClose()}
                >
                  <span className={`mr-3 ${isActivePath(item.path) ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Show indicator for active link */}
                  {isActivePath(item.path) && (
                    <span className="ml-auto">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>        {/* User info section */}
        <div className="mt-auto">
          {/* Wallet Info */}
          <div className="mx-4 mb-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md">
            <div className="text-xs font-medium text-blue-100">Wallet Balance</div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-white">GH¢{authState.user?.walletBalance.toFixed(2) ?? '0.00'}</div>
              <Link to="/dashboard/profile" className="text-xs bg-blue-800 hover:bg-blue-900 text-blue-100 py-1 px-2 rounded-md">
                Top up
              </Link>
            </div>
          </div>

          {/* User profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0 relative">
                {authState.user?.userType === 'agent' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-900 z-10"></div>
                )}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {authState.user?.fullName.charAt(0)}{authState.user?.fullName.split(' ')[1]?.charAt(0) ?? ''}
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{authState.user?.fullName}</div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 ${authState.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1`}></span>
                  <p className="text-xs text-gray-400 truncate capitalize">{authState.user?.userType ?? 'User'}</p>
                </div>
              </div>
            </div>
            
            {/* Logout button */}
            <button 
              onClick={() => {
                logout();
                onClose();
              }} 
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
          
          {/* App version */}
          <div className="p-3 border-t border-gray-700 text-center">
            <div className="text-xs text-gray-500">SaaS Telecom</div>
            <div className="text-xs text-gray-600 font-semibold">v1.0.0</div>
          </div>
        </div>
      </aside>
    </>
  );
};
