// src/services/user.service.ts
import { apiClient } from '../utils/api-client';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: string;
  status: string;
  businessName?: string;
  businessCategory?: string;
  createdAt?: string;
}

export interface FetchUsersParams {
  status?: string;
  userType?: string;
  search?: string;
}

export const userService = {
  async fetchUsers(params: FetchUsersParams = {}): Promise<User[]> {
    const { status, userType } = params;
    const query = [];
    if (status) query.push(`status=${status}`);
    if (userType) query.push(`userType=${userType}`);
    // Search is frontend only for now
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
};
