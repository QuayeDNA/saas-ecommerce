// src/services/user.service.ts
import { apiClient } from "../utils/api-client";

import type { UserType } from "../types/auth";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: UserType;
  status: string;
  businessName?: string;
  businessCategory?: "electronics" | "fashion" | "food" | "services" | "other";
  agentCode?: string;
  createdAt?: string;
  isActive?: boolean;
  subscriptionPlan?: "basic" | "premium" | "enterprise";
  subscriptionStatus?: "active" | "inactive" | "suspended";
  walletBalance: number;
  isVerified: boolean;
}

export interface FetchUsersParams {
  status?: string;
  userType?: string;
  search?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AfaRegistrationData {
  fullName: string;
  phone: string;
  userType: "agent" | "subscriber";
}

export interface AfaRegistration {
  orderNumber: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerPhone: string;
}

export interface AfaOrder {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
  };
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    packageDetails: {
      name: string;
      price: number;
    };
    quantity: number;
    totalPrice: number;
    customerPhone: string;
  }>;
}

export interface AfaRegistrationResponse {
  afaOrders: AfaOrder[];
  total: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  agents: number;
  totalAgentRoles: number;
  superAdmins: number;
  totalAgents: number;
  activeAgents: number;
  verifiedSubordinates: number;
  unverifiedSubordinates: number;
  recentSubordinates: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  users: {
    total: number;
    newThisPeriod: number;
    newThisWeek: number;
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
    draft: number;
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
    orderCount: number;
    averageOrderValue: number;
  };
  wallet: {
    totalBalance: number;
    transactions: {
      credits: {
        amount: number;
        count: number;
      };
      debits: {
        amount: number;
        count: number;
      };
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
  recentActivity: {
    users: Array<{
      _id: string;
      fullName: string;
      email: string;
      userType: string;
      subscriptionStatus: string;
      status: string;
      createdAt: string;
    }>;
    orders: Array<{
      _id: string;
      orderType: string;
      total: number;
      status: string;
      createdAt: string;
      orderNumber: string;
      completionPercentage: number;
      id: string;
    }>;
    transactions: Array<{
      _id: string;
      amount: number;
      type: string;
      description: string;
      createdAt: string;
    }>;
  };
  rates: {
    userVerification: number;
    agentActivation: number;
    orderSuccess: number;
  };
  timeframe: string;
  generatedAt: string;
}
export interface ChartData {
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
}

export const userService = {
  async fetchUsers(params: FetchUsersParams = {}): Promise<User[]> {
    const { status, userType, search } = params;
    const query = [];
    if (status) query.push(`status=${status}`);
    if (userType) query.push(`userType=${userType}`);
    if (search) query.push(`search=${encodeURIComponent(search)}`);
    // Search is now backend supported
    const q = query.length ? `?${query.join("&")}` : "";
    const resp = await apiClient.get(`/api/auth/users${q}`);
    return resp.data.users;
  },
  async updateAgentStatus(
    id: string,
    status: "active" | "rejected"
  ): Promise<void> {
    await apiClient.patch(`/api/auth/users/${id}/status`, { status });
  },
  async fetchUserById(id: string): Promise<User> {
    const resp = await apiClient.get(`/api/auth/users/${id}`);
    return resp.data.user;
  },
  async updateUser(
    id: string,
    updates: Partial<User & { isActive?: boolean }>
  ): Promise<User> {
    const resp = await apiClient.patch(`/api/auth/users/${id}`, updates);
    return resp.data.user;
  },
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/api/auth/users/${id}/reset-password`, {
      newPassword,
    });
  },
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/auth/users/${id}`);
  },
  async impersonateUser(id: string): Promise<{ token: string; user: User }> {
    const resp = await apiClient.post(`/api/auth/users/${id}/impersonate`);
    return resp.data;
  },
  async fetchDashboardStats(): Promise<DashboardStats> {
    const resp = await apiClient.get("/api/analytics/summary");
    return resp.data.data;
  },
  async fetchChartData(): Promise<ChartData> {
    const resp = await apiClient.get("/api/analytics/charts");
    return resp.data.data;
  },
  // Additional methods for UserContext
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const resp = await apiClient.patch("/api/auth/profile", data);
    return resp.data.user;
  },
  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.patch("/api/auth/change-password", data);
  },
  async submitAfaRegistration(
    data: AfaRegistrationData
  ): Promise<AfaRegistration> {
    const resp = await apiClient.post("/api/users/afa-registration", data);
    return resp.data.order;
  },
  async getAfaRegistration(): Promise<AfaRegistrationResponse> {
    const resp = await apiClient.get("/api/users/afa-registration");
    return resp.data;
  },
  async getUsers(params: FetchUsersParams = {}): Promise<UsersResponse> {
    const resp = await apiClient.get("/api/auth/users", { params });
    return resp.data;
  },
  async getUserById(id: string): Promise<User> {
    const resp = await apiClient.get(`/api/auth/users/${id}`);
    return resp.data.user;
  },
  async getProfile(): Promise<User> {
    const resp = await apiClient.get("/api/auth/profile");
    return resp.data.user;
  },
  async getUserStats(): Promise<UserStats> {
    const resp = await apiClient.get("/api/auth/users/stats");
    return resp.data.stats;
  },
  async updateUserStatus(id: string, data: { status: string }): Promise<User> {
    const resp = await apiClient.patch(`/api/auth/users/${id}/status`, data);
    return resp.data.user;
  },
};
