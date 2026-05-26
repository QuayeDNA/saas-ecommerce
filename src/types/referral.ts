export interface ReferralDashboard {
  totalReferred: number;
  activeReferred: number;
  totalCommissionsEarned: number;
  referralCode: string;
  shareLink: string;
  commissionBalance: number;
  pendingCommissions: number;
  walletBalance: number;
}

export interface ReferralDashboardResponse {
  success: boolean;
  data: ReferralDashboard;
}

export interface LeaderboardEntry {
  fullName: string;
  referralCount: number;
  commissionEarned: number;
  rank: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

export interface ReferralTreeNode {
  userId: string;
  fullName: string;
  phone: string;
  level: number;
  createdAt: string;
  children: ReferralTreeNode[];
}

export interface ReferralTreeResponse {
  success: boolean;
  data: ReferralTreeNode;
}

export interface ReferralAdminStats {
  totalReferrals: number;
  activeParticipants: number;
  totalCommissionPaid: number;
  totalCommissionPending: number;
  averageReferralsPerUser: number;
  topReferrer: {
    fullName: string;
    referralCount: number;
    commissionEarned: number;
  } | null;
  dailySignups: Array<{
    date: string;
    count: number;
  }>;
}

export interface ReferralAdminStatsResponse {
  success: boolean;
  data: ReferralAdminStats;
}

export interface ReferralAdminUser {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  referralCode: string;
  referralCount: number;
  totalEarned: number;
  userType: string;
  createdAt: string;
}

export interface ReferralAdminUsersResponse {
  success: boolean;
  data: ReferralAdminUser[];
}
