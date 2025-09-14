import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./design-system/components/toast";
import { Button } from "./design-system";
import "./App.css";
import "./design-system/theme.css";
import { AppProvider } from "./providers/app-provider";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { MaintenanceBanner } from "./components/maintenance-banner";
import { InstallPrompt } from "./components/install-prompt";

function App() {
  const routeElement = useRoutes(routes);
  const isImpersonating =
    typeof window !== "undefined" &&
    localStorage.getItem("impersonation") === "true";

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
      {isImpersonating && (
        <div className="bg-yellow-100 border-b border-yellow-300 p-2 flex flex-col sm:flex-row sm:items-center justify-between z-50 w-full">
          <span className="text-yellow-800 font-semibold text-sm">
            Impersonation Active: You are acting as another user.
          </span>
          <Button variant="danger" size="sm" onClick={handleReturnToAdmin}>
            Return to Admin
          </Button>
        </div>
      )}
      <ThemeProvider initialTheme="default">
        <ToastProvider>
          <AppProvider>
            <NotificationProvider>
              <div className="min-h-screen flex flex-col">
                <MaintenanceBanner />
                <div className="flex-1">{routeElement}</div>
                <NetworkStatusIndicator />
                <InstallPrompt />
              </div>
            </NotificationProvider>
          </AppProvider>
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
