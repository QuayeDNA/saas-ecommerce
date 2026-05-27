import { apiClient } from "../utils/api-client";
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  DayFilter,
  UserActivityLog,
  UserActivityLogResponse,
} from "../types/auditLog";

type BackendAuditLog = Omit<AuditLog, "userId" | "user"> & {
  userId?:
    | string
    | { _id?: string; fullName?: string; email?: string; userType?: string };
  user?: AuditLog["user"];
};

type BackendAuditStats = Partial<AuditLogStats> & {
  byCategory?: Record<string, number> | Array<{ _id: string; count: number }>;
  bySeverity?: Record<string, number> | Array<{ _id: string; count: number }>;
  byAction?: Array<{ _id: string; count: number }>;
  dailyTrend?: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
  }>;
};

function aggregateToRecord(
  source?: Record<string, number> | Array<{ _id: string; count: number }>,
): Record<string, number> {
  if (!source) return {};
  if (Array.isArray(source)) {
    return source.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  return source;
}

const AUDIT_LOG_BASE_URL = "/api/audit-logs";

function normalizeUserId(userId?: BackendAuditLog["userId"]): string {
  if (!userId) return "";
  if (typeof userId === "string") return userId;
  return userId._id ?? "";
}

function normalizeAuditLog(log: BackendAuditLog): AuditLog {
  const populatedUser =
    log.userId && typeof log.userId === "object" ? log.userId : undefined;
  const userId = normalizeUserId(log.userId);

  return {
    _id: log._id,
    userId,
    userType: log.userType ?? populatedUser?.userType ?? "",
    action: log.action,
    category: log.category,
    resource: log.resource,
    changes: log.changes,
    metadata: log.metadata ?? {},
    ipAddress: log.ipAddress ?? "",
    userAgent: log.userAgent ?? "",
    timestamp:
      typeof log.timestamp === "string"
        ? log.timestamp
        : new Date(log.timestamp).toISOString(),
    severity: log.severity,
    user:
      populatedUser && userId
        ? {
            _id: userId,
            fullName: populatedUser.fullName ?? "",
            email: populatedUser.email ?? "",
            userType: populatedUser.userType ?? "",
          }
        : log.user,
  };
}

function normalizeAuditStats(
  stats: BackendAuditStats | undefined,
): AuditLogStats {
  return {
    totalLogs: stats?.totalLogs ?? 0,
    byCategory: aggregateToRecord(stats?.byCategory),
    bySeverity: aggregateToRecord(stats?.bySeverity),
    topUsers: stats?.topUsers ?? [],
    recentCritical: stats?.recentCritical ?? 0,
    byAction: stats?.byAction ?? [],
    dailyTrend: stats?.dailyTrend ?? [],
  };
}

export const auditLogService = {
  async getAuditLogs(
    filters: AuditLogFilters & { page?: number; limit?: number } = {},
  ): Promise<AuditLogResponse> {
    const response = await apiClient.get<{
      success: boolean;
      logs: BackendAuditLog[];
      pagination: AuditLogResponse["pagination"];
    }>(AUDIT_LOG_BASE_URL, { params: filters });

    return {
      success: response.data.success,
      logs: (response.data.logs ?? []).map(normalizeAuditLog),
      pagination: response.data.pagination,
    };
  },

  async getUserActivity(
    userId: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
  ): Promise<AuditLogResponse> {
    const response = await apiClient.get<{
      success: boolean;
      logs: BackendAuditLog[];
      pagination: AuditLogResponse["pagination"];
    }>(`${AUDIT_LOG_BASE_URL}/user/${userId}`, {
      params: { page, limit, startDate, endDate },
    });

    return {
      success: response.data.success,
      logs: (response.data.logs ?? []).map(normalizeAuditLog),
      pagination: response.data.pagination,
    };
  },

  async getUserActivitySimplified(
    userId: string,
    dayFilter: DayFilter = "today",
    page = 1,
    limit = 50,
  ): Promise<UserActivityLogResponse> {
    const response = await apiClient.get<{
      success: boolean;
      logs: UserActivityLog[];
      pagination: UserActivityLogResponse["pagination"];
    }>(`${AUDIT_LOG_BASE_URL}/user/${userId}`, {
      params: { page, limit, dayFilter },
    });

    return {
      success: response.data.success,
      logs: response.data.logs ?? [],
      pagination: response.data.pagination,
    };
  },

  async getRecentActivity(
    limit = 20,
  ): Promise<{ success: boolean; logs: AuditLog[] }> {
    const response = await apiClient.get<{
      success: boolean;
      logs: BackendAuditLog[];
    }>(`${AUDIT_LOG_BASE_URL}/recent`, { params: { limit } });

    return {
      success: response.data.success,
      logs: (response.data.logs ?? []).map(normalizeAuditLog),
    };
  },

  async getStats(
    startDate?: string,
    endDate?: string,
  ): Promise<{
    success: boolean;
    stats: AuditLogStats;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      stats: BackendAuditStats;
    }>(`${AUDIT_LOG_BASE_URL}/stats`, { params: { startDate, endDate } });

    return {
      success: response.data.success,
      stats: normalizeAuditStats(response.data.stats),
    };
  },

  async exportLogs(filters: AuditLogFilters): Promise<Blob> {
    const response = await apiClient.get(`${AUDIT_LOG_BASE_URL}/export`, {
      params: filters,
      responseType: "blob",
    });

    return response.data;
  },
};

export default auditLogService;
