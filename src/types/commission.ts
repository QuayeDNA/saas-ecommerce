export type CommissionStatus = "pending" | "paid" | "cancelled";

export interface Commission {
  _id: string;
  referrer: string;
  date: string;
  amount: number;
  commissionRate: number;
  batchTotal: number;
  ordersCount: number;
  qualifiedUsersCount: number;
  status: CommissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionBalanceResponse {
  success: boolean;
  balance: number;
}

export interface CommissionStats {
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  withdrawnCommissions: number;
  averageCommission: number;
  dailyAverage: number;
  currentBalance: number;
}

export interface CommissionStatsResponse {
  success: boolean;
  data: CommissionStats;
}

export interface CommissionListResponse {
  success: boolean;
  data: Commission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface WithdrawResponse {
  success: boolean;
  data: {
    transaction: {
      _id: string;
      amount: number;
      type: string;
      description: string;
      metadata: {
        type: string;
        commissionIds: string[];
      };
    };
    newBalance: number;
  };
}

export interface WithdrawalHistoryResponse {
  success: boolean;
  data: Array<{
    _id: string;
    user: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    metadata: {
      type: string;
      commissionIds?: string[];
    };
    createdAt: string;
  }>;
}
