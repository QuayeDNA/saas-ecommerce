import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { settingsService } from "../services/settings.service";
import { websocketService } from "../services/websocket.service";
import { useAuth } from "../hooks/use-auth";

interface SiteStatus {
  isSiteOpen: boolean;
  customMessage: string;
}

interface SiteStatusContextType {
  siteStatus: SiteStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshSiteStatus: () => Promise<void>;
  signupApprovalRequired: boolean;
}

const SiteStatusContext = createContext<SiteStatusContextType | undefined>(
  undefined
);

export const useSiteStatus = () => {
  const context = useContext(SiteStatusContext);
  if (context === undefined) {
    throw new Error("useSiteStatus must be used within a SiteStatusProvider");
  }
  return context;
};

interface SiteStatusProviderProps {
  children: ReactNode;
}

export const SiteStatusProvider: React.FC<SiteStatusProviderProps> = ({
  children,
}) => {
  const [siteStatus, setSiteStatus] = useState<SiteStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signupApprovalRequired, setSignupApprovalRequired] = useState(true);

  const refreshSiteStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [status, approvalData] = await Promise.all([
        settingsService.getSiteStatus(),
        settingsService.getSignupApprovalSetting(),
      ]);
      setSiteStatus(status);
      setSignupApprovalRequired(approvalData.requireApprovalForSignup);
    } catch (err) {
      setError("Failed to load site status");
      console.error("Error loading site status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSiteStatus();
  }, []);

  const value: SiteStatusContextType = {
    siteStatus,
    isLoading,
    error,
    refreshSiteStatus,
    signupApprovalRequired,
  };

  return (
    <SiteStatusContext.Provider value={value}>
      {children}
    </SiteStatusContext.Provider>
  );
};

// WebSocket connector component that should be used inside AuthProvider
export const SiteStatusWebSocketConnector: React.FC = () => {
  const { authState } = useAuth();
  const { refreshSiteStatus } = useSiteStatus();

  useEffect(() => {
    if (authState.user?.id) {
      // Connect to WebSocket
      websocketService.connect(authState.user.id);

      // Listen for site status updates
      const handleSiteStatusUpdate = (data: unknown) => {
        console.log("Received site status update via WebSocket:", data);
        if (data && typeof data === "object") {
          // Refresh the site status to get the latest data
          refreshSiteStatus();
        }
      };

      websocketService.on("site_status_update", handleSiteStatusUpdate);

      // Cleanup function
      return () => {
        websocketService.off("site_status_update", handleSiteStatusUpdate);
      };
    }
  }, [authState.user?.id, refreshSiteStatus]);

  return null; // This component doesn't render anything
};
