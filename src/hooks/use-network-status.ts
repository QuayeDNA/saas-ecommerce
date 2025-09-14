import { useState, useEffect } from "react";

interface NetworkConnection {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
}

interface ExtendedNavigator extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
}

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
  effectiveType?: string;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const extendedNavigator = navigator as ExtendedNavigator;
      const connection =
        extendedNavigator.connection ||
        extendedNavigator.mozConnection ||
        extendedNavigator.webkitConnection;

      const isSlowConnection =
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g" ||
        (connection?.downlink && connection.downlink < 1);

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection: isSlowConnection || false,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType,
      });
    };

    // Listen for online/offline events
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    // Listen for connection changes if supported
    const extendedNavigator = navigator as ExtendedNavigator;
    const connection =
      extendedNavigator.connection ||
      extendedNavigator.mozConnection ||
      extendedNavigator.webkitConnection;

    if (connection?.addEventListener) {
      connection.addEventListener("change", updateNetworkStatus);
    }

    // Initial status
    updateNetworkStatus();

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);

      if (connection?.removeEventListener) {
        connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};
