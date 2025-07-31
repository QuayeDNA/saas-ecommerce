import React, { useEffect } from 'react';
import { useSiteStatus } from '../contexts/site-status-context';
import { FaExclamationTriangle } from 'react-icons/fa';

export const MaintenanceBanner: React.FC = () => {
  const { siteStatus, isLoading } = useSiteStatus();

  // Control body scroll when banner is visible
  useEffect(() => {
    if (siteStatus && !siteStatus.isSiteOpen) {
      // Disable scrolling when site is closed
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when site is open
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [siteStatus?.isSiteOpen]);

  // Don't show banner if loading or site is open
  if (isLoading || !siteStatus || siteStatus.isSiteOpen) {
    return null;
  }

  return (
    <div className="bg-yellow-50 min-h-screen flex flex-col items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-yellow-800 mb-2">Site Maintenance</h1>
          <p className="text-lg text-yellow-700 mb-4">{siteStatus.customMessage}</p>
        </div>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-6 py-4">
          <div className="text-sm text-yellow-800 font-medium">
            🔧 MAINTENANCE MODE - Please check back later
          </div>
        </div>
      </div>
    </div>
  );
}; 