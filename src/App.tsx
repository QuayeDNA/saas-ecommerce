import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { ThemeProvider, Button } from "./design-system";
import { ToastProvider } from "./design-system/components/toast";
import "./App.css";
import "./design-system/theme.css";
import { AppProvider } from "./providers/app-provider";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CommissionProvider } from "./contexts/CommissionContext";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { MaintenanceBanner } from "./components/maintenance-banner";
import { InstallPrompt } from "./components/install-prompt";
import { AnnouncementPopupHandler } from "./components/announcements/announcement-popup-handler";
import PushNotificationInitializer from "./components/PushNotificationInitializer";
import { useLocation } from "react-router-dom";

function App() {
  const routeElement = useRoutes(routes);
  const location = useLocation();
  const isImpersonating =
    typeof window !== "undefined" &&
    localStorage.getItem("impersonation") === "true";

  // Check if current route is authenticated (not public/auth routes)
  const isAuthenticatedRoute = location.pathname.startsWith('/agent') ||
                               location.pathname.startsWith('/admin') ||
                               location.pathname.startsWith('/superadmin');

  const handleReturnToAdmin = async () => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      // Restore admin token to localStorage
      localStorage.setItem("token", adminToken);

      // Clear impersonation flags
      localStorage.removeItem("adminToken");
      localStorage.removeItem("impersonation");

      // Clear cookies (auth service will handle this)
      const Cookies = (await import("js-cookie")).default;
      Cookies.remove("authToken", { path: "/" });
      Cookies.remove("user", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      Cookies.remove("rememberMe", { path: "/" });

      // Redirect to super admin dashboard
      window.location.href = "/superadmin";
    }
  };

  return (
    <>
      {isImpersonating && isAuthenticatedRoute && (
        <div className="sticky top-0 z-50 w-full bg-yellow-100 border-b border-yellow-300 p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm">
          <span className="text-yellow-800 font-semibold text-sm sm:text-base mb-2 sm:mb-0">
            Impersonation Active: You are acting as another user.
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReturnToAdmin}
            className="self-start sm:self-auto"
          >
            Return to Admin
          </Button>
        </div>
      )}
      <ThemeProvider initialTheme="default">
        <ToastProvider>
          <AppProvider>
            <CommissionProvider>
              <NotificationProvider>
                <AnnouncementProvider>
                  <PushNotificationInitializer />
                  <div className={`min-h-screen flex flex-col ${isImpersonating && isAuthenticatedRoute ? 'pt-0' : ''}`}>
                    <MaintenanceBanner />
                    <div className="flex-1">{routeElement}</div>
                    <NetworkStatusIndicator />
                    <InstallPrompt />
                    <AnnouncementPopupHandler />
                  </div>
                </AnnouncementProvider>
              </NotificationProvider>
            </CommissionProvider>
          </AppProvider>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
