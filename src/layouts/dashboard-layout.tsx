/**
 * Modern Dashboard Layout Component
 *
 * Features:
 * - Responsive sidebar that collapses on mobile
 * - Modern header with user profile and notifications
 * - Smooth animations and transitions
 * - Support for guided tour
 * - Mobile-first design with touch-friendly controls
 */

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { NavigationLoader } from "../components/navigation-loader";
import GuidedTour from "../components/guided-tour";
import type { TourStep } from "../components/guided-tour";
import { useAuth } from "../hooks";
import ImpersonationService from "../utils/impersonation";
import {
  FaPhone,
  FaWallet,
  FaClipboardList,
  FaChartLine,
  FaUser,
} from "react-icons/fa";

export const DashboardLayout = () => {
  const { authState, updateFirstTimeFlag } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showTour, setShowTour] = useState(false);
  const location = useLocation();
  const isImpersonating = ImpersonationService.isImpersonating();

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

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check if user is new and should see the tour
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Check if this is the user's first login using the isFirstTime flag from backend
      const isFirstTime = authState.user.isFirstTime === true;

      // Check if we've already completed the tour in this session
      const tourCompletedThisSession =
        localStorage.getItem("tourCompleted") === "true";

      // Show the tour for first-time users on dashboard pages
      if (
        isFirstTime &&
        location.pathname.includes("/dashboard") &&
        !tourCompletedThisSession
      ) {
        setShowTour(true);
      }
    }
  }, [authState.isAuthenticated, authState.user, location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Updated tour step definitions for telecom app
  const tourSteps: TourStep[] = [
    {
      target: ".dashboard-welcome",
      title: "Welcome to Your Telecom Dashboard",
      content:
        "This is your main dashboard where you can manage airtime and data orders, track your wallet, and view your transaction history.",
      position: "bottom",
      icon: <FaUser className="text-blue-600" />,
    },
    {
      target: ".quick-actions",
      title: "Quick Network Actions",
      content:
        "Order airtime and data bundles for MTN, Telecel, AT Big Time, and AT iShare Premium networks. Click any network to start ordering.",
      position: "bottom",
      icon: <FaPhone className="text-green-600" />,
    },
    {
      target: ".account-overview",
      title: "Account Overview",
      content:
        "Track your total orders, amount spent, success rate, and current wallet balance. These metrics help you monitor your business performance.",
      position: "bottom",
      icon: <FaChartLine className="text-purple-600" />,
    },
    {
      target: ".wallet-balance",
      title: "Wallet Management",
      content:
        "Your wallet balance is automatically deducted when you place orders. Keep it topped up to ensure smooth order processing.",
      position: "right",
      icon: <FaWallet className="text-green-600" />,
    },
    {
      target: ".recent-transactions",
      title: "Recent Transactions",
      content:
        "View your latest wallet transactions and order history. This helps you track all your financial activities and order statuses.",
      position: "top",
      icon: <FaClipboardList className="text-orange-600" />,
    },
  ];

  const handleTourComplete = () => {
    // Mark tour as completed
    localStorage.setItem("tourCompleted", "true");

    // Update first time flag in backend
    if (authState.user?.isFirstTime) {
      updateFirstTimeFlag();
    }
  };

  return (
    <div
      className={`flex bg-gray-50 overflow-hidden ${
        isImpersonating ? "" : "h-screen"
      }`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <button
          className="fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 ease-in-out lg:hidden border-0"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
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
        <main
          className={`flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50 ${
            isImpersonating ? "min-h-screen" : ""
          }`}
        >
          <NavigationLoader delay={150}>
            <Outlet />
          </NavigationLoader>
        </main>
      </div>

      {/* Guided Tour */}
      {showTour && localStorage.getItem("tourCompleted") !== "true" && (
        <GuidedTour
          steps={tourSteps}
          isOpen={showTour}
          onClose={() => {
            setShowTour(false);
            localStorage.setItem("tourCompleted", "true");
          }}
          onComplete={handleTourComplete}
        />
      )}
    </div>
  );
};
