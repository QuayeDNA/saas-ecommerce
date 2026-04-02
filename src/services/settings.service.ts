import { apiClient, publicApiClient } from "../utils/api-client";

// =============================================================================
// TYPES
// =============================================================================

export interface SiteSettings {
  isSiteOpen: boolean;
  customMessage: string;
  storefrontsOpen?: boolean;
  storefrontsClosedMessage?: string;
}

export interface CommissionRates {
  agentCommission: number;
  superAgentCommission: number;
  dealerCommission: number;
  superDealerCommission: number;
  defaultCommissionRate: number;
  customerCommission: number;
}

export interface ApiSettings {
  mtnApiKey: string;
  telecelApiKey: string;
  airtelTigoApiKey: string;
  apiEndpoint: string;
  // Paystack
  paystackEnabled?: boolean;
  paystackWalletTopUpEnabled?: boolean;
  paystackStorefrontEnabled?: boolean;
  paystackTestPublicKey?: string;
  paystackTestSecretKey?: string; // returned only in non-production builds
  paystackLivePublicKey?: string;
  paystackLiveSecretKey?: string; // returned only in non-production builds

  // Flags indicating whether a secret exists on the server (safe to expose)
  paystackTestSecretExists?: boolean;
  paystackLiveSecretExists?: boolean;
}

export interface SystemInfo {
  version: string;
  lastUpdated: string;
  databaseStatus: string;
  apiStatus: string;
  cacheStatus: string;
  sslStatus: string;
}

export interface WalletSettings {
  minimumTopUpAmounts: {
    agent: number;
    super_agent: number;
    dealer: number;
    super_dealer: number;
    default: number;
  };
  /** Global minimum applied specifically to Paystack instant top-ups */
  paystackMinimumTopUpAmount: number;
}

export interface FeeSettings {
  /** Storefront payment collection fees */
  paystackCollectionFeePercent: number;
  platformFeePercent: number;
  delegateFeesToCustomer: boolean;
  /** Wallet top-up collection fees (separate from storefront) */
  walletTopUpCollectionFeePercent: number;
  walletTopUpPlatformFeePercent: number;
  walletTopUpDelegateFeesToCustomer: boolean;
  paystackTransferFees: {
    mobile_money: number;
    bank_account: number;
  };
  payoutFeeBearer: 'platform' | 'agent';
  /** Platform's own percentage cut deducted from each payout amount */
  platformPayoutFeePercent: number;
  /** Whether agents can withdraw directly via Paystack without admin approval */
  autoPayoutEnabled: boolean;
  /** Minimum amounts agents must request per destination type */
  minimumPayoutAmounts: {
    mobile_money: number;
    bank_account: number;
  };
}

export interface PasswordResetRequest {
  userId: string;
  newPassword: string;
}

export interface RoleChangeRequest {
  userId: string;
  newRole:
    | "agent"
    | "super_agent"
    | "dealer"
    | "super_dealer"
    | "admin"
    | "super_admin";
}

// =============================================================================
// SETTINGS SERVICE
// =============================================================================

class SettingsService {
  // short-lived in-memory cache for combined settings to avoid repeated requests
  private _allSettingsCache: { ts: number; data: any } | null = null;

  // Site Management
  async getSiteSettings(): Promise<SiteSettings> {
    const response = await apiClient.get("/api/settings/site");
    return response.data;
  }

  async updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
    const response = await apiClient.put("/api/settings/site", settings);
    // invalidate cache so subsequent `getAllSettings` returns fresh data
    this._allSettingsCache = null;
    return response.data;
  }

  async toggleSiteStatus(): Promise<{ isSiteOpen: boolean }> {
    const response = await apiClient.post("/api/settings/site/toggle");
    this._allSettingsCache = null;
    return response.data;
  }

  async toggleStorefrontsAvailability(): Promise<{ storefrontsOpen: boolean }> {
    const response = await apiClient.post("/api/settings/storefronts/toggle");
    this._allSettingsCache = null;
    return response.data;
  }

  async getSignupApprovalSetting(): Promise<{ requireApprovalForSignup: boolean }> {
    const response = await publicApiClient.get("/api/settings/signup-approval");
    return response.data;
  }

  async updateSignupApprovalSetting(requireApproval: boolean): Promise<{ requireApprovalForSignup: boolean }> {
    const response = await apiClient.put("/api/settings/signup-approval", { requireApprovalForSignup: requireApproval });
    this._allSettingsCache = null;
    return response.data;
  }

  async getAutoApproveStorefronts(): Promise<{ autoApproveStorefronts: boolean }> {
    const response = await apiClient.get("/api/settings/storefront-auto-approve");
    return response.data;
  }

  async updateAutoApproveStorefronts(autoApprove: boolean): Promise<{ autoApproveStorefronts: boolean }> {
    const response = await apiClient.put("/api/settings/storefront-auto-approve", { autoApproveStorefronts: autoApprove });
    this._allSettingsCache = null;
    return response.data;
  }

  // Get site status (public endpoint)
  async getSiteStatus(): Promise<{
    isSiteOpen: boolean;
    customMessage: string;
    storefrontsOpen?: boolean;
    storefrontsClosedMessage?: string;
  }> {
    const response = await publicApiClient.get("/api/settings/site/status");
    return response.data;
  }

  // Commission Rates
  async getCommissionRates(): Promise<CommissionRates> {
    const response = await apiClient.get("/api/commissions/settings");
    return response.data.data;
  }

  async updateCommissionRates(
    rates: CommissionRates
  ): Promise<CommissionRates> {
    const response = await apiClient.put("/api/commissions/settings", rates);
    return response.data.data;
  }

  // API Settings
  async getApiSettings(): Promise<ApiSettings> {
    const response = await apiClient.get("/api/settings/api");
    return response.data;
  }

  async updateApiSettings(settings: ApiSettings): Promise<ApiSettings> {
    const response = await apiClient.put("/api/settings/api", settings);
    this._allSettingsCache = null;
    return response.data;
  }

  // User Management
  async resetUserPassword(
    request: PasswordResetRequest
  ): Promise<{ message: string }> {
    const response = await apiClient.post(
      "/api/settings/users/reset-password",
      request
    );
    return response.data;
  }

  async changeUserRole(
    request: RoleChangeRequest
  ): Promise<{ message: string }> {
    const response = await apiClient.post(
      "/api/settings/users/change-role",
      request
    );
    return response.data;
  }

  // System Information
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await apiClient.get("/api/settings/system");
    return response.data;
  }

  // Admin Password Change
  async changeAdminPassword(request: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post(
      "/api/settings/admin/change-password",
      request
    );
    return response.data;
  }

  // Wallet Settings
  async getWalletSettings(): Promise<WalletSettings> {
    const response = await apiClient.get("/api/settings/wallet");
    // backend may omit the paystackMinimumTopUpAmount when missing
    const data: WalletSettings = response.data;
    if (data.paystackMinimumTopUpAmount === undefined) {
      data.paystackMinimumTopUpAmount = 0;
    }
    return data;
  }

  async updateWalletSettings(
    settings: WalletSettings
  ): Promise<WalletSettings> {
    const response = await apiClient.put("/api/settings/wallet", settings);
    this._allSettingsCache = null;
    const data: WalletSettings = response.data;
    if (data.paystackMinimumTopUpAmount === undefined) {
      data.paystackMinimumTopUpAmount = 0;
    }
    return data;
  }

  // Fee Settings (Paystack collection fees, platform fees, payout fees)
  async getFeeSettings(): Promise<FeeSettings> {
    const response = await apiClient.get("/api/settings/fees");
    return response.data.data ?? response.data;
  }

  async updateFeeSettings(settings: Partial<FeeSettings>): Promise<FeeSettings> {
    const response = await apiClient.put("/api/settings/fees", settings);
    this._allSettingsCache = null;
    return response.data.data ?? response.data;
  }

  /**
   * Combined fetch used by the Settings page — cached client‑side for a short TTL
   * reduces duplicate network calls when the page remounts or dialogs re-open.
   */
  async getAllSettings(force = false): Promise<{
    siteSettings: SiteSettings;
    apiSettings: ApiSettings;
    walletSettings: WalletSettings;
    feeSettings: FeeSettings;
    signupApproval: { requireApprovalForSignup: boolean };
    autoApproveStorefronts: { autoApproveStorefronts: boolean };
    systemInfo: SystemInfo;
  }> {
    const TTL = 30_000; // 30s
    if (!force && this._allSettingsCache && (Date.now() - this._allSettingsCache.ts) < TTL) {
      return this._allSettingsCache.data;
    }

    const [siteSettings, apiSettings, walletSettings, feeSettings, signupApproval, autoApproveStorefronts, systemInfo] = await Promise.all([
      this.getSiteSettings(),
      this.getApiSettings(),
      this.getWalletSettings(),
      this.getFeeSettings(),
      this.getSignupApprovalSetting(),
      this.getAutoApproveStorefronts(),
      this.getSystemInfo(),
    ]);

    const combined = { siteSettings, apiSettings, walletSettings, feeSettings, signupApproval, autoApproveStorefronts, systemInfo };
    this._allSettingsCache = { ts: Date.now(), data: combined };
    return combined;
  }
}

export const settingsService = new SettingsService();
