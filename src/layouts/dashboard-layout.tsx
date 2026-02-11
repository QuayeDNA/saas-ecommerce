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
import { TutorialProvider } from "../contexts/TutorialContext";
import { TutorialPlayer } from "../components/tutorials/tutorial-player";
import { TutorialLauncher } from "../components/tutorials/tutorial-launcher";
import { TutorialAutoTrigger } from "../components/tutorials/tutorial-auto-trigger";
import { AnnouncementPopupHandler } from "../components/announcements/announcement-popup-handler";
import { useAuth } from "../hooks";
import ImpersonationService from "../utils/impersonation";

export const DashboardLayout = () => {
  const { authState, updateFirstTimeFlag } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const isImpersonating = ImpersonationService.isImpersonating();

  const userRole = (authState.user?.userType ?? "agent") as string;

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

  // Mark first-time users as onboarded after first visit
  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.user?.isFirstTime &&
      location.pathname.includes("/dashboard")
    ) {
      const alreadyHandled = localStorage.getItem("tourCompleted") === "true";
      if (!alreadyHandled) {
        localStorage.setItem("tourCompleted", "true");
        updateFirstTimeFlag();
      }
    }
  }, [authState.isAuthenticated, authState.user, location.pathname, updateFirstTimeFlag]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <TutorialProvider userRole={userRole}>
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

        {/* Tutorial system */}
        <TutorialPlayer />
        <TutorialAutoTrigger />
        <TutorialLauncher />

        {/* Announcement Popup Handler */}
        <AnnouncementPopupHandler />
      </div>
    </TutorialProvider>
  );
};
