import { apiClient } from "../utils/api-client";
import type {
  ReferralDashboardResponse,
  ReferralDashboard,
  LeaderboardResponse,
  LeaderboardEntry,
  ReferralTreeResponse,
  ReferralTreeNode,
  ReferralAdminStatsResponse,
  ReferralAdminStats,
  ReferralAdminUsersResponse,
  ReferralAdminUser,
  BackendPagination,
} from "../types/referral";

class ReferralService {
  async getDashboard(): Promise<ReferralDashboard> {
    const response = await apiClient.get<ReferralDashboardResponse>(
      "/api/referrals/dashboard"
    );
    return response.data.data;
  }

  async getLeaderboard(
    timeframe: "weekly" | "monthly" | "all" = "monthly"
  ): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardResponse>(
      `/api/referrals/leaderboard?timeframe=${timeframe}`
    );
    return response.data.data;
  }

  async getReferralTree(
    depth = 3,
    userInfo?: { fullName?: string; phone?: string }
  ): Promise<ReferralTreeNode[]> {
    const response = await apiClient.get<ReferralTreeResponse>(
      `/api/referrals/tree?depth=${depth}`
    );
    const treeData = Array.isArray(response.data.data) ? response.data.data : [];
    if (!userInfo || treeData.length === 0) {
      return treeData;
    }

    return [
      {
        user: {
          _id: "self",
          fullName: userInfo.fullName || "You",
          email: "",
          phone: userInfo.phone || "",
          referralCode: "",
          createdAt: "",
        },
        children: treeData,
      },
    ];
  }

  async getAdminStats(): Promise<ReferralAdminStats> {
    const response = await apiClient.get<ReferralAdminStatsResponse>(
      "/api/referrals/admin/stats"
    );
    return response.data.data;
  }

  async getAdminUsers(): Promise<{
    users: ReferralAdminUser[];
    pagination: BackendPagination;
  }> {
    const response = await apiClient.get<ReferralAdminUsersResponse>(
      "/api/referrals/admin/users"
    );
    return {
      users: Array.isArray(response.data.data.users) ? response.data.data.users : [],
      pagination: response.data.data.pagination,
    };
  }
}

export const referralService = new ReferralService();
