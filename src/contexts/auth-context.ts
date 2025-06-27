import { createContext } from 'react';
import type { AuthState, User } from '../types';

// Default auth state
const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Define the auth context type
export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'walletBalance' | 'createdAt'>) => Promise<void>;
  logout: () => void;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  authState: defaultAuthState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});
