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
    paystackTestSecret: false,
    paystackLiveSecret: false,
  });

  useEffect(() => {
    if (isOpen) {
      // In production we DO NOT receive secret values from the backend — clear inputs so
      // the dialog only sends secret fields when admin provides a new value.
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
      // Do not send secret fields back to the server in production when left blank.
      const payload: Partial<ApiSettings> = { ...formData };
      if (!import.meta.env.DEV) {
        if (!payload.paystackTestSecretKey) delete payload.paystackTestSecretKey;
        if (!payload.paystackLiveSecretKey) delete payload.paystackLiveSecretKey;
      }

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
    setShowKeys({ mtn: false, telecel: false, airtelTigo: false, paystackTestSecret: false, paystackLiveSecret: false });
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          iconOnly
                          aria-label={showKeys.mtn ? 'Hide MTN key' : 'Reveal MTN key'}
                          onClick={() => toggleKeyVisibility('mtn')}
                        >
                          {showKeys.mtn ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          iconOnly
                          aria-label={showKeys.telecel ? 'Hide Telecel key' : 'Reveal Telecel key'}
                          onClick={() => toggleKeyVisibility('telecel')}
                        >
                          {showKeys.telecel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          iconOnly
                          aria-label={showKeys.airtelTigo ? 'Hide AirtelTigo key' : 'Reveal AirtelTigo key'}
                          onClick={() => toggleKeyVisibility('airtelTigo')}
                        >
                          {showKeys.airtelTigo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
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
                    <span className="text-sm text-gray-700">Enable Paystack</span>
                  </div>

                  <FormField label="Test Secret Key">
                    <Input
                      type={showKeys.paystackTestSecret ? 'text' : 'password'}
                      value={formData.paystackTestSecretKey || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, paystackTestSecretKey: e.target.value }))}
                      placeholder={import.meta.env.DEV ? "sk_test_..." : (currentSettings.paystackTestSecretExists ? "(stored on server)" : "sk_test_...")}
                      className="font-mono"
                      rightIcon={
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          iconOnly
                          aria-label={showKeys.paystackTestSecret ? 'Hide test secret' : 'Reveal test secret'}
                          onClick={() => setShowKeys(prev => ({ ...prev, paystackTestSecret: !prev.paystackTestSecret }))}
                        >
                          {showKeys.paystackTestSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      }
                    />
                    {!import.meta.env.DEV && currentSettings.paystackTestSecretExists && (
                      <div className="text-xs text-gray-500 mt-2">Secret stored on server — leave blank to keep existing value or enter a new key to replace.</div>
                    )}
                  </FormField>

                  <FormField label="Live Public Key (optional)">
                    <Input
                      value={formData.paystackLivePublicKey || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, paystackLivePublicKey: e.target.value }))}
                      placeholder="pk_live_..."
                      className="font-mono"
                    />
                  </FormField>

                  <FormField label="Live Secret Key (optional)">
                    <Input
                      type={showKeys.paystackLiveSecret ? 'text' : 'password'}
                      value={formData.paystackLiveSecretKey || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, paystackLiveSecretKey: e.target.value }))}
                      placeholder={import.meta.env.DEV ? "sk_live_..." : (currentSettings.paystackLiveSecretExists ? "(stored on server)" : "sk_live_...")}
                      className="font-mono"
                      rightIcon={
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          iconOnly
                          aria-label={showKeys.paystackLiveSecret ? 'Hide live secret' : 'Reveal live secret'}
                          onClick={() => setShowKeys(prev => ({ ...prev, paystackLiveSecret: !prev.paystackLiveSecret }))}
                        >
                          {showKeys.paystackLiveSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      }
                    />
                    {!import.meta.env.DEV && currentSettings.paystackLiveSecretExists && (
                      <div className="text-xs text-gray-500 mt-2">Secret stored on server — leave blank to keep existing value or enter a new key to replace.</div>
                    )}
                  </FormField>
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
