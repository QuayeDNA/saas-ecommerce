import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { walletService } from "../services/wallet-service";
import { websocketService } from "../services/websocket.service";
import type { WalletInfo, WalletTransaction } from "../types/wallet";
import { useAuth } from "../hooks/use-auth";
import { WalletContext } from "./wallet-context";
import { canHaveWallet } from "../utils/userTypeHelpers";

interface WalletUpdateEvent {
  type: "wallet_update";
  userId: string;
  balance: number;
  recentTransactions: WalletTransaction[];
}

interface WalletProviderProps {
  readonly children: ReactNode;
}

export function WalletProvider({ children }: Readonly<WalletProviderProps>) {
  const { authState } = useAuth();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "websocket" | "disconnected"
  >("disconnected");

  // Helper function to get user ID (handles both 'id' and '_id' properties)
  const getUserId = useCallback(() => {
    if (!authState.user) {
      return null;
    }

    return authState.user.id || authState.user._id;
  }, [authState.user]);

  const refreshWallet = useCallback(async () => {
    const userId = getUserId();
    if (!authState.isAuthenticated || !userId) {
      return;
    }

    // Only fetch wallet for business users
    if (!canHaveWallet(authState.user?.userType || "")) {
      setWalletInfo(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await walletService.getWalletInfo(authState.user?.userType);
      setWalletInfo(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch wallet information";
      setError(errorMessage);
      setWalletInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, authState.user?.userType, getUserId]);

  // WebSocket wallet update handler
  const handleWalletUpdate = useCallback(
    (data: unknown) => {
      // Only process wallet updates for business users
      if (!canHaveWallet(authState.user?.userType || "")) {
        return;
      }

      // Type guard to ensure data is WalletUpdateEvent
      if (
        typeof data === "object" &&
        data !== null &&
        "type" in data &&
        "userId" in data
      ) {
        const walletUpdate = data as WalletUpdateEvent;
        const currentUserId = getUserId();

        if (
          walletUpdate.type === "wallet_update" &&
          walletUpdate.userId === currentUserId
        ) {
          // Update wallet balance in real-time
          setWalletInfo((prev) => {
            const updatedWallet = prev
              ? {
                ...prev,
                balance: walletUpdate.balance,
                recentTransactions:
                  walletUpdate.recentTransactions || prev.recentTransactions,
              }
              : {
                balance: walletUpdate.balance,
                recentTransactions: walletUpdate.recentTransactions || [],
              };

            return updatedWallet;
          });
        }
      }
    },
    [authState.user?.userType, getUserId]
  );

  // Monitor connection status and ensure WebSocket is connected
  useEffect(() => {
    const checkConnectionStatus = () => {
      if (websocketService.isConnected()) {
        setConnectionStatus("websocket");
      } else {
        setConnectionStatus("disconnected");
      }
    };

    // Check status every 2 seconds
    const interval = setInterval(checkConnectionStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Load wallet data on initial render and when auth state changes
  useEffect(() => {
    const userId = getUserId();

    if (
      authState.isAuthenticated &&
      userId &&
      canHaveWallet(authState.user?.userType || "")
    ) {
      // Initial wallet load
      refreshWallet();

      // Connect to WebSocket for real-time updates
      websocketService.connect(userId);

      // Listen for wallet updates
      websocketService.on("wallet_update", handleWalletUpdate);

      // Set up periodic refresh as fallback (every 30 seconds)
      const fallbackInterval = setInterval(() => {
        if (connectionStatus === "disconnected") {
          refreshWallet();
        }
      }, 30000);

      // Cleanup WebSocket listeners and interval on unmount
      return () => {
        websocketService.off("wallet_update", handleWalletUpdate);
        clearInterval(fallbackInterval);
      };
    } else if (!authState.isAuthenticated) {
      // Disconnect WebSocket when user logs out
      websocketService.disconnect();
      // Clear wallet data
      setWalletInfo(null);
      setConnectionStatus("disconnected");
    }
  }, [
    authState.isAuthenticated,
    authState.user?.userType,
    authState.user,
    refreshWallet,
    handleWalletUpdate,
    getUserId,
    connectionStatus,
  ]);

  const value = useMemo(
    () => ({
      walletBalance: walletInfo?.balance ?? 0,
      recentTransactions: walletInfo?.recentTransactions ?? [],
      isLoading,
      error,
      refreshWallet,
      connectionStatus,
      isAgent: canHaveWallet(authState.user?.userType || ""),
    }),
    [
      walletInfo,
      isLoading,
      error,
      refreshWallet,
      connectionStatus,
      authState.user?.userType,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
