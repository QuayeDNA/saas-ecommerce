// src/services/user.service.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/users`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  userType: 'agent' | 'subscriber';
}

export interface AfaRegistration {
  afaId: string;
  registrationType: 'agent' | 'subscriber';
  fullName: string;
  phone: string;
  registrationFee: number;
  status: 'pending' | 'completed' | 'failed';
  registrationDate: string;
}

export interface UserStats {
  totalCustomers?: number;
  verifiedCustomers?: number;
  unverifiedCustomers?: number;
  recentCustomers?: number;
  totalUsers?: number;
  totalAgents?: number;
  activeAgents?: number;
  inactiveAgents?: number;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * User Service for managing user profiles and operations
 */
class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/profile');
      return response.data.user;
    } catch (error) {
      this.handleError(error, 'Failed to get user profile');
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put('/profile', data);
      return response.data.user;
    } catch (error) {
      this.handleError(error, 'Failed to update profile');
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.post('/change-password', data);
    } catch (error) {
      this.handleError(error, 'Failed to change password');
      throw error;
    }
  }

  /**
   * Submit AFA registration
   */
  async submitAfaRegistration(data: AfaRegistrationData): Promise<AfaRegistration> {
    try {
      const response = await api.post('/afa-registration', data);
      return response.data.afaRegistration;
    } catch (error) {
      this.handleError(error, 'AFA registration failed');
      throw error;
    }
  }

  /**
   * Get AFA registration status
   */
  async getAfaRegistration(): Promise<AfaRegistration | null> {
    try {
      const response = await api.get('/afa-registration');
      return response.data.afaRegistration;
    } catch (error) {
      this.handleError(error, 'Failed to get AFA registration status');
      throw error;
    }
  }

  /**
   * Get users list (for agents/admins)
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    userType?: string;
  }): Promise<UsersResponse> {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get users');
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get(`/${id}`);
      return response.data.user;
    } catch (error) {
      this.handleError(error, 'Failed to get user');
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get('/stats');
      return response.data.stats;
    } catch (error) {
      this.handleError(error, 'Failed to get user statistics');
      throw error;
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(id: string, data: {
    isVerified?: boolean;
    subscriptionStatus?: string;
  }): Promise<User> {
    try {
      const response = await api.put(`/${id}/status`, data);
      return response.data.user;
    } catch (error) {
      this.handleError(error, 'Failed to update user status');
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      this.handleError(error, 'Failed to delete user');
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown, fallbackMessage: string) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || fallbackMessage;
      console.error(`User Service Error: ${message}`, error);
    } else {
      console.error(`User Service Error: ${fallbackMessage}`, error);
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
