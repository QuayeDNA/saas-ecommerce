import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLogService";
import type { AuditLogFilters, DayFilter } from "../types/auditLog";

export const useAuditLogs = (
  filters: AuditLogFilters & { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => auditLogService.getAuditLogs(filters),
    staleTime: 30_000,
  });
};

export const useInfiniteAuditLogs = (filters: AuditLogFilters) => {
  return useInfiniteQuery({
    queryKey: ["audit-logs-infinite", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      auditLogService.getAuditLogs({ ...filters, page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.pages
        ? lastPage.pagination.page + 1
        : undefined,
  });
};

export const useUserActivity = (
  userId: string,
  page = 1,
  limit = 50,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ["user-activity", userId, page, limit, startDate, endDate],
    queryFn: () =>
      auditLogService.getUserActivity(userId, page, limit, startDate, endDate),
    enabled: Boolean(userId),
  });
};

export const useUserActivityTimeline = (
  userId: string,
  dayFilter: DayFilter = "today",
  page: number = 1,
) => {
  return useQuery({
    queryKey: ["user-activity-timeline", userId, dayFilter, page],
    queryFn: () =>
      auditLogService.getUserActivitySimplified(userId, dayFilter, page, 20),
    enabled: Boolean(userId),
  });
};

export const useRecentActivity = (limit = 20) => {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => auditLogService.getRecentActivity(limit),
    refetchInterval: 10_000,
  });
};

export const useAuditStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["audit-stats", startDate, endDate],
    queryFn: () => auditLogService.getStats(startDate, endDate),
  });
};
