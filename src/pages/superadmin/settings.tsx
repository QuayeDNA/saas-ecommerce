import React, { useEffect, useState, useCallback } from "react";
import { Edit, Key as KeyIcon, Eye, EyeOff, Smartphone, CreditCard, Camera } from "lucide-react";
import { Button } from "../../design-system/components/button";
import { Card } from "../../design-system/components/card";
import { Badge } from "../../design-system/components/badge";
import { Spinner, Tabs, TabsList, TabsTrigger, Switch } from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { useAuth, useProfilePhoto } from "../../hooks";
import { DarkModeToggle } from "../../components/common/dark-mode-toggle";
import { settingsService, type SiteSettings, type ApiSettings, type WalletSettings, type FeeSettings, type BryteLinksSettings, type MomoBridgeSettings, type SystemInfo } from "../../services/settings.service";
import pushNotificationService from "../../services/pushNotificationService";
import { SiteSettingsDialog, ApiSettingsDialog, WalletSettingsDialog, AdminPasswordDialog, MomoBridgeSettingsDialog } from "../../components/superadmin";
import { FeeSettingsDialog } from "../../components/superadmin/fee-settings-dialog";

export default function SuperAdminSettingsPage() {

  // combined settings object to minimize re-renders and network calls
  const [data, setData] = useState<{
    siteSettings: SiteSettings;
    apiSettings: ApiSettings;
    walletSettings: WalletSettings;
    bryteLinksSettings: BryteLinksSettings;
    momoBridgeSettings: MomoBridgeSettings;
    signupApproval: { requireApprovalForSignup: boolean };
    autoApproveStorefronts: { autoApproveStorefronts: boolean };
    systemInfo: SystemInfo;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  // dialogs
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [momoDialogOpen, setMomoDialogOpen] = useState(false);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(null);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const { upload: uploadPhoto, remove: removePhoto, isUploading: isUploadingPhoto, photoError } = useProfilePhoto();
  const { authState, refreshAuth } = useAuth();

  const hasUploadedPhoto = authState.user?.profilePicture && !authState.user.profilePicture.includes('/api/assets/avatar');

  // single load + client cache via settingsService.getAllSettings()
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const all = await settingsService.getAllSettings();
        if (!mounted) return;
        setData(all);
        if (all.feeSettings) setFeeSettings(all.feeSettings);
      } catch (err) {
        console.error("Failed to load settings:", err);
        if (mounted) addToast("Failed to load settings", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setBusy = useCallback((key: string, v: boolean) => setBusyKeys(prev => ({ ...prev, [key]: v })), []);

  // Optimistic toggle helpers — update local state first, then call API; revert on error
  const handleToggleSite = useCallback(async () => {
    if (!data) return;
    const prev = data.siteSettings.isSiteOpen;
    setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: !prev } } : d);
    setBusy("siteToggle", true);
    try {
      const res = await settingsService.toggleSiteStatus();
      setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: res.isSiteOpen } } : d);
      addToast(`Site ${res.isSiteOpen ? "opened" : "closed"} successfully`, "success");
    } catch {
      setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: prev } } : d);
      addToast("Failed to update site status", "error");
    } finally {
      setBusy("siteToggle", false);
    }
  }, [data, setBusy, addToast]);

  const handleToggleStorefronts = useCallback(async () => {
    if (!data) return;
    const prev = data.siteSettings.storefrontsOpen ?? true;
    setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, storefrontsOpen: !prev } } : d);
    setBusy("storefrontsToggle", true);
    try {
      const res = await settingsService.toggleStorefrontsAvailability();
      setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, storefrontsOpen: res.storefrontsOpen } } : d);
      addToast(`Storefronts ${res.storefrontsOpen ? "opened" : "closed"} successfully`, "success");
    } catch {
      setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, storefrontsOpen: prev } } : d);
      addToast("Failed to update storefront availability", "error");
    } finally {
      setBusy("storefrontsToggle", false);
    }
  }, [data, setBusy, addToast]);

  const handleToggleSignupApproval = useCallback(async () => {
    if (!data) return;
    const prev = data.signupApproval.requireApprovalForSignup;
    setData(d => d ? { ...d, signupApproval: { requireApprovalForSignup: !prev } } : d);
    setBusy("signupToggle", true);
    try {
      await settingsService.updateSignupApprovalSetting(!prev);
      addToast(`Signup approval ${!prev ? "required" : "disabled"}`, "success");
    } catch {
      setData(d => d ? { ...d, signupApproval: { requireApprovalForSignup: prev } } : d);
      addToast("Failed to update signup approval setting", "error");
    } finally {
      setBusy("signupToggle", false);
    }
  }, [data, setBusy, addToast]);

  const handleToggleAutoApprove = useCallback(async () => {
    if (!data) return;
    const prev = data.autoApproveStorefronts.autoApproveStorefronts;
    setData(d => d ? { ...d, autoApproveStorefronts: { autoApproveStorefronts: !prev } } : d);
    setBusy("autoApproveToggle", true);
    try {
      await settingsService.updateAutoApproveStorefronts(!prev);
      addToast(`Storefront auto-approval ${!prev ? "enabled" : "disabled"}`, "success");
    } catch {
      setData(d => d ? { ...d, autoApproveStorefronts: { autoApproveStorefronts: prev } } : d);
      addToast("Failed to update storefront auto-approval setting", "error");
    } finally {
      setBusy("autoApproveToggle", false);
    }
  }, [data, setBusy, addToast]);

  // BryteLinks — Payment Gate & Auto-Suspend handlers
  const handleTogglePaymentGate = useCallback(async () => {
    if (!data) return;
    const prev = data.bryteLinksSettings.requirePaymentForStorefrontCreation;
    setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, requirePaymentForStorefrontCreation: !prev } } : d);
    setBusy("paymentGateToggle", true);
    try {
      await settingsService.updateBryteLinksSettings({ requirePaymentForStorefrontCreation: !prev });
      addToast(`Storefront payment gate ${!prev ? "enabled" : "disabled"}`, "success");
    } catch {
      setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, requirePaymentForStorefrontCreation: prev } } : d);
      addToast("Failed to update payment gate setting", "error");
    } finally {
      setBusy("paymentGateToggle", false);
    }
  }, [data, setBusy, addToast]);

  const handleToggleAutoSuspend = useCallback(async () => {
    if (!data) return;
    const prev = data.bryteLinksSettings.autoSuspendInactiveStores;
    setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, autoSuspendInactiveStores: !prev } } : d);
    setBusy("autoSuspendToggle", true);
    try {
      await settingsService.updateBryteLinksSettings({ autoSuspendInactiveStores: !prev });
      addToast(`Auto-suspend inactive stores ${!prev ? "enabled" : "disabled"}`, "success");
    } catch {
      setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, autoSuspendInactiveStores: prev } } : d);
      addToast("Failed to update auto-suspend setting", "error");
    } finally {
      setBusy("autoSuspendToggle", false);
    }
  }, [data, setBusy, addToast]);

  const handleSaveCreationFee = useCallback(async () => {
    if (!data) return;
    const fee = data.bryteLinksSettings.storefrontCreationFee;
    setBusy("creationFeeSave", true);
    try {
      await settingsService.updateBryteLinksSettings({ storefrontCreationFee: fee });
      addToast("Creation fee saved", "success");
    } catch {
      addToast("Failed to save creation fee", "error");
    } finally {
      setBusy("creationFeeSave", false);
    }
  }, [data, setBusy, addToast]);

  const handleSaveInactivityThreshold = useCallback(async () => {
    if (!data) return;
    const days = data.bryteLinksSettings.inactivityThresholdDays;
    setBusy("inactivityDaysSave", true);
    try {
      await settingsService.updateBryteLinksSettings({ inactivityThresholdDays: days });
      addToast("Inactivity threshold saved", "success");
    } catch {
      addToast("Failed to save inactivity threshold", "error");
    } finally {
      setBusy("inactivityDaysSave", false);
    }
  }, [data, setBusy, addToast]);
  const handleSiteSettingsSuccess = useCallback((settings: SiteSettings) => {
    setData(d => d ? { ...d, siteSettings: settings } : d);
    addToast("Site settings updated", "success");
  }, [addToast]);

  const handleApiSettingsSuccess = useCallback((settings: ApiSettings) => {
    setData(d => d ? { ...d, apiSettings: settings } : d);
    addToast("API settings updated", "success");
  }, [addToast]);

  const handleFeeSettingsSuccess = useCallback((settings: FeeSettings) => {
    setFeeSettings(settings);
    setData(d => d ? { ...d, feeSettings: settings } : d);
    addToast('Fee settings updated', 'success');
  }, [addToast]);

  const handleMomoBridgeSettingsSuccess = useCallback((settings: MomoBridgeSettings) => {
    setData(d => d ? { ...d, momoBridgeSettings: settings } : d);
    addToast("MoMo Bridge settings updated", "success");
  }, [addToast]);

  const handleWalletSettingsSuccess = useCallback((settings: WalletSettings) => {
    setData(d => d ? { ...d, walletSettings: settings } : d);
    addToast("Wallet settings updated", "success");
  }, [addToast]);

  const handlePasswordChangeSuccess = useCallback(() => {
    addToast("Admin password changed successfully. Please log in again.", "success");
  }, [addToast]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadPhoto(file);
    if (result) {
      await refreshAuth();
      addToast("Profile photo updated", "success");
    } else {
      addToast(photoError || "Photo upload failed", "error");
    }
  };

  const handlePhotoRemove = async () => {
    const ok = await removePhoto();
    if (ok) {
      await refreshAuth();
      addToast("Profile photo removed", "success");
    } else {
      addToast(photoError || "Failed to remove photo", "error");
    }
  };

  const handleSendTestPush = useCallback(async () => {
    setTestPushLoading(true);
    try {
      const success = await pushNotificationService.sendTestNotification(
        "Test Notification",
        "This is a test push notification from Superadmin settings",
        "/"
      );
      if (success) {
        addToast("Test push notification sent. Check your browser notification tray.", "success");
      } else {
        addToast("Failed to send test push notification. See logs.", "error");
      }
    } catch (error) {
      console.error("Test push action error:", error);
      addToast("Unexpected error while sending test push notification.", "error");
    } finally {
      setTestPushLoading(false);
    }
  }, [addToast]);

  // derived values for compact templates
  const siteOpen = data?.siteSettings?.isSiteOpen ?? false;
  const storefrontsOpen = data?.siteSettings?.storefrontsOpen ?? true;
  const signupRequired = data?.signupApproval?.requireApprovalForSignup ?? false;
  const autoApprove = data?.autoApproveStorefronts?.autoApproveStorefronts ?? false;
  const paymentGate = data?.bryteLinksSettings?.requirePaymentForStorefrontCreation ?? false;
  const creationFee = data?.bryteLinksSettings?.storefrontCreationFee ?? 50;
  const autoSuspend = data?.bryteLinksSettings?.autoSuspendInactiveStores ?? false;
  const inactivityDays = data?.bryteLinksSettings?.inactivityThresholdDays ?? 14;

  // compact responsive layout pieces
  const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  // Reveal state for sensitive keys shown in the API tab (display only)
  const [revealKeys, setRevealKeys] = useState<Record<string, boolean>>({
    telecel: false,
    airtelTigo: false,
    paystackTestPublic: false,
    paystackTestSecret: false,
    paystackLivePublic: false,
    paystackLiveSecret: false,
  });
  const toggleRevealKey = (k: string) => setRevealKeys(p => ({ ...p, [k]: !p[k] }));
  const formatMasked = (val?: string) => {
    if (!val) return 'Not configured';
    if (val.length <= 10) return '••••••••';
    return `${val.slice(0, 6)}…${val.slice(-4)}`;
  };

  // Tab state (lazy-render each section when selected)
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'finance' | 'system'>('general');
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ general: true });
  const handleTabChange = (value: string) => {
    if (value === 'general' || value === 'api' || value === 'finance' || value === 'system') {
      setActiveTab(value);
      setVisitedTabs(prev => ({ ...prev, [value]: true }));
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[240px] flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>System Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage site, API and wallet configuration</p>
        </div>
      </div>

      {/* Tabs (mobile-first) */}
      <div className="">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full overflow-auto">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4">
          {/* render only active or visited tabs (lazy) */}

          {(activeTab === 'general' || visitedTabs.general) && (
            <div className={`space-y-6 ${activeTab === 'general' ? '' : 'hidden'}`}>
              <Card>
                <SectionHeader title="Site Management" subtitle="Control availability and maintenance message" action={<Button size="sm" variant="secondary" onClick={() => setSiteDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />

                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Site status</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{siteOpen ? 'Open to users' : 'Closed for maintenance'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: siteOpen ? 'var(--success)' : 'var(--error)' }}>{siteOpen ? 'Open' : 'Closed'}</span>
                      <Switch checked={siteOpen} onCheckedChange={handleToggleSite} isDisabled={!!busyKeys['siteToggle']} />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Maintenance message</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.siteSettings.customMessage || 'No custom message set'}</div>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dashboard greeting</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.siteSettings.greetingText || 'Default time-based greeting'}</div>
                  </div>

                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Welcome message</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.siteSettings.welcomeMessage || 'Welcome back!'}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Icon enabled: {data.siteSettings.showGreetingIcon ? 'Yes' : 'No'}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Storefront availability</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {storefrontsOpen
                          ? 'All storefronts are open to customers'
                          : 'All storefronts are closed by admin'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: storefrontsOpen ? 'var(--success)' : 'var(--error)' }}>
                        {storefrontsOpen ? 'Open' : 'Closed'}
                      </span>
                      <Switch checked={storefrontsOpen} onCheckedChange={handleToggleStorefronts} isDisabled={!!busyKeys['storefrontsToggle']} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Require admin approval for signups</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{signupRequired ? 'Approval required' : 'Auto-approve new users'}</div>
                    </div>
                    <Switch checked={signupRequired} onCheckedChange={handleToggleSignupApproval} isDisabled={!!busyKeys['signupToggle']} />
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Auto-approve storefronts</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{autoApprove ? 'Auto' : 'Manual'}</div>
                    </div>
                    <Switch checked={autoApprove} onCheckedChange={handleToggleAutoApprove} isDisabled={!!busyKeys['autoApproveToggle']} />
                  </div>
                </div>
              </Card>

              {/* BryteLinks — Storefront Payment Gate & Auto-Suspend */}
              <Card>
                <SectionHeader title="Storefront Policies" subtitle="Payment gate and inactivity auto-suspension" />
                <div className="mt-4 space-y-4">
                  {/* Payment Gate Toggle */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Require payment for storefront creation</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {paymentGate ? `Agents must pay GH₵${creationFee} before creating a store` : 'No payment required'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: paymentGate ? 'var(--success)' : 'var(--text-secondary)' }}>{paymentGate ? 'On' : 'Off'}</span>
                      <Switch checked={paymentGate} onCheckedChange={handleTogglePaymentGate} isDisabled={!!busyKeys['paymentGateToggle']} />
                    </div>
                  </div>

                  {/* Creation Fee Input */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Storefront creation fee (GH₵)</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Amount deducted from agent wallet on creation</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={creationFee}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, storefrontCreationFee: val } } : d);
                        }}
                        className="w-24 px-3 py-1.5 text-sm rounded-lg border text-right"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        disabled={!!busyKeys['creationFeeSave']}
                      />
                      <Button size="sm" variant="secondary" onClick={handleSaveCreationFee} isLoading={!!busyKeys['creationFeeSave']}>Save</Button>
                    </div>
                  </div>

                  {/* Auto-Suspend Toggle */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Auto-suspend inactive stores</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {autoSuspend ? `Suspends stores with no activity for ${inactivityDays} days` : 'Disabled'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: autoSuspend ? 'var(--success)' : 'var(--text-secondary)' }}>{autoSuspend ? 'On' : 'Off'}</span>
                      <Switch checked={autoSuspend} onCheckedChange={handleToggleAutoSuspend} isDisabled={!!busyKeys['autoSuspendToggle']} />
                    </div>
                  </div>

                  {/* Inactivity Threshold Input */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Inactivity threshold (days)</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Number of days without activity before auto-suspension</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={inactivityDays}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10) || 14;
                          setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, inactivityThresholdDays: val } } : d);
                        }}
                        className="w-24 px-3 py-1.5 text-sm rounded-lg border text-right"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        disabled={!!busyKeys['inactivityDaysSave']}
                      />
                      <Button size="sm" variant="secondary" onClick={handleSaveInactivityThreshold} isLoading={!!busyKeys['inactivityDaysSave']}>Save</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="User Management" subtitle="Admin & security settings" action={<Button size="sm" variant="secondary" onClick={() => setPasswordDialogOpen(true)}><KeyIcon className="w-3 h-3 mr-1" />Change Password</Button>} />

                {/* Profile picture */}
                <div className="mt-4 flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0 overflow-hidden relative group" style={!authState.user?.profilePicture ? { background: "var(--gradient-primary)" } : undefined}>
                    {authState.user?.profilePicture ? (
                      <img src={authState.user.profilePicture} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>
                        {authState.user?.fullName?.charAt(0)?.toUpperCase() ?? "A"}
                        {authState.user?.fullName?.split(" ")[1]?.charAt(0)?.toUpperCase() ?? ""}
                      </span>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                      {isUploadingPhoto ? (
                        <span className="text-xs text-white font-medium">...</span>
                      ) : (
                        <Camera className="h-5 w-5 text-white" />
                      )}
                    </label>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {authState.user?.fullName ?? "Admin"}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {authState.user?.email ?? ""}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                      {isUploadingPhoto ? "Uploading…" : "Hover avatar to change photo"}
                    </p>
                    {hasUploadedPhoto && !isUploadingPhoto && (
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        className="text-xs underline mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
                  <div className="text-sm font-medium" style={{ color: 'var(--success)' }}>Admin account security</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--success)' }}>Change your admin password regularly. You'll be required to log in again after changing it.</div>
                </div>
              </Card>
            </div>
          )}

          {(activeTab === 'api' || visitedTabs.api) && (
            <div className={`space-y-6 ${activeTab === 'api' ? '' : 'hidden'}`}>
              <Card>
                <SectionHeader title="API Settings" subtitle="External integrations & keys" action={<Button size="sm" variant="secondary" onClick={() => setApiDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 8%, transparent)' }}>
                    <div className="text-sm font-medium" style={{ color: 'var(--warning)' }}>API Endpoint</div>
                    <div className="text-xs font-mono mt-1" style={{ color: 'var(--warning)' }}>{data.apiSettings.apiEndpoint || 'Not configured'}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Telecel key (masked, reveal) */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />Telecel API Key</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto" style={{ color: 'var(--text-primary)' }}>{revealKeys.telecel ? (data.apiSettings.telecelApiKey || 'Not configured') : formatMasked(data.apiSettings.telecelApiKey)}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" leftIcon={revealKeys.telecel ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('telecel')}>{revealKeys.telecel ? 'Hide' : 'Reveal'}</Button>
                          <Badge colorScheme={data.apiSettings.telecelApiKey ? 'success' : 'error'}>{data.apiSettings.telecelApiKey ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* AirtelTigo key (masked, reveal) */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                      <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4" style={{ color: 'var(--error)' }} />AirtelTigo API Key</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto" style={{ color: 'var(--text-primary)' }}>{revealKeys.airtelTigo ? (data.apiSettings.airtelTigoApiKey || 'Not configured') : formatMasked(data.apiSettings.airtelTigoApiKey)}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" leftIcon={revealKeys.airtelTigo ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('airtelTigo')}>{revealKeys.airtelTigo ? 'Hide' : 'Reveal'}</Button>
                          <Badge colorScheme={data.apiSettings.airtelTigoApiKey ? 'success' : 'error'}>{data.apiSettings.airtelTigoApiKey ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Paystack block (show enabled + public/secret keys) */}
                    <div className="p-3 rounded-lg col-span-full sm:col-span-2" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />Paystack</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Payment gateway configuration (test & live keys)</div>
                        </div>
                        <Badge colorScheme={data.apiSettings.paystackEnabled ? 'success' : 'warning'}>{data.apiSettings.paystackEnabled ? 'Enabled' : 'Disabled'}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {import.meta.env.DEV && (
                          <>
                            <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Test public key</div>
                              <div className="mt-1 flex items-center justify-between gap-3">
                                <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackTestPublic ? (data.apiSettings.paystackTestPublicKey || 'Not configured') : formatMasked(data.apiSettings.paystackTestPublicKey)}</div>
                                <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackTestPublic ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackTestPublic')}>{revealKeys.paystackTestPublic ? 'Hide' : 'Reveal'}</Button>
                              </div>
                            </div>

                            <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Test secret key</div>
                              <div className="mt-1 flex items-center justify-between gap-3">
                                {data.apiSettings.paystackTestSecretKey !== undefined ? (
                                  // dev: secret value returned — allow reveal
                                  <>
                                    <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackTestSecret ? (data.apiSettings.paystackTestSecretKey || 'Not configured') : formatMasked(data.apiSettings.paystackTestSecretKey)}</div>
                                    <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackTestSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackTestSecret')}>{revealKeys.paystackTestSecret ? 'Hide' : 'Reveal'}</Button>
                                  </>
                                ) : (
                                  // prod: secret redacted — show existence and let admin open dialog to replace
                                  <>
                                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{data.apiSettings.paystackTestSecretExists ? 'Stored on server' : 'Not configured'}</div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="ghost" leftIcon={<KeyIcon className="w-3 h-3" />} onClick={() => setApiDialogOpen(true)}>{data.apiSettings.paystackTestSecretExists ? 'Replace' : 'Set'}</Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live public key</div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackLivePublic ? (data.apiSettings.paystackLivePublicKey || 'Not configured') : formatMasked(data.apiSettings.paystackLivePublicKey)}</div>
                            <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackLivePublic ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackLivePublic')}>{revealKeys.paystackLivePublic ? 'Hide' : 'Reveal'}</Button>
                          </div>
                        </div>

                        <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live secret key</div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            {import.meta.env.DEV && data.apiSettings.paystackLiveSecretKey !== undefined ? (
                              // dev: secret value returned — allow reveal
                              <>
                                <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackLiveSecret ? (data.apiSettings.paystackLiveSecretKey || 'Not configured') : formatMasked(data.apiSettings.paystackLiveSecretKey)}</div>
                                <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackLiveSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackLiveSecret')}>{revealKeys.paystackLiveSecret ? 'Hide' : 'Reveal'}</Button>
                              </>
                            ) : (
                              // prod: secret redacted — show existence and let admin open dialog to replace
                              <>
                                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{data.apiSettings.paystackLiveSecretExists ? 'Stored on server' : 'Not configured'}</div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => setApiDialogOpen(true)}>{data.apiSettings.paystackLiveSecretExists ? 'Replace' : 'Set'}</Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {(activeTab === 'finance' || visitedTabs.finance) && (
            <div className={`space-y-6 ${activeTab === 'finance' ? '' : 'hidden'}`}>
              <Card>
                <SectionHeader title="Wallet Settings" subtitle="Top-up limits & behaviour" action={<Button size="sm" variant="secondary" onClick={() => setWalletDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Agent Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.agent}</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Super Agent Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.super_agent}</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Dealer Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.dealer}</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Super Dealer Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.super_dealer}</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between col-span-full sm:col-span-1" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Default Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.default}</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between col-span-full sm:col-span-2" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Paystack Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.paystackMinimumTopUpAmount ?? 0}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader
                  title="MoMo Bridge"
                  subtitle="Mobile money wallet top-up via MoMo Bridge"
                  action={<Button size="sm" variant="secondary" onClick={() => setMomoDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
                />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status</div>
                    <Badge colorScheme={data.momoBridgeSettings.momoBridgeEnabled ? 'success' : 'error'}>
                      {data.momoBridgeSettings.momoBridgeEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Key</div>
                    <div className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                      {data.momoBridgeSettings.momoBridgeApiKey
                        ? `${data.momoBridgeSettings.momoBridgeApiKey.slice(0, 6)}…${data.momoBridgeSettings.momoBridgeApiKey.slice(-4)}`
                        : <span style={{ color: 'var(--text-muted)' }}>Not configured</span>}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Relay URL</div>
                    <div className="text-sm font-mono truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>
                      {data.momoBridgeSettings.momoBridgeRelayUrl || 'Default'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Platform Fee</div>
                    <div className="font-medium">{data.momoBridgeSettings.momoBridgeClaimFeePercent}%</div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Storefront Collection Fees" subtitle="Fees applied to agent storefront payments via Paystack" action={<Button size="sm" variant="secondary" onClick={() => setFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Paystack Fee</div>
                    <div className="font-medium">{feeSettings?.paystackCollectionFeePercent ?? 1.95}%</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Platform Fee</div>
                    <div className="font-medium">{feeSettings?.platformFeePercent ?? 0}%</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fee Bearer</div>
                    <div className="font-medium">{(feeSettings?.delegateFeesToCustomer ?? true) ? 'Customer' : 'Platform'}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Wallet Top-Up Fees" subtitle="Fees applied when agents top up their wallet via Paystack" action={<Button size="sm" variant="secondary" onClick={() => setFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Paystack Fee</div>
                    <div className="font-medium">{feeSettings?.walletTopUpCollectionFeePercent ?? 1.95}%</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Platform Fee</div>
                    <div className="font-medium">{feeSettings?.walletTopUpPlatformFeePercent ?? 0}%</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fee Bearer</div>
                    <div className="font-medium">{(feeSettings?.walletTopUpDelegateFeesToCustomer ?? true) ? 'Agent' : 'Platform'}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Payout Transfer Fees" subtitle="Paystack transfer costs & payout configuration" action={<Button size="sm" variant="secondary" onClick={() => setFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bank Transfer Fee</div>
                    <div className="font-medium">GH₵{(feeSettings?.paystackTransferFees?.bank_account ?? 8.0).toFixed(2)}</div>
                  </div>
                  <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fee Bearer</div>
                    <div className="font-medium capitalize">{feeSettings?.payoutFeeBearer ?? 'agent'}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Referral Commission Rate" subtitle="Percentage of order value credited to referring agents" action={<Button size="sm" variant="secondary" onClick={() => setFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 8%, transparent)' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--warning)' }}>Current rate</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--warning)' }}>Configurable via Fee Settings dialog</div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--warning)' }}>{feeSettings?.commissionRatePercent ?? 5}%</div>
                    <div className="text-xs" style={{ color: 'var(--warning)' }}>GH₵ {((feeSettings?.commissionRatePercent ?? 5) * 100 / 100).toFixed(2)} per GH₵ 100 order</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {(activeTab === 'system' || visitedTabs.system) && (
            <div className={`space-y-6 ${activeTab === 'system' ? '' : 'hidden'}`}>
              <Card>
                <SectionHeader title="System Information" subtitle="Health & metadata" />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Version</div>
                    <div className="font-medium mt-1">{data.systemInfo.version}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last updated</div>
                    <div className="font-medium mt-1">{data.systemInfo.lastUpdated}</div>
                  </div>

                  <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Status</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.systemInfo.apiStatus}</div>
                    </div>
                    <Badge colorScheme={data.systemInfo.apiStatus === 'healthy' ? 'success' : 'warning'}>{data.systemInfo.apiStatus}</Badge>
                  </div>

                  <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>DB Status</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{data.systemInfo.databaseStatus}</div>
                    </div>
                    <Badge colorScheme={data.systemInfo.databaseStatus === 'connected' ? 'success' : 'warning'}>{data.systemInfo.databaseStatus}</Badge>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendTestPush}
                    isLoading={testPushLoading}
                  >
                    Send Test Push Notification
                  </Button>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Appearance" subtitle="Toggle dark mode" />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Switch between light and dark theme</p>
                  </div>
                  <DarkModeToggle />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Dialogs (receive props from cached `data` to avoid re-fetch) */}
        <SiteSettingsDialog isOpen={siteDialogOpen} onClose={() => setSiteDialogOpen(false)} currentSettings={data.siteSettings} onSuccess={handleSiteSettingsSuccess} />

        <ApiSettingsDialog isOpen={apiDialogOpen} onClose={() => setApiDialogOpen(false)} currentSettings={data.apiSettings} onSuccess={handleApiSettingsSuccess} />

        <WalletSettingsDialog isOpen={walletDialogOpen} onClose={() => setWalletDialogOpen(false)} currentSettings={data.walletSettings} onSuccess={handleWalletSettingsSuccess} />

        <FeeSettingsDialog isOpen={feeDialogOpen} onClose={() => setFeeDialogOpen(false)} currentSettings={feeSettings} onSuccess={handleFeeSettingsSuccess} />

        <MomoBridgeSettingsDialog isOpen={momoDialogOpen} onClose={() => setMomoDialogOpen(false)} currentSettings={data.momoBridgeSettings} onSuccess={handleMomoBridgeSettingsSuccess} />

        <AdminPasswordDialog isOpen={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} onSuccess={handlePasswordChangeSuccess} />
      </div>
    </div>
  );
}
