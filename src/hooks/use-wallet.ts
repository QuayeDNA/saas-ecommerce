import { useContext, useState, useCallback } from 'react';
import { WalletContext } from '../contexts/wallet-context';
import { walletService } from '../services/wallet-service';
import type { 
  TransactionHistoryResponse,
  WalletAnalytics
} from '../types/wallet';

export function useWallet() {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionHistoryResponse | null>(null);
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);

  // Get transaction history with pagination
  const getTransactionHistory = useCallback(async (
    page = 1, 
    limit = 20, 
    type?: 'credit' | 'debit',
    startDate?: string,
    endDate?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await walletService.getTransactionHistory(page, limit, type, startDate, endDate);
      setTransactions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request a wallet top-up
  const requestTopUp = useCallback(async (amount: number, description: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await walletService.requestTopUp(amount, description);
      // Refresh wallet info after successful top-up request
      await context.refreshWallet();
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request wallet top-up');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  // Admin: Top up a user's wallet
  const adminTopUpWallet = useCallback(async (userId: string, amount: number, description?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await walletService.adminTopUpWallet(userId, amount, description);
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to top up wallet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin: Get pending top-up requests
  const getPendingRequests = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await walletService.getPendingRequests(page, limit);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin: Process (approve/reject) a top-up request
  const processTopUpRequest = useCallback(async (transactionId: string, approve: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const transaction = await walletService.processTopUpRequest(transactionId, approve);
      return transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process top-up request');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Admin: Get wallet analytics
  const getWalletAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await walletService.getWalletAnalytics(startDate, endDate);
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Context values
    walletBalance: context.walletBalance,
    recentTransactions: context.recentTransactions,
    refreshWallet: context.refreshWallet,
    connectionStatus: context.connectionStatus,
    
    // Local state
    transactions,
    analytics,
    isLoading: context.isLoading ?? isLoading,
    error: context.error ?? error,
    
    // Methods
    getTransactionHistory,
    requestTopUp,
    adminTopUpWallet,
    getPendingRequests,
    processTopUpRequest,
    getWalletAnalytics,
    clearError
  };
}
