import React from 'react';
import { useSiteStatus } from '../contexts/site-status-context';
import { Alert } from '../design-system/components/alert';
import { FaExclamationTriangle } from 'react-icons/fa';

export const MaintenanceBanner: React.FC = () => {
  const { siteStatus, isLoading } = useSiteStatus();

  // Don't show banner if loading or site is open
  if (isLoading || !siteStatus || siteStatus.isSiteOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert
        status="warning"
        title="Site Maintenance"
        icon={<FaExclamationTriangle className="w-4 h-4" />}
      >
        <div className="flex items-center justify-between">
          <span>{siteStatus.customMessage}</span>
          <div className="text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
            MAINTENANCE MODE
          </div>
        </div>
      </Alert>
    </div>
  );
}; 