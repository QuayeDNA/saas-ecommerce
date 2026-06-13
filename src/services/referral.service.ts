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
  ReferralAdminUserDetail,
  BackendPagination,
} from "../types/referral";

const SELF_USER_ID = "self";

class ReferralService {
  async getDashboard(): Promise<ReferralDashboard> {
    const response = await apiClient.get<ReferralDashboardResponse>(
      "/api/referrals/dashboard"
    );
    return response.data.data;
  }

  async getLeaderboard(
    timeframe: "this-week" | "this-month" | "all-time" = "all-time",
    page = 1
  ): Promise<{ entries: LeaderboardEntry[]; pagination: BackendPagination }> {
    const response = await apiClient.get<LeaderboardResponse>(
      `/api/referrals/leaderboard?timeframe=${timeframe}&page=${page}`
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
          _id: SELF_USER_ID,
          fullName: userInfo.fullName || "You",
          email: "",
          phone: userInfo.phone || "",
          referralCode: "",
          createdAt: "",
          totalOrders: 0,
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

  async getAdminUsers(
    page = 1, limit = 20
  ): Promise<{
    users: ReferralAdminUser[];
    pagination: BackendPagination;
  }> {
    const response = await apiClient.get<ReferralAdminUsersResponse>(
      `/api/referrals/admin/users?page=${page}&limit=${limit}`
    );
    return {
      users: Array.isArray(response.data.data.users) ? response.data.data.users : [],
      pagination: response.data.data.pagination,
    };
  }

  async getAdminUserDetail(id: string): Promise<ReferralAdminUserDetail> {
    const response = await apiClient.get<{
      success: boolean;
      data: ReferralAdminUserDetail;
    }>(`/api/referrals/admin/users/${id}`);
    return response.data.data;
  }
}

export const referralService = new ReferralService();
