export type UserType = 'agent' | 'subscriber';

export interface User {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  userType: UserType;
  walletBalance: number;
  createdAt?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
