// src/contexts/AuthContext.tsx

/**
 * Enhanced Authentication Context for SaaS E-commerce App
 * 
 * This context provides comprehensive authentication state management including:
 * - Cookie-based authentication with automatic token refresh
 * - User session management for both agents and customers
 * - Automatic logout on token expiry with proper cleanup
 * - Registration flows for different user types
 * - Password reset and account verification flows
 * - Robust error handling and loading states
 * 
 * Key Features:
 * - Seamless integration with auth.service.ts
 * - Automatic token refresh without user interruption
 * - Type-safe state management
 * - Navigation integration with protected routes
 * - Toast notifications for user feedback
 * 
 * @version 2.0.0
 * @author SaaS E-commerce Team
 */

import {
  createContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "../types";
import { authService, type RegisterAgentData, type RegisterCustomerData } from "../services/auth.service";
import { tokenRefreshService } from "../utils/token-refresh";
import { useToast } from "../design-system/components/toast";

/**
 * Enhanced Authentication State Interface
 * 
 * Comprehensive state object that tracks all authentication-related data
 * including user information, tokens, loading states, and error conditions.
 */
export interface AuthState {
  user: User | null;              // Current authenticated user data
  token: string | null;           // JWT access token (stored in cookies)
  isAuthenticated: boolean;       // Whether user is currently authenticated
  isLoading: boolean;             // Loading state for async operations
  isInitialized: boolean;         // Whether auth state has been initialized
  error: string | null;           // Current error message, if any
  dashboardUrl?: string;          // Dashboard URL based on user type
}

/**
 * Enhanced Authentication Context Interface
 * 
 * Defines all methods and state available through the auth context.
 * All methods handle their own loading states and error management.
 */
export interface AuthContextValue {
  authState: AuthState;                                                          // Current authentication state
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;   // User login
  registerAgent: (data: RegisterAgentData) => Promise<{ agentCode: string }>;       // Agent registration
  registerCustomer: (data: RegisterCustomerData) => Promise<void>;                  // Customer registration
  logout: () => Promise<void>;                                                      // User logout
  forgotPassword: (email: string) => Promise<void>;                                 // Request password reset
  resetPassword: (token: string, password: string) => Promise<void>;                // Complete password reset
  verifyAccount: (token: string) => Promise<{ userType: string }>;                  // Verify user account
  clearErrors: () => void;                                                          // Clear error state
  refreshAuth: () => Promise<void>;                                                 // Refresh authentication
  updateFirstTimeFlag: () => Promise<void>;                                         // Update first-time flag after tour
}

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Create auth context
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Enhanced Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<AuthState>({
    ...defaultAuthState,
    isLoading: true,
  });

  // Handle automatic logout from interceptor
  useEffect(() => {
    const handleAutoLogout = () => {
      console.log('Auto logout triggered by token expiry');
      setState({
        ...defaultAuthState,
        isInitialized: true,
        isLoading: false,
      });
      
      // Only show toast and navigate if not already on login page
      if (location.pathname !== '/login') {
        addToast("Session expired. Please log in again.", "warning");
        navigate('/login', { replace: true, state: { from: location } });
      }
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
      // Clean up token refresh service on unmount
      tokenRefreshService.stopTokenRefresh();
    };
  }, [addToast, navigate, location]);

  // Helper function to set authenticated state
  const setAuthenticatedState = useCallback((user: User, token: string) => {
    const dashboardUrl = user.userType === 'agent' ? '/agent/dashboard' : '/customer/dashboard';
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
      dashboardUrl
    });
    
    // Start proactive token refresh
    tokenRefreshService.startTokenRefresh();
  }, []);

  // Helper function to set unauthenticated state
  const setUnauthenticatedState = useCallback((error?: string) => {
    // Stop token refresh service
    tokenRefreshService.stopTokenRefresh();
    
    setState({
      ...defaultAuthState,
      isInitialized: true,
      isLoading: false,
      error: error ?? null,
    });
  }, []);

  // Handle token refresh logic
  const handleTokenRefresh = useCallback(async () => {
    try {
      const newToken = await authService.refreshAccessToken();
      const refreshedUser = authService.getCurrentUser();
      
      if (refreshedUser && newToken) {
        console.log('✅ AuthContext: Token refreshed successfully');
        setAuthenticatedState(refreshedUser, newToken);
      } else {
        throw new Error('User data missing after refresh');
      }
    } catch (refreshError) {
      console.error('❌ AuthContext: Token refresh failed:', refreshError);
      authService.clearAuthData();
      setUnauthenticatedState();
    }
  }, [setAuthenticatedState, setUnauthenticatedState]);

  // Refresh authentication state
  const refreshAuth = useCallback(async () => {
    console.log('🔄 AuthContext: Refreshing authentication state...');
    
    try {
      // Check if we have any authentication data
      if (!authService.isAuthenticated()) {
        console.log('🚫 AuthContext: No authentication data found');
        setUnauthenticatedState();
        return;
      }

      // Verify current token validity
      const { valid, user } = await authService.verifyToken();
      
      if (valid && user) {
        // Token is valid, update state
        const token = authService.getToken();
        if (token) {
          console.log('✅ AuthContext: Token verified successfully');
          setAuthenticatedState(user, token);
          return;
        }
      }

      // Token is invalid, attempt refresh
      console.log('🔄 AuthContext: Token invalid, attempting refresh...');
      await handleTokenRefresh();
      
    } catch (error) {
      console.error('❌ AuthContext: Auth refresh error:', error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      setUnauthenticatedState(errorMessage);
    }
  }, [setAuthenticatedState, setUnauthenticatedState, handleTokenRefresh]);

  // Initialize authentication state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 AuthContext: Initializing authentication...');
      
      try {
        // Use the improved auth service initialization
        const isAuthenticated = await authService.initializeAuth();
        
        if (isAuthenticated) {
          // Authentication successful - get user data
          const user = authService.getCurrentUser();
          const token = authService.getToken();
          
          if (user && token) {
            const dashboardUrl = user.userType === 'agent' 
              ? '/agent/dashboard' 
              : '/customer/dashboard';
            
            console.log('✅ AuthContext: Authentication initialized successfully', { 
              userId: user.id, 
              userType: user.userType 
            });
            
            setState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
              dashboardUrl
            });
            return;
          }
        }
        
        // Authentication failed or no valid tokens
        console.log('🚫 AuthContext: No valid authentication found');
        setState({
          ...defaultAuthState,
          isInitialized: true,
          isLoading: false,
        });
        
      } catch (error) {
        console.error('❌ AuthContext: Authentication initialization failed:', error);
        
        // Clear any stale data and set error state
        authService.clearAuthData();
        setState({
          ...defaultAuthState,
          isInitialized: true,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    };

    initializeAuth();
  }, []);
  // Enhanced login method with improved error handling
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    console.log('🔐 AuthContext: Attempting login...');
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, token, dashboardUrl } = await authService.login({
        email,
        password,
        rememberMe,
      });

      console.log('✅ AuthContext: Login successful', { 
        userId: user.id, 
        userType: user.userType 
      });

      setAuthenticatedState(user, token);

      // Show success toast
      addToast(`Welcome back, ${user.fullName}!`, "success");
      
      // Navigate to dashboard or intended page
      const locationState = location.state as { from?: { pathname: string } } | null;
      const from = locationState?.from?.pathname ?? dashboardUrl ?? '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to login";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Re-throw error for form handling
      throw error;
    }
  }, [addToast, navigate, location.state, setAuthenticatedState]);

  // Register agent method
  const registerAgent = useCallback(async (data: RegisterAgentData): Promise<{ agentCode: string }> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authService.registerAgent(data);
      setState((prev) => ({ ...prev, isLoading: false }));
      addToast("Agent account created successfully! Check your email for verification.", "success");
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register agent";
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [addToast]);

  // Register customer method
  const registerCustomer = useCallback(async (data: RegisterCustomerData): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.registerCustomer(data);
      setState((prev) => ({ ...prev, isLoading: false }));
      addToast("Customer account created successfully! Check your email for verification.", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register customer";
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [addToast]);

  // Forgot password method
  const forgotPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.forgotPassword({ email });
      setState((prev) => ({ ...prev, isLoading: false }));
      addToast("Password reset email sent successfully!", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email";
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [addToast]);

  // Reset password method
  const resetPassword = useCallback(async (token: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authService.resetPassword({ token, password });
      setState((prev) => ({ ...prev, isLoading: false }));
      addToast("Password reset successfully!", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [addToast]);

  // Verify account method
  const verifyAccount = useCallback(async (token: string): Promise<{ userType: string }> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await authService.verifyAccount({ token });
      setState((prev) => ({ ...prev, isLoading: false }));
      addToast("Account verified successfully! You can now log in.", "success");
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify account";
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, [addToast]);

  // Logout method with improved error handling
  const logout = useCallback(async () => {
    console.log('🚪 AuthContext: Logging out...');
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();
      console.log('✅ AuthContext: Logout successful');
      
      // Clear localStorage flags for wizard/tour completion
      localStorage.removeItem('wizardCompleted');
      localStorage.removeItem('tourCompleted');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    } finally {
      // Stop token refresh service
      tokenRefreshService.stopTokenRefresh();
      
      // Always clear state regardless of logout API success
      setUnauthenticatedState();
      addToast("Logged out successfully", "success");
      
      // Clear any redirect state and go to login
      navigate('/login', { replace: true });
    }
  }, [addToast, navigate, setUnauthenticatedState]);

  // Update first-time flag after completing guided tour or setup wizard
  const updateFirstTimeFlag = useCallback(async (): Promise<void> => {
    try {
      await authService.updateFirstTimeFlag();
      
      // Update local state to avoid showing the tour/wizard again
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, isFirstTime: false } : null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update preferences";
      console.error("Error updating first-time flag:", errorMessage);
      // Silently fail as this is not critical
    }
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      authState: state,
      login,
      registerAgent,
      registerCustomer,
      logout,
      forgotPassword,
      resetPassword,
      verifyAccount,
      clearErrors,
      refreshAuth,
      updateFirstTimeFlag,
    }),
    [state, login, registerAgent, registerCustomer, logout, forgotPassword, resetPassword, verifyAccount, clearErrors, refreshAuth, updateFirstTimeFlag]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};