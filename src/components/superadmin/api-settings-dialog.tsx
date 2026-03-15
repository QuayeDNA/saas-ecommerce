import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  Input,
  Button,
  FormField,
  Switch,
} from "../../design-system";
import { Key, Smartphone, CreditCard, Eye, EyeOff } from "lucide-react";
import { Badge } from "../../design-system/components/badge";
import {
  settingsService,
  type ApiSettings,
} from "../../services/settings.service";

interface ApiSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ApiSettings;
  onSuccess: (settings: ApiSettings) => void;
}

export const ApiSettingsDialog: React.FC<ApiSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ApiSettings>(currentSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeys, setShowKeys] = useState({
    mtn: false,
    telecel: false,
    airtelTigo: false,
  });

  const formatMasked = (val?: string) => {
    if (!val) return "Not configured";
    if (val.length <= 10) return "••••••••";
    return `${val.slice(0, 6)}…${val.slice(-4)}`;
  };

  useEffect(() => {
    if (isOpen) {
      // In production the test key field is hidden; clear it so it is never sent.
      // For the live secret, clear it so the field only submits when the admin enters a new value.
      const clearedSecrets = { ...currentSettings } as ApiSettings;
      if (!import.meta.env.DEV) {
        clearedSecrets.paystackTestSecretKey = "";
        clearedSecrets.paystackLiveSecretKey = "";
      }
      setFormData(clearedSecrets);
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Keys are managed via environment variables; do not send them to the backend.
      const payload: Partial<ApiSettings> = { ...formData };
      delete payload.paystackTestPublicKey;
      delete payload.paystackTestSecretKey;
      delete payload.paystackLivePublicKey;
      delete payload.paystackLiveSecretKey;

      const result = await settingsService.updateApiSettings(payload as ApiSettings);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update API settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(currentSettings);
    setShowKeys({ mtn: false, telecel: false, airtelTigo: false });
    onClose();
  };

  const toggleKeyVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="xl">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Key className="w-4 h-4 text-orange-600" />
          </span>
          API Configuration
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">API Endpoint</h3>
              <Input
                value={formData.apiEndpoint}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    apiEndpoint: e.target.value,
                  }))
                }
                placeholder="https://api.telecomsaas.com"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Provider API Keys</h3>

              <div className="grid grid-cols-1 gap-4">
                {/* MTN API Key */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">MTN API Key</h4>
                      <p className="text-sm text-gray-600">
                        For MTN data services
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type={showKeys.mtn ? "text" : "password"}
                      value={formData.mtnApiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mtnApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter MTN API key"
                      className="font-mono"
                      rightIcon={
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          aria-label={showKeys.mtn ? 'Hide MTN key' : 'Reveal MTN key'}
                          onClick={() => toggleKeyVisibility('mtn')}
                        >
                          {showKeys.mtn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </FormField>
                </div>

                {/* Telecel API Key */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Telecel API Key
                      </h4>
                      <p className="text-sm text-gray-600">
                        For Telecel data services
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type={showKeys.telecel ? "text" : "password"}
                      value={formData.telecelApiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          telecelApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter Telecel API key"
                      className="font-mono"
                      rightIcon={
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          aria-label={showKeys.telecel ? 'Hide Telecel key' : 'Reveal Telecel key'}
                          onClick={() => toggleKeyVisibility('telecel')}
                        >
                          {showKeys.telecel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </FormField>
                </div>

                {/* AirtelTigo API Key */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        AirtelTigo API Key
                      </h4>
                      <p className="text-sm text-gray-600">
                        For AirtelTigo data services
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type={showKeys.airtelTigo ? "text" : "password"}
                      value={formData.airtelTigoApiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          airtelTigoApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter AirtelTigo API key"
                      className="font-mono"
                      rightIcon={
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          aria-label={showKeys.airtelTigo ? 'Hide AirtelTigo key' : 'Reveal AirtelTigo key'}
                          onClick={() => toggleKeyVisibility('airtelTigo')}
                        >
                          {showKeys.airtelTigo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Paystack (Payment Gateway)</h3>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><CreditCard className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Paystack</h4>
                    <p className="text-sm text-gray-600">Enable Paystack and configure test/live keys</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.paystackEnabled || false}
                      onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, paystackEnabled: checked }))}
                    />
                    <span className="text-sm text-gray-700">Enable Paystack (global)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.paystackWalletTopUpEnabled || false}
                      onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, paystackWalletTopUpEnabled: checked }))}
                      isDisabled={!formData.paystackEnabled}
                    />
                    <span className={`text-sm ${formData.paystackEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                      Allow Paystack for wallet top-ups
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.paystackStorefrontEnabled || false}
                      onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, paystackStorefrontEnabled: checked }))}
                      isDisabled={!formData.paystackEnabled}
                    />
                    <span className={`text-sm ${formData.paystackEnabled ? 'text-gray-700' : 'text-gray-400'}`}>
                      Allow Paystack for storefront orders
                    </span>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-900">Paystack key configuration</div>
                    <div className="text-xs text-yellow-700 mt-1">
                      Paystack keys are loaded from environment variables on the server. To change keys, update your environment (e.g. <code>.env</code>) and restart the backend.
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded border">
                        <div className="text-xs text-gray-500">Live public key</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{formData.paystackLivePublicKey ? formatMasked(formData.paystackLivePublicKey) : 'Not configured'}</div>
                          <Badge colorScheme={formData.paystackLivePublicKey ? 'success' : 'error'}>{formData.paystackLivePublicKey ? 'Configured' : 'Missing'}</Badge>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded border">
                        <div className="text-xs text-gray-500">Live secret key</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <div className="text-sm text-gray-700">{currentSettings.paystackLiveSecretExists ? 'Configured' : 'Missing'}</div>
                          <Badge colorScheme={currentSettings.paystackLiveSecretExists ? 'success' : 'error'}>{currentSettings.paystackLiveSecretExists ? 'Configured' : 'Missing'}</Badge>
                        </div>
                      </div>

                      {import.meta.env.DEV && (
                        <>
                          <div className="p-3 bg-white rounded border">
                            <div className="text-xs text-gray-500">Test public key</div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{formData.paystackTestPublicKey ? formatMasked(formData.paystackTestPublicKey) : 'Not configured'}</div>
                              <Badge colorScheme={formData.paystackTestPublicKey ? 'success' : 'error'}>{formData.paystackTestPublicKey ? 'Configured' : 'Missing'}</Badge>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded border">
                            <div className="text-xs text-gray-500">Test secret key</div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="text-sm text-gray-700">{currentSettings.paystackTestSecretExists ? 'Configured' : 'Missing'}</div>
                              <Badge colorScheme={currentSettings.paystackTestSecretExists ? 'success' : 'error'}>{currentSettings.paystackTestSecretExists ? 'Configured' : 'Missing'}</Badge>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="blue"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Saving..." : "Save API Settings"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
