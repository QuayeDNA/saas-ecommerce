/**
 * Modern Dashboard Layout Component
 * 
 * Features:
 * - Responsive sidebar that collapses on mobile
 * - Modern header with user profile and notifications
 * - Smooth animations and transitions
 * - Support for guided tour and setup wizard
 * - Mobile-first design with touch-friendly controls
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/sidebar';
import { Header } from '../components/header';
import GuidedTour from '../components/guided-tour';
import type { TourStep } from '../components/guided-tour';
import SetupWizard, { WelcomeStep } from '../components/setup-wizard';
import { useAuth } from '../hooks';

export const DashboardLayout = () => {
  const { authState } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showTour, setShowTour] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const location = useLocation();

  // Handle window resize to detect mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Always show sidebar on desktop
      } else {
        setSidebarOpen(false); // Hide sidebar on mobile by default
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Check if user is new and should see the tour/wizard
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Check if this is the user's first login (in a real app, this would be a property on the user)
      const isFirstLogin = localStorage.getItem('hasSeenTour') !== 'true';
      
      if (isFirstLogin && location.pathname === '/dashboard') {
        // Show setup wizard first time
        setShowSetupWizard(true);
      }
    }
  }, [authState.isAuthenticated, authState.user, location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Tour step definitions
  const tourSteps: TourStep[] = [
    {
      target: '.dashboard-welcome',
      title: 'Welcome to Your Dashboard',
      content: 'This is your main dashboard where you can see an overview of your account and services.',
      position: 'bottom'
    },
    {
      target: '.network-actions',
      title: 'Quick Actions',
      content: 'Access different network services quickly using these buttons.',
      position: 'bottom'
    },
    {
      target: '.wallet-balance',
      title: 'Your Wallet',
      content: 'Keep track of your wallet balance and fund your account here.',
      position: 'right'
    },
    {
      target: '.transactions-table',
      title: 'Recent Transactions',
      content: 'View your recent activity and transaction history.',
      position: 'top'
    }
  ];

  // Handle tour completion
  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  // Handle wizard completion
  const handleWizardComplete = () => {
    setShowSetupWizard(false);
    localStorage.setItem('hasSeenTour', 'true');
    
    // After wizard, offer the tour
    setShowTour(true);
  };

  // Setup wizard steps
  const wizardSteps = [
    {
      id: 'welcome',
      title: 'Welcome',
      component: <WelcomeStep />,
      isCompleted: false
    },
    {
      id: 'profile',
      title: 'Your Profile',
      component: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Complete Your Profile</h3>
          <p className="text-gray-600">These details help us customize your experience.</p>
          {/* Profile fields would go here */}
        </div>
      ),
      isCompleted: false
    },
    {
      id: 'preferences',
      title: 'Preferences',
      component: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Set Your Preferences</h3>
          <p className="text-gray-600">Choose your notification and display settings.</p>
          {/* Preference options would go here */}
        </div>
      ),
      isCompleted: false
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <button 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden border-0"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
          }}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        {/* Header - gets the toggleSidebar function */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
      
      {/* Guided Tour */}
      {showTour && (
        <GuidedTour 
          steps={tourSteps}
          isOpen={showTour}
          onClose={() => setShowTour(false)}
          onComplete={handleTourComplete}
        />
      )}
      
      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <SetupWizard
                steps={wizardSteps}
                onComplete={handleWizardComplete}
                onClose={() => setShowSetupWizard(false)}
                showSkip
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
