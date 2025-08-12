// src/components/sidebar-new.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import type { ReactNode } from 'react';
import { 
  FaBox, 
  FaMobile, 
  FaUsers, 
  FaUsersCog, 
  FaWallet,
  FaUser,
  FaCog,
  FaTachometerAlt,
  FaBuilding,
  FaClipboardList
} from 'react-icons/fa';
import { 
  Home,
  Plus,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { BryteLinksSvgIcon } from './common/BryteLinksSvgLogo';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

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

// =============================================================================
// NAVIGATION CONFIGURATIONS
// =============================================================================

// Agent navigation configuration
const getAgentNavItems = (): NavItem[] => [
  {
    label: 'Dashboard',
    path: '/agent/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  {
    label: 'Packages',
    path: '/agent/dashboard/packages',
    icon: <FaBox />,
    children: [
      {
        label: 'MTN Packages',
        path: '/agent/dashboard/packages/mtn',
        icon: <FaBox />
      },
      {
        label: 'Telecel Packages',
        path: '/agent/dashboard/packages/telecel',
        icon: <FaBox />
      },
      {
        label: 'AT BIG TIME Packages',
        path: '/agent/dashboard/packages/at-big-time',
        icon: <FaBox />
      },
      {
        label: 'AT iShare Premium Packages',
        path: '/agent/dashboard/packages/at-ishare-premium',
        icon: <FaBox />
      },
    ]
  },
  {
    label: 'Orders',
    path: '/agent/dashboard/orders',
    icon: <FaMobile />
  },
  {
    label: 'My Customers',
    path: '/agent/dashboard/users',
    icon: <FaUsers />
  },
  {
    label: 'Wallet',
    path: '/agent/dashboard/wallet',
    icon: <FaWallet />
  },
  {
    label: 'AFA Registration',
    path: '/agent/dashboard/afa-registration',
    icon: <Plus className="w-5 h-5" />
  },
  {
    label: 'Profile',
    path: '/agent/dashboard/profile',
    icon: <FaUser />
  },
];

// Customer navigation configuration
const getCustomerNavItems = (): NavItem[] => [
  {
    label: 'Dashboard',
    path: '/customer/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  {
    label: 'Profile',
    path: '/customer/dashboard/profile',
    icon: <FaUser />
  },
];

// Admin navigation configuration
const getAdminNavItems = (): NavItem[] => [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  {
    label: 'User Management',
    path: '/admin/dashboard/users',
    icon: <FaUsersCog />
  },
  {
    label: 'Packages',
    path: '/admin/dashboard/packages',
    icon: <FaBox />
  },
  {
    label: 'Wallet',
    path: '/admin/dashboard/wallet',
    icon: <FaWallet />
  },
  {
    label: 'Profile',
    path: '/admin/dashboard/profile',
    icon: <FaUser />
  },
];

// Super Admin navigation configuration
const getSuperAdminNavItems = (): NavItem[] => [
  {
    label: 'Dashboard',
    path: '/superadmin',
    icon: <FaTachometerAlt />,
  },
  {
    label: 'Users',
    path: '/superadmin/users',
    icon: <FaUsers />,
  },
  {
    label: 'Providers',
    path: '/superadmin/providers',
    icon: <FaBuilding />,
  },
  {
    label: 'Packages',
    path: '/superadmin/packages',
    icon: <FaBox />,
  },
  {
    label: 'Orders',
    path: '/superadmin/orders',
    icon: <FaClipboardList />,
  },
  {
    label: 'Wallet',
    path: '/superadmin/wallet',
    icon: <FaWallet />,
  },
  {
    label: 'Settings',
    path: '/superadmin/settings',
    icon: <FaCog />,
  },
];

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

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

  // Get app name for version display
  const getAppName = () => {
    if (authState.user?.businessName) {
      return authState.user.businessName;
    }
    return 'SaaS Telecom';
  };

  // Get navigation items based on user type
  const getNavItems = (): NavItem[] => {
    switch (authState.user?.userType) {
      case 'agent':
        return getAgentNavItems();
      case 'customer':
        return getCustomerNavItems();
      case 'super_admin':
        return getSuperAdminNavItems();
      default:
        return getAdminNavItems(); // Fallback for admin
    }
  };

  const navItems = getNavItems();
  
  // Check if a path is active
  const isActivePath = (path: string) => {
    // Handle dashboard paths specifically - only match exact dashboard paths
    if (path === '/superadmin') {
      return location.pathname === '/superadmin' || location.pathname === '/superadmin/';
    }
    if (path === '/agent/dashboard') {
      return location.pathname === '/agent/dashboard' || location.pathname === '/agent/dashboard/';
    }
    if (path === '/customer/dashboard') {
      return location.pathname === '/customer/dashboard' || location.pathname === '/customer/dashboard/';
    }
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/';
    }
    
    // For other paths, check exact match only
    return location.pathname === path;
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
                  ? 'bg-[#0ea5e9] text-white shadow-md'
                  : 'text-gray-300 hover:bg-[#1e3a5f] hover:text-white'
              } ${level > 0 ? 'ml-4' : ''}`}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${hasActiveChildItem ? 'text-white' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRight size={12} />
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
                ? 'bg-[#0ea5e9] text-white shadow-md'
                : 'text-gray-300 hover:bg-[#1e3a5f] hover:text-white'
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
                <Check className="w-5 h-5" />
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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#142850] text-white transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:h-screen md:flex-shrink-0`}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between px-4 py-5 bg-[#0f1f3a] shadow-md">
          <div className="flex items-center min-w-0 flex-1">
            <BryteLinksSvgIcon className="w-10 h-10 mr-1 flex-shrink-0" />
            <div className="text-lg sm:text-xl font-bold truncate text-white">
              BryteLinks
            </div>
          </div>
          <button 
            aria-label="Close sidebar"
            className="text-gray-300 hover:text-white md:hidden focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:ring-opacity-50 rounded-md p-1 flex-shrink-0"
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
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Menu</p>
          </div>
          <ul className="space-y-1 px-3">
            {navItems.map((item) => renderNavItem(item))}
          </ul>
        </nav>        
        
        {/* User info section */}
        <div className="mt-auto">
          {/* User profile */}
          <div className="p-4 border-t border-[#1e3a5f]">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md">
                  {authState.user?.fullName.charAt(0)}{authState.user?.fullName.split(' ')[1]?.charAt(0) ?? ''}
                </div>
              </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="text-sm font-medium truncate text-white">{authState.user?.fullName}</div>
              <div className="flex items-center">
                <span className={`w-2 h-2 ${authState.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1 flex-shrink-0`}></span>
                <p className="text-xs text-gray-300 truncate capitalize">{authState.user?.userType ?? 'User'}</p>
                {authState.user?.userType === 'agent' && authState.user?.agentCode && (
                  <div className="ml-2 text-md font-mono font-bold text-white tracking-wide">
                    {authState.user?.agentCode}
                  </div>
                )}
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
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
          
          {/* App version */}
          <div className="p-3 border-t border-[#1e3a5f] text-center">
            <div className="text-xs text-gray-400 truncate">{getAppName()}</div>
            <div className="text-xs text-gray-300 font-semibold">v1.0.0</div>
          </div>
        </div>
      </aside>
    </>
  );
}; 