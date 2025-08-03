import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { walletService } from '../services/wallet-service';
import { websocketService } from '../services/websocket.service';
import type { WalletInfo, WalletTransaction } from '../types/wallet';
import { useAuth } from '../hooks/use-auth';
import { WalletContext } from './wallet-context';

interface WalletUpdateEvent {
  type: 'wallet_update';
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

  const refreshWallet = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await walletService.getWalletInfo();
      setWalletInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet information');
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  // WebSocket wallet update handler
  const handleWalletUpdate = useCallback((data: WalletUpdateEvent) => {
    if (data.type === 'wallet_update' && data.userId === authState.user?.id) {
      // Update wallet balance in real-time
      setWalletInfo(prev => prev ? {
        ...prev,
        balance: data.balance,
        recentTransactions: data.recentTransactions || prev.recentTransactions
      } : null);
    }
  }, [authState.user?.id]);

  // Load wallet data on initial render and when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshWallet();
      
      // Connect to WebSocket for real-time updates
      if (authState.user?.id) {
        websocketService.connect(authState.user.id);
        
        // Listen for wallet updates
        websocketService.on('wallet_update', handleWalletUpdate as (data: unknown) => void);
        
        // Cleanup WebSocket listeners on unmount
        return () => {
          websocketService.off('wallet_update', handleWalletUpdate as (data: unknown) => void);
        };
      }
    } else {
      // Disconnect WebSocket when user logs out
      websocketService.disconnect();
    }
  }, [authState.isAuthenticated, authState.user?.id, refreshWallet, handleWalletUpdate]);

  const value = useMemo(() => ({
    walletBalance: walletInfo?.balance ?? 0,
    recentTransactions: walletInfo?.recentTransactions ?? [],
    isLoading,
    error,
    refreshWallet
  }), [walletInfo, isLoading, error, refreshWallet]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
