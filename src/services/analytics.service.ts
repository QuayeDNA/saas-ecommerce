// src/services/analytics.service.ts
import { apiClient } from '../utils/api-client';

export interface AnalyticsData {
  users: {
    total: number;
    newThisPeriod: number;
    activeAgents: number;
    verified: number;
    unverified: number;
    byType: {
      agents: number;
      customers: number;
      super_admins: number;
    };
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    failed: number;
    cancelled: number;
    successRate: number;
    today: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      failed: number;
      cancelled: number;
    };
    thisMonth: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      failed: number;
      cancelled: number;
    };
    byType: {
      bulk: number;
      single: number;
    };
  };
  revenue: {
    total: number;
    thisMonth: number;
    today: number;
    orderCount: number;
    averageOrderValue: number;
  };
  wallet: {
    totalBalance: number;
    transactions: {
      credits: { amount: number; count: number };
      debits: { amount: number; count: number };
    };
  };
  providers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  commissions: {
    totalPaid: number;
    totalRecords: number;
    pendingCount: number;
    pendingAmount: number;
  };
  charts: {
    labels: string[];
    orders: number[];
    revenue: number[];
    completedOrders: number[];
    userRegistrations: number[];
    orderStatus: {
      completed: number;
      pending: number;
      processing: number;
      failed: number;
      cancelled: number;
    };
  };
  timeframe: string;
  generatedAt: string;
}

export interface AgentAnalyticsData {
  orders: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    failed: number;
    cancelled: number;
    successRate: number;
    todayCounts: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      failed: number;
      cancelled: number;
    };
  };
  revenue: {
    total: number;
    thisMonth: number;
    today: number;
    orderCount: number;
    averageOrderValue: number;
  };
  commissions: {
    rate: number;
    earned: number;
    paid: number;
    pending: number;
    totalOrders: number;
    totalRevenue: number;
  };
  wallet: {
    balance: number;
  };
  charts: {
    labels: string[];
    orders: number[];
    revenue: number[];
    completedOrders: number[];
  };
  timeframe: string;
  generatedAt: string;
}

export interface ChartData {
  labels: string[];
  orders: number[];
  revenue: number[];
  completedOrders: number[];
  userRegistrations?: number[];
  orderStatus?: {
    completed: number;
    pending: number;
    processing: number;
    failed: number;
    cancelled: number;
  };
}

export interface RealtimeMetrics {
  todayOrders: number;
  todayRevenue: number;
  todayUsers: number;
  timestamp: string;
}

class AnalyticsService {
  /**
   * Get comprehensive analytics for super admin
   * @param timeframe - Time period (7d, 30d, 90d, 365d)
   * @returns Promise<AnalyticsData>
   */
  async getSuperAdminAnalytics(timeframe: string = '30d'): Promise<AnalyticsData> {
    const response = await apiClient.get('/api/analytics/superadmin', {
      params: { timeframe }
    });
    return response.data.data;
  }

  /**
   * Get analytics for agent dashboard
   * @param timeframe - Time period (7d, 30d, 90d, 365d)
   * @returns Promise<AgentAnalyticsData>
   */
  async getAgentAnalytics(timeframe: string = '30d'): Promise<AgentAnalyticsData> {
    const response = await apiClient.get('/api/analytics/agent', {
      params: { timeframe }
    });
    return response.data.data;
  }

  /**
   * Get analytics summary (for both super admin and agents)
   * @param timeframe - Time period (7d, 30d, 90d, 365d)
   * @returns Promise<AnalyticsData | AgentAnalyticsData>
   */
  async getAnalyticsSummary(timeframe: string = '30d'): Promise<AnalyticsData | AgentAnalyticsData> {
    const response = await apiClient.get('/api/analytics/summary', {
      params: { timeframe }
    });
    return response.data.data;
  }

  /**
   * Get chart data only
   * @param timeframe - Time period (7d, 30d, 90d, 365d)
   * @returns Promise<ChartData>
   */
  async getChartData(timeframe: string = '30d'): Promise<ChartData> {
    const response = await apiClient.get('/api/analytics/charts', {
      params: { timeframe }
    });
    return response.data.data;
  }

  /**
   * Get real-time metrics
   * @returns Promise<RealtimeMetrics>
   */
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    const response = await apiClient.get('/api/analytics/realtime');
    return response.data.data;
  }
}

export const analyticsService = new AnalyticsService();