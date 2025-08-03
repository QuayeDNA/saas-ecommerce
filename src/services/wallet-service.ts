import { apiClient } from '../utils/api-client';
import type { 
  WalletInfo,
  TransactionHistoryResponse,
  WalletTransaction, 
  WalletAnalytics 
} from '../types/wallet';

// Use the consolidated apiClient for all wallet operations
export const walletService = {
  /**
   * Get wallet info and recent transactions
   * @returns Wallet information with recent transactions
   */
  getWalletInfo: async (): Promise<WalletInfo> => {
    const response = await apiClient.get<{success: boolean; wallet: WalletInfo}>('/api/wallet/info');
    return response.data.wallet;
  },

  /**
   * Get transaction history with pagination
   * @param page Page number
   * @param limit Items per page
   * @param type Transaction type filter
   * @param startDate Start date filter
   * @param endDate End date filter
   * @returns Paginated transaction history
   */
  getTransactionHistory: async (
    page = 1, 
    limit = 20, 
    type?: 'credit' | 'debit',
    startDate?: string,
    endDate?: string
  ): Promise<TransactionHistoryResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<{
      success: boolean; 
      transactions: WalletTransaction[]; 
      pagination: { 
        total: number; 
        page: number; 
        limit: number; 
        pages: number;
      }
    }>(`/api/wallet/transactions?${params.toString()}`);
    
    return {
      transactions: response.data.transactions,
      pagination: response.data.pagination
    };
  },

  /**
   * Request a wallet top-up
   * @param amount Amount to request
   * @param description Reason for the top-up
   * @returns The created transaction request
   */
  requestTopUp: async (amount: number, description: string): Promise<WalletTransaction> => {
    const response = await apiClient.post<{success: boolean; transaction: WalletTransaction}>(
      '/api/wallet/request-top-up',
      { amount, description }
    );
    
    return response.data.transaction;
  },

  /**
   * Admin: Top up a user's wallet
   * @param userId User ID to credit
   * @param amount Amount to credit
   * @param description Optional description
   * @returns The created transaction
   */
  adminTopUpWallet: async (userId: string, amount: number, description = 'Wallet top-up by admin'): Promise<WalletTransaction> => {
    const response = await apiClient.post<{success: boolean; transaction: WalletTransaction}>(
      '/api/wallet/top-up',
      { userId, amount, description }
    );
    
    return response.data.transaction;
  },

  /**
   * Admin: Debit a user's wallet
   * @param userId User ID to debit
   * @param amount Amount to debit
   * @param description Optional description
   * @returns The created transaction
   */
  adminDebitWallet: async (userId: string, amount: number, description = 'Wallet debit by admin'): Promise<WalletTransaction> => {
    const response = await apiClient.post<{success: boolean; transaction: WalletTransaction}>(
      '/api/wallet/debit',
      { userId, amount, description }
    );
    
    return response.data.transaction;
  },

  /**
   * Admin: Get pending top-up requests
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated pending requests
   */
  getPendingRequests: async (page = 1, limit = 20): Promise<TransactionHistoryResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<{
      success: boolean; 
      requests: WalletTransaction[]; 
      pagination: { 
        total: number; 
        page: number; 
        limit: number; 
        pages: number;
      }
    }>(`/api/wallet/pending-requests?${params.toString()}`);
    
    return {
      transactions: response.data.requests,
      pagination: response.data.pagination
    };
  },

  /**
   * Admin: Process (approve/reject) a top-up request
   * @param transactionId Transaction ID to process
   * @param approve Whether to approve or reject
   * @returns The updated transaction
   */
  processTopUpRequest: async (transactionId: string, approve: boolean): Promise<WalletTransaction> => {
    const response = await apiClient.post<{success: boolean; transaction: WalletTransaction}>(
      `/api/wallet/requests/${transactionId}/process`,
      { approve }
    );
    
    return response.data.transaction;
  },

  /**
   * Admin: Get wallet analytics
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Wallet analytics
   */
  getWalletAnalytics: async (startDate?: string, endDate?: string): Promise<WalletAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<{success: boolean; analytics: WalletAnalytics}>(
      `/api/wallet/analytics?${params.toString()}`
    );
    
    return response.data.analytics;
  }
};
