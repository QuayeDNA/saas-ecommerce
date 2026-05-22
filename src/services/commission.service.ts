import { apiClient } from "../utils/api-client";
import type {
  CommissionBalanceResponse,
  CommissionStats,
  CommissionStatsResponse,
  CommissionListResponse,
  WithdrawResponse,
  WithdrawalHistoryResponse,
  Commission,
} from "../types/commission";

class CommissionService {
  async getBalance(): Promise<number> {
    const response = await apiClient.get<CommissionBalanceResponse>(
      "/api/commissions/balance"
    );
    return response.data.data.commissionBalance;
  }

  async getStats(): Promise<CommissionStats> {
    const response = await apiClient.get<CommissionStatsResponse>(
      "/api/commissions/stats"
    );
    return response.data.data;
  }

  async getCommissions(
    page = 1,
    limit = 20,
    status?: string
  ): Promise<CommissionListResponse["data"] & { pagination: CommissionListResponse["pagination"] }> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);

    const response = await apiClient.get<CommissionListResponse>(
      `/api/commissions?${params.toString()}`
    );
    return { ...response.data.data, pagination: response.data.pagination };
  }

  async withdraw(amount: number): Promise<WithdrawResponse["data"]> {
    const response = await apiClient.post<WithdrawResponse>(
      "/api/commissions/withdraw",
      { amount }
    );
    return response.data.data;
  }

  async getWithdrawalHistory(): Promise<WithdrawalHistoryResponse["data"]> {
    const response = await apiClient.get<WithdrawalHistoryResponse>(
      "/api/commissions/withdrawals"
    );
    return response.data.data;
  }

  async processDailyBatch(): Promise<{
    success: boolean;
    message: string;
    data?: {
      totalCommissions: number;
      totalAmount: number;
      qualifiedUsersCount: number;
      date: string;
    };
  }> {
    const response = await apiClient.post("/api/commissions/process-daily");
    return response.data;
  }
}

export const commissionService = new CommissionService();
