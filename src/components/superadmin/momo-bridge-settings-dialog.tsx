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
import { Smartphone, Eye, EyeOff, User, Phone } from "lucide-react";
import {
  settingsService,
  type MomoBridgeSettings,
} from "../../services/settings.service";

interface MomoBridgeSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: MomoBridgeSettings;
  onSuccess: (settings: MomoBridgeSettings) => void;
}

export const MomoBridgeSettingsDialog: React.FC<MomoBridgeSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<MomoBridgeSettings>(currentSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentSettings);
      setShowKey(false);
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await settingsService.updateMomoBridgeSettings(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update MoMo Bridge settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(currentSettings);
    setShowKey(false);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, #d4a843 15%, transparent)' }}>
            <Smartphone className="w-4 h-4" style={{ color: '#d4a843' }} />
          </span>
          MoMo Bridge Configuration
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">

            {/* Enable Toggle */}
            <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Enable MoMo Bridge
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Allow agents to credit wallets via mobile money verification
                  </p>
                </div>
                <Switch
                  checked={formData.momoBridgeEnabled}
                  onCheckedChange={(checked: boolean) =>
                    setFormData(prev => ({ ...prev, momoBridgeEnabled: checked }))
                  }
                />
              </div>
            </div>

            {/* API Key */}
            <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, #d4a843 15%, transparent)' }}>
                  <Smartphone className="w-4 h-4" style={{ color: '#d4a843' }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    MoMo Bridge API Key
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Merchant API key from the MoMo Bridge Android app
                  </p>
                </div>
              </div>
              <FormField>
                <Input
                  type={showKey ? "text" : "password"}
                  value={formData.momoBridgeApiKey}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      momoBridgeApiKey: e.target.value,
                    }))
                  }
                  placeholder="Enter MoMo Bridge API key"
                  className="font-mono"
                  rightIcon={
                    <button
                      type="button"
                      className="transition-colors focus:outline-none"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                      aria-label={showKey ? 'Hide API key' : 'Reveal API key'}
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </FormField>
            </div>

            {/* Relay URL */}
            <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
                  <Smartphone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Relay Server URL
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    The relay server that bridges the MoMo Bridge Android app and your backend
                  </p>
                </div>
              </div>
              <FormField>
                <Input
                  type="text"
                  value={formData.momoBridgeRelayUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      momoBridgeRelayUrl: e.target.value,
                    }))
                  }
                  placeholder="https://momobridge-relay.onrender.com"
                  className="font-mono text-sm"
                  disabled={!formData.momoBridgeEnabled}
                />
              </FormField>
            </div>

            {/* Claim Fee Percent */}
            <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 8%, transparent)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--warning)' }}>%</span>
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Platform Fee
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Percentage deducted from each MoMo Bridge claim (0-100). Set to 0 for no fee.
                  </p>
                </div>
              </div>
              <FormField>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={formData.momoBridgeClaimFeePercent}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        momoBridgeClaimFeePercent: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                    className="w-28 text-right font-mono"
                    disabled={!formData.momoBridgeEnabled}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>%</span>
                </div>
              </FormField>
              {formData.momoBridgeClaimFeePercent > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--warning)' }}>
                  Agents will be charged {formData.momoBridgeClaimFeePercent}% on each claim.
                </p>
              )}
            </div>

            {/* Account Details */}
            <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Account Details (Displayed in Widget)
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    The account name and number customers see when verifying payments
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <FormField>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Account Name
                  </label>
                  <Input
                    type="text"
                    value={formData.momoBridgeAccountName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        momoBridgeAccountName: e.target.value,
                      }))
                    }
                    placeholder="e.g. John's Store"
                    className="font-mono text-sm"
                    disabled={!formData.momoBridgeEnabled}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                </FormField>
                <FormField>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Account Number
                  </label>
                  <Input
                    type="text"
                    value={formData.momoBridgeAccountNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        momoBridgeAccountNumber: e.target.value,
                      }))
                    }
                    placeholder="e.g. 024 123 4567"
                    className="font-mono text-sm"
                    disabled={!formData.momoBridgeEnabled}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                </FormField>
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
            disabled={isLoading}
            isLoading={isLoading}
            style={{ backgroundColor: '#d4a843', borderColor: '#d4a843', color: '#0a0e1a' }}
          >
            {isLoading ? "Saving..." : "Save MoMo Bridge Settings"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
