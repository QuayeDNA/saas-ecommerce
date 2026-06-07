export type CommissionStatus = "pending" | "credited" | "cancelled";

export interface PopulatedUser {
  _id: string;
  fullName: string;
  email: string;
  agentCode?: string;
}

export interface Commission {
  _id: string;
  referrer: string | PopulatedUser;
  date: string;
  amount: number;
  rate: number;
  batchTotal: number;
  ordersCount: number;
  qualifiedUsersCount: number;
  status: CommissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CommissionBalanceResponse {
  success: boolean;
  data: {
    commissionBalance: number;
    walletBalance: number;
  };
}

export interface CommissionStats {
  totalCommissions: number;
  totalEarned: number;
  totalPending: number;
  pendingCount: number;
  creditedCount: number;
}

export interface CommissionStatsResponse {
  success: boolean;
  data: CommissionStats;
}

export interface CommissionListResponse {
  success: boolean;
  data: {
    commissions: Commission[];
    pagination: BackendPagination;
  };
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    commissionBalance: number;
    walletBalance: number;
  };
}

export interface Withdrawal {
  _id: string;
  user: string | PopulatedUser;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  metadata: {
    type: string;
    commissionIds?: string[];
  };
  createdAt: string;
}

export interface WithdrawalHistoryResponse {
  success: boolean;
  data: {
    withdrawals: Withdrawal[];
    pagination: BackendPagination;
  };
}
