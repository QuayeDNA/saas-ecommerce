import { apiClient } from '@/utils/api-client';
import { AxiosError } from 'axios';

// =========================================================================
// Types
// =========================================================================

export interface StorefrontData {
  _id?: string;
  agentId: string | { _id: string; fullName: string; userType: string };
  businessName: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  isApproved?: boolean;
  // Suspension fields (admin-level)
  suspendedByAdmin?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  paymentMethods: Array<{
    type: 'mobile_money' | 'bank_transfer';
    details: Record<string, unknown>;
    isActive: boolean;
  }>;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
  };
  settings?: {
    theme?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'indigo' | 'pink';
    showContact?: boolean;
  };
  branding?: StorefrontBranding;
  // Optional Paystack subaccount code for direct payouts to the agent via Paystack
  paystackSubaccountId?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StorefrontBranding {
  logoUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  layout?: 'classic' | 'modern' | 'minimal';
  showBanner?: boolean;
  footerText?: string;
}

/** Response shape for getMyStorefront when store is admin-suspended */
export interface StorefrontResponse {
  data: StorefrontData;
  suspended?: boolean;
  suspensionMessage?: string;
}

export interface StorefrontPricing {
  _id?: string;
  storefrontId: string;
  bundleId: string | {
    _id: string;
    name: string;
    description?: string;
    dataVolume: number;
    dataUnit: string;
    validity: number | string;
    validityUnit: string;
    providerId?: { _id: string; name: string; code: string };
    category?: string;
    isActive: boolean;
    bundleCode?: string;
    formattedDataVolume?: string;
    formattedValidity?: string;
  };
  tierPrice: number;
  customPrice: number;
  markup: number;
  markupPercentage: number;
  hasCustomPrice: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Bundle returned by GET /agent/storefront/bundles — ALL admin-active bundles with pricing overlay */
export interface AgentBundle {
  _id: string;
  name: string;
  description?: string;
  dataVolume: number;
  dataUnit: string;
  validity: number | string;
  validityUnit: string;
  category?: string;
  bundleCode?: string;
  provider: { _id: string; name: string; code: string };
  packageName?: string;
  tierPrice: number;
  customPrice: number | null;
  markup: number | null;
  isEnabled: boolean;
}

export interface StorefrontOrderItem {
  _id?: string;
  bundleId: string;
  bundleName: string;
  provider?: string;
  dataVolume: number;
  dataUnit: string;
  validity: number | string;
  validityUnit: string;
  quantity: number;
  customerPhone: string;
  unitPrice: number;
  tierPrice: number;
  totalPrice: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  processedAt?: string;
}

export interface StorefrontOrder {
  _id: string;
  orderNumber: string;
  orderType: 'storefront';
  status: 'pending_payment' | 'pending' | 'confirmed' | 'processing' | 'partially_completed' | 'completed' | 'cancelled' | 'failed';
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  storefrontData: {
    storefrontId: string;
    customerInfo: {
      name: string;
      phone: string;
      email?: string;
      ghanaCardNumber?: string;
    };
    paymentMethod: {
      type: 'mobile_money' | 'bank_transfer';
      reference?: string;
      paymentProofUrl?: string;
      verified: boolean;
      verifiedAt?: string;
      verificationNotes?: string;
    };
    totalMarkup: number;
    totalTierCost: number;
    items: StorefrontOrderItem[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  completedOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

// Public storefront types (customer-facing)
export interface PublicBundle {
  _id: string;
  name: string;
  description?: string;
  dataVolume: number;
  dataUnit: string;
  validity: number | string;
  validityUnit: string;
  provider?: string;
  providerName?: string;
  packageName?: string;
  packageCategory?: string;
  category?: string;
  price: number; // hasCustomPrice ? customPrice : tierPrice
  // AFA-specific fields
  requiresGhanaCard?: boolean;
  afaRequirements?: string[];
}

export interface PublicStorefront {
  storefront: {
    businessName: string;
    displayName: string;
    description?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
    settings?: {
      theme?: string;
      showContact?: boolean;
    };
    branding?: StorefrontBranding;
    paymentMethods: Array<{
      type: 'mobile_money' | 'bank_transfer';
      details: Record<string, unknown>;
      isActive: boolean;
    }>;
  };
  // backward-compatible flat list
  bundles: PublicBundle[];
  // grouped providers -> packages -> bundles (optional; added for provider-first UI)
  providers?: Array<{
    code: string;
    name: string;
    logo?: { url?: string; alt?: string } | undefined;
    packages: Array<{
      _id?: string;
      name: string;
      category?: string;
      bundles: PublicBundle[];
    }>;
  }>;
}

export interface PublicOrderData {
  items: Array<{
    bundleId: string;
    quantity: number;
    customerPhone?: string;
  }>;
  customerInfo: {
    name: string;
    phone: string;
    email?: string; // optional
    ghanaCardNumber?: string; // AFA-specific
  };
  paymentMethod: {
    type: 'mobile_money' | 'bank_transfer';
    reference?: string;
    paymentProofUrl?: string;
  };
}

export interface PublicOrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
  status: string;
}

// Admin types
export interface AdminStorefrontData extends StorefrontData {
  agentId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    userType: string;
    walletBalance: number;
  };
}

export interface AdminStorefrontStats {
  totalStores: number;
  activeStores: number;
  pendingApproval: number;
  suspendedStores: number;
  totalStorefrontOrders: number;
  totalRevenue: number;
  totalProfit: number;
  autoApproveStorefronts: boolean;
}

/** Bundle toggle request item */
export interface BundleToggleItem {
  bundleId: string;
  isEnabled: boolean;
}

/** Pricing update request item (customPrice optional — omit to enable at tier price) */
export interface PricingUpdateItem {
  bundleId: string;
  customPrice?: number;
}

// =========================================================================
// Service
// =========================================================================

class StorefrontService {
  private basePath = '/api/storefront';

  // =========================================================================
  // Agent Storefront Management
  // =========================================================================

  /**
   * Get agent's storefront.
   * Returns the storefront even if admin-suspended (with suspension info).
   */
  async getMyStorefront(): Promise<StorefrontResponse | null> {
    try {
      const response = await apiClient.get(`${this.basePath}/agent/storefront`);
      return {
        data: response.data.data,
        suspended: response.data.suspended,
        suspensionMessage: response.data.suspensionMessage,
      };
    } catch (error: unknown) {
      if ((error as AxiosError)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createStorefront(data: Omit<StorefrontData, '_id' | 'agentId'>): Promise<{ data: StorefrontData; message: string }> {
    const response = await apiClient.post(`${this.basePath}/agent/storefront`, data);
    return { data: response.data.data, message: response.data.message };
  }

  async updateStorefront(data: Partial<StorefrontData>): Promise<StorefrontData> {
    const response = await apiClient.put(`${this.basePath}/agent/storefront`, data);
    return response.data.data;
  }

  /** Soft deactivate — agent can still see store, public can't */
  async deactivateStorefront(): Promise<{ message: string }> {
    const response = await apiClient.put(`${this.basePath}/agent/storefront/deactivate`);
    return { message: response.data.message };
  }

  /** Reactivate agent's own store (blocked if admin-suspended) */
  async reactivateStorefront(): Promise<StorefrontData> {
    const response = await apiClient.put(`${this.basePath}/agent/storefront/reactivate`);
    return response.data.data;
  }

  /** Graceful delete — checks for active orders first */
  async deleteStorefront(): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.basePath}/agent/storefront`);
    return { message: response.data.message };
  }

  /**
   * Create Paystack subaccount for the authenticated agent's storefront.
   * Returns the updated storefront object and the Paystack subaccount payload.
   * Backend validation: agent must have an active bank_transfer payment method with account details.
   */
  async createPaystackSubaccount(): Promise<{ storefront: StorefrontData; subaccount: any }> {
    const response = await apiClient.post(`${this.basePath}/agent/storefront/paystack/subaccount`);
    return response.data.data;
  }

  // =========================================================================
  // Bundle & Pricing Management
  // =========================================================================

  /** Get ALL admin-active bundles with pricing overlay (customPrice, markup, isEnabled) */
  async getAvailableBundles(): Promise<AgentBundle[]> {
    const response = await apiClient.get(`${this.basePath}/agent/storefront/bundles`);
    return response.data.data || [];
  }

  /** Toggle bundles enabled/disabled in agent's store */
  async toggleBundles(bundles: BundleToggleItem[]): Promise<{ enabled: number; disabled: number }> {
    const response = await apiClient.put(`${this.basePath}/agent/storefront/bundles/toggle`, { bundles });
    return response.data.data;
  }

  /** Get current pricing records for agent's storefront */
  async getMyPricing(): Promise<StorefrontPricing[]> {
    const response = await apiClient.get(`${this.basePath}/agent/storefront/pricing`);
    return response.data.data || [];
  }

  /**
   * Set pricing for bundles.
   * customPrice is optional — omit to enable bundle at tier price (hasCustomPrice: false).
   */
  async updatePricing(pricingUpdates: PricingUpdateItem[]): Promise<{ updated: number; created: number }> {
    const response = await apiClient.post(`${this.basePath}/agent/storefront/pricing`, {
      pricing: pricingUpdates
    });
    return response.data.data;
  }

  // =========================================================================
  // Order Management (Agent)
  // =========================================================================

  async getMyOrders(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    orders: StorefrontOrder[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, value.toString());
      });
    }
    
    const response = await apiClient.get(`${this.basePath}/agent/storefront/orders?${params}`);
    return response.data.data;
  }

  /**
   * Verify payment — deducts wallet and sets paymentStatus to 'paid'.
   * Order stays in 'pending' status and enters existing admin processing flow.
   */
  async verifyPayment(orderId: string, notes?: string): Promise<StorefrontOrder> {
    const response = await apiClient.put(`${this.basePath}/agent/storefront/orders/${orderId}/verify`, {
      notes
    });
    return response.data.data;
  }

  /** Reject order — refunds wallet if payment was already verified */
  async rejectPayment(orderId: string, reason: string): Promise<StorefrontOrder> {
    const response = await apiClient.put(`${this.basePath}/agent/storefront/orders/${orderId}/reject`, {
      reason
    });
    return response.data.data;
  }

  // =========================================================================
  // Analytics
  // =========================================================================

  async getAnalytics(dateRange?: { startDate?: string; endDate?: string }): Promise<StorefrontAnalytics> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    
    const response = await apiClient.get(`${this.basePath}/agent/storefront/analytics?${params}`);
    return response.data.data;
  }

  // =========================================================================
  // Public Storefront (Customer-facing)
  // =========================================================================

  async getPublicStorefront(businessName: string): Promise<PublicStorefront> {
    const response = await apiClient.get(`${this.basePath}/${businessName}`);
    return response.data.data;
  }

  async createPublicOrder(businessName: string, orderData: PublicOrderData): Promise<PublicOrderResult> {
    const response = await apiClient.post(`${this.basePath}/${businessName}/order`, orderData);
    return response.data.data;
  }

  // =========================================================================
  // Admin Operations
  // =========================================================================

  async getAdminStorefronts(filters?: {
    status?: 'active' | 'inactive' | 'pending' | 'approved' | 'suspended';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    storefronts: AdminStorefrontData[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, value.toString());
      });
    }
    
    const response = await apiClient.get(`${this.basePath}/admin/storefronts?${params}`);
    return response.data.data;
  }

  async getAdminStats(): Promise<AdminStorefrontStats> {
    const response = await apiClient.get(`${this.basePath}/admin/stats`);
    return response.data.data;
  }

  async approveStorefront(storefrontId: string): Promise<StorefrontData> {
    const response = await apiClient.put(`${this.basePath}/admin/storefronts/${storefrontId}/approve`);
    return response.data.data;
  }

  /** Suspend a storefront — blocks agent AND public access */
  async suspendStorefront(storefrontId: string, reason?: string): Promise<StorefrontData> {
    const response = await apiClient.put(`${this.basePath}/admin/storefronts/${storefrontId}/suspend`, {
      reason
    });
    return response.data.data;
  }

  /** Unsuspend — lifts admin ban, restores active status */
  async unsuspendStorefront(storefrontId: string): Promise<StorefrontData> {
    const response = await apiClient.put(`${this.basePath}/admin/storefronts/${storefrontId}/unsuspend`);
    return response.data.data;
  }

  /** Admin delete — graceful, checks active orders, notifies agent */
  async adminDeleteStorefront(storefrontId: string, reason?: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.basePath}/admin/storefronts/${storefrontId}`, {
      data: { reason }
    });
    return { message: response.data.message };
  }

  /** Toggle auto-approve for new storefronts */
  async toggleAutoApprove(enabled: boolean): Promise<{ autoApproveStorefronts: boolean }> {
    const response = await apiClient.put(`${this.basePath}/admin/settings/auto-approve`, { enabled });
    return response.data.data;
  }
}

export const storefrontService = new StorefrontService();
export default storefrontService;