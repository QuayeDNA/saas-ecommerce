import React, { useEffect, useState, useCallback } from "react";
import { Camera } from "lucide-react";
import { Card } from "../../../design-system/components/card";
import { Spinner, Tabs, TabsList, TabsTrigger } from "../../../design-system";
import { useToast } from "../../../design-system/components/toast";
import { useAuth, useProfilePhoto } from "../../../hooks";
import { settingsService, type SiteSettings, type ApiSettings, type WalletSettings, type FeeSettings, type BryteLinksSettings, type MomoBridgeSettings, type MtnRestrictionSettings, type SystemInfo } from "../../../services/settings.service";
import pushNotificationService from "../../../services/pushNotificationService";
import { SiteSettingsDialog, ApiSettingsDialog, WalletSettingsDialog, AdminPasswordDialog, MomoBridgeSettingsDialog } from "../../../components/superadmin";
import { FeeSettingsDialog } from "../../../components/superadmin/fee-settings-dialog";
import { GeneralTab } from "./general-tab";
import { ApiTab } from "./api-tab";
import { FinanceTab } from "./finance-tab";
import { SystemTab } from "./system-tab";

interface PageData {
  siteSettings: SiteSettings;
  apiSettings: ApiSettings;
  walletSettings: WalletSettings;
  bryteLinksSettings: BryteLinksSettings;
  momoBridgeSettings: MomoBridgeSettings;
  mtnRestriction: MtnRestrictionSettings;
  signupApproval: { requireApprovalForSignup: boolean };
  autoApproveStorefronts: { autoApproveStorefronts: boolean };
  systemInfo: SystemInfo;
}

export default function SuperAdminSettingsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});
  const { addToast } = useToast();

  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [momoDialogOpen, setMomoDialogOpen] = useState(false);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(null);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [mtnNumbersCount, setMtnNumbersCount] = useState<number | null>(null);
  const { upload: uploadPhoto, remove: removePhoto, isUploading: isUploadingPhoto, photoError } = useProfilePhoto();
  const { authState, refreshAuth } = useAuth();

  const hasUploadedPhoto = authState.user?.profilePicture && !authState.user.profilePicture.includes('/api/assets/avatar');

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

      try {
        const stats = await settingsService.getMtnNumberStats();
        if (mounted) setMtnNumbersCount(stats.totalKnownNumbers);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const setBusy = useCallback((key: string, v: boolean) => setBusyKeys(prev => ({ ...prev, [key]: v })), []);

  const handleToggleSite = useCallback(() => {
    if (!data) return;
    const prev = data.siteSettings.isSiteOpen;
    setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: !prev } } : d);
    setBusy("siteToggle", true);
    settingsService.toggleSiteStatus()
      .then(res => {
        setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: res.isSiteOpen } } : d);
        addToast(`Site ${res.isSiteOpen ? "opened" : "closed"} successfully`, "success");
      })
      .catch(() => {
        setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: prev } } : d);
        addToast("Failed to update site status", "error");
      })
      .finally(() => setBusy("siteToggle", false));
  }, [data, setBusy, addToast]);

  const handleToggleStorefronts = useCallback(() => {
    if (!data) return;
    const prev = data.siteSettings.storefrontsOpen ?? true;
    setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, storefrontsOpen: !prev } } : d);
    setBusy("storefrontsToggle", true);
    settingsService.toggleStorefrontsAvailability()
      .then(res => {
        setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, storefrontsOpen: res.storefrontsOpen } } : d);
        addToast(`Storefronts ${res.storefrontsOpen ? "opened" : "closed"} successfully`, "success");
      })
      .catch(() => {
        setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, storefrontsOpen: prev } } : d);
        addToast("Failed to update storefront availability", "error");
      })
      .finally(() => setBusy("storefrontsToggle", false));
  }, [data, setBusy, addToast]);

  const handleToggleSignupApproval = useCallback(() => {
    if (!data) return;
    const prev = data.signupApproval.requireApprovalForSignup;
    setData(d => d ? { ...d, signupApproval: { requireApprovalForSignup: !prev } } : d);
    setBusy("signupToggle", true);
    settingsService.updateSignupApprovalSetting(!prev)
      .then(() => addToast(`Signup approval ${!prev ? "required" : "disabled"}`, "success"))
      .catch(() => {
        setData(d => d ? { ...d, signupApproval: { requireApprovalForSignup: prev } } : d);
        addToast("Failed to update signup approval setting", "error");
      })
      .finally(() => setBusy("signupToggle", false));
  }, [data, setBusy, addToast]);

  const handleToggleAutoApprove = useCallback(() => {
    if (!data) return;
    const prev = data.autoApproveStorefronts.autoApproveStorefronts;
    setData(d => d ? { ...d, autoApproveStorefronts: { autoApproveStorefronts: !prev } } : d);
    setBusy("autoApproveToggle", true);
    settingsService.updateAutoApproveStorefronts(!prev)
      .then(() => addToast(`Storefront auto-approval ${!prev ? "enabled" : "disabled"}`, "success"))
      .catch(() => {
        setData(d => d ? { ...d, autoApproveStorefronts: { autoApproveStorefronts: prev } } : d);
        addToast("Failed to update storefront auto-approval setting", "error");
      })
      .finally(() => setBusy("autoApproveToggle", false));
  }, [data, setBusy, addToast]);

  const handleTogglePaymentGate = useCallback(() => {
    if (!data) return;
    const prev = data.bryteLinksSettings.requirePaymentForStorefrontCreation;
    setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, requirePaymentForStorefrontCreation: !prev } } : d);
    setBusy("paymentGateToggle", true);
    settingsService.updateBryteLinksSettings({ requirePaymentForStorefrontCreation: !prev })
      .then(() => addToast(`Storefront payment gate ${!prev ? "enabled" : "disabled"}`, "success"))
      .catch(() => {
        setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, requirePaymentForStorefrontCreation: prev } } : d);
        addToast("Failed to update payment gate setting", "error");
      })
      .finally(() => setBusy("paymentGateToggle", false));
  }, [data, setBusy, addToast]);

  const handleToggleAutoSuspend = useCallback(() => {
    if (!data) return;
    const prev = data.bryteLinksSettings.autoSuspendInactiveStores;
    setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, autoSuspendInactiveStores: !prev } } : d);
    setBusy("autoSuspendToggle", true);
    settingsService.updateBryteLinksSettings({ autoSuspendInactiveStores: !prev })
      .then(() => addToast(`Auto-suspend inactive stores ${!prev ? "enabled" : "disabled"}`, "success"))
      .catch(() => {
        setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, autoSuspendInactiveStores: prev } } : d);
        addToast("Failed to update auto-suspend setting", "error");
      })
      .finally(() => setBusy("autoSuspendToggle", false));
  }, [data, setBusy, addToast]);

  const handleToggleMtnRestriction = useCallback(() => {
    if (!data) return;
    const prev = data.mtnRestriction.mtnOrderRestrictionEnabled;
    setData(d => d ? { ...d, mtnRestriction: { mtnOrderRestrictionEnabled: !prev } } : d);
    setBusy("mtnRestriction", true);
    settingsService.updateMtnRestriction({ mtnOrderRestrictionEnabled: !prev })
      .then(() => addToast(`MTN order restriction ${!prev ? "enabled" : "disabled"}`, "success"))
      .catch(() => {
        setData(d => d ? { ...d, mtnRestriction: { mtnOrderRestrictionEnabled: prev } } : d);
        addToast("Failed to update MTN restriction", "error");
      })
      .finally(() => setBusy("mtnRestriction", false));
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

  const updateBryteLinks = useCallback((patch: Partial<BryteLinksSettings>) => {
    setData(d => d ? { ...d, bryteLinksSettings: { ...d.bryteLinksSettings, ...patch } } : d);
  }, []);

  const dialogSuccess = {
    site: useCallback((settings: SiteSettings) => {
      setData(d => d ? { ...d, siteSettings: settings } : d);
      addToast("Site settings updated", "success");
    }, [addToast]),
    api: useCallback((settings: ApiSettings) => {
      setData(d => d ? { ...d, apiSettings: settings } : d);
      addToast("API settings updated", "success");
    }, [addToast]),
    fee: useCallback((settings: FeeSettings) => {
      setFeeSettings(settings);
      setData(d => d ? { ...d, feeSettings: settings } : d);
      addToast("Fee settings updated", "success");
    }, [addToast]),
    momo: useCallback((settings: MomoBridgeSettings) => {
      setData(d => d ? { ...d, momoBridgeSettings: settings } : d);
      addToast("MoMo Bridge settings updated", "success");
    }, [addToast]),
    wallet: useCallback((settings: WalletSettings) => {
      setData(d => d ? { ...d, walletSettings: settings } : d);
      addToast("Wallet settings updated", "success");
    }, [addToast]),
    password: useCallback(() => {
      addToast("Admin password changed successfully. Please log in again.", "success");
    }, [addToast]),
  };

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

  const [revealKeys, setRevealKeys] = useState<Record<string, boolean>>({
    telecel: false, airtelTigo: false,
    paystackTestPublic: false, paystackTestSecret: false,
    paystackLivePublic: false, paystackLiveSecret: false,
  });
  const toggleRevealKey = (k: string) => setRevealKeys(p => ({ ...p, [k]: !p[k] }));

  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'finance' | 'system'>('general');
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ general: true });
  const handleTabChange = (value: string) => {
    if (value === 'general' || value === 'api' || value === 'finance' || value === 'system') {
      setActiveTab(value);
      setVisitedTabs(prev => ({ ...prev, [value]: true }));
    }
  };

  const refreshMtnStats = useCallback(async () => {
    try {
      const stats = await settingsService.getMtnNumberStats();
      setMtnNumbersCount(stats.totalKnownNumbers);
      addToast("Stats refreshed", "success");
    } catch {
      addToast("Failed to refresh stats", "error");
    }
  }, [addToast]);

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">Manage site, API and wallet configuration</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0 overflow-hidden relative group"
            style={!authState.user?.profilePicture ? { background: "var(--gradient-primary)" } : undefined}>
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
            <p className="text-sm font-semibold truncate text-[var(--text-primary)]">{authState.user?.fullName ?? "Admin"}</p>
            <p className="text-xs truncate mt-0.5 text-[var(--text-muted)]">{authState.user?.email ?? ""}</p>
            <p className="text-[11px] mt-1 text-[var(--text-muted)]">{isUploadingPhoto ? "Uploading…" : "Hover avatar to change photo"}</p>
            {hasUploadedPhoto && !isUploadingPhoto && (
              <button type="button" onClick={handlePhotoRemove} className="text-xs underline mt-1 text-[var(--text-muted)]">Remove photo</button>
            )}
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full overflow-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={activeTab === 'general' ? '' : 'hidden'}>
        {visitedTabs.general && (
          <GeneralTab
            data={data}
            busyKeys={busyKeys}
            mtnNumbersCount={mtnNumbersCount}
            onToggleSite={handleToggleSite}
            onToggleStorefronts={handleToggleStorefronts}
            onToggleSignupApproval={handleToggleSignupApproval}
            onToggleAutoApprove={handleToggleAutoApprove}
            onTogglePaymentGate={handleTogglePaymentGate}
            onToggleAutoSuspend={handleToggleAutoSuspend}
            onToggleMtnRestriction={handleToggleMtnRestriction}
            onSaveCreationFee={handleSaveCreationFee}
            onSaveInactivityThreshold={handleSaveInactivityThreshold}
            onUpdateBryteLinks={updateBryteLinks}
            onSetSiteDialogOpen={setSiteDialogOpen}
            onSetPasswordDialogOpen={setPasswordDialogOpen}
            onRefreshMtnStats={refreshMtnStats}
          />
        )}
      </div>

      <div className={activeTab === 'api' ? '' : 'hidden'}>
        {visitedTabs.api && (
          <ApiTab
            apiSettings={data.apiSettings}
            revealKeys={revealKeys}
            onToggleRevealKey={toggleRevealKey}
            onSetApiDialogOpen={setApiDialogOpen}
          />
        )}
      </div>

      <div className={activeTab === 'finance' ? '' : 'hidden'}>
        {visitedTabs.finance && (
          <FinanceTab
            walletSettings={data.walletSettings}
            momoBridgeSettings={data.momoBridgeSettings}
            feeSettings={feeSettings}
            onSetWalletDialogOpen={setWalletDialogOpen}
            onSetMomoDialogOpen={setMomoDialogOpen}
            onSetFeeDialogOpen={setFeeDialogOpen}
          />
        )}
      </div>

      <div className={activeTab === 'system' ? '' : 'hidden'}>
        {visitedTabs.system && (
          <SystemTab
            systemInfo={data.systemInfo}
            testPushLoading={testPushLoading}
            onSendTestPush={handleSendTestPush}
          />
        )}
      </div>

      <SiteSettingsDialog isOpen={siteDialogOpen} onClose={() => setSiteDialogOpen(false)} currentSettings={data.siteSettings} onSuccess={dialogSuccess.site} />
      <ApiSettingsDialog isOpen={apiDialogOpen} onClose={() => setApiDialogOpen(false)} currentSettings={data.apiSettings} onSuccess={dialogSuccess.api} />
      <WalletSettingsDialog isOpen={walletDialogOpen} onClose={() => setWalletDialogOpen(false)} currentSettings={data.walletSettings} onSuccess={dialogSuccess.wallet} />
      <FeeSettingsDialog isOpen={feeDialogOpen} onClose={() => setFeeDialogOpen(false)} currentSettings={feeSettings} onSuccess={dialogSuccess.fee} />
      <MomoBridgeSettingsDialog isOpen={momoDialogOpen} onClose={() => setMomoDialogOpen(false)} currentSettings={data.momoBridgeSettings} onSuccess={dialogSuccess.momo} />
      <AdminPasswordDialog isOpen={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} onSuccess={dialogSuccess.password} />
    </div>
  );
}
