// src/services/storefront.service.ts
import { apiClient } from '../utils/api-client';

export interface PaymentMethod {
  type: 'mobile_money' | 'bank_transfer' | 'paystack';
  mobileMoney?: {
    network: 'MTN' | 'Vodafone' | 'AirtelTigo';
    accountName: string;
    accountNumber: string;
  };
  bankTransfer?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch?: string;
  };
  paystack?: {
    publicKey: string;
  };
  instructions?: string;
  processingFee?: number;
  isActive: boolean;
}

export interface Storefront {
  _id: string;
  agentId: string;
  businessName: string;
  displayName?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  pricing?: {
    bundleId: string;
    customPrice: number;
    markup: number;
    isActive: boolean;
  }[];
  paymentMethods: PaymentMethod[];
  settings: {
    contactInfo: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
    autoFulfill: boolean;
    orderNotifications: boolean;
  };
  security?: {
    rateLimitWindow: number;
    maxOrdersPerWindow: number;
  };
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
    conversionRate: number;
    totalViews?: number;
  };
  isActive: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorefrontData {
  businessName: string;
  displayName?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  paymentMethods: PaymentMethod[];
  settings?: {
    contactInfo?: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
    autoFulfill?: boolean;
    orderNotifications?: boolean;
  };
  customPricing?: {
    bundleId: string;
    customPrice: number;
  }[];
}

export interface OrderSummary {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  paymentMethod: {
    type: string;
    network?: string;
  };
  total: number;
  profit: number;
  status: string;
  createdAt: string;
  paymentProof?: {
    filename: string;
    uploadedAt: string;
  };
}

export interface StorefrontAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  conversionRate: number;
  totalViews?: number;
  recentOrders?: OrderSummary[];
  revenueByPeriod?: Array<{
    period: string;
    revenue: number;
    profit: number;
  }>;
  monthlyData?: Array<{
    month: string;
    orders: number;
    revenue: number;
    profit: number;
    views: number;
  }>;
  topProducts?: Array<{
    name: string;
    orders: number;
    revenue: number;
    profit: number;
  }>;
  paymentMethodStats?: Array<{
    method: string;
    orders: number;
    revenue: number;
  }>;
  recentActivity?: Array<{
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

export interface PublicStorefront {
  _id: string;
  businessName: string;
  displayName?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  paymentMethods: PaymentMethod[];
  settings: {
    contactInfo: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
  };
  isActive: boolean;
  isPublic?: boolean;
}

export interface StorefrontBundle {
  _id: string;
  name: string;
  description?: string;
  price: number;
  customPrice?: number;
  markup?: number;
  provider: string;
  category: string;
  isActive: boolean;
}

export interface UploadResult {
  success: boolean;
  filename: string;
  uploadedAt: string;
  message?: string;
}

export interface OrderConfirmation {
  _id: string;
  orderNumber: string;
  status: string;
  confirmedAt: string;
  transactionId: string;
  amountPaid: number;
  notes?: string;
}

class StorefrontService {
  // Get agent's storefront
  async getAgentStorefront(): Promise<Storefront> {
    const response = await apiClient.get('/api/storefront');
    return response.data.data.storefront;
  }

  // Create new storefront
  async createStorefront(data: CreateStorefrontData): Promise<Storefront> {
    const response = await apiClient.post('/api/storefront', data);
    return response.data.data.storefront;
  }

  // Update storefront
  async updateStorefront(storefrontId: string, data: Partial<CreateStorefrontData>): Promise<Storefront> {
    const response = await apiClient.put(`/api/storefront/${storefrontId}`, data);
    return response.data.data.storefront;
  }

  // Add payment method
  async addPaymentMethod(storefrontId: string, paymentMethod: PaymentMethod): Promise<Storefront> {
    const response = await apiClient.post(`/api/storefront/${storefrontId}/payment-methods`, paymentMethod);
    return response.data.data.storefront;
  }

  // Update payment method
  async updatePaymentMethod(storefrontId: string, methodId: string, paymentMethod: PaymentMethod): Promise<Storefront> {
    const response = await apiClient.put(`/api/storefront/${storefrontId}/payment-methods/${methodId}`, paymentMethod);
    return response.data.data.storefront;
  }

  // Set custom pricing
  async setPricing(storefrontId: string, pricing: { bundleId: string; customPrice: number }[]): Promise<Storefront> {
    const response = await apiClient.put(`/api/storefront/${storefrontId}/pricing`, { pricing });
    return response.data.data.storefront;
  }

  // Get pending orders
  async getPendingOrders(): Promise<OrderSummary[]> {
    const response = await apiClient.get('/api/storefront/orders/pending');
    return response.data.data.orders;
  }

  // Confirm payment
  async confirmPayment(orderId: string, data: {
    transactionId: string;
    amountPaid: number;
    notes?: string;
  }): Promise<OrderConfirmation> {
    const response = await apiClient.put(`/api/storefront/orders/${orderId}/confirm`, data);
    return response.data.data.order;
  }

  // Upload payment proof
  async uploadPaymentProof(orderId: string, file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('paymentProof', file);

    const response = await apiClient.post(`/api/storefront/orders/${orderId}/payment-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Get storefront analytics
  async getAnalytics(storefrontId: string): Promise<StorefrontAnalytics> {
    const response = await apiClient.get(`/api/storefront/${storefrontId}/analytics`);
    return response.data.data.analytics;
  }

  // Get public storefront (for preview)
  async getPublicStorefront(businessName: string): Promise<PublicStorefront> {
    const response = await apiClient.get(`/api/storefront/${businessName}`);
    return response.data.data.storefront;
  }

  // Get storefront bundles (for preview)
  async getStorefrontBundles(businessName: string): Promise<StorefrontBundle[]> {
    const response = await apiClient.get(`/api/storefront/${businessName}/bundles`);
    return response.data.data.bundles;
  }

  // Activate storefront
  async activateStorefront(storefrontId: string): Promise<Storefront> {
    const response = await apiClient.put(`/api/storefront/${storefrontId}/activate`);
    return response.data.data.storefront;
  }

  // Deactivate storefront
  async deactivateStorefront(storefrontId: string): Promise<Storefront> {
    const response = await apiClient.put(`/api/storefront/${storefrontId}/deactivate`);
    return response.data.data.storefront;
  }
}

export const storefrontService = new StorefrontService();
export default storefrontService;