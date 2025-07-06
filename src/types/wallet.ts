import type { User } from './auth';

// Wallet transaction types
export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'pending' | 'completed' | 'rejected';

export interface WalletTransaction {
  _id: string;
  user: string | User;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  reference: string;
  relatedOrder?: string;
  approvedBy?: string | User;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
}

// Wallet info interface
export interface WalletInfo {
  balance: number;
  recentTransactions: WalletTransaction[];
}

// Wallet transaction history response
export interface TransactionHistoryResponse {
  transactions: WalletTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Top-up request interface
export interface TopUpRequest {
  amount: number;
  description: string;
}

// Analytics interfaces
export interface WalletAnalytics {
  users: {
    total: number;
    withBalance: number;
    withoutBalance: number;
  };
  balance: {
    total: number;
    average: number;
    highest: number;
  };
  transactions: {
    credits: {
      count: number;
      total: number;
    };
    debits: {
      count: number;
      total: number;
    };
    pendingRequests: number;
  };
}
