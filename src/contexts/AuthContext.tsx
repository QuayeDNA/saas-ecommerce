// src/contexts/AuthContext.tsx
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
import { useToast } from "../design-system/components/toast";

// Enhanced Auth state interface
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  dashboardUrl?: string;
}

// Enhanced Auth context type
export interface AuthContextValue {
  authState: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  registerAgent: (data: RegisterAgentData) => Promise<{ agentCode: string }>;
  registerCustomer: (data: RegisterCustomerData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyAccount: (token: string) => Promise<{ userType: string }>;
  clearErrors: () => void;
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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const { valid, user } = await authService.verifyToken();
          
          if (valid && user) {
            const token = authService.getToken();
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
          } else {
            // Token invalid, clear storage
            await authService.logout();
            setState({
              ...defaultAuthState,
              isInitialized: true,
              isLoading: false,
            });
          }
        } else {
          setState({
            ...defaultAuthState,
            isInitialized: true,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          ...defaultAuthState,
          isInitialized: true,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to initialize authentication",
        });
      }
    };

    initAuth();
  }, []);

  // Enhanced login method
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, token, dashboardUrl } = await authService.login({
        email,
        password,
        rememberMe,
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

      // Show success toast
      addToast(`Welcome back, ${user.fullName}!`, "success");
      
      // Navigate to dashboard or intended page
      const from = (location.state)?.from?.pathname ?? dashboardUrl ?? '/';
      navigate(from, { replace: true });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Don't show toast for login errors - let the form handle it
      throw error;
    }
  }, [addToast, navigate, location.state]);

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

  // Logout method
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    setState({
      ...defaultAuthState,
      isInitialized: true,
      isLoading: false,
    });

    addToast("Logged out successfully", "success");
    navigate('/login', { replace: true });
  }, [addToast, navigate]);

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
    }),
    [state, login, registerAgent, registerCustomer, logout, forgotPassword, resetPassword, verifyAccount, clearErrors]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
