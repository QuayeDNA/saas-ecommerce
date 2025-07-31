import { useState } from "react";
import { 
  FaPowerOff, 
  FaUserShield, 
  FaPercentage, 
  FaEdit,
  FaSave,
  FaTimes,
  FaStore,
  FaUser,
  FaDatabase,
  FaKey,
  FaGlobe,
  FaCheck,
  FaBox,
  FaMobile,
  FaInfoCircle
} from "react-icons/fa";
import { Button } from "../../design-system/components/button";
import { Card } from "../../design-system/components/card";
import { Input } from "../../design-system/components/input";
import { Badge } from "../../design-system/components/badge";
import { settingsService, type SiteSettings, type CommissionRates, type ApiSettings } from "../../services/settings.service";
import { Alert } from "../../design-system/components/alert";


export default function SuperAdminSettingsPage() {
  // Site Management
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    isSiteOpen: true,
    customMessage: "We're currently performing maintenance. Please check back later."
  });

  // Commission Rates
  const [commissionRates, setCommissionRates] = useState<CommissionRates>({
    agentCommission: 5.0,
    customerCommission: 2.5
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    mtnApiKey: "",
    telecelApiKey: "",
    airtelTigoApiKey: "",
    apiEndpoint: "https://api.telecomsaas.com"
  });

  // Form States
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Password Reset
  const [passwordReset, setPasswordReset] = useState({
    userId: "",
    newPassword: "",
    confirmPassword: ""
  });

  // User Role Management
  const [userRole, setUserRole] = useState({
    userId: "",
    newRole: "customer"
  });

  // Admin Password Change
  const [adminPassword, setAdminPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSiteToggle = async () => {
    setLoading(true);
    try {
      const result = await settingsService.toggleSiteStatus();
      setSiteSettings(prev => ({ ...prev, isSiteOpen: result.isSiteOpen }));
      setMessage({ type: 'success', text: `Site ${result.isSiteOpen ? 'opened' : 'closed'} successfully` });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update site status' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      switch (section) {
        case 'Site':
          await settingsService.updateSiteSettings(siteSettings);
          break;
        case 'Commission':
          await settingsService.updateCommissionRates(commissionRates);
          break;
        case 'API':
          await settingsService.updateApiSettings(apiSettings);
          break;
      }
      setMessage({ type: 'success', text: `${section} settings saved successfully` });
      setEditingSection(null);
    } catch {
      setMessage({ type: 'error', text: `Failed to save ${section} settings` });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (passwordReset.newPassword !== passwordReset.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      await settingsService.resetUserPassword({
        userId: passwordReset.userId,
        newPassword: passwordReset.newPassword
      });
      setMessage({ type: 'success', text: 'Password reset successfully' });
      setPasswordReset({ userId: "", newPassword: "", confirmPassword: "" });
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    setLoading(true);
    try {
      await settingsService.changeUserRole({
        userId: userRole.userId,
        newRole: userRole.newRole as 'customer' | 'agent' | 'admin' | 'super_admin'
      });
      setMessage({ type: 'success', text: 'User role updated successfully' });
      setUserRole({ userId: "", newRole: "customer" });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update user role' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPasswordChange = async () => {
    if (adminPassword.newPassword !== adminPassword.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setLoading(true);
    try {
      await settingsService.changeAdminPassword({
        currentPassword: adminPassword.currentPassword,
        newPassword: adminPassword.newPassword
      });
      setMessage({ type: 'success', text: 'Admin password changed successfully' });
      setAdminPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setMessage({ type: 'error', text: 'Failed to change admin password' });
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
          <p className="text-gray-600 mt-1">Manage site configuration, user permissions, and system preferences</p>
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
          status={message.type === 'success' ? 'success' : message.type === 'error' ? 'error' : 'info'}
          onClose={clearMessage}
          title={message.type === 'success' ? 'Success' : message.type === 'error' ? 'Error' : 'Info'}
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
              <h2 className="text-lg font-semibold text-gray-900">Site Management</h2>
            </div>
            {editingSection === 'site' ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveSettings('Site')}
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
                onClick={() => setEditingSection('site')}
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
                  {siteSettings.isSiteOpen ? 'Site is currently open to users' : 'Site is currently closed to users'}
                </p>
              </div>
              <Button
                variant={siteSettings.isSiteOpen ? "danger" : "primary"}
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
            {editingSection === 'site' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Message (when site is closed)
                </label>
                <textarea
                  value={siteSettings.customMessage}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, customMessage: e.target.value }))}
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
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Password Reset */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Reset User Password</h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="User ID"
                  value={passwordReset.userId}
                  onChange={(e) => setPasswordReset(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user ID"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordReset.newPassword}
                  onChange={(e) => setPasswordReset(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={passwordReset.confirmPassword}
                  onChange={(e) => setPasswordReset(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  variant="primary"
                  onClick={handlePasswordReset}
                  disabled={loading || !passwordReset.userId || !passwordReset.newPassword}
                >
                  <FaKey className="w-3 h-3 mr-1" />
                  Reset Password
                </Button>
              </div>
            </div>

            {/* Role Management */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900">Change User Role</h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="User ID"
                  value={userRole.userId}
                  onChange={(e) => setUserRole(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Enter user ID"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Role
                  </label>
                  <select
                    value={userRole.newRole}
                    onChange={(e) => setUserRole(prev => ({ ...prev, newRole: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  onClick={handleRoleChange}
                  disabled={loading || !userRole.userId}
                >
                  <FaUserShield className="w-3 h-3 mr-1" />
                  Update Role
                </Button>
              </div>
            </div>

            {/* Admin Password Change */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900">Change Admin Password</h3>
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Current Password"
                  type="password"
                  value={adminPassword.currentPassword}
                  onChange={(e) => setAdminPassword(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={adminPassword.newPassword}
                  onChange={(e) => setAdminPassword(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={adminPassword.confirmPassword}
                  onChange={(e) => setAdminPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  variant="primary"
                  onClick={handleAdminPasswordChange}
                  disabled={loading || !adminPassword.currentPassword || !adminPassword.newPassword}
                >
                  <FaKey className="w-3 h-3 mr-1" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Commission Rates */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaPercentage className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Commission Rates</h2>
            </div>
            {editingSection === 'commission' ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveSettings('Commission')}
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
                onClick={() => setEditingSection('commission')}
              >
                <FaEdit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaStore className="text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Agent Commission</h3>
                    <p className="text-sm text-gray-600">Percentage earned by agents</p>
                  </div>
                </div>
                {editingSection === 'commission' ? (
                  <Input
                    type="number"
                    value={commissionRates.agentCommission}
                    onChange={(e) => setCommissionRates(prev => ({ 
                      ...prev, 
                      agentCommission: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-24"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                ) : (
                  <span className="text-lg font-semibold text-blue-600">
                    {commissionRates.agentCommission}%
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaUser className="text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Customer Commission</h3>
                    <p className="text-sm text-gray-600">Percentage earned by customers</p>
                  </div>
                </div>
                {editingSection === 'commission' ? (
                  <Input
                    type="number"
                    value={commissionRates.customerCommission}
                    onChange={(e) => setCommissionRates(prev => ({ 
                      ...prev, 
                      customerCommission: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-24"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                ) : (
                  <span className="text-lg font-semibold text-green-600">
                    {commissionRates.customerCommission}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* API Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaDatabase className="text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">API Settings</h2>
            </div>
            {editingSection === 'api' ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveSettings('API')}
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
                onClick={() => setEditingSection('api')}
              >
                <FaEdit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {editingSection === 'api' ? (
              <div className="space-y-3">
                <Input
                  label="MTN API Key"
                  type="password"
                  value={apiSettings.mtnApiKey}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, mtnApiKey: e.target.value }))}
                  placeholder="Enter MTN API key"
                />
                <Input
                  label="Telecel API Key"
                  type="password"
                  value={apiSettings.telecelApiKey}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, telecelApiKey: e.target.value }))}
                  placeholder="Enter Telecel API key"
                />
                <Input
                  label="AirtelTigo API Key"
                  type="password"
                  value={apiSettings.airtelTigoApiKey}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, airtelTigoApiKey: e.target.value }))}
                  placeholder="Enter AirtelTigo API key"
                />
                <Input
                  label="API Endpoint"
                  value={apiSettings.apiEndpoint}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                  placeholder="https://api.telecomsaas.com"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">MTN API</h3>
                    <p className="text-sm text-gray-600">
                      {apiSettings.mtnApiKey ? 'Configured' : 'Not configured'}
                    </p>
                  </div>
                                    <Badge colorScheme={apiSettings.mtnApiKey ? "success" : "error"}>
                    {apiSettings.mtnApiKey ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Telecel API</h3>
                    <p className="text-sm text-gray-600">
                      {apiSettings.telecelApiKey ? 'Configured' : 'Not configured'}
                    </p>
                  </div>
                  <Badge colorScheme={apiSettings.telecelApiKey ? "success" : "error"}>
                    {apiSettings.telecelApiKey ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">AirtelTigo API</h3>
                    <p className="text-sm text-gray-600">
                      {apiSettings.airtelTigoApiKey ? 'Configured' : 'Not configured'}
                    </p>
                  </div>
                  <Badge colorScheme={apiSettings.airtelTigoApiKey ? "success" : "error"}>
                    {apiSettings.airtelTigoApiKey ? 'Active' : 'Inactive'}
                  </Badge>
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
            <h2 className="text-lg font-semibold text-gray-900">Product & Service Management</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FaMobile className="text-yellow-600" />
              <h3 className="font-medium text-gray-900">MTN Bundles</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Manage MTN data bundles and pricing</p>
            <Button variant="secondary" size="sm">
              <FaEdit className="w-3 h-3 mr-1" />
              Manage Bundles
            </Button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FaMobile className="text-blue-600" />
              <h3 className="font-medium text-gray-900">Telecel Bundles</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Manage Telecel data bundles and pricing</p>
            <Button variant="secondary" size="sm">
              <FaEdit className="w-3 h-3 mr-1" />
              Manage Bundles
            </Button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <FaMobile className="text-red-600" />
              <h3 className="font-medium text-gray-900">AirtelTigo Bundles</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Manage AirtelTigo data bundles and pricing</p>
            <Button variant="secondary" size="sm">
              <FaEdit className="w-3 h-3 mr-1" />
              Manage Bundles
            </Button>
          </div>
        </div>
      </Card>

      {/* System Information */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FaInfoCircle className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">System Version</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">2024-01-15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database Status</span>
              <Badge colorScheme="success">Connected</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">API Status</span>
              <Badge colorScheme="success">Healthy</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Status</span>
              <Badge colorScheme="success">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SSL Certificate</span>
              <Badge colorScheme="success">Valid</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 