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
    setShowKeys({ telecel: false, airtelTigo: false });
    onClose();
  };

  const toggleKeyVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="xl">
      <DialogHeader>
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 10%, transparent)' }}>
            <Key className="w-4 h-4" style={{ color: 'var(--warning)' }} />
          </span>
          API Configuration
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <h3 className="font-medium mb-2" style={{ color: 'var(--color-primary)' }}>API Endpoint</h3>
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
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Provider API Keys</h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Telecel API Key */}
                <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Telecel API Key
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                          className="transition-colors focus:outline-none"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
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
                <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        AirtelTigo API Key
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                          className="transition-colors focus:outline-none"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
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
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Paystack (Payment Gateway)</h3>

              <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)' }}><CreditCard className="w-4 h-4" style={{ color: 'var(--success)' }} /></div>
                  <div>
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Paystack</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enable Paystack and configure test/live keys</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.paystackEnabled || false}
                      onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, paystackEnabled: checked }))}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Enable Paystack (global)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.paystackWalletTopUpEnabled || false}
                      onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, paystackWalletTopUpEnabled: checked }))}
                      isDisabled={!formData.paystackEnabled}
                    />
                    <span className="text-sm" style={{ color: formData.paystackEnabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      Allow Paystack for wallet top-ups
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.paystackStorefrontEnabled || false}
                      onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, paystackStorefrontEnabled: checked }))}
                      isDisabled={!formData.paystackEnabled}
                    />
                    <span className="text-sm" style={{ color: formData.paystackEnabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      Allow Paystack for storefront orders
                    </span>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 5%, transparent)' }}>
                    <div className="font-medium" style={{ color: 'var(--warning)' }}>Paystack key configuration</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--warning)' }}>
                      Paystack keys are loaded from environment variables on the server. To change keys, update your environment (e.g. <code>.env</code>) and restart the backend.
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live public key</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{formData.paystackLivePublicKey ? formatMasked(formData.paystackLivePublicKey) : 'Not configured'}</div>
                          <Badge colorScheme={formData.paystackLivePublicKey ? 'success' : 'error'}>{formData.paystackLivePublicKey ? 'Configured' : 'Missing'}</Badge>
                        </div>
                      </div>

                      <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live secret key</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{currentSettings.paystackLiveSecretExists ? 'Configured' : 'Missing'}</div>
                          <Badge colorScheme={currentSettings.paystackLiveSecretExists ? 'success' : 'error'}>{currentSettings.paystackLiveSecretExists ? 'Configured' : 'Missing'}</Badge>
                        </div>
                      </div>

                      {import.meta.env.DEV && (
                        <>
                          <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Test public key</div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto">{formData.paystackTestPublicKey ? formatMasked(formData.paystackTestPublicKey) : 'Not configured'}</div>
                              <Badge colorScheme={formData.paystackTestPublicKey ? 'success' : 'error'}>{formData.paystackTestPublicKey ? 'Configured' : 'Missing'}</Badge>
                            </div>
                          </div>

                          <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Test secret key</div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{currentSettings.paystackTestSecretExists ? 'Configured' : 'Missing'}</div>
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
