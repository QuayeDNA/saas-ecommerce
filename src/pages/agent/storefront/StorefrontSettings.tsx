// src/pages/agent/storefront/StorefrontSettings.tsx
import React, { useState } from "react";
import { Card } from "../../../design-system/components/card";
import { Button } from "../../../design-system/components/button";
import { Input } from "../../../design-system/components/input";
import { Textarea } from "../../../design-system/components/textarea";
import { Switch } from "../../../design-system/components/switch";
import { useToast } from "../../../design-system";
import {
  Settings,
  Palette,
  Save,
  Eye,
  Globe,
  Phone,
  Shield,
  Clock,
} from "lucide-react";
import { useStorefront } from "../../../hooks/useStorefront";
import { storefrontService } from "../../../services/storefront.service";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

const PRESET_THEMES = [
  {
    name: "Default",
    colors: { primary: "#3B82F6", secondary: "#64748B", accent: "#10B981" },
  },
  {
    name: "Ocean",
    colors: { primary: "#0EA5E9", secondary: "#64748B", accent: "#06B6D4" },
  },
  {
    name: "Forest",
    colors: { primary: "#059669", secondary: "#64748B", accent: "#10B981" },
  },
  {
    name: "Sunset",
    colors: { primary: "#DC2626", secondary: "#64748B", accent: "#F59E0B" },
  },
  {
    name: "Purple",
    colors: { primary: "#7C3AED", secondary: "#64748B", accent: "#A855F7" },
  },
];

export default function StorefrontSettings() {
  const { storefront, updateStorefront } = useStorefront();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [basicInfo, setBasicInfo] = useState({
    displayName: storefront?.displayName || "",
    description: storefront?.description || "",
  });

  const [theme, setTheme] = useState<ThemeColors>({
    primary: storefront?.theme?.primaryColor || "#3B82F6",
    secondary: storefront?.theme?.secondaryColor || "#64748B",
    accent: storefront?.theme?.primaryColor || "#10B981", // Using primary as accent fallback
  });

  const [contactInfo, setContactInfo] = useState({
    phone: storefront?.settings?.contactInfo?.phone || "",
    email: storefront?.settings?.contactInfo?.email || "",
    whatsapp: storefront?.settings?.contactInfo?.whatsapp || "",
  });

  const [settings, setSettings] = useState({
    autoFulfill: storefront?.settings?.autoFulfill || false,
    orderNotifications: storefront?.settings?.orderNotifications ?? true,
    isPublic: storefront?.isPublic !== false, // Default to true
  });

  const [security, setSecurity] = useState({
    rateLimitWindow: storefront?.security?.rateLimitWindow || 15, // minutes
    maxOrdersPerWindow: storefront?.security?.maxOrdersPerWindow || 10,
  });

  const handleSave = async () => {
    if (!storefront?._id) return;

    try {
      setSaving(true);

      const updateData = {
        displayName: basicInfo.displayName,
        description: basicInfo.description,
        theme: {
          primaryColor: theme.primary,
          secondaryColor: theme.secondary,
        },
        settings: {
          ...settings,
          contactInfo,
        },
        security,
        isPublic: settings.isPublic,
      };

      await storefrontService.updateStorefront(storefront._id, updateData);
      await updateStorefront(storefront._id, {}); // Refresh storefront data

      showToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const applyPresetTheme = (preset: (typeof PRESET_THEMES)[0]) => {
    setTheme(preset.colors);
  };

  const getPreviewStyles = () => {
    if (!previewMode) return {};

    return {
      "--preview-primary": theme.primary,
      "--preview-secondary": theme.secondary,
      "--preview-accent": theme.accent,
    } as React.CSSProperties;
  };

  return (
    <div className="space-y-6" style={getPreviewStyles()}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Storefront Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Customize your storefront appearance and configure advanced options.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Exit Preview" : "Preview Theme"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {previewMode && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center text-blue-800">
            <Eye className="w-5 h-5 mr-2" />
            <span className="font-medium">Preview Mode Active</span>
            <span className="ml-2 text-sm">Changes are not saved yet</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                value={basicInfo.displayName}
                onChange={(e) =>
                  setBasicInfo((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Your Storefront Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={basicInfo.description}
                onChange={(e) =>
                  setBasicInfo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your storefront..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Visibility
                </label>
                <p className="text-xs text-gray-500">
                  Make your storefront visible to customers
                </p>
              </div>
              <Switch
                checked={settings.isPublic}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, isPublic: checked }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Theme Customization */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Theme Customization
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preset Themes
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_THEMES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPresetTheme(preset)}
                    className="p-2 border rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex space-x-1 mb-1">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.primary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.secondary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.colors.accent }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.primary}
                    onChange={(e) =>
                      setTheme((prev) => ({ ...prev, primary: e.target.value }))
                    }
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={theme.primary}
                    onChange={(e) =>
                      setTheme((prev) => ({ ...prev, primary: e.target.value }))
                    }
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.secondary}
                    onChange={(e) =>
                      setTheme((prev) => ({
                        ...prev,
                        secondary: e.target.value,
                      }))
                    }
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={theme.secondary}
                    onChange={(e) =>
                      setTheme((prev) => ({
                        ...prev,
                        secondary: e.target.value,
                      }))
                    }
                    placeholder="#64748B"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Phone className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                value={contactInfo.phone}
                onChange={(e) =>
                  setContactInfo((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+233 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) =>
                  setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <Input
                value={contactInfo.whatsapp}
                onChange={(e) =>
                  setContactInfo((prev) => ({
                    ...prev,
                    whatsapp: e.target.value,
                  }))
                }
                placeholder="+233 XX XXX XXXX"
              />
            </div>
          </div>
        </Card>

        {/* Advanced Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Advanced Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto Fulfill Orders
                </label>
                <p className="text-xs text-gray-500">
                  Automatically process orders after payment verification
                </p>
              </div>
              <Switch
                checked={settings.autoFulfill}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, autoFulfill: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notifications
                </label>
                <p className="text-xs text-gray-500">
                  Receive notifications for new orders
                </p>
              </div>
              <Switch
                checked={settings.orderNotifications}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    orderNotifications: checked,
                  }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Security & Rate Limiting
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Limit Window (minutes)
              </label>
              <Input
                type="number"
                min="1"
                max="60"
                value={security.rateLimitWindow}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    rateLimitWindow: parseInt(e.target.value) || 15,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Time window for rate limiting
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Orders per Window
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={security.maxOrdersPerWindow}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    maxOrdersPerWindow: parseInt(e.target.value) || 10,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum orders allowed in the time window
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                These settings help prevent abuse and ensure fair usage of your
                storefront.
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? "Saving Settings..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
