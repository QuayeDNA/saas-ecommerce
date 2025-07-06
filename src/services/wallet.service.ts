import { apiClient } from '../utils/api-client';
import type { WalletTransaction, WalletInfo, TopUpRequest, WalletAnalytics } from '../types/wallet';

export interface WalletTransactionsResponse {
  success: boolean;
  transactions: WalletTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface WalletInfoResponse {
  success: boolean;
  wallet: {
    balance: number;
    recentTransactions: WalletTransaction[];
  };
}

export interface TopUpRequestResponse {
  success: boolean;
  message: string;
  transaction?: WalletTransaction;
}

export interface WalletAnalyticsResponse {
  success: boolean;
  analytics: WalletAnalytics;
}

export interface PendingRequestsResponse {
  success: boolean;
  requests: TopUpRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for wallet-related functionality
 */
export class WalletService {
  /**
   * Get wallet information including balance and recent transactions
   */
  async getWalletInfo(): Promise<WalletInfo> {
    const { data } = await apiClient.get<WalletInfoResponse>('/wallet/info');
    return data.wallet;
  }

  /**
   * Get transaction history with pagination and filtering
   */
  async getTransactions(params: {
    page?: number;
    limit?: number;
    type?: 'credit' | 'debit';
    startDate?: string;
    endDate?: string;
  }): Promise<WalletTransactionsResponse> {
    const { data } = await apiClient.get<WalletTransactionsResponse>('/wallet/transactions', { params });
    return data;
  }

  /**
   * Request a wallet top-up (for agents)
   */
  async requestTopUp(amount: number, description: string): Promise<TopUpRequestResponse> {
    const { data } = await apiClient.post<TopUpRequestResponse>('/wallet/request-top-up', {
      amount,
      description
    });
    return data;
  }

  /**
   * Top up a wallet directly (admin only)
   */
  async topUpWallet(userId: string, amount: number, description?: string): Promise<TopUpRequestResponse> {
    const { data } = await apiClient.post<TopUpRequestResponse>('/wallet/top-up', {
      userId,
      amount,
      description: description || 'Manual top-up by admin'
    });
    return data;
  }

  /**
   * Get pending top-up requests (admin only)
   */
  async getPendingRequests(params: {
    page?: number;
    limit?: number;
  }): Promise<PendingRequestsResponse> {
    const { data } = await apiClient.get<PendingRequestsResponse>('/wallet/pending-requests', { params });
    return data;
  }

  /**
   * Process a top-up request (approve/reject) (admin only)
   */
  async processTopUpRequest(transactionId: string, approve: boolean): Promise<TopUpRequestResponse> {
    const { data } = await apiClient.post<TopUpRequestResponse>(`/wallet/requests/${transactionId}/process`, {
      approve
    });
    return data;
  }

  /**
   * Get wallet analytics (admin only)
   */
  async getWalletAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<WalletAnalyticsResponse> {
    const { data } = await apiClient.get<WalletAnalyticsResponse>('/wallet/analytics', { params });
    return data;
  }
}

export const walletService = new WalletService();
