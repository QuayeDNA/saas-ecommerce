import { useState, useMemo, type ReactNode } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/auth-context';
import type { User } from '../types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock login function (to be replaced with actual API call)
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulating API call with the credentials
      console.log(`Logging in with ${email} and password: ${password.substring(0, 1)}***`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const userData: User = {
        id: '123',
        fullName: 'John Doe',
        email,
        phone: '+233123456789',
        userType: 'agent',
        walletBalance: 1000,
        createdAt: new Date(),
      };
      
      // Mock token
      const jwtToken = 'mock-jwt-token';
      
      // Update state
      setUser(userData);
      setToken(jwtToken);
      setIsLoading(false);
      
      // Store in localStorage for persistence
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };

  // Mock register function
  const register = async (userData: Omit<User, 'id' | 'walletBalance' | 'createdAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulating API call with user data
      console.log('Registering user:', userData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      // After successful registration, you might want to automatically log the user in
      // or redirect them to login page
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to register');
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Create context value with useMemo to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    authState: {
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      error,
    },
    login,
    register,
    logout,
  }), [user, token, isLoading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
