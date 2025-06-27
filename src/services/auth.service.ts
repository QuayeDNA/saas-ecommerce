// src/services/auth.service.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import type { User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: import.meta.env.PROD, // Only secure in production
  sameSite: 'strict' as const,
  expires: 7, // 7 days default
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 - let components handle it
    if (error.response?.status === 401) {
      // Clear auth data but don't redirect
      Cookies.remove('authToken');
      Cookies.remove('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

/**
 * Auth Service Types
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterAgentData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  businessCategory: 'electronics' | 'fashion' | 'food' | 'services' | 'other';
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
}

export interface RegisterCustomerData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  agentCode?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface VerifyAccountData {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  dashboardUrl?: string;
}

/**
 * Enhanced Auth Service for Multi-tenant SaaS
 */
class AuthService {
  /**
   * Extracts error message and errors array from an Axios error
   */
  private extractErrorMessage(err: unknown, fallback: string): { message: string; errors?: { message: string }[] } {
    let message = fallback;
    let errors: { message: string }[] | undefined;
    
    if (axios.isAxiosError(err)) {
      message = err.response?.data?.message ?? err.message ?? message;
      errors = err.response?.data?.errors;
    } else if (err instanceof Error) {
      message = err.message;
    }
    
    return { message, errors };
  }

  /**
   * Store auth data securely
   */
  private storeAuthData(token: string, user: User, rememberMe = false): void {
    const cookieExpires = rememberMe ? 30 : 7; // 30 days if remember me, 7 days otherwise
    
    // Store in secure cookies
    Cookies.set('authToken', token, { ...COOKIE_OPTIONS, expires: cookieExpires });
    Cookies.set('user', JSON.stringify(user), { ...COOKIE_OPTIONS, expires: cookieExpires });
    
    // Also store in localStorage for backward compatibility
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear auth data
   */
  private clearAuthData(): void {
    Cookies.remove('authToken');
    Cookies.remove('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  /**
   * Login user (agent or customer)
   */
  async login({ email, password, rememberMe }: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
        rememberMe
      });
      
      const { user, token, dashboardUrl } = response.data;
      
      // Store auth data securely
      this.storeAuthData(token, user, rememberMe);
      
      return { success: true, user, token, dashboardUrl };
    } catch (err: unknown) {
      const { message } = this.extractErrorMessage(err, 'Login failed');
      throw new Error(message);
    }
  }

  /**
   * Register new agent (business owner)
   */
  async registerAgent(data: RegisterAgentData): Promise<{ agentCode: string }> {
    try {
      const response = await api.post('/api/auth/register/agent', data);
      return {
        agentCode: response.data.agentCode
      };
    } catch (err: unknown) {
      const { message, errors } = this.extractErrorMessage(err, 'Agent registration failed');
      if (errors && errors.length > 0) {
        throw new Error(errors.map((e) => e.message).join(', '));
      }
      throw new Error(message);
    }
  }

  /**
   * Register new customer
   */
  async registerCustomer(data: RegisterCustomerData): Promise<void> {
    try {
      await api.post('/api/auth/register/customer', data);
    } catch (err: unknown) {
      const { message, errors } = this.extractErrorMessage(err, 'Customer registration failed');
      if (errors && errors.length > 0) {
        throw new Error(errors.map((e) => e.message).join(', '));
      }
      throw new Error(message);
    }
  }

  /**
   * Verify user account
   */
  async verifyAccount(data: VerifyAccountData): Promise<{ userType: string }> {
    try {
      const response = await api.post('/api/auth/verify-account', data);
      return {
        userType: response.data.userType
      };
    } catch (err: unknown) {
      const { message } = this.extractErrorMessage(err, 'Account verification failed');
      throw new Error(message);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    try {
      await api.post('/api/auth/forgot-password', data);
    } catch (err: unknown) {
      const { message } = this.extractErrorMessage(err, 'Failed to send reset email');
      throw new Error(message);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await api.post('/api/auth/reset-password', data);
    } catch (err: unknown) {
      const { message } = this.extractErrorMessage(err, 'Password reset failed');
      throw new Error(message);
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await api.post('/api/auth/verify-token');
      return {
        valid: response.data.valid,
        user: response.data.user
      };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch {
      console.warn('Logout API call failed, continuing with local logout');
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    // Try cookies first, then localStorage
    let user = Cookies.get('user');
    if (user === undefined) {
      const localUser = localStorage.getItem('user');
      if (localUser !== null) {
        user = localUser;
      }
    }
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    // Check both cookies and localStorage
    return !!(Cookies.get('authToken') ?? localStorage.getItem('authToken'));
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return Cookies.get('authToken') ?? localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
