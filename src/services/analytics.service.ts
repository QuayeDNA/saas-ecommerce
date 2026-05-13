// src/services/analytics.service.ts
import { apiClient } from "../utils/api-client";

export interface AnalyticsData {
  users: {
    total: number;
    newThisPeriod: number;
    newThisWeek?: number;
    activeAgents: number;
    verified: number;
    unverified: number;
    byType: {
      agents: number;
      super_agents: number;
      dealers: number;
      super_dealers: number;
      super_admins: number;
    };
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    confirmed: number;
    failed: number;
    cancelled: number;
    partiallyCompleted: number;
    successRate: number;
    today: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      confirmed: number;
      failed: number;
      cancelled: number;
      partiallyCompleted: number;
    };
    thisMonth: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      confirmed: number;
      failed: number;
      cancelled: number;
      partiallyCompleted: number;
    };
    byType: {
      bulk: number;
      single: number;
      regular: number;
      storefront: number;
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
    totalEarned: number;
    totalPaid: number;
    totalRecords: number;
    pendingCount: number;
    pendingAmount: number;
    byStatus?: {
      pending: number;
      paid: number;
      rejected: number;
      cancelled: number;
    };
  };
  payouts?: {
    totalRequests: number;
    totalAmountAllTime: number;
    thisPeriod: {
      count: number;
      amount: number;
    };
    byStatus: {
      pending: number;
      approved: number;
      processing: number;
      completed: number;
      failed: number;
      rejected: number;
    };
    completionRate: number;
    pendingLiability: number;
    queuedCount: number;
    byDestination: {
      mobile_money: { count: number; amount: number };
      bank_account: { count: number; amount: number };
    };
  };
  earnings?: {
    period: {
      credits: { amount: number; count: number };
      debits: { amount: number; count: number };
      payouts: { amount: number; count: number };
      netFlow: number;
    };
    allTime: {
      credits: { amount: number; count: number };
      debits: { amount: number; count: number };
      payouts: { amount: number; count: number };
      netFlow: number;
    };
  };
  growth?: {
    users: {
      current: number;
      previous: number;
      percent: number;
      trend: string;
    };
    orders: {
      current: number;
      previous: number;
      percent: number;
      trend: string;
    };
    revenue: {
      current: number;
      previous: number;
      percent: number;
      trend: string;
    };
    payouts: {
      current: number;
      previous: number;
      percent: number;
      trend: string;
    };
    commissions: {
      current: number;
      previous: number;
      percent: number;
      trend: string;
    };
  };
  overview?: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalCommissions: number;
    totalWalletBalance: number;
    activeProviders: number;
    payoutLiability: number;
    pendingPayouts: number;
  };
  breakdowns?: {
    userTypes: Record<string, number>;
    orderStatuses: Record<string, number>;
    commissionStatuses: Record<string, number>;
    payoutStatuses: Record<string, number>;
  };
  topPerformers?: {
    agents: Array<{
      userId: string;
      fullName: string;
      agentCode?: string;
      userType: string;
      orders: number;
      revenue: number;
      averageOrderValue: number;
    }>;
    commissionLeaders: Array<{
      userId: string;
      fullName: string;
      agentCode?: string;
      userType: string;
      records: number;
      totalCommission: number;
    }>;
    storefronts: Array<{
      storefrontId: string;
      storefrontName: string;
      businessName?: string;
      agentId?: string;
      agentName?: string;
      totalOrders: number;
      netProfit: number;
      grossRevenue: number;
      orders: number;
      revenue: number;
      averageOrderValue: number;
    }>;
    orderTypes: Array<{
      orderType: string;
      count: number;
      revenue: number;
    }>;
  };
  recentActivity?: {
    users: Array<Record<string, unknown>>;
    orders: Array<Record<string, unknown>>;
    transactions: Array<Record<string, unknown>>;
    payouts?: Array<Record<string, unknown>>;
    commissions?: Array<Record<string, unknown>>;
  };
  activityFeed?: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    value?: number;
    meta?: Record<string, unknown>;
  }>;
  insights?: Array<{
    title: string;
    type: "positive" | "warning" | "info";
    description: string;
  }>;
  rates?: {
    userVerification: number;
    agentActivation: number;
    orderSuccess: number;
  };
  charts: {
    labels: string[];
    orders: number[];
    revenue: number[];
    completedOrders: number[];
    userRegistrations: number[];
    commissions?: number[];
    orderStatus: {
      completed: number;
      pending: number;
      processing: number;
      failed: number;
      cancelled: number;
      confirmed?: number;
      partiallyCompleted?: number;
    };
  };
  centralizedSource?: boolean;
  scope?: string;
  source?: string;
  timeframe: string;
  generatedAt: string;
}

export interface AgentAnalyticsData {
  users: {
    referredUsers: number;
    totalReferredUsers: number;
    activeReferredUsers: number;
    conversionRate: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    processing: number;
    confirmed: number;
    failed: number;
    cancelled: number;
    partiallyCompleted: number;
    successRate: number;
    todayCounts: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      confirmed: number;
      failed: number;
      cancelled: number;
      partiallyCompleted: number;
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
    totalCommission: number;
    paidCommission: number;
    pendingCommission: number;
    commissionCount: number;
  };
  wallet: {
    balance: number;
    totalCredits: number;
    totalDebits: number;
    transactionCount: number;
    subscriptionStatus: string;
    recentTransactions: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      createdAt: string;
    }>;
  };
  charts: {
    labels: string[];
    orders: number[];
    revenue: number[];
    completedOrders: number[];
  };
  recentActivity?: Array<Record<string, unknown>>;
  timeframe: string;
  generatedAt: string;
}

export interface ChartData {
  labels: string[];
  orders: number[];
  revenue: number[];
  completedOrders: number[];
  userRegistrations?: number[];
  commissions?: number[];
  orderStatus?: {
    completed: number;
    pending: number;
    processing: number;
    failed: number;
    cancelled: number;
    confirmed?: number;
    partiallyCompleted?: number;
  };
}

export interface CentralizedAnalyticsResponse {
  actor: {
    userId: string;
    userType: string;
    tenantId: string;
  };
  timeframe: string;
  scope: string;
  generatedAt: string;
  source: string;
  data: AnalyticsData | AgentAnalyticsData | Record<string, unknown>;
}

export interface RealtimeMetrics {
  todayOrders: number;
  todayRevenue: number;
  todayUsers: number;
  timestamp: string;
}

class AnalyticsService {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  private getCachedData<T>(key: string): T | null {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Return cached data if it hasn't expired
        if (Date.now() - timestamp < this.CACHE_TTL) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Failed to read from cache", e);
    }
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch (e) {
      console.warn("Failed to write to cache", e);
    }
  }

  public clearCache(): void {
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("analytics_")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Failed to clear cache", e);
    }
  }

  async getSuperAdminAnalytics(
    timeframe: string = "30d",
    forceRefresh = false,
  ): Promise<AnalyticsData> {
    const cacheKey = `analytics_superadmin_${timeframe}`;

    if (!forceRefresh) {
      const cached = this.getCachedData<AnalyticsData>(cacheKey);
      if (cached) return cached;
    }

    const response = await apiClient.get("/api/analytics/superadmin", {
      params: { timeframe },
    });
    this.setCachedData(cacheKey, response.data.data);
    return response.data.data;
  }

  async getAgentAnalytics(
    timeframe: string = "30d",
    forceRefresh = false,
  ): Promise<AgentAnalyticsData> {
    const cacheKey = `analytics_agent_${timeframe}`;

    if (!forceRefresh) {
      const cached = this.getCachedData<AgentAnalyticsData>(cacheKey);
      if (cached) return cached;
    }

    const response = await apiClient.get("/api/analytics/agent", {
      params: { timeframe },
    });
    this.setCachedData(cacheKey, response.data.data);
    return response.data.data;
  }

  async getAnalyticsSummary(
    timeframe: string = "30d",
    forceRefresh = false,
  ): Promise<AnalyticsData | AgentAnalyticsData> {
    const cacheKey = `analytics_summary_${timeframe}`;

    if (!forceRefresh) {
      const cached = this.getCachedData<AnalyticsData | AgentAnalyticsData>(
        cacheKey,
      );
      if (cached) return cached;
    }

    const response = await apiClient.get("/api/analytics/summary", {
      params: { timeframe },
    });
    this.setCachedData(cacheKey, response.data.data);
    return response.data.data;
  }

  async getChartData(
    timeframe: string = "30d",
    forceRefresh = false,
  ): Promise<ChartData> {
    const cacheKey = `analytics_charts_${timeframe}`;

    if (!forceRefresh) {
      const cached = this.getCachedData<ChartData>(cacheKey);
      if (cached) return cached;
    }

    const response = await apiClient.get("/api/analytics/charts", {
      params: { timeframe },
    });
    this.setCachedData(cacheKey, response.data.data);
    return response.data.data;
  }

  // Realtime metrics should not be cached completely, but we could throttle requests
  // For now, we leave it uncached as it implies "realtime"
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    const response = await apiClient.get("/api/analytics/realtime");
    return response.data.data;
  }

  async getCentralizedAnalytics(
    timeframe: string = "30d",
    scope: string = "all",
    forceRefresh = false,
  ): Promise<CentralizedAnalyticsResponse> {
    const cacheKey = `analytics_centralized_${scope}_${timeframe}`;

    if (!forceRefresh) {
      const cached = this.getCachedData<CentralizedAnalyticsResponse>(cacheKey);
      if (cached) return cached;
    }

    const response = await apiClient.get("/api/analytics/centralized", {
      params: { timeframe, scope },
    });
    this.setCachedData(cacheKey, response.data.data);
    return response.data.data;
  }
}

export const analyticsService = new AnalyticsService();
