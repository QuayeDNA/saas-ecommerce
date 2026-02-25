import { apiClient } from "../utils/api-client";
import type {
  WalletInfo,
  TransactionHistoryResponse,
  WalletTransaction,
  WalletAnalytics,
  EarningsDashboard,
  PayoutRequestItem,
  PayoutDestination,
} from "../types/wallet";
import { canHaveWallet } from "../utils/userTypeHelpers";

// Use the consolidated apiClient for all wallet operations
export const walletService = {
  /**
   * Get wallet info and recent transactions (only for agents)
   * @param userType User type to check if agent
   * @returns Wallet information with recent transactions
   */
  getWalletInfo: async (userType?: string): Promise<WalletInfo | null> => {
    // Only fetch wallet data for business users
    if (!canHaveWallet(userType || "")) {
      return null;
    }

    const response = await apiClient.get<{
      success: boolean;
      wallet: WalletInfo;
    }>("/api/wallet/info");
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
    type?: "credit" | "debit",
    startDate?: string,
    endDate?: string
  ): Promise<TransactionHistoryResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (type) params.append("type", type);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await apiClient.get<{
      success: boolean;
      transactions: WalletTransaction[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>(`/api/wallet/transactions?${params.toString()}`);

    return {
      transactions: response.data.transactions,
      pagination: response.data.pagination,
    };
  },

  /**
   * Check if user has a pending top-up request
   * @returns Boolean indicating if user has pending top-up request
   */
  checkPendingTopUpRequest: async (): Promise<boolean> => {
    const response = await apiClient.get<{
      success: boolean;
      hasPendingRequest: boolean;
    }>("/api/wallet/check-pending-topup");

    return response.data.hasPendingRequest;
  },

  /**
   * Request a wallet top-up
   * @param amount Amount to request
   * @param description Reason for the top-up
   * @returns The created transaction request
   */
  requestTopUp: async (
    amount: number,
    description: string
  ): Promise<WalletTransaction> => {
    const response = await apiClient.post<{
      success: boolean;
      transaction: WalletTransaction;
    }>("/api/wallet/request-top-up", { amount, description });

    return response.data.transaction;
  },

  /**
   * Initiate Paystack checkout for instant wallet top-up (agent-facing)
   * Calls backend POST /api/wallet/paystack/initiate and returns Paystack init data
   */
  initiatePaystackTopUp: async (
    amount: number
  ): Promise<{ authorizationUrl: string; reference: string; access_code?: string; amount?: number }> => {
    const response = await apiClient.post<{ success: boolean; data: any }>("/api/wallet/paystack/initiate", { amount });
    return response.data.data;
  },

  /**
   * Verify a paystack transaction by reference (used by frontend callback)
   */
  verifyPaystackReference: async (reference: string) => {
    const response = await apiClient.get<{ success: boolean; message?: string }>(`/api/wallet/paystack/verify?reference=${encodeURIComponent(reference)}`);
    return response.data;
  },

  /**
   * Get Paystack public key + server-side configured status
   * Calls GET /api/wallet/paystack/public-key and returns { publicKey, configured }
   */
  getPaystackPublicKey: async (): Promise<{ publicKey: string; configured: boolean }> => {
    const response = await apiClient.get<{
      success: boolean;
      publicKey?: string;
      configured?: boolean;
    }>("/api/wallet/paystack/public-key");

    return {
      publicKey: response.data?.publicKey || "",
      configured: Boolean(response.data?.configured),
    };
  },

  /**
   * Cancel a pending Paystack top-up request by reference (cleanup on failure)
   */
  cancelPaystackTopUp: async (reference: string) => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/wallet/paystack/cancel?reference=${encodeURIComponent(reference)}`
    );
    return response.data;
  },

  /**
   * Admin: Top up a user's wallet
   * @param userId User ID to credit
   * @param amount Amount to credit
   * @param description Optional description
   * @returns The created transaction
   */
  adminTopUpWallet: async (
    userId: string,
    amount: number,
    description = "Wallet top-up by admin"
  ): Promise<WalletTransaction> => {
    const response = await apiClient.post<{
      success: boolean;
      transaction: WalletTransaction;
    }>("/api/wallet/top-up", { userId, amount, description });

    return response.data.transaction;
  },

  /**
   * Admin: Debit a user's wallet
   * @param userId User ID to debit
   * @param amount Amount to debit
   * @param description Optional description
   * @returns The created transaction
   */
  adminDebitWallet: async (
    userId: string,
    amount: number,
    description = "Wallet debit by admin"
  ): Promise<WalletTransaction> => {
    const response = await apiClient.post<{
      success: boolean;
      transaction: WalletTransaction;
    }>("/api/wallet/debit", { userId, amount, description });

    return response.data.transaction;
  },

  /**
   * Admin: Get pending top-up requests
   * @param page Page number
   * @param limit Items per page
   * @returns Paginated pending requests
   */
  getPendingRequests: async (
    page = 1,
    limit = 20
  ): Promise<TransactionHistoryResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await apiClient.get<{
      success: boolean;
      requests: WalletTransaction[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>(`/api/wallet/pending-requests?${params.toString()}`);

    return {
      transactions: response.data.requests,
      pagination: response.data.pagination,
    };
  },

  /**
   * Admin: Process (approve/reject) a top-up request
   * @param transactionId Transaction ID to process
   * @param approve Whether to approve or reject
   * @returns The updated transaction
   */
  processTopUpRequest: async (
    transactionId: string,
    approve: boolean
  ): Promise<WalletTransaction> => {
    const response = await apiClient.post<{
      success: boolean;
      transaction: WalletTransaction;
    }>(`/api/wallet/requests/${transactionId}/process`, { approve });

    return response.data.transaction;
  },

  /**
   * Admin: Get wallet analytics
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Wallet analytics
   */
  getWalletAnalytics: async (
    startDate?: string,
    endDate?: string
  ): Promise<WalletAnalytics> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await apiClient.get<{
      success: boolean;
      analytics: WalletAnalytics;
    }>(`/api/wallet/analytics?${params.toString()}`);

    return response.data.analytics;
  },

  /* Earnings & Payouts (agent-facing) */
  getEarningsDashboard: async (): Promise<EarningsDashboard> => {
    const response = await apiClient.get<{ success: boolean; data: EarningsDashboard }>("/api/wallet/earnings/dashboard");
    return response.data.data;
  },

  getPayouts: async (status?: string): Promise<PayoutRequestItem[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    const response = await apiClient.get<{ success: boolean; data: PayoutRequestItem[] }>(`/api/wallet/payouts?${params.toString()}`);
    return response.data.data;
  },

  requestPayout: async (amount: number, destination: PayoutDestination): Promise<PayoutRequestItem> => {
    const response = await apiClient.post<{ success: boolean; data: PayoutRequestItem }>("/api/wallet/payouts/request", { amount, destination });
    return response.data.data;
  },

  /* Admin: payout queue & actions */
  getPendingPayouts: async (): Promise<PayoutRequestItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: PayoutRequestItem[] }>("/api/wallet/admin/payouts");
    return response.data.data;
  },

  approvePayout: async (payoutId: string, transferReference?: string) => {
    const response = await apiClient.put<{ success: boolean; data: PayoutRequestItem }>(`/api/wallet/admin/payouts/${payoutId}/approve`, { transferReference });
    return response.data.data;
  },

  rejectPayout: async (payoutId: string, reason?: string) => {
    const response = await apiClient.put<{ success: boolean; data: PayoutRequestItem }>(`/api/wallet/admin/payouts/${payoutId}/reject`, { reason });
    return response.data.data;
  },

  processPayout: async (payoutId: string) => {
    const response = await apiClient.post<{ success: boolean; data: PayoutRequestItem }>(`/api/wallet/admin/payouts/${payoutId}/process`);
    return response.data.data;
  },

  /**
   * Admin: Get all wallet transactions performed by admin
   * @param page Page number
   * @param limit Items per page
   * @param type Transaction type filter
   * @param startDate Start date filter
   * @param endDate End date filter
   * @param userId User ID filter
   * @returns Paginated admin transaction history
   */
  getAdminTransactions: async (
    page = 1,
    limit = 20,
    type?: "credit" | "debit",
    startDate?: string,
    endDate?: string,
    userId?: string
  ): Promise<TransactionHistoryResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (type) params.append("type", type);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (userId) params.append("userId", userId);

    const response = await apiClient.get<{
      success: boolean;
      transactions: WalletTransaction[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>(`/api/wallet/admin-transactions?${params.toString()}`);

    return {
      transactions: response.data.transactions,
      pagination: response.data.pagination,
    };
  },
};
