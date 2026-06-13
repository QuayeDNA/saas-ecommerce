export interface ReferralDashboard {
  referralCode: string;
  shareLink: string;
  totalReferred: number;
  activeReferred: number;
  totalCommissionsEarned: number;
  pendingCommissions: number;
  commissionBalance: number;
  walletBalance: number;
}

export interface ReferralDashboardResponse {
  success: boolean;
  data: ReferralDashboard;
}

export interface LeaderboardEntry {
  referrerId: string;
  fullName: string;
  referralCode: string;
  commissionsEarned: number;
  totalOrders: number;
  totalReferred: number;
  batchCount: number;
}

export interface PaginatedLeaderboard {
  entries: LeaderboardEntry[];
  pagination: BackendPagination;
}

export interface LeaderboardResponse {
  success: boolean;
  data: PaginatedLeaderboard;
}

export interface ReferralTreeUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  createdAt: string;
  totalOrders: number;
}

export interface ReferralTreeNode {
  user: ReferralTreeUser;
  children: ReferralTreeNode[];
}

export interface ReferralTreeResponse {
  success: boolean;
  data: ReferralTreeNode[];
}

export interface ReferralAdminStats {
  totalReferrers: number;
  activeReferrers: number;
  totalCommissionsPaid: number;
  totalOrdersFromReferrals: number;
  totalBatches: number;
  totalReferred: number;
  referredWithOrders: number;
  referralConversionRate: number;
}

export interface ReferralAdminStatsResponse {
  success: boolean;
  data: ReferralAdminStats;
}

export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ReferralAdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  referredBy?: {
    _id: string;
    fullName: string;
    email: string;
    referralCode: string;
  } | null;
  status: string;
  createdAt: string;
  orderCount: number;
}

export interface ReferralAdminUserDetail {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  referredBy?: {
    _id: string;
    fullName: string;
    email: string;
    referralCode: string;
  } | null;
  status: string;
  createdAt: string;
  walletBalance: number;
  commissionBalance: number;
  totalReferred: number;
  orderStats: {
    totalOrders: number;
    totalOrderValue: number;
    lastOrderDate: string | null;
  };
  commissionAsReferrer: {
    totalEarned: number;
    totalOrders: number;
    batchCount: number;
  };
}

export interface ReferralAdminUsersResponse {
  success: boolean;
  data: {
    users: ReferralAdminUser[];
    pagination: BackendPagination;
  };
}
