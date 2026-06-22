import { apiClient } from '@/utils/api-client';

/** Minimal key data returned in the paginated list (lean DTO). */
export interface AdminKeyListItem {
  _id: string;
  agent: {
    _id: string;
    name: string | null;
    email: string | null;
    userType: string | null;
  } | null;
  label: string;
  keyPrefix: string;
  status: 'active' | 'suspended' | 'revoked';
  createdAt: string;
}

/** Full key detail returned by GET /keys/:id. */
export interface AdminKeyDetail {
  _id: string;
  agentId: { _id: string; name: string; email: string; userType: string } | string;
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

export interface AdminUsageStats {
  totalRequests: number;
  errorCount: number;
  avgLatency: number;
  errorRate: number;
}

export interface AdminAggregateStats {
  usage: AdminUsageStats;
  keys: {
    total: number;
    active: number;
    suspended: number;
    revoked: number;
  } | null;
}

export interface AdminUsageLogEntry {
  _id: string;
  apiKeyId: { _id: string; keyPrefix: string; label: string } | string;
  agentId: { _id: string; name: string; email: string } | string;
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

export interface AgentUsageSummary {
  _id: string;
  totalRequests: number;
  errorCount: number;
  avgLatency: number;
  agent?: {
    name: string | null;
    email: string | null;
    userType: string | null;
  } | null;
}

export interface DailyCount {
  _id: string;
  count: number;
  avgLatency: number;
  errors: number;
}

type ApiResponse<T> = { success: true; data: T; meta?: PaginationMeta } | { success: false; message: string };

class AdminMarketplaceService {
  // ─── Key Management ───────────────────────────────────────────────────────

  async listAllKeys(params?: {
    status?: string;
    agentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<AdminKeyListItem[]>> {
    const response = await apiClient.get('/api/admin/marketplace/keys', { params });
    return response.data;
  }

  async getKeyById(id: string): Promise<ApiResponse<AdminKeyDetail>> {
    const response = await apiClient.get(`/api/admin/marketplace/keys/${id}`);
    return response.data;
  }

  async revokeKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; status: string }>> {
    const response = await apiClient.post(`/api/admin/marketplace/keys/${id}/revoke`);
    return response.data;
  }

  async suspendKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; status: string }>> {
    const response = await apiClient.post(`/api/admin/marketplace/keys/${id}/suspend`);
    return response.data;
  }

  async activateKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; status: string }>> {
    const response = await apiClient.post(`/api/admin/marketplace/keys/${id}/activate`);
    return response.data;
  }

  // ─── Usage Analytics ──────────────────────────────────────────────────────

  async getAggregateStats(agentId?: string): Promise<ApiResponse<AdminAggregateStats>> {
    const params = agentId ? { agentId } : {};
    const response = await apiClient.get('/api/admin/marketplace/usage/stats', { params });
    return response.data;
  }

  async getUsageLogs(params?: {
    limit?: number;
    page?: number;
    agentId?: string;
  }): Promise<ApiResponse<AdminUsageLogEntry[]>> {
    const response = await apiClient.get('/api/admin/marketplace/usage/logs', { params });
    return response.data;
  }

  async getAgentUsageSummary(params?: { top?: number; page?: number; limit?: number }): Promise<ApiResponse<AgentUsageSummary[]>> {
    const response = await apiClient.get('/api/admin/marketplace/usage/agent-summary', { params });
    return response.data;
  }

  async getDailyCounts(days?: number, agentId?: string): Promise<ApiResponse<DailyCount[]>> {
    const params: Record<string, string | number> = {};
    if (days) params.days = days;
    if (agentId) params.agentId = agentId;
    const response = await apiClient.get('/api/admin/marketplace/usage/daily-counts', { params });
    return response.data;
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async getRateLimitConfig(): Promise<ApiResponse<{ defaultLimit: number; windowMs: number; description: string }>> {
    const response = await apiClient.get('/api/admin/marketplace/settings/rate-limit');
    return response.data;
  }

  async updateRateLimitConfig(data: { defaultLimit?: number; windowMs?: number }): Promise<ApiResponse<{ defaultLimit: number; windowMs: number }>> {
    const response = await apiClient.put('/api/admin/marketplace/settings/rate-limit', data);
    return response.data;
  }

  async revokeAllAgentKeys(agentId: string): Promise<ApiResponse<{ revokedCount: number }>> {
    const response = await apiClient.post(`/api/admin/marketplace/keys/revoke-by-agent/${agentId}`);
    return response.data;
  }

  async updateKeyLabel(id: string, label: string): Promise<ApiResponse<AdminKeyDetail>> {
    const response = await apiClient.put(`/api/admin/marketplace/keys/${id}`, { label });
    return response.data;
  }

  async regenerateKey(id: string): Promise<ApiResponse<{ _id: string; keyPrefix: string; key: string }>> {
    const response = await apiClient.post(`/api/admin/marketplace/keys/${id}/regenerate`);
    return response.data;
  }

  async setKeyExpiration(id: string, expiresAt: string | null): Promise<ApiResponse<AdminKeyDetail>> {
    const response = await apiClient.put(`/api/admin/marketplace/keys/${id}/expiration`, { expiresAt });
    return response.data;
  }

  async updateKeyPermissions(id: string, permissions: string[]): Promise<ApiResponse<AdminKeyDetail>> {
    const response = await apiClient.put(`/api/admin/marketplace/keys/${id}/permissions`, { permissions });
    return response.data;
  }

  async updateKeyAllowedIps(id: string, allowedIps: string[]): Promise<ApiResponse<AdminKeyDetail>> {
    const response = await apiClient.put(`/api/admin/marketplace/keys/${id}/allowed-ips`, { allowedIps });
    return response.data;
  }

  async updateKeyRateLimitOverride(id: string, rateLimitOverride: number | null): Promise<ApiResponse<AdminKeyDetail>> {
    const response = await apiClient.put(`/api/admin/marketplace/keys/${id}/rate-limit-override`, { rateLimitOverride });
    return response.data;
  }

  // ─── Per-Key Usage Stats ──────────────────────────────────────────────────

  async getPerKeyUsageStats(agentId?: string): Promise<ApiResponse<{ apiKeyId: string; label: string; keyPrefix: string; totalRequests: number; errorCount: number; avgLatency: number }[]>> {
    const params = agentId ? { agentId } : {};
    const response = await apiClient.get('/api/admin/marketplace/usage/per-key', { params });
    return response.data;
  }

  // ─── Webhooks ─────────────────────────────────────────────────────────────

  async getWebhooks(params?: {
    agentId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    _id: string;
    agentId: { _id: string; name: string; email: string } | string;
    url: string;
    events: string[];
    active: boolean;
    description: string;
    createdAt: string;
  }[]>> {
    const response = await apiClient.get('/api/admin/marketplace/webhooks', { params });
    return response.data;
  }

  async getWebhookById(id: string): Promise<ApiResponse<{
    _id: string;
    agentId: { _id: string; name: string; email: string } | string;
    url: string;
    secret: string;
    events: string[];
    active: boolean;
    description: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    const response = await apiClient.get(`/api/admin/marketplace/webhooks/${id}`);
    return response.data;
  }
}

export const adminMarketplaceService = new AdminMarketplaceService();
