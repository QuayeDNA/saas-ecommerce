import { apiClient } from '@/utils/api-client';

export interface ApiKeyData {
  _id: string;
  label: string;
  keyPrefix: string;
  status: 'active' | 'suspended' | 'revoked';
  permissions: string[];
  allowedIps: string[];
  rateLimitOverride: number | null;
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

export interface WebhookEndpointData {
  _id: string;
  agentId: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveryLogData {
  _id: string;
  webhookId: string;
  event: string;
  url: string;
  statusCode: number | null;
  responseBody: string | null;
  success: boolean;
  durationMs: number;
  attempt: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  error: string | null;
  createdAt: string;
}

export interface OrderListItem {
  _id: string;
  orderNumber: string;
  bundle: { _id: string; name: string } | null;
  quantity: number;
  customerPhone: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetail {
  _id: string;
  orderNumber: string;
  bundle: { _id: string; name: string; bundleCode?: string } | null;
  quantity: number;
  customerPhone: string;
  total: number;
  status: string;
  paymentStatus: string;
  servedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PerKeyUsageData {
  apiKeyId: string;
  label: string;
  keyPrefix: string;
  status: string;
  totalRequests: number;
  errorCount: number;
  avgLatency: number;
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

  // ─── Key Management ───────────────────────────────────────────────────────

  async getKeyById(id: string): Promise<ApiResponse<ApiKeyData>> {
    const response = await apiClient.get(`/api/marketplace/keys/${id}`);
    return response.data;
  }

  async updateKeyLabel(id: string, label: string): Promise<ApiResponse<ApiKeyData>> {
    const response = await apiClient.put(`/api/marketplace/keys/${id}`, { label });
    return response.data;
  }

  async suspendKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; status: string }>> {
    const response = await apiClient.post(`/api/marketplace/keys/${id}/suspend`);
    return response.data;
  }

  async activateKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; status: string }>> {
    const response = await apiClient.post(`/api/marketplace/keys/${id}/activate`);
    return response.data;
  }

  async regenerateKey(id: string): Promise<ApiResponse<CreatedApiKey>> {
    const response = await apiClient.post(`/api/marketplace/keys/${id}/regenerate`);
    return response.data;
  }

  async setKeyExpiration(id: string, expiresAt: string | null): Promise<ApiResponse<ApiKeyData>> {
    const response = await apiClient.put(`/api/marketplace/keys/${id}/expiration`, { expiresAt });
    return response.data;
  }

  async updateKeyPermissions(id: string, permissions: string[]): Promise<ApiResponse<ApiKeyData>> {
    const response = await apiClient.put(`/api/marketplace/keys/${id}/permissions`, { permissions });
    return response.data;
  }

  // ─── Wallet ────────────────────────────────────────────────────────────────

  async getWalletBalance(): Promise<ApiResponse<{ balance: number; currency: string }>> {
    const response = await apiClient.get('/api/marketplace/wallet/balance');
    return response.data;
  }

  async initiateTopup(amount: number): Promise<ApiResponse<{
    reference: string;
    amount: number;
    authorizationUrl: string;
    callbackUrl: string;
  }>> {
    const response = await apiClient.post('/api/marketplace/wallet/topup', { amount });
    return response.data;
  }

  async getTopupStatus(reference: string): Promise<ApiResponse<{
    reference: string;
    amount: number;
    status: string;
    credited: boolean;
  }>> {
    const response = await apiClient.get(`/api/marketplace/wallet/topup/${reference}`);
    return response.data;
  }

  // ─── Order Queries ────────────────────────────────────────────────────────

  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<OrderListItem[]>> {
    const response = await apiClient.get('/api/marketplace/orders', { params });
    return response.data;
  }

  async getOrderById(id: string): Promise<ApiResponse<OrderDetail>> {
    const response = await apiClient.get(`/api/marketplace/orders/${id}`);
    return response.data;
  }

  // ─── Per-Key Usage Stats ──────────────────────────────────────────────────

  async getPerKeyUsageStats(): Promise<ApiResponse<PerKeyUsageData[]>> {
    const response = await apiClient.get('/api/marketplace/usage/per-key');
    return response.data;
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  async getWebhooks(): Promise<ApiResponse<WebhookEndpointData[]>> {
    const response = await apiClient.get('/api/marketplace/webhooks');
    return response.data;
  }

  async getWebhookById(id: string): Promise<ApiResponse<WebhookEndpointData>> {
    const response = await apiClient.get(`/api/marketplace/webhooks/${id}`);
    return response.data;
  }

  async createWebhook(data: {
    url: string;
    secret: string;
    events: string[];
    description?: string;
    active?: boolean;
  }): Promise<ApiResponse<WebhookEndpointData>> {
    const response = await apiClient.post('/api/marketplace/webhooks', data);
    return response.data;
  }

  async updateWebhook(
    id: string,
    data: {
      url?: string;
      secret?: string;
      events?: string[];
      description?: string;
      active?: boolean;
    },
  ): Promise<ApiResponse<WebhookEndpointData>> {
    const response = await apiClient.put(`/api/marketplace/webhooks/${id}`, data);
    return response.data;
  }

  async deleteWebhook(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/api/marketplace/webhooks/${id}`);
    return response.data;
  }

  async testWebhook(id: string): Promise<ApiResponse<WebhookDeliveryLogData>> {
    const response = await apiClient.post(`/api/marketplace/webhooks/${id}/test`);
    return response.data;
  }

  async getWebhookDeliveryLogs(
    webhookId: string,
    params?: { page?: number; limit?: number },
  ): Promise<ApiResponse<WebhookDeliveryLogData[]>> {
    const response = await apiClient.get(`/api/marketplace/webhooks/${webhookId}/delivery-logs`, { params });
    return response.data;
  }
}

export const apiMarketplaceService = new ApiMarketplaceService();
