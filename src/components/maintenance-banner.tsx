import React from "react";
import { useSiteStatus } from "../contexts/site-status-context";
import { FaExclamationTriangle } from "react-icons/fa";

export const MaintenanceBanner: React.FC = () => {
  const { siteStatus, isLoading } = useSiteStatus();

  // Don't show banner if loading or site is open
  if (isLoading || !siteStatus || siteStatus.isSiteOpen) {
    return null;
  }

  return (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <FaExclamationTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0">
            <div className="inline-block animate-marquee">
              <span className="text-sm text-warning font-medium px-4">
                {siteStatus.customMessage}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-warning bg-warning/20 px-2 py-1 rounded font-medium">
          🚫 SITE CLOSED
        </div>
      </div>
    </div>
  );
};
