// src/services/commission.service.ts
import { apiClient } from '../utils/api-client';

export interface CommissionSettings {
  agentCommission: number;
  customerCommission: number;
}

export interface CommissionRecord {
  _id: string;
  agentId: {
    _id: string;
    fullName: string;
    email: string;
    businessName?: string;
  };
  tenantId: string;
  period: 'monthly' | 'weekly' | 'daily';
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  totalRevenue: number;
  commissionRate: number;
  amount: number;
  status: 'pending' | 'paid' | 'rejected' | 'cancelled';
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

export interface CommissionFilters {
  status?: 'pending' | 'paid' | 'rejected' | 'cancelled';
  period?: 'monthly' | 'weekly' | 'daily';
  startDate?: string;
  endDate?: string;
  agentId?: string;
  month?: string;
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
  results: Array<{
    agentId: string;
    status: 'created' | 'exists' | 'error' | 'success';
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

class CommissionService {
  /**
   * Get commission settings (super admin only)
   * @returns Promise<CommissionSettings>
   */
  async getCommissionSettings(): Promise<CommissionSettings> {
    const response = await apiClient.get('/api/commissions/settings');
    return response.data.data;
  }

  /**
   * Update commission settings (super admin only)
   * @param settings - Commission settings to update
   * @returns Promise<CommissionSettings>
   */
  async updateCommissionSettings(settings: Partial<CommissionSettings>): Promise<CommissionSettings> {
    const response = await apiClient.put('/api/commissions/settings', settings);
    return response.data.data;
  }

  /**
   * Get agent's commissions
   * @param filters - Optional filters
   * @returns Promise<CommissionRecord[]>
   */
  async getAgentCommissions(filters: CommissionFilters = {}): Promise<CommissionRecord[]> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.period) params.append('period', filters.period);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    const baseUrl = '/api/commissions/agent';
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
  }

  /**
   * Get all commissions (super admin only)
   * @param filters - Optional filters
   * @returns Promise<CommissionRecord[]>
   */
  async getAllCommissions(filters: CommissionFilters = {}): Promise<CommissionRecord[]> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.period) params.append('period', filters.period);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.agentId) params.append('agentId', filters.agentId);
    if (filters.month) params.append('month', filters.month);

    const query = params.toString();
    const baseUrl = '/api/commissions';
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await apiClient.get(url);
    return response.data.data;
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
    const response = await apiClient.post('/api/commissions/calculate', data);
    return response.data.data;
  }

  /**
   * Create commission record (super admin only)
   * @param data - Commission record data
   * @returns Promise<CommissionRecord>
   */
  async createCommissionRecord(data: Omit<CommissionRecord, '_id' | 'createdAt' | 'updatedAt'>): Promise<CommissionRecord> {
    const response = await apiClient.post('/api/commissions/records', data);
    return response.data.data;
  }

  /**
   * Pay single commission (super admin only)
   * @param commissionId - Commission record ID
   * @param data - Payment data
   * @returns Promise<CommissionRecord>
   */
  async payCommission(commissionId: string, data: PayCommissionData = {}): Promise<CommissionRecord> {
    const response = await apiClient.put(`/api/commissions/${commissionId}/pay`, data);
    return response.data.data;
  }

  /**
   * Pay multiple commissions (super admin only)
   * @param data - Multiple payment data
   * @returns Promise<MultiplePaymentResult>
   */
  async payMultipleCommissions(data: PayMultipleCommissionsData): Promise<MultiplePaymentResult> {
    const response = await apiClient.put('/api/commissions/pay-multiple', data);
    return response.data.data;
  }

  /**
   * Reject single commission (super admin only)
   * @param commissionId - Commission record ID
   * @param data - Rejection data
   * @returns Promise<CommissionRecord>
   */
  async rejectCommission(commissionId: string, data: RejectCommissionData = {}): Promise<CommissionRecord> {
    const response = await apiClient.put(`/api/commissions/${commissionId}/reject`, data);
    return response.data.data;
  }

  /**
   * Reject multiple commissions (super admin only)
   * @param data - Multiple rejection data
   * @returns Promise<MultiplePaymentResult>
   */
  async rejectMultipleCommissions(data: RejectMultipleCommissionsData): Promise<MultiplePaymentResult> {
    const response = await apiClient.put('/api/commissions/reject-multiple', data);
    return response.data.data;
  }

  /**
   * Generate monthly commissions for all agents (super admin only)
   * @param data - Generation parameters
   * @returns Promise<MonthlyGenerationResult>
   */
  async generateMonthlyCommissions(data: GenerateMonthlyCommissionsData = {}): Promise<MonthlyGenerationResult> {
    const response = await apiClient.post('/api/commissions/generate-monthly', data);
    return response.data.data;
  }

  /**
   * Get commission statistics (super admin only)
   * @returns Promise<CommissionStatistics>
   */
  async getCommissionStatistics(): Promise<CommissionStatistics> {
    const response = await apiClient.get('/api/commissions/statistics');
    return response.data.data;
  }
}

export const commissionService = new CommissionService();