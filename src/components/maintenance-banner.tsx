import React from 'react';
import { useSiteStatus } from '../contexts/site-status-context';
import { FaExclamationTriangle } from 'react-icons/fa';

export const MaintenanceBanner: React.FC = () => {
  const { siteStatus, isLoading } = useSiteStatus();



  // Don't show banner if loading or site is open
  if (isLoading || !siteStatus || siteStatus.isSiteOpen) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">{siteStatus.customMessage}</span>
        </div>
        <div className="text-xs text-yellow-800 bg-yellow-100 px-2 py-1 rounded font-medium">
          🔧 MAINTENANCE MODE
        </div>
      </div>
    </div>
  );
}; 