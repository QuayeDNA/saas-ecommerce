import { apiClient } from '@/utils/api-client';

export interface ApiKeyData {
  _id: string;
  label: string;
  keyPrefix: string;
  status: 'active' | 'suspended' | 'revoked';
  permissions: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatedApiKey extends ApiKeyData {
  key: string;
}

export interface UsageStats {
  totalRequests: number;
  errorCount: number;
  avgLatency: number;
  errorRate: number;
}

export interface DailyCount {
  _id: string;
  count: number;
  avgLatency: number;
  errors: number;
}

export interface UsageLogEntry {
  _id: string;
  apiKeyId: string;
  agentId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  scopes?: string[];
}

export interface ApiMetadata {
  name: string;
  version: string;
  baseUrl: string;
  authType: string;
  rateLimit: string;
  permissionScopes: { scope: string; description: string }[];
  endpoints: ApiEndpoint[];
  errorCodes: { code: string; status: number; description: string }[];
}

type ApiResponse<T> = { success: true; data: T; meta?: PaginationMeta } | { success: false; message: string };

class ApiMarketplaceService {
  async getApiMetadata(): Promise<ApiResponse<ApiMetadata>> {
    const response = await apiClient.get('/api/marketplace');
    return response.data;
  }

  async getStats(): Promise<ApiResponse<{ totalKeys: number; usageStats: UsageStats }>> {
    const [keysRes, usageRes] = await Promise.allSettled([
      apiClient.get('/api/marketplace/keys'),
      apiClient.get('/api/marketplace/usage/stats'),
    ]);

    const totalKeys =
      keysRes.status === 'fulfilled' && keysRes.value.data.success
        ? (keysRes.value.data.data as ApiKeyData[]).length
        : 0;

    const usageStats: UsageStats =
      usageRes.status === 'fulfilled' && usageRes.value.data.success
        ? usageRes.value.data.data
        : { totalRequests: 0, errorCount: 0, avgLatency: 0, errorRate: 0 };

    return { success: true, data: { totalKeys, usageStats } };
  }

  async getKeys(): Promise<ApiResponse<ApiKeyData[]>> {
    const response = await apiClient.get('/api/marketplace/keys');
    return response.data;
  }

  async createKey(label: string): Promise<ApiResponse<CreatedApiKey>> {
    const response = await apiClient.post('/api/marketplace/keys', { label });
    return response.data;
  }

  async revokeKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; status: string }>> {
    const response = await apiClient.post(`/api/marketplace/keys/${id}/revoke`);
    return response.data;
  }

  async getUsageStats(): Promise<ApiResponse<UsageStats>> {
    const response = await apiClient.get('/api/marketplace/usage/stats');
    return response.data;
  }

  async getUsageLogs(limit = 50, page = 1): Promise<ApiResponse<UsageLogEntry[]>> {
    const response = await apiClient.get('/api/marketplace/usage/logs', {
      params: { limit, page },
    });
    return response.data;
  }

  async getDailyCounts(days = 7): Promise<ApiResponse<DailyCount[]>> {
    const response = await apiClient.get('/api/marketplace/usage/daily-counts', {
      params: { days },
    });
    return response.data;
  }
}

export const apiMarketplaceService = new ApiMarketplaceService();
