import React, { useEffect, useState, useCallback } from "react";
import { Edit, Key as KeyIcon, Eye, EyeOff, Smartphone, CreditCard } from "lucide-react";
import { Button } from "../../design-system/components/button";
import { Card } from "../../design-system/components/card";
import { Badge } from "../../design-system/components/badge";
import { Alert } from "../../design-system/components/alert";
import { Spinner, Tabs, TabsList, TabsTrigger } from "../../design-system";
import { ColorSchemeSelector } from "../../components/common/color-scheme-selector";
import { settingsService, type SiteSettings, type ApiSettings, type WalletSettings, type SystemInfo } from "../../services/settings.service";
import { SiteSettingsDialog, ApiSettingsDialog, WalletSettingsDialog, AdminPasswordDialog } from "../../components/superadmin";

export default function SuperAdminSettingsPage() {

  // combined settings object to minimize re-renders and network calls
  const [data, setData] = useState<{
    siteSettings: SiteSettings;
    apiSettings: ApiSettings;
    walletSettings: WalletSettings;
    signupApproval: { requireApprovalForSignup: boolean };
    autoApproveStorefronts: { autoApproveStorefronts: boolean };
    systemInfo: SystemInfo;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // dialogs
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // single load + client cache via settingsService.getAllSettings()
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const all = await settingsService.getAllSettings();
        if (!mounted) return;
        setData(all);
      } catch (err) {
        console.error("Failed to load settings:", err);
        if (mounted) setMessage({ type: "error", text: "Failed to load settings" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const setBusy = useCallback((key: string, v: boolean) => setBusyKeys(prev => ({ ...prev, [key]: v })), []);

  const clearMessage = useCallback(() => setMessage(null), []);

  // Optimistic toggle helpers — update local state first, then call API; revert on error
  const handleToggleSite = useCallback(async () => {
    if (!data) return;
    const prev = data.siteSettings.isSiteOpen;
    setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: !prev } } : d);
    setBusy("siteToggle", true);
    try {
      const res = await settingsService.toggleSiteStatus();
      setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: res.isSiteOpen } } : d);
      setMessage({ type: "success", text: `Site ${res.isSiteOpen ? "opened" : "closed"} successfully` });
    } catch {
      setData(d => d ? { ...d, siteSettings: { ...d.siteSettings, isSiteOpen: prev } } : d);
      setMessage({ type: "error", text: "Failed to update site status" });
    } finally {
      setBusy("siteToggle", false);
    }
  }, [data, setBusy]);

  const handleToggleSignupApproval = useCallback(async () => {
    if (!data) return;
    const prev = data.signupApproval.requireApprovalForSignup;
    setData(d => d ? { ...d, signupApproval: { requireApprovalForSignup: !prev } } : d);
    setBusy("signupToggle", true);
    try {
      await settingsService.updateSignupApprovalSetting(!prev);
      setMessage({ type: "success", text: `Signup approval ${!prev ? "required" : "disabled"}` });
    } catch {
      setData(d => d ? { ...d, signupApproval: { requireApprovalForSignup: prev } } : d);
      setMessage({ type: "error", text: "Failed to update signup approval setting" });
    } finally {
      setBusy("signupToggle", false);
    }
  }, [data, setBusy]);

  const handleToggleAutoApprove = useCallback(async () => {
    if (!data) return;
    const prev = data.autoApproveStorefronts.autoApproveStorefronts;
    setData(d => d ? { ...d, autoApproveStorefronts: { autoApproveStorefronts: !prev } } : d);
    setBusy("autoApproveToggle", true);
    try {
      await settingsService.updateAutoApproveStorefronts(!prev);
      setMessage({ type: "success", text: `Storefront auto-approval ${!prev ? "enabled" : "disabled"}` });
    } catch {
      setData(d => d ? { ...d, autoApproveStorefronts: { autoApproveStorefronts: prev } } : d);
      setMessage({ type: "error", text: "Failed to update storefront auto-approval setting" });
    } finally {
      setBusy("autoApproveToggle", false);
    }
  }, [data, setBusy]);

  // Dialog callbacks update the combined `data` object — prevents refetching
  const handleSiteSettingsSuccess = useCallback((settings: SiteSettings) => {
    setData(d => d ? { ...d, siteSettings: settings } : d);
    setMessage({ type: "success", text: "Site settings updated" });
  }, []);

  const handleApiSettingsSuccess = useCallback((settings: ApiSettings) => {
    setData(d => d ? { ...d, apiSettings: settings } : d);
    setMessage({ type: "success", text: "API settings updated" });
  }, []);

  const handleWalletSettingsSuccess = useCallback((settings: WalletSettings) => {
    setData(d => d ? { ...d, walletSettings: settings } : d);
    setMessage({ type: "success", text: "Wallet settings updated" });
  }, []);

  const handlePasswordChangeSuccess = useCallback(() => {
    setMessage({ type: "success", text: "Admin password changed successfully. Please log in again." });
  }, []);

  // derived values for compact templates
  const siteOpen = data?.siteSettings?.isSiteOpen ?? false;
  const signupRequired = data?.signupApproval?.requireApprovalForSignup ?? false;
  const autoApprove = data?.autoApproveStorefronts?.autoApproveStorefronts ?? false;

  // compact responsive layout pieces
  const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );

  // Reveal state for sensitive keys shown in the API tab (display only)
  const [revealKeys, setRevealKeys] = useState<Record<string, boolean>>({
    mtn: false,
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
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage site, API and wallet configuration</p>
        </div>
      </div>

      {message && (
        <Alert status={message.type === "error" ? "error" : message.type === "success" ? "success" : "info"} onClose={clearMessage} title={message.type === "error" ? "Error" : message.type === "success" ? "Success" : "Info"}>
          {message.text}
        </Alert>
      )}

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
                  <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Site status</div>
                      <div className="text-xs text-gray-500 mt-1">{siteOpen ? 'Open to users' : 'Closed for maintenance'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${siteOpen ? 'text-green-600' : 'text-red-600'}`}>{siteOpen ? 'Open' : 'Closed'}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={siteOpen} onChange={handleToggleSite} disabled={!!busyKeys['siteToggle']} />
                        <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-5"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-900">Maintenance message</div>
                    <div className="text-xs text-gray-500 mt-1">{data.siteSettings.customMessage || 'No custom message set'}</div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Require admin approval for signups</div>
                      <div className="text-xs text-gray-500 mt-1">{signupRequired ? 'Approval required' : 'Auto-approve new users'}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={signupRequired} onChange={handleToggleSignupApproval} disabled={!!busyKeys['signupToggle']} />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Auto-approve storefronts</div>
                      <div className="text-xs text-gray-500 mt-1">{autoApprove ? 'Auto' : 'Manual'}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoApprove} onChange={handleToggleAutoApprove} disabled={!!busyKeys['autoApproveToggle']} />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="User Management" subtitle="Admin & security settings" action={<Button size="sm" variant="secondary" onClick={() => setPasswordDialogOpen(true)}><KeyIcon className="w-3 h-3 mr-1" />Change Password</Button>} />
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Admin account security</div>
                  <div className="text-xs text-green-800 mt-1">Change your admin password regularly. You'll be required to log in again after changing it.</div>
                </div>
              </Card>
            </div>
          )}

          {(activeTab === 'api' || visitedTabs.api) && (
            <div className={`space-y-6 ${activeTab === 'api' ? '' : 'hidden'}`}>
              <Card>
                <SectionHeader title="API Settings" subtitle="External integrations & keys" action={<Button size="sm" variant="secondary" onClick={() => setApiDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>} />
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-900">API Endpoint</div>
                    <div className="text-xs text-orange-800 font-mono mt-1">{data.apiSettings.apiEndpoint || 'Not configured'}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* MTN key (masked, reveal) */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4 text-yellow-600" />MTN API Key</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="font-mono text-sm text-gray-700 break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.mtn ? (data.apiSettings.mtnApiKey || 'Not configured') : formatMasked(data.apiSettings.mtnApiKey)}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" leftIcon={revealKeys.mtn ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('mtn')}>{revealKeys.mtn ? 'Hide' : 'Reveal'}</Button>
                          <Badge colorScheme={data.apiSettings.mtnApiKey ? 'success' : 'error'}>{data.apiSettings.mtnApiKey ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Telecel key (masked, reveal) */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4 text-blue-600" />Telecel API Key</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="font-mono text-sm text-gray-700 break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.telecel ? (data.apiSettings.telecelApiKey || 'Not configured') : formatMasked(data.apiSettings.telecelApiKey)}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" leftIcon={revealKeys.telecel ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('telecel')}>{revealKeys.telecel ? 'Hide' : 'Reveal'}</Button>
                          <Badge colorScheme={data.apiSettings.telecelApiKey ? 'success' : 'error'}>{data.apiSettings.telecelApiKey ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* AirtelTigo key (masked, reveal) */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4 text-red-600" />AirtelTigo API Key</div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="font-mono text-sm text-gray-700 break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.airtelTigo ? (data.apiSettings.airtelTigoApiKey || 'Not configured') : formatMasked(data.apiSettings.airtelTigoApiKey)}</div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" leftIcon={revealKeys.airtelTigo ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('airtelTigo')}>{revealKeys.airtelTigo ? 'Hide' : 'Reveal'}</Button>
                          <Badge colorScheme={data.apiSettings.airtelTigoApiKey ? 'success' : 'error'}>{data.apiSettings.airtelTigoApiKey ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Paystack block (show enabled + public/secret keys) */}
                    <div className="p-3 bg-blue-50 rounded-lg col-span-full sm:col-span-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" />Paystack</div>
                          <div className="text-xs text-gray-500 mt-1">Payment gateway configuration (test & live keys)</div>
                        </div>
                        <Badge colorScheme={data.apiSettings.paystackEnabled ? 'success' : 'warning'}>{data.apiSettings.paystackEnabled ? 'Enabled' : 'Disabled'}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500">Test public key</div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackTestPublic ? (data.apiSettings.paystackTestPublicKey || 'Not configured') : formatMasked(data.apiSettings.paystackTestPublicKey)}</div>
                            <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackTestPublic ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackTestPublic')}>{revealKeys.paystackTestPublic ? 'Hide' : 'Reveal'}</Button>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500">Test secret key</div>
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
                                <div className="text-sm text-gray-700">{data.apiSettings.paystackTestSecretExists ? 'Stored on server' : 'Not configured'}</div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" leftIcon={<KeyIcon className="w-3 h-3" />} onClick={() => setApiDialogOpen(true)}>{data.apiSettings.paystackTestSecretExists ? 'Replace' : 'Set'}</Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500">Live public key</div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackLivePublic ? (data.apiSettings.paystackLivePublicKey || 'Not configured') : formatMasked(data.apiSettings.paystackLivePublicKey)}</div>
                            <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackLivePublic ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackLivePublic')}>{revealKeys.paystackLivePublic ? 'Hide' : 'Reveal'}</Button>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded border">
                          <div className="text-xs text-gray-500">Live secret key</div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            {data.apiSettings.paystackLiveSecretKey !== undefined ? (
                              // dev: secret value returned — allow reveal
                              <>
                                <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{revealKeys.paystackLiveSecret ? (data.apiSettings.paystackLiveSecretKey || 'Not configured') : formatMasked(data.apiSettings.paystackLiveSecretKey)}</div>
                                <Button size="sm" variant="ghost" leftIcon={revealKeys.paystackLiveSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} onClick={() => toggleRevealKey('paystackLiveSecret')}>{revealKeys.paystackLiveSecret ? 'Hide' : 'Reveal'}</Button>
                              </>
                            ) : (
                              // prod: secret redacted — show existence and let admin open dialog to replace
                              <>
                                <div className="text-sm text-gray-700">{data.apiSettings.paystackLiveSecretExists ? 'Stored on server' : 'Not configured'}</div>
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
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                    <div className="text-sm text-gray-600">Agent Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.agent}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                    <div className="text-sm text-gray-600">Super Agent Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.super_agent}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                    <div className="text-sm text-gray-600">Dealer Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.dealer}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                    <div className="text-sm text-gray-600">Super Dealer Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.super_dealer}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex justify-between col-span-full sm:col-span-1">
                    <div className="text-sm text-gray-600">Default Minimum</div>
                    <div className="font-medium">GH₵{data.walletSettings.minimumTopUpAmounts.default}</div>
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
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Version</div>
                    <div className="font-medium mt-1">{data.systemInfo.version}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Last updated</div>
                    <div className="font-medium mt-1">{data.systemInfo.lastUpdated}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">API Status</div>
                      <div className="text-xs text-gray-500 mt-1">{data.systemInfo.apiStatus}</div>
                    </div>
                    <Badge colorScheme={data.systemInfo.apiStatus === 'healthy' ? 'success' : 'warning'}>{data.systemInfo.apiStatus}</Badge>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">DB Status</div>
                      <div className="text-xs text-gray-500 mt-1">{data.systemInfo.databaseStatus}</div>
                    </div>
                    <Badge colorScheme={data.systemInfo.databaseStatus === 'connected' ? 'success' : 'warning'}>{data.systemInfo.databaseStatus}</Badge>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Appearance" subtitle="Theme & color" />
                <div className="mt-4">
                  <ColorSchemeSelector />
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Dialogs (receive props from cached `data` to avoid re-fetch) */}
        <SiteSettingsDialog isOpen={siteDialogOpen} onClose={() => setSiteDialogOpen(false)} currentSettings={data.siteSettings} onSuccess={handleSiteSettingsSuccess} />

        <ApiSettingsDialog isOpen={apiDialogOpen} onClose={() => setApiDialogOpen(false)} currentSettings={data.apiSettings} onSuccess={handleApiSettingsSuccess} />

        <WalletSettingsDialog isOpen={walletDialogOpen} onClose={() => setWalletDialogOpen(false)} currentSettings={data.walletSettings} onSuccess={handleWalletSettingsSuccess} />

        <AdminPasswordDialog isOpen={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} onSuccess={handlePasswordChangeSuccess} />
      </div>
    </div>
  );
}
