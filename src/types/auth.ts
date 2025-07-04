export type UserType = 'agent' | 'customer' | 'subscriber' | 'super_admin' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  fullName: string;
  phone: string;
  email: string;
  userType: UserType;
  walletBalance: number;
  isVerified: boolean;
  createdAt?: Date | string;
  // Agent-specific fields
  businessName?: string;
  businessCategory?: 'electronics' | 'fashion' | 'food' | 'services' | 'other';
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
  subscriptionStatus?: 'active' | 'inactive' | 'suspended';
  // Multi-tenant fields
  tenantId?: string;
  // AFA Registration
  afaRegistration?: {
    afaId: string;
    registrationType: 'agent' | 'subscriber';
    fullName: string;
    phone: string;
    registrationFee: number;
    status: 'pending' | 'completed' | 'failed';
    registrationDate: Date | string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
