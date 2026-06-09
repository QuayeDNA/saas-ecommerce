import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  FormField,
  Input,
  Button,
} from "../../design-system";
import {
  settingsService,
  type WalletSettings,
} from "../../services/settings.service";
import {
  BUSINESS_USER_TYPES,
  USER_TYPE_LABELS,
} from "../../utils/userTypeHelpers";

interface WalletSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: WalletSettings;
  onSuccess: (settings: WalletSettings) => void;
}

export const WalletSettingsDialog: React.FC<WalletSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<WalletSettings>(currentSettings);

  // ensure the new field exists when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...currentSettings,
        paystackMinimumTopUpAmount: currentSettings.paystackMinimumTopUpAmount || 0,
      });
    }
  }, [isOpen, currentSettings]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentSettings);
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await settingsService.updateWalletSettings(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update wallet settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(currentSettings);
    onClose();
  };

  const handleAmountChange = (
    userType: keyof WalletSettings["minimumTopUpAmounts"],
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      minimumTopUpAmounts: {
        ...prev.minimumTopUpAmounts,
        [userType]: numValue,
      },
    }));
  };

  const userTypeMeta: Record<string, { icon: string; accentVar: string }> = {
    agent: { icon: "👤", accentVar: "--success" },
    super_agent: { icon: "⭐", accentVar: "--warning" },
    dealer: { icon: "🏪", accentVar: "--color-primary" },
    super_dealer: { icon: "👑", accentVar: "--color-secondary" },
    elite_dealer: { icon: "💎", accentVar: "--color-secondary" },
    master_dealer: { icon: "🏆", accentVar: "--error" },
  };

  const userTypes = [
    ...BUSINESS_USER_TYPES.map((type) => ({
      key: type,
      label: USER_TYPE_LABELS[type],
      icon: userTypeMeta[type]?.icon ?? "👤",
      accentVar: userTypeMeta[type]?.accentVar ?? "--text-muted",
    })),
    {
      key: "default",
      label: "Default",
      icon: "⚙️",
      accentVar: "--text-muted",
    },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)' }}>
            💰
          </span>
          Wallet Configuration
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 5%, transparent)' }}>
              <h3 className="font-medium mb-2" style={{ color: 'var(--success)' }}>
                Minimum Top-up Amounts
              </h3>
              <p className="text-sm" style={{ color: 'var(--success)' }}>
                Set the minimum amounts users can top-up their wallets with for
                each user type.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <h3 className="font-medium mb-2" style={{ color: 'var(--color-primary)' }}>
                Paystack Minimum
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--color-primary)' }}>
                Global minimum amount (GH₵) that applies when customers top up
                instantly via Paystack. Leave zero to disable.
              </p>
              <FormField>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paystackMinimumTopUpAmount}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      paystackMinimumTopUpAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  leftIcon={<span style={{ color: 'var(--text-secondary)' }}>₵</span>}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTypes.map(({ key, label, icon, accentVar }) => {
                const amountKey = key as keyof typeof formData.minimumTopUpAmounts;
                return (
                <div
                  key={key}
                  className="p-4 border rounded-lg"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `color-mix(in srgb, var(${accentVar}) 10%, transparent)` }}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Minimum top-up amount
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumTopUpAmounts[amountKey]}
                      onChange={(e) => handleAmountChange(amountKey, e.target.value)}
                      placeholder="0.00"
                      leftIcon={<span style={{ color: 'var(--text-secondary)' }}>₵</span>}
                    />
                  </FormField>
                </div>
              );
              })}
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 5%, transparent)' }}>
              <div className="flex items-start gap-3">
                <span style={{ color: 'var(--warning)' }}>⚠️</span>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--warning)' }}>
                    Important Notes
                  </h4>
                  <ul className="text-sm mt-1 space-y-1" style={{ color: 'var(--warning)' }}>
                    <li>
                      • Changes will take effect immediately for new top-up
                      requests
                    </li>
                    <li>• Existing pending top-ups will not be affected</li>
                    <li>• Set amounts to 0 to disable minimum requirements</li>
                  </ul>
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
            color="green"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Saving..." : "Save Wallet Settings"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
