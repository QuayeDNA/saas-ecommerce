// src/services/user.service.ts
import { apiClient } from '../utils/api-client';

import type { UserType } from '../types/auth';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: UserType;
  status: string;
  businessName?: string;
  businessCategory?: 'electronics' | 'fashion' | 'food' | 'services' | 'other';
  createdAt?: string;
  isActive?: boolean;
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus?: 'active' | 'inactive' | 'suspended';
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
  afaId: string;
  registrationType: 'agent' | 'subscriber';
  fullName: string;
  phone: string;
  registrationFee: number;
  userType?: 'agent' | 'subscriber';
}

export interface AfaRegistration {
  _id: string;
  afaId: string;
  registrationType: 'agent' | 'subscriber';
  fullName: string;
  phone: string;
  registrationFee: number;
  status: 'pending' | 'completed' | 'failed';
  registrationDate: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  agents: number;
  customers: number;
  superAdmins: number;
  totalAgents: number;
  activeAgents: number;
  verifiedCustomers: number;
  unverifiedCustomers: number;
  recentCustomers: number;
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
    agents: number;
    customers: number;
    verified: number;
    unverified: number;
    activeAgents: number;
    inactiveAgents: number;
    pendingAgents: number;
    newThisWeek: number;
    newThisMonth: number;
    verificationRate: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    thisWeek: number;
    thisMonth: number;
    successRate: number;
  };
  revenue: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
  providers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  wallet: {
    totalTransactions: number;
    thisWeek: number;
    totalBalance: number;
  };
  rates: {
    userVerification: number;
    orderSuccess: number;
    agentActivation: number;
  };
  recentActivity: {
    users: Array<{
      _id: string;
      fullName: string;
      email: string;
      userType: string;
      createdAt: string;
      status: string;
    }>;
    orders: Array<{
      _id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
      createdAt: string;
    }>;
    transactions: Array<{
      _id: string;
      amount: number;
      type: string;
      description: string;
      createdAt: string;
    }>;
  };
}

export interface ChartData {
  labels: string[];
  userRegistrations: number[];
  orders: number[];
  revenue: number[];
  orderStatus: {
    completed: number;
    pending: number;
    failed: number;
  };
  userTypes: {
    agents: number;
    customers: number;
    super_admins: number;
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
    const q = query.length ? `?${query.join('&')}` : '';
    const resp = await apiClient.get(`/api/auth/users${q}`);
    return resp.data.users;
  },
  async updateAgentStatus(id: string, status: 'active' | 'rejected'): Promise<void> {
    await apiClient.patch(`/api/auth/users/${id}/status`, { status });
  },
  async fetchUserById(id: string): Promise<User> {
    const resp = await apiClient.get(`/api/auth/users/${id}`);
    return resp.data.user;
  },
  async updateUser(id: string, updates: Partial<User & { isActive?: boolean }>): Promise<User> {
    const resp = await apiClient.patch(`/api/auth/users/${id}`, updates);
    return resp.data.user;
  },
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/api/auth/users/${id}/reset-password`, { newPassword });
  },
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/api/auth/users/${id}`);
  },
  async impersonateUser(id: string): Promise<{ token: string; user: User }> {
    const resp = await apiClient.post(`/api/auth/users/${id}/impersonate`);
    return resp.data;
  },
  async fetchDashboardStats(): Promise<DashboardStats> {
    const resp = await apiClient.get('/api/users/dashboard-stats');
    return resp.data.stats;
  },
  async fetchChartData(): Promise<ChartData> {
    const resp = await apiClient.get('/api/users/chart-data');
    return resp.data.chartData;
  },
  // Additional methods for UserContext
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const resp = await apiClient.patch('/api/auth/profile', data);
    return resp.data.user;
  },
  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.patch('/api/auth/change-password', data);
  },
  async submitAfaRegistration(data: AfaRegistrationData): Promise<AfaRegistration> {
    const resp = await apiClient.post('/api/users/afa-registration', data);
    return resp.data.afaRegistration;
  },
  async getAfaRegistration(): Promise<AfaRegistration | null> {
    const resp = await apiClient.get('/api/users/afa-registration');
    return resp.data.afaRegistration;
  },
  async getUsers(params: FetchUsersParams = {}): Promise<UsersResponse> {
    const resp = await apiClient.get('/api/auth/users', { params });
    return resp.data;
  },
  async getUserById(id: string): Promise<User> {
    const resp = await apiClient.get(`/api/auth/users/${id}`);
    return resp.data.user;
  },
  async getProfile(): Promise<User> {
    const resp = await apiClient.get('/api/auth/profile');
    return resp.data.user;
  },
  async getUserStats(): Promise<UserStats> {
    const resp = await apiClient.get('/api/auth/users/stats');
    return resp.data.stats;
  },
  async updateUserStatus(id: string, data: { status: string }): Promise<User> {
    const resp = await apiClient.patch(`/api/auth/users/${id}/status`, data);
    return resp.data.user;
  },
};
