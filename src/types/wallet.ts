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

export interface EarningsReconciliation {
  userId: string;
  availableBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  expectedAvailable: number;
  delta: number;
  isBalanced: boolean;
  reconciledAt: string | Date;
}

export interface EarningsReconciliationAdjustment extends EarningsReconciliation {
  adjusted: boolean;
  adjustedAt?: string | Date;
  adjustment?: {
    type: 'credit' | 'debit';
    amount: number;
    transactionId: string;
  };
}

export interface EarningsBackfillPreview {
  missingCount: number;
  totalMissingAmount: number;
  orders: Array<{
    _id: string;
    orderNumber: string;
    totalMarkup: number;
    storefrontId: string;
    createdAt: string | Date;
  }>;
}

export interface EarningsBackfillResult {
  appliedCount: number;
  totalAppliedAmount: number;
  availableBalance: number;
  ordersApplied: Array<{
    orderId: string;
    orderNumber: string;
    amount: number;
  }>;
}

