// src/components/sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import type { ReactNode } from 'react';
import { 
  FaBox, 
  FaMobile, 
  FaUsers, 
  FaUsersCog, 
  FaChevronRight,
  FaWallet
} from 'react-icons/fa';
import { useState } from 'react';

// Nav item type definition
interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['packages']));
  
  // Toggle expanded state for nav items with children
  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedItems(newExpanded);
  };

  // Get business name from user context
  const getBusinessName = () => {
    if (authState.user?.businessName) {
      return authState.user.businessName;
    }
    // Fallback to user's full name if no business name
    if (authState.user?.fullName) {
      return authState.user.fullName;
    }
    // Final fallback
    return 'SaaS Telecom';
  };

  // Get app name for version display
  const getAppName = () => {
    if (authState.user?.businessName) {
      return authState.user.businessName;
    }
    return 'SaaS Telecom';
  };

  // Dynamic navigation items based on user type
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        label: 'Dashboard',
        path: '',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      },
    ];

    // Agent-specific navigation items
    if (authState.user?.userType === 'agent') {
      baseItems.push(
        {
          label: 'Packages',
          path: 'packages',
          icon: <FaBox />,
          children: [
            {
              label: 'MTN Packages',
              path: 'packages/mtn',
              icon: <FaBox />
            },
            {
              label: 'Telecel Packages',
              path: 'packages/telecel',
              icon: <FaBox />
            },
            {
              label: 'AT BIG TIME Packages',
              path: 'packages/at-big-time',
              icon: <FaBox />
            },
            {
              label: 'AT iShare Premium Packages',
              path: 'packages/at-ishare-premium',
              icon: <FaBox />
            },
          ]
        },
        {
          label: 'Orders',
          path: 'orders',
          icon: <FaMobile />
        },
        // {
        //   label: 'Store',
        //   path: 'store',
        //   icon: <FaShoppingBag />
        // },
        {
          label: 'My Customers',
          path: 'users',
          icon: <FaUsers />
        },
        {
          label: 'Wallet',
          path: 'wallet',
          icon: <FaWallet />
        },
        {
          label: 'AFA Registration',
          path: 'afa-registration',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )
        },
      );
    }

    // Super Admin specific navigation items
    if (authState.user?.userType === 'super_admin') {
      return [
        {
          label: 'Dashboard',
          path: '/superadmin',
          icon: <FaBox />,
        },
        {
          label: 'User Management',
          path: '/superadmin/users',
          icon: <FaUsersCog />,
        },
        {
          label: 'Providers',
          path: '/superadmin/providers',
          icon: <FaMobile />,
        },
        {
          label: 'Orders',
          path: '/superadmin/orders',
          icon: <FaBox />,
        },
        {
          label: 'Wallet',
          path: '/superadmin/wallet',
          icon: <FaWallet />,
        },
        {
          label: 'Settings',
          path: '/superadmin/settings',
          icon: <FaChevronRight />,
        },
      ];
    }
    if (authState.user?.userType === 'agent') {
      // Only agent routes, all paths absolute
      return [
        {
          label: 'Dashboard',
          path: '/agent/dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        },
        {
          label: 'Packages',
          path: '/agent/packages',
          icon: <FaBox />,
        },
        {
          label: 'Orders',
          path: '/agent/orders',
          icon: <FaMobile />,
        },
        {
          label: 'My Customers',
          path: '/agent/users',
          icon: <FaUsers />,
        },
        {
          label: 'Wallet',
          path: '/agent/wallet',
          icon: <FaWallet />,
        },
        {
          label: 'AFA Registration',
          path: '/agent/afa-registration',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          )
        },
      ];
    }

    // Common navigation items for all users
    baseItems.push(
      {
        label: 'Profile',
        path: 'profile',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      },
    );

    return baseItems;
  };

  const navItems = getNavItems();
  
  // Check if a path is active
  const isActivePath = (path: string) => {
    if (path === '') {
      return location.pathname === '/agent/dashboard' || location.pathname === '/customer/dashboard' || location.pathname === '/admin/dashboard';
    }
    // For super admin, only highlight exact or subpath matches
    if (authState.user?.userType === 'super_admin') {
      if (path === '/superadmin') {
        return location.pathname === '/superadmin';
      }
      return location.pathname.startsWith(path + '/') || location.pathname === path;
    }
    // For agent, only highlight exact or subpath matches
    if (authState.user?.userType === 'agent') {
      return location.pathname.startsWith(path + '/') || location.pathname === path;
    }
    // Default: includes for other users
    return location.pathname.includes(path);
  };

  // Check if parent has active child
  const hasActiveChild = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some(child => isActivePath(child.path));
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.path);
    const isActive = isActivePath(item.path);
    const hasActiveChildItem = hasActiveChild(item);

    return (
      <li key={item.path}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpanded(item.path)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-sm transition-all duration-200 ${
                hasActiveChildItem
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${level > 0 ? 'ml-4' : ''}`}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${hasActiveChildItem ? 'text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <FaChevronRight size={12} />
              </span>
            </button>
            
            {isExpanded && (
              <ul className="mt-1 space-y-1">
                {item.children?.map(child => renderNavItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center px-3 py-3 rounded-md text-sm transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            } ${level > 0 ? 'ml-6' : ''}`}
            onClick={() => onClose()}
          >
            <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400'} ${level > 0 ? 'text-xs' : ''}`}>
              {item.icon}
            </span>
            <span className={`font-medium ${level > 0 ? 'text-sm' : ''}`}>{item.label}</span>
            
            {/* Show indicator for active link */}
            {isActive && (
              <span className="ml-auto">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
              </span>
            )}
          </Link>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Sidebar - slide in on mobile, fixed on desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:h-screen md:flex-shrink-0`}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between px-4 py-5 bg-gray-800 shadow-md">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 mr-3 bg-blue-600 rounded-md flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-lg font-bold text-white">
                {getBusinessName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold truncate">
              {getBusinessName()}
            </div>
          </div>
          <button 
            aria-label="Close sidebar"
            className="text-gray-300 hover:text-white md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-1 flex-shrink-0"
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
            {navItems.map((item) => renderNavItem(item))}
          </ul>
        </nav>        
        
        {/* User info section */}
        <div className="mt-auto">
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
              <div className="overflow-hidden min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{authState.user?.fullName}</div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 ${authState.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1 flex-shrink-0`}></span>
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
            <div className="text-xs text-gray-500 truncate">{getAppName()}</div>
            <div className="text-xs text-gray-600 font-semibold">v1.0.0</div>
          </div>
        </div>
      </aside>
    </>
  );
};
