export interface AuditLog {
  _id: string;
  userId: string;
  userType: string;
  action: string;
  category:
    | "auth"
    | "user"
    | "order"
    | "wallet"
    | "storefront"
    | "payout"
    | "settings"
    | "bundle";
  resource?: {
    type: string;
    id: string;
  };
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  user?: {
    _id: string;
    fullName: string;
    email: string;
    userType: string;
  };
}

export interface AuditLogFilters {
  userId?: string;
  userType?: string;
  category?: string;
  action?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  topUsers: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  recentCritical: number;
  byAction?: Array<{
    _id: string;
    count: number;
  }>;
  dailyTrend?: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    count: number;
  }>;
}

export interface AuditLogResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export type DayFilter = "today" | "yesterday" | "2daysago" | "all";

export interface UserActivityLog {
  _id: string;
  user: {
    fullName: string;
    email: string;
  };
  action: string;
  category: string;
  severity: "info" | "warning" | "critical";
  time: string;
  date: string;
  timestamp: string;
  description: string;
  raw: {
    metadata: Record<string, any>;
    changes: {
      before: Record<string, any>;
      after: Record<string, any>;
    } | null;
    resource: {
      type: string;
      id: string;
    } | null;
    ipAddress: string;
    userAgent: string;
  };
}

export interface UserActivityLogResponse {
  success: boolean;
  logs: UserActivityLog[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}
