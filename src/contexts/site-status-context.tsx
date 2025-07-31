import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { settingsService } from '../services/settings.service';

interface SiteStatus {
  isSiteOpen: boolean;
  customMessage: string;
}

interface SiteStatusContextType {
  siteStatus: SiteStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshSiteStatus: () => Promise<void>;
}

const SiteStatusContext = createContext<SiteStatusContextType | undefined>(undefined);

export const useSiteStatus = () => {
  const context = useContext(SiteStatusContext);
  if (context === undefined) {
    throw new Error('useSiteStatus must be used within a SiteStatusProvider');
  }
  return context;
};

interface SiteStatusProviderProps {
  children: ReactNode;
}

export const SiteStatusProvider: React.FC<SiteStatusProviderProps> = ({ children }) => {
  const [siteStatus, setSiteStatus] = useState<SiteStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSiteStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await settingsService.getSiteStatus();
      setSiteStatus(status);
    } catch (err) {
      setError('Failed to load site status');
      console.error('Error loading site status:', err);
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
    refreshSiteStatus
  };

  return (
    <SiteStatusContext.Provider value={value}>
      {children}
    </SiteStatusContext.Provider>
  );
}; 