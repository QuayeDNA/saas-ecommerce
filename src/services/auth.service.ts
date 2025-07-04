// src/services/auth.service.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import type { User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: import.meta.env.PROD, // Only secure in production
  sameSite: 'strict' as const,
  path: '/', // Ensure cookies are available site-wide
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
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

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt token refresh
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          }, {
            withCredentials: true
          });
          
          const { accessToken, user } = refreshResponse.data;
          
          // Store new tokens
          authService.storeAuthData(accessToken, user, !!Cookies.get('rememberMe'));
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear all auth data and let the app handle redirect
        authService.clearAuthData();
        // Dispatch custom event to notify app of logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError instanceof Error ? refreshError : new Error(String(refreshError)));
      }
    }
    
    // For other 401s or if refresh failed, clear auth data
    if (error.response?.status === 401) {
      authService.clearAuthData();
      window.dispatchEvent(new CustomEvent('auth:logout'));
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
  refreshToken?: string;
  dashboardUrl?: string;
}

/**
 * Enhanced Auth Service for Multi-tenant SaaS (Cookie-Only)
 * 
 * This service handles all authentication operations including:
 * - Login/logout with secure cookie storage
 * - Automatic token refresh
 * - User registration (agents and customers)
 * - Password reset flows
 * - Account verification
 */
class AuthService {
  // =============================================================================
  // INITIALIZATION & TOKEN MANAGEMENT
  // =============================================================================

  /**
   * Initialize authentication state on app startup
   * This method checks for existing tokens and attempts refresh if needed
   * 
   * @returns Promise<boolean> - true if user is authenticated, false otherwise
   */
  async initializeAuth(): Promise<boolean> {
    try {
      const accessToken = this.getToken();
      const refreshToken = this.getRefreshToken();
      
      console.log('🔐 Initializing auth state...', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });
      
      // Case 1: No access token but have refresh token - attempt refresh
      if (!accessToken && refreshToken) {
        console.log('📱 No access token found, attempting refresh...');
        try {
          await this.refreshAccessToken();
          return true;
        } catch (error) {
          console.error('❌ Token refresh failed during initialization:', error);
          this.clearAuthData();
          return false;
        }
      }
      
      // Case 2: Have access token - verify it's still valid
      if (accessToken) {
        const { valid } = await this.verifyToken();
        if (valid) {
          console.log('✅ Access token is valid');
          return true;
        } else if (refreshToken) {
          console.log('🔄 Access token invalid, attempting refresh...');
          try {
            await this.refreshAccessToken();
            return true;
          } catch (error) {
            console.error('❌ Token refresh failed:', error);
            this.clearAuthData();
            return false;
          }
        }
      }
      
      // Case 3: No tokens available
      console.log('🚫 No valid authentication found');
      return false;
      
    } catch (error) {
      console.error('💥 Auth initialization failed:', error);
      this.clearAuthData();
      return false;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

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

  // =============================================================================
  // TOKEN MANAGEMENT
  // =============================================================================

  /**
   * Store auth data securely in cookies only
   */
  storeAuthData(token: string, user: User, rememberMe = false): void {
    const cookieExpires = rememberMe ? 30 : 7; // 30 days if remember me, 7 days otherwise
    
    // Store in secure cookies only
    Cookies.set('authToken', token, { ...COOKIE_OPTIONS, expires: cookieExpires });
    Cookies.set('user', JSON.stringify(user), { ...COOKIE_OPTIONS, expires: cookieExpires });
    
    if (rememberMe) {
      Cookies.set('rememberMe', 'true', { ...COOKIE_OPTIONS, expires: cookieExpires });
    }
    
    // Clean up any old localStorage data
    this.cleanLocalStorage();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('🔄 Attempting token refresh...');
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken
      }, {
        withCredentials: true
      });
      
      const { accessToken, user, refreshToken: newRefreshToken } = response.data;
      const rememberMe = !!Cookies.get('rememberMe');
      
      // Store new tokens
      this.storeAuthData(accessToken, user, rememberMe);
      if (newRefreshToken) {
        this.storeRefreshToken(newRefreshToken, rememberMe);
      }
      
      console.log('✅ Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearAuthData();
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Store refresh token
   */
  storeRefreshToken(refreshToken: string, rememberMe = false): void {
    const cookieExpires = rememberMe ? 30 : 7;
    Cookies.set('refreshToken', refreshToken, { 
      ...COOKIE_OPTIONS, 
      expires: cookieExpires
    });
  }

  /**
   * Clear all auth data
   */
  clearAuthData(): void {
    Cookies.remove('authToken', { path: '/' });
    Cookies.remove('user', { path: '/' });
    Cookies.remove('refreshToken', { path: '/' });
    Cookies.remove('rememberMe', { path: '/' });
    
    // Clean up any old localStorage data
    this.cleanLocalStorage();
  }

  /**
   * Clean up old localStorage data
   */
  private cleanLocalStorage(): void {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.warn('Failed to clean localStorage:', error);
    }
  }

 /**
   * Enhanced login method
   */
  async login({ email, password, rememberMe }: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
        rememberMe
      });
      
      const { user, token, refreshToken, dashboardUrl } = response.data;
      
      // Store auth data securely
      this.storeAuthData(token, user, rememberMe);
      
      // Store refresh token if provided
      if (refreshToken) {
        this.storeRefreshToken(refreshToken, rememberMe);
      }
      
      return { success: true, user, token, refreshToken, dashboardUrl };
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
   * Verify JWT token with the server
   */
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { valid: false };
      }

      const response = await api.post('/api/auth/verify-token');
      return {
        valid: response.data.valid,
        user: response.data.user
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await api.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, continuing with local logout:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current user from cookies only
   */
  getCurrentUser(): User | null {
    try {
      const userCookie = Cookies.get('user');
      return userCookie ? JSON.parse(userCookie) : null;
    } catch (error) {
      console.error('Failed to parse user from cookie:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid token in cookies)
   */
  isAuthenticated(): boolean {
    const token = Cookies.get('authToken');
    const user = Cookies.get('user');
    return !!(token && user);
  }

  /**
   * Get auth token from cookies only
   */
  getToken(): string | null {
    return Cookies.get('authToken') ?? null;
  }

  /**
   * Get refresh token from cookies
   */
  getRefreshToken(): string | null {
    return Cookies.get('refreshToken') ?? null;
  }

  /**
   * Check if remember me is enabled
   */
  isRememberMeEnabled(): boolean {
    return Cookies.get('rememberMe') === 'true';
  }
}

export const authService = new AuthService();