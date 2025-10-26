// src/services/commission.service.ts
import { apiClient } from "../utils/api-client";

export interface CommissionSettings {
  agentCommission: number;
  superAgentCommission: number;
  dealerCommission: number;
  superDealerCommission: number;
  defaultCommissionRate: number;
}

export interface CommissionRecord {
  _id: string;
  agentId: {
    _id: string;
    fullName: string;
    email: string;
    businessName?: string;
    userType?: string;
  };
  tenantId: string;
  period: "monthly" | "weekly" | "daily";
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  totalRevenue: number;
  commissionRate: number;
  formattedRate: string;
  amount: number;
  status: "pending" | "paid" | "rejected" | "cancelled";
  isFinal: boolean;
  finalizedAt?: string;
  paidAt?: string;
  paidBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  paymentReference?: string;
  rejectedAt?: string;
  rejectedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionCalculation {
  agentId: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  totalRevenue: number;
  commissionRate: number;
  amount: number;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    total: number;
    createdAt: string;
  }>;
}

export interface CommissionStatistics {
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  totalAgents: number;
  thisMonth: {
    totalPaid: number;
    totalPending: number;
    totalRecords: number;
  };
}

export interface CurrentMonthStatistics {
  currentMonth: {
    month: string;
    totalEarned: number;
    totalPaid: number;
    totalPending: number;
    totalRejected: number;
    pendingCount: number;
    totalRecords: number;
    agentCount: number;
  };
}

export interface CommissionMonthlySummary {
  _id: string;
  month: string; // "2025-01"
  year: number;
  monthNumber: number;
  monthName: string; // "January 2025"
  agentId: {
    _id: string;
    fullName: string;
    email: string;
    agentCode?: string;
    userType?: string;
  };
  tenantId: string;
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  totalRejected: number;
  totalExpired: number;
  orderCount: number;
  revenue: number;
  commissionRate: number;
  formattedRate: string;
  paymentStatus:
    | "fully_paid"
    | "partially_paid"
    | "unpaid"
    | "rejected"
    | "expired";
  paymentPercentage: number;
  recordIds: string[];
  recordCount: number;
  isArchived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionFilters {
  status?: "pending" | "paid" | "rejected" | "cancelled";
  period?: "monthly" | "weekly" | "daily";
  startDate?: string;
  endDate?: string;
  agentId?: string;
  month?: string;
  search?: string;
}

export interface PayCommissionData {
  paymentReference?: string;
}

export interface PayMultipleCommissionsData {
  commissionIds: string[];
  paymentReference?: string;
}

export interface RejectCommissionData {
  rejectionReason?: string;
}

export interface RejectMultipleCommissionsData {
  commissionIds: string[];
  rejectionReason?: string;
}

export interface GenerateMonthlyCommissionsData {
  targetMonth?: string;
}

export interface CommissionResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MultiplePaymentResult {
  results: Array<{
    success: boolean;
    commissionId: string;
    commission?: CommissionRecord;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface MonthlyGenerationResult {
  warning: boolean;
  data: string;
  message: string;
  results: Array<{
    agentId: string;
    status: "created" | "exists" | "error" | "success";
    record?: CommissionRecord;
    error?: string;
  }>;
  summary: {
    total: number;
    created: number;
    exists: number;
    errors: number;
  };
}

export interface MonthlyGenerationResponse {
  success: boolean;
  warning?: boolean;
  message?: string;
  data: MonthlyGenerationResult | { existingRecords: boolean };
}

class CommissionService {
  /**
   * Get commission settings (super admin only)
   * @returns Promise<CommissionSettings>
   */
  async getCommissionSettings(): Promise<CommissionSettings> {
    const response = await apiClient.get("/api/commissions/settings");
    return response.data.data;
  }

  /**
   * Update commission settings (super admin only)
   * @param settings - Commission settings to update
   * @returns Promise<CommissionSettings>
   */
  async updateCommissionSettings(
    settings: Partial<CommissionSettings>
  ): Promise<CommissionSettings> {
    const response = await apiClient.put("/api/commissions/settings", settings);
    return response.data.data;
  }

  /**
   * Get agent's commissions
   * @param filters - Optional filters
   * @returns Promise<CommissionRecord[]>
   */
  async getAgentCommissions(
    filters: CommissionFilters = {}
  ): Promise<CommissionRecord[]> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.period) params.append("period", filters.period);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const query = params.toString();
    const baseUrl = "/api/commissions/agent";
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
  }

  /**
   * Get all commissions (super admin only)
   * @param filters - Optional filters
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Promise with data and pagination info
   */
  async getAllCommissions(
    filters: CommissionFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: CommissionRecord[];
    pagination: { total: number; page: number; pages: number; limit: number };
  }> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.period) params.append("period", filters.period);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.agentId) params.append("agentId", filters.agentId);
    if (filters.month) params.append("month", filters.month);
    if (filters.search) params.append("search", filters.search);

    // Add pagination params
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const query = params.toString();
    const baseUrl = "/api/commissions";
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await apiClient.get(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  /**
   * Calculate commission for a specific period (super admin only)
   * @param data - Calculation parameters
   * @returns Promise<CommissionCalculation>
   */
  async calculateCommission(data: {
    agentId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
  }): Promise<CommissionCalculation> {
    const response = await apiClient.post("/api/commissions/calculate", data);
    return response.data.data;
  }

  /**
   * Create commission record (super admin only)
   * @param data - Commission record data
   * @returns Promise<CommissionRecord>
   */
  async createCommissionRecord(
    data: Omit<CommissionRecord, "_id" | "createdAt" | "updatedAt">
  ): Promise<CommissionRecord> {
    const response = await apiClient.post("/api/commissions/records", data);
    return response.data.data;
  }

  /**
   * Pay single commission (super admin only)
   * @param commissionId - Commission record ID
   * @param data - Payment data
   * @returns Promise<CommissionRecord>
   */
  async payCommission(
    commissionId: string,
    data: PayCommissionData = {}
  ): Promise<CommissionRecord> {
    const response = await apiClient.put(
      `/api/commissions/${commissionId}/pay`,
      data
    );
    return response.data.data;
  }

  /**
   * Pay multiple commissions (super admin only)
   * @param data - Multiple payment data
   * @returns Promise<MultiplePaymentResult>
   */
  async payMultipleCommissions(
    data: PayMultipleCommissionsData
  ): Promise<MultiplePaymentResult> {
    const response = await apiClient.put("/api/commissions/pay-multiple", data);
    return response.data.data;
  }

  /**
   * Reject single commission (super admin only)
   * @param commissionId - Commission record ID
   * @param data - Rejection data
   * @returns Promise<CommissionRecord>
   */
  async rejectCommission(
    commissionId: string,
    data: RejectCommissionData = {}
  ): Promise<CommissionRecord> {
    const response = await apiClient.put(
      `/api/commissions/${commissionId}/reject`,
      data
    );
    return response.data.data;
  }

  /**
   * Reject multiple commissions (super admin only)
   * @param data - Multiple rejection data
   * @returns Promise<MultiplePaymentResult>
   */
  async rejectMultipleCommissions(
    data: RejectMultipleCommissionsData
  ): Promise<MultiplePaymentResult> {
    const response = await apiClient.put(
      "/api/commissions/reject-multiple",
      data
    );
    return response.data.data;
  }

  /**
   * Generate monthly commissions for all agents (super admin only)
   * @param data - Generation parameters
   * @returns Promise<MonthlyGenerationResult>
   */
  async generateMonthlyCommissions(
    data: GenerateMonthlyCommissionsData = {}
  ): Promise<MonthlyGenerationResponse> {
    const response = await apiClient.post(
      "/api/commissions/generate-monthly",
      data
    );
    return response.data;
  }

  /**
   * Get commission statistics (business users)
   * @returns Promise<CommissionStatistics>
   */
  async getCommissionStatistics(): Promise<CommissionStatistics> {
    const response = await apiClient.get("/api/commissions/statistics");
    return response.data.data;
  }

  /**
   * Expire old commissions (super admin only)
   * Manually triggers the commission expiry job
   * @returns Promise with expiry results
   */
  async expireOldCommissions(): Promise<{
    success: boolean;
    message: string;
    data: {
      expiredCount: number;
      totalAmount: string;
      duration: string;
    };
  }> {
    const response = await apiClient.post("/api/commissions/expire-old");
    return response.data;
  }

  /**
   * Archive commissions for a specific month (super admin only)
   * @param year - Year to archive
   * @param month - Month number (1-12)
   * @returns Promise with archival results
   */
  async archiveMonthCommissions(
    year: number,
    month: number
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      month: string;
      monthStr: string;
      summariesCreated: number;
      recordsArchived: number;
      duration: string;
    };
  }> {
    const response = await apiClient.post("/api/commissions/archive-month", {
      year,
      month,
    });
    return response.data;
  }

  /**
   * Get agent's monthly summaries
   * @param options - Query options
   * @returns Promise<CommissionMonthlySummary[]>
   */
  async getAgentMonthlySummaries(
    options: {
      limit?: number;
      paymentStatus?: string;
    } = {}
  ): Promise<CommissionMonthlySummary[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.paymentStatus)
      params.append("paymentStatus", options.paymentStatus);

    const query = params.toString();
    const baseUrl = "/api/commissions/monthly-summaries/agent";
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
  }

  /**
   * Get all monthly summaries (super admin only)
   * @param options - Query options
   * @returns Promise<CommissionMonthlySummary[]>
   */
  async getAllMonthlySummaries(
    options: {
      limit?: number;
      paymentStatus?: string;
      month?: string;
    } = {}
  ): Promise<CommissionMonthlySummary[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.paymentStatus)
      params.append("paymentStatus", options.paymentStatus);
    if (options.month) params.append("month", options.month);

    const query = params.toString();
    const baseUrl = "/api/commissions/monthly-summaries";
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
  }

  /**
   * Get current month statistics
   * @returns Promise<CurrentMonthStatistics>
   */
  async getCurrentMonthStatistics(): Promise<CurrentMonthStatistics> {
    const response = await apiClient.get(
      "/api/commissions/current-month-stats"
    );
    return response.data.data;
  }
}

export const commissionService = new CommissionService();
