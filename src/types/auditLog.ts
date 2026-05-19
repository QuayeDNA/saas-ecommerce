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
    | "bundle"
    | "commission";
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
