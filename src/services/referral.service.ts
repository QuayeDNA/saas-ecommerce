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

  async getReferralTree(depth = 3): Promise<ReferralTreeNode | null> {
    const response = await apiClient.get<ReferralTreeResponse>(
      `/api/referrals/tree?depth=${depth}`
    );
    const raw: unknown = response.data.data;
    if (!raw || (Array.isArray(raw) && raw.length === 0)) return null;
    return raw as ReferralTreeNode;
  }

  async getAdminStats(): Promise<ReferralAdminStats> {
    const response = await apiClient.get<ReferralAdminStatsResponse>(
      "/api/referrals/admin/stats"
    );
    return response.data.data;
  }

  async getAdminUsers(): Promise<ReferralAdminUser[]> {
    const response = await apiClient.get<ReferralAdminUsersResponse>(
      "/api/referrals/admin/users"
    );
    return response.data.data;
  }
}

export const referralService = new ReferralService();
