import React from "react";
import { useNetworkStatus } from "../hooks/use-network-status";
import { useOfflineQueue } from "../hooks/use-offline-queue";
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@design-system/components/button";

interface NetworkStatusIndicatorProps {
  className?: string;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className = "",
}) => {
  const { isOnline, isSlowConnection, connectionType, effectiveType } =
    useNetworkStatus();
  const { queue, isProcessing, forceSync } = useOfflineQueue();

  if (isOnline && queue.length === 0) {
    return null; // Don't show anything when everything is normal
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
        {/* Network Status */}
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi
              className={`w-4 h-4 ${
                isSlowConnection ? "text-yellow-500" : "text-green-500"
              }`}
            />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isOnline
              ? isSlowConnection
                ? "Slow Connection"
                : "Online"
              : "Offline"}
          </span>
          {connectionType && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({effectiveType || connectionType})
            </span>
          )}
        </div>

        {/* Offline Queue Status */}
        {queue.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">
                  {queue.length} pending{" "}
                  {queue.length === 1 ? "request" : "requests"}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={forceSync}
                disabled={!isOnline || isProcessing}
                className="h-7 px-2"
              >
                {isProcessing ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
            {!isOnline && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Requests will sync when connection is restored
              </p>
            )}
          </div>
        )}

        {/* Slow Connection Warning */}
        {isOnline && isSlowConnection && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                Slow connection detected. Some features may be slower.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
