import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPowerOff,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
  FaDatabase,
  FaKey,
  FaGlobe,
  FaCheck,
  FaBox,
  FaMobile,
  FaInfoCircle,
  FaMoneyBillWave,
  FaPalette,
} from "react-icons/fa";
import { Button } from "../../design-system/components/button";
import { Card } from "../../design-system/components/card";
import { Input } from "../../design-system/components/input";
import { Badge } from "../../design-system/components/badge";
import {
  settingsService,
  type SiteSettings,
  type ApiSettings,
  type WalletSettings,
} from "../../services/settings.service";
import { Alert } from "../../design-system/components/alert";
import { ColorSchemeSelector } from "../../components/common/color-scheme-selector";

export default function SuperAdminSettingsPage() {
  const navigate = useNavigate();

  // Site Management
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    isSiteOpen: true,
    customMessage:
      "We're currently performing maintenance. Please check back later.",
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    mtnApiKey: "",
    telecelApiKey: "",
    airtelTigoApiKey: "",
    apiEndpoint: "https://api.telecomsaas.com",
  });

  // Wallet Settings
  const [walletSettings, setWalletSettings] = useState<WalletSettings>({
    minimumTopUpAmount: 10,
  });

  // Form States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

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

  // Admin Password Change
  const [adminPassword, setAdminPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch wallet settings on component mount
  useEffect(() => {
    const fetchWalletSettings = async () => {
      try {
        const settings = await settingsService.getWalletSettings();
        setWalletSettings(settings);
      } catch (error) {
        console.error("Failed to fetch wallet settings:", error);
      }
    };

    fetchWalletSettings();
  }, []);

  // Fetch system information on component mount
  useEffect(() => {
    const fetchSystemInfo = async () => {
      setSystemInfoLoading(true);
      try {
        const response = await fetch("/api/system/info", {
          headers: {
            "Content-Type": "application/json",
            // Add auth header if needed
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSystemInfo({
            version: data.version || "v1.0.0",
            lastUpdated: data.lastUpdated || "2024-01-15",
            databaseStatus: data.databaseStatus || "connected",
            apiStatus: data.apiStatus || "healthy",
            cacheStatus: data.cacheStatus || "active",
            sslStatus: data.sslStatus || "valid",
          });
        } else {
          throw new Error("Failed to fetch system info");
        }
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

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      switch (section) {
        case "Site":
          await settingsService.updateSiteSettings(siteSettings);
          break;
        case "API":
          await settingsService.updateApiSettings(apiSettings);
          break;
        case "Wallet":
          await settingsService.updateWalletSettings(walletSettings);
          break;
      }
      setMessage({
        type: "success",
        text: `${section} settings saved successfully`,
      });
      setEditingSection(null);
    } catch {
      setMessage({ type: "error", text: `Failed to save ${section} settings` });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordChange = async () => {
    if (adminPassword.newPassword !== adminPassword.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await settingsService.changeAdminPassword({
        currentPassword: adminPassword.currentPassword,
        newPassword: adminPassword.newPassword,
      });
      setMessage({
        type: "success",
        text: "Admin password changed successfully",
      });
      setAdminPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setMessage({ type: "error", text: "Failed to change admin password" });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => setMessage(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage site configuration, user permissions, and system preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge colorScheme={siteSettings.isSiteOpen ? "success" : "error"}>
            {siteSettings.isSiteOpen ? (
              <>
                <FaCheck className="w-3 h-3 mr-1" />
                Site Open
              </>
            ) : (
              <>
                <FaPowerOff className="w-3 h-3 mr-1" />
                Site Closed
              </>
            )}
          </Badge>
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
            {editingSection === "site" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveSettings("Site")}
                  disabled={loading}
                >
                  <FaSave className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingSection(null)}
                >
                  <FaTimes className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditingSection("site")}
              >
                <FaEdit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
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
              <Button
                variant="primary"
                onClick={handleSiteToggle}
                disabled={loading}
              >
                {siteSettings.isSiteOpen ? (
                  <>
                    <FaPowerOff className="w-3 h-3 mr-1" />
                    Close Site
                  </>
                ) : (
                  <>
                    <FaCheck className="w-3 h-3 mr-1" />
                    Open Site
                  </>
                )}
              </Button>
            </div>

            {/* Custom Message */}
            {editingSection === "site" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Message (when site is closed)
                </label>
                <textarea
                  value={siteSettings.customMessage}
                  onChange={(e) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      customMessage: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter custom message to display when site is closed..."
                />
              </div>
            )}
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
          </div>

          <div className="space-y-4">
            {/* Admin Password Change */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900">
                Change Admin Password
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={adminPassword.currentPassword}
                  onChange={(e) =>
                    setAdminPassword((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={adminPassword.newPassword}
                  onChange={(e) =>
                    setAdminPassword((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={adminPassword.confirmPassword}
                  onChange={(e) =>
                    setAdminPassword((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                />
                <Button
                  variant="primary"
                  onClick={handleAdminPasswordChange}
                  disabled={
                    loading ||
                    !adminPassword.currentPassword ||
                    !adminPassword.newPassword
                  }
                >
                  <FaKey className="w-3 h-3 mr-1" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* API Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaDatabase className="text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                API Settings
              </h2>
            </div>
            {editingSection === "api" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveSettings("API")}
                  disabled={loading}
                >
                  <FaSave className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingSection(null)}
                >
                  <FaTimes className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditingSection("api")}
              >
                <FaEdit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {editingSection === "api" ? (
              <div className="space-y-3">
                <Input
                  label="MTN API Key"
                  type="password"
                  value={apiSettings.mtnApiKey}
                  onChange={(e) =>
                    setApiSettings((prev) => ({
                      ...prev,
                      mtnApiKey: e.target.value,
                    }))
                  }
                  placeholder="Enter MTN API key"
                />
                <Input
                  label="Telecel API Key"
                  type="password"
                  value={apiSettings.telecelApiKey}
                  onChange={(e) =>
                    setApiSettings((prev) => ({
                      ...prev,
                      telecelApiKey: e.target.value,
                    }))
                  }
                  placeholder="Enter Telecel API key"
                />
                <Input
                  label="AirtelTigo API Key"
                  type="password"
                  value={apiSettings.airtelTigoApiKey}
                  onChange={(e) =>
                    setApiSettings((prev) => ({
                      ...prev,
                      airtelTigoApiKey: e.target.value,
                    }))
                  }
                  placeholder="Enter AirtelTigo API key"
                />
                <Input
                  label="API Endpoint"
                  value={apiSettings.apiEndpoint}
                  onChange={(e) =>
                    setApiSettings((prev) => ({
                      ...prev,
                      apiEndpoint: e.target.value,
                    }))
                  }
                  placeholder="https://api.telecomsaas.com"
                />
              </div>
            ) : (
              <div className="space-y-3">
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
            )}
          </div>
        </Card>

        {/* Wallet Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Wallet Settings
              </h2>
            </div>
            {editingSection === "wallet" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveSettings("Wallet")}
                  disabled={loading}
                >
                  <FaSave className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingSection(null)}
                >
                  <FaTimes className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditingSection("wallet")}
              >
                <FaEdit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {editingSection === "wallet" ? (
              <div className="space-y-3">
                <Input
                  label="Minimum Top-Up Amount (GH₵)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={walletSettings.minimumTopUpAmount}
                  onChange={(e) =>
                    setWalletSettings((prev) => ({
                      ...prev,
                      minimumTopUpAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="10.00"
                />
                <p className="text-sm text-gray-600">
                  This is the minimum amount users can request for wallet
                  top-ups.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Top-Up Amount</span>
                  <span className="font-medium">
                    GH₵{walletSettings.minimumTopUpAmount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Product Management Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaBox className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Product & Service Management
            </h2>
          </div>
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
              <h3 className="font-medium text-gray-900">Telecel Bundles</h3>
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
              <h3 className="font-medium text-gray-900">AirtelTigo Bundles</h3>
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

      {/* Color Scheme */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FaPalette className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
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
                {systemInfoLoading ? "Loading..." : systemInfo.lastUpdated}
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
  );
}
