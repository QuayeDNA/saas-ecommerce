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
  ): Promise<Commission[]> {
    const { data: result } = await this.getCommissionHistory(page, limit, status);
    return result;
  }

  async getCommissionHistory(
    page = 1,
    limit = 20,
    status?: string
  ): Promise<{
    data: Commission[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);

    const response = await apiClient.get<CommissionListResponse>(
      `/api/commissions?${params.toString()}`
    );
    const bp = response.data.data.pagination;
    return {
      data: Array.isArray(response.data.data.commissions)
        ? response.data.data.commissions
        : [],
      pagination: {
        page: bp?.page ?? 1,
        limit: bp?.limit ?? 20,
        total: bp?.total ?? 0,
        pages: bp?.totalPages ?? 0,
      },
    };
  }

  async withdraw(amount: number): Promise<WithdrawResponse["data"]> {
    const response = await apiClient.post<WithdrawResponse>(
      "/api/commissions/withdraw",
      { amount }
    );
    return response.data.data;
  }

  async getWithdrawalHistory(): Promise<
    Array<{
      _id: string;
      user: string;
      type: string;
      amount: number;
      balanceAfter: number;
      description: string;
      metadata: { type: string; commissionIds?: string[] };
      createdAt: string;
    }>
  > {
    const response = await apiClient.get<WithdrawalHistoryResponse>(
      "/api/commissions/withdrawals"
    );
    const withdrawals = response.data.data?.withdrawals;
    return Array.isArray(withdrawals) ? withdrawals : [];
  }

  async processDailyBatch(): Promise<{
    success: boolean;
    message: string;
    data?: {
      processed: number;
      skipped: number;
      message: string;
      date: string;
    };
  }> {
    const response = await apiClient.post("/api/commissions/process-daily");
    return response.data;
  }
}

export const commissionService = new CommissionService();
