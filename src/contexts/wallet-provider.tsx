import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { walletService } from '../services/wallet-service';
import type { WalletInfo } from '../types/wallet';
import { useAuth } from '../hooks/use-auth';
import { WalletContext } from './wallet-context';

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

  // Load wallet data on initial render and when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshWallet();
    }
  }, [authState.isAuthenticated, refreshWallet]);

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
