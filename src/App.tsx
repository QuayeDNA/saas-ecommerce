import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { ThemeProvider } from "./design-system";
import { Button } from "./design-system/components/button";
import { ToastProvider } from "./design-system/components/toast";
import "./App.css";
import { AppProvider } from "./providers/app-provider";
import { StorefrontSessionProvider } from "./contexts/storefront-session-context";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { MaintenanceBanner } from "./components/maintenance-banner";
import { InstallPrompt } from "./components/install-prompt";
import { AnnouncementBanner } from "./components/announcements/announcement-banner";
import { AnnouncementWatcher } from "./components/announcements/announcement-watcher";
import PushNotificationInitializer from "./components/PushNotificationInitializer";
import { useLocation, useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import ImpersonationService from "./utils/impersonation";

function App() {
  const routeElement = useRoutes(routes);
  const location = useLocation();
  const navigate = useNavigate();
  const isImpersonating =
    typeof window !== "undefined" &&
    localStorage.getItem("impersonation") === "true";

  const isAuthenticatedRoute =
    location.pathname.startsWith("/agent") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/superadmin");

  const handleReturnToAdmin = async () => {
    try {
      await ImpersonationService.endImpersonation();
      navigate("/superadmin");
    } catch (error) {
      console.error("Failed to end impersonation from banner:", error);
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) localStorage.setItem("token", adminToken);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("impersonation");
      navigate("/superadmin");
    }
  };

  return (
    // StorefrontSessionProvider must wrap the entire app so the guard and
    // marker can communicate via context regardless of which route is active.
    <StorefrontSessionProvider>
      <>
        {isImpersonating && isAuthenticatedRoute && (
          <div className="sticky top-0 z-50 bg-warning/10 border-b border-warning/30 px-4 py-2">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <FaExclamationTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0">
                  <div className="inline-block animate-marquee">
                    <span className="text-sm text-warning font-medium px-4">
                      Impersonation Active: You are acting as another user.
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReturnToAdmin}
                className="flex-shrink-0 ml-4"
              >
                Return to Admin
              </Button>
            </div>
          </div>
        )}
        <ThemeProvider>
          <ToastProvider>
            <AppProvider>
              <PushNotificationInitializer />
              <div
                className={`min-h-screen flex flex-col ${
                  isImpersonating && isAuthenticatedRoute ? "pt-0" : ""
                }`}
              >
                <MaintenanceBanner />
                <div className="flex-1">{routeElement}</div>
                <NetworkStatusIndicator />
                <InstallPrompt />
                <AnnouncementBanner />
                <AnnouncementWatcher />
              </div>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </>
    </StorefrontSessionProvider>
  );
}

export default App;
