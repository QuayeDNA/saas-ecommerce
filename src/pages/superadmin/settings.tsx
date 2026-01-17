import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaEdit,
  FaDatabase,
  FaKey,
  FaGlobe,
  FaBox,
  FaMobile,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPalette,
} from "react-icons/fa";
import { Button } from "../../design-system/components/button";
import { Card } from "../../design-system/components/card";
import { Badge } from "../../design-system/components/badge";
import {
  settingsService,
  type SiteSettings,
  type ApiSettings,
  type WalletSettings,
} from "../../services/settings.service";
import { Alert } from "../../design-system/components/alert";
import { ColorSchemeSelector } from "../../components/common/color-scheme-selector";
import { apiClient } from "../../utils/api-client";
import {
  SiteSettingsDialog,
  ApiSettingsDialog,
  WalletSettingsDialog,
  AdminPasswordDialog,
} from "../../components/superadmin";

export default function SuperAdminSettingsPage() {
  const navigate = useNavigate();

  // Active Tab State
  const [activeTab, setActiveTab] = useState("general");

  // Tab configuration
  const tabs = [
    { id: "general", label: "General", icon: FaGlobe },
    { id: "api", label: "API", icon: FaDatabase },
    { id: "finance", label: "Finance", icon: FaMoneyBillWave },
    { id: "system", label: "System", icon: FaInfoCircle },
  ];

  // Site Management
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    isSiteOpen: true,
    customMessage:
      "We're currently performing maintenance. Please check back later.",
  });

  // Signup Approval Setting
  const [requireApprovalForSignup, setRequireApprovalForSignup] =
    useState(true);

  // API Settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    mtnApiKey: "",
    telecelApiKey: "",
    airtelTigoApiKey: "",
    apiEndpoint: "",
  });

  // Wallet Settings
  const [walletSettings, setWalletSettings] = useState<WalletSettings>({
    minimumTopUpAmounts: {
      agent: 10,
      super_agent: 50,
      dealer: 100,
      super_dealer: 200,
      default: 10,
    },
  });

  // Form States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Dialog States
  const [siteDialogOpen, setSiteDialogOpen] = useState(false);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // System Information
  const [systemInfo, setSystemInfo] = useState({
    version: "Loading...",
    lastUpdated: "Loading...",
    databaseStatus: "checking",
    apiStatus: "checking",
    cacheStatus: "checking",
    sslStatus: "checking",
  });
  const [systemInfoLoading, setSystemInfoLoading] = useState(true);

  // Fetch all settings on component mount
  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        const [siteData, apiData, walletData, signupApprovalData] =
          await Promise.all([
            settingsService.getSiteSettings(),
            settingsService.getApiSettings(),
            settingsService.getWalletSettings(),
            settingsService.getSignupApprovalSetting(),
          ]);

        setSiteSettings(siteData);
        setApiSettings(apiData);
        setWalletSettings(walletData);
        setRequireApprovalForSignup(
          signupApprovalData.requireApprovalForSignup
        );
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setMessage({ type: "error", text: "Failed to load settings" });
      }
    };

    fetchAllSettings();
  }, []);

  // Fetch system information on component mount
  useEffect(() => {
    const fetchSystemInfo = async () => {
      setSystemInfoLoading(true);
      try {
        const response = await apiClient.get("/api/system/info");
        const data = response.data;
        setSystemInfo({
          version: data.version || "v1.0.0",
          lastUpdated: data.lastUpdated || "2024-01-15",
          databaseStatus: data.databaseStatus || "connected",
          apiStatus: data.apiStatus || "healthy",
          cacheStatus: data.cacheStatus || "active",
          sslStatus: data.sslStatus || "valid",
        });
      } catch (error) {
        console.error("Failed to fetch system info:", error);
        // Keep default values on error
        setSystemInfo({
          version: "v1.0.0",
          lastUpdated: "2024-01-15",
          databaseStatus: "unknown",
          apiStatus: "unknown",
          cacheStatus: "unknown",
          sslStatus: "unknown",
        });
      } finally {
        setSystemInfoLoading(false);
      }
    };

    fetchSystemInfo();
  }, []);

  const handleSiteToggle = async () => {
    setLoading(true);
    try {
      const result = await settingsService.toggleSiteStatus();
      setSiteSettings((prev) => ({ ...prev, isSiteOpen: result.isSiteOpen }));
      setMessage({
        type: "success",
        text: `Site ${result.isSiteOpen ? "opened" : "closed"} successfully`,
      });
    } catch {
      setMessage({ type: "error", text: "Failed to update site status" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupApprovalToggle = async () => {
    setLoading(true);
    try {
      const newValue = !requireApprovalForSignup;
      await settingsService.updateSignupApprovalSetting(newValue);
      setRequireApprovalForSignup(newValue);
      setMessage({
        type: "success",
        text: `Signup approval ${newValue ? "required" : "disabled"}`,
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to update signup approval setting",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSettingsSuccess = (settings: SiteSettings) => {
    setSiteSettings(settings);
    setMessage({
      type: "success",
      text: "Site settings updated successfully",
    });
  };

  const handleApiSettingsSuccess = (settings: ApiSettings) => {
    setApiSettings(settings);
    setMessage({
      type: "success",
      text: "API settings updated successfully",
    });
  };

  const handleWalletSettingsSuccess = (settings: WalletSettings) => {
    setWalletSettings(settings);
    setMessage({
      type: "success",
      text: "Wallet settings updated successfully",
    });
  };

  const handlePasswordChangeSuccess = () => {
    setMessage({
      type: "success",
      text: "Admin password changed successfully. Please log in again.",
    });
  };

  const clearMessage = () => setMessage(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage site configuration, user permissions, and system preferences
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <Alert
          status={
            message.type === "success"
              ? "success"
              : message.type === "error"
              ? "error"
              : "info"
          }
          onClose={clearMessage}
          title={
            message.type === "success"
              ? "Success"
              : message.type === "error"
              ? "Error"
              : "Info"
          }
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Site Management */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Site Management
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSiteDialogOpen(true)}
                >
                  <FaEdit className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>

              <div className="space-y-4">
                {/* Site Status Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Site Status</h3>
                    <p className="text-sm text-gray-600">
                      {siteSettings.isSiteOpen
                        ? "Site is currently open to users"
                        : "Site is currently closed to users"}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={siteSettings.isSiteOpen}
                      onChange={handleSiteToggle}
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {siteSettings.isSiteOpen ? "Open" : "Closed"}
                    </span>
                  </label>
                </div>

                {/* Custom Message Display */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Maintenance Message
                  </h3>
                  <p className="text-sm text-gray-600">
                    {siteSettings.customMessage || "No custom message set"}
                  </p>
                </div>

                {/* Signup Approval Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Require Admin Approval for New Signups
                    </h3>
                    <p className="text-sm text-gray-600">
                      {requireApprovalForSignup
                        ? "New users must be approved before access."
                        : "New users are auto-approved."}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={requireApprovalForSignup}
                      onChange={handleSignupApprovalToggle}
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {requireApprovalForSignup ? "Required" : "Auto"}
                    </span>
                  </label>
                </div>
              </div>
            </Card>

            {/* User Management */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaUserShield className="text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    User Management
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  <FaKey className="w-3 h-3 mr-1" />
                  Change Password
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">
                    Admin Account Security
                  </h3>
                  <p className="text-sm text-green-800">
                    Change your admin password regularly to maintain account
                    security. You will need to log in again after changing your
                    password.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "api" && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaDatabase className="text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  API Settings
                </h2>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setApiDialogOpen(true)}
              >
                <FaEdit className="w-3 h-3 mr-1" />
                Configure
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">
                  API Endpoint
                </h3>
                <p className="text-sm text-orange-800 font-mono">
                  {apiSettings.apiEndpoint || "Not configured"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">MTN API</h3>
                    <p className="text-sm text-gray-600">
                      {apiSettings.mtnApiKey ? "Configured" : "Not configured"}
                    </p>
                  </div>
                  <Badge
                    colorScheme={apiSettings.mtnApiKey ? "success" : "error"}
                  >
                    {apiSettings.mtnApiKey ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Telecel API</h3>
                    <p className="text-sm text-gray-600">
                      {apiSettings.telecelApiKey
                        ? "Configured"
                        : "Not configured"}
                    </p>
                  </div>
                  <Badge
                    colorScheme={
                      apiSettings.telecelApiKey ? "success" : "error"
                    }
                  >
                    {apiSettings.telecelApiKey ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      AirtelTigo API
                    </h3>
                    <p className="text-sm text-gray-600">
                      {apiSettings.airtelTigoApiKey
                        ? "Configured"
                        : "Not configured"}
                    </p>
                  </div>
                  <Badge
                    colorScheme={
                      apiSettings.airtelTigoApiKey ? "success" : "error"
                    }
                  >
                    {apiSettings.airtelTigoApiKey ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "finance" && (
          <div className="space-y-6">
            {/* Wallet Settings */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Wallet Settings
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setWalletDialogOpen(true)}
                >
                  <FaEdit className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">
                    Minimum Top-up Amounts
                  </h3>
                  <p className="text-sm text-green-800">
                    Set the minimum amounts users can top-up their wallets with
                    for each user type.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Agent Minimum</span>
                    <span className="font-medium">
                      GH₵{walletSettings.minimumTopUpAmounts.agent}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Super Agent Minimum</span>
                    <span className="font-medium">
                      GH₵{walletSettings.minimumTopUpAmounts.super_agent}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Dealer Minimum</span>
                    <span className="font-medium">
                      GH₵{walletSettings.minimumTopUpAmounts.dealer}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Super Dealer Minimum</span>
                    <span className="font-medium">
                      GH₵{walletSettings.minimumTopUpAmounts.super_dealer}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Default Minimum</span>
                    <span className="font-medium">
                      GH₵{walletSettings.minimumTopUpAmounts.default}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Product Management Section */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FaBox className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Product & Service Management
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMobile className="text-yellow-600" />
                    <h3 className="font-medium text-gray-900">MTN Bundles</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage MTN data bundles and pricing
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/superadmin/packages")}
                  >
                    <FaEdit className="w-3 h-3 mr-1" />
                    Manage Bundles
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMobile className="text-blue-600" />
                    <h3 className="font-medium text-gray-900">
                      Telecel Bundles
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage Telecel data bundles and pricing
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/superadmin/packages")}
                  >
                    <FaEdit className="w-3 h-3 mr-1" />
                    Manage Bundles
                  </Button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMobile className="text-red-600" />
                    <h3 className="font-medium text-gray-900">
                      AirtelTigo Bundles
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage AirtelTigo data bundles and pricing
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/superadmin/packages")}
                  >
                    <FaEdit className="w-3 h-3 mr-1" />
                    Manage Bundles
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            {/* Color Scheme */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FaPalette className="text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Appearance
                </h2>
              </div>
              <ColorSchemeSelector />
            </Card>

            {/* System Information */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FaInfoCircle className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  System Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">System Version</span>
                    <span className="font-medium">
                      {systemInfoLoading ? "Loading..." : systemInfo.version}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {systemInfoLoading
                        ? "Loading..."
                        : systemInfo.lastUpdated}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database Status</span>
                    <Badge
                      colorScheme={
                        systemInfo.databaseStatus === "connected"
                          ? "success"
                          : systemInfo.databaseStatus === "disconnected"
                          ? "error"
                          : "warning"
                      }
                    >
                      {systemInfoLoading
                        ? "Checking..."
                        : systemInfo.databaseStatus.charAt(0).toUpperCase() +
                          systemInfo.databaseStatus.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Status</span>
                    <Badge
                      colorScheme={
                        systemInfo.apiStatus === "healthy"
                          ? "success"
                          : systemInfo.apiStatus === "unhealthy"
                          ? "error"
                          : "warning"
                      }
                    >
                      {systemInfoLoading
                        ? "Checking..."
                        : systemInfo.apiStatus.charAt(0).toUpperCase() +
                          systemInfo.apiStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache Status</span>
                    <Badge
                      colorScheme={
                        systemInfo.cacheStatus === "active"
                          ? "success"
                          : systemInfo.cacheStatus === "inactive"
                          ? "error"
                          : "warning"
                      }
                    >
                      {systemInfoLoading
                        ? "Checking..."
                        : systemInfo.cacheStatus.charAt(0).toUpperCase() +
                          systemInfo.cacheStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SSL Certificate</span>
                    <Badge
                      colorScheme={
                        systemInfo.sslStatus === "valid"
                          ? "success"
                          : systemInfo.sslStatus === "invalid"
                          ? "error"
                          : "warning"
                      }
                    >
                      {systemInfoLoading
                        ? "Checking..."
                        : systemInfo.sslStatus.charAt(0).toUpperCase() +
                          systemInfo.sslStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog Components */}
      <SiteSettingsDialog
        isOpen={siteDialogOpen}
        onClose={() => setSiteDialogOpen(false)}
        currentSettings={siteSettings}
        onSuccess={handleSiteSettingsSuccess}
      />

      <ApiSettingsDialog
        isOpen={apiDialogOpen}
        onClose={() => setApiDialogOpen(false)}
        currentSettings={apiSettings}
        onSuccess={handleApiSettingsSuccess}
      />

      <WalletSettingsDialog
        isOpen={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        currentSettings={walletSettings}
        onSuccess={handleWalletSettingsSuccess}
      />

      <AdminPasswordDialog
        isOpen={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}
