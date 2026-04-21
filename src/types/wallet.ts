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

// MTN/MoMo initiation response
export interface MomoInitiateResponse {
  success: boolean;
  message?: string;
  referenceId?: string;
}

// MTN/MoMo verify response (backend may include transaction object)
export interface MomoVerifyResponse {
  success: boolean;
  message?: string;
  transaction?: WalletTransaction | null;
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

export interface AdminPayoutSummary {
  totalProfit: number;
  availableEarnings: number;
  totalWithdrawn: number;
  processingAmount: number;
}

// Earnings & Payout types (storefront payouts)
export type PayoutDestinationType = 'mobile_money' | 'bank_account';

export interface PayoutDestination {
  type: PayoutDestinationType;
  mobileProvider?: string; // MTN|TELECEL|AT
  phoneNumber?: string; // e.g. 0244123456
  bankCode?: string; // free-text bank code/name
  accountNumber?: string;
  accountName?: string;
  recipientName?: string;
  recipientCode?: string;
}

export interface SavedPayoutAccount extends PayoutDestination {
  updatedAt?: string | Date;
}

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected';

export interface PayoutRequestItem {
  _id: string;
  user: string | { _id: string; fullName?: string; email?: string; phone?: string; earningsBalance?: number; userType?: string };
  amount: number;
  currency: string;
  status: PayoutStatus;
  destination: PayoutDestination;
  transferFee?: number;
  netAmount?: number;
  paystackTransfer?: Record<string, any> | null;
  reviewedBy?: string;
  reviewedAt?: string | Date;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  createdAt: string | Date;
  updatedAt?: string | Date;
  requestedAt?: string | Date;
  processedAt?: string | Date;
  completedAt?: string | Date;
}

export interface EarningsDashboard {
  availableBalance: number;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  recentPayouts: PayoutRequestItem[];
  canRequestPayout: boolean;
  savedPayoutAccount?: SavedPayoutAccount | null;
  transferFees?: {
    mobile_money: number;
    bank_account: number;
  };
  payoutFeeBearer?: 'platform' | 'agent';
  platformPayoutFeePercent?: number;
  autoPayoutEnabled?: boolean;
  minimumPayoutAmounts?: {
    mobile_money: number;
    bank_account: number;
  };
  canAutoPayout?: boolean; // new field to indicate if auto payout is possible based on settings and configuration
}

