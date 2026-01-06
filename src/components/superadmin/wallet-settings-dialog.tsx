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

  const userTypes = [
    {
      key: "agent" as const,
      label: "Agent",
      icon: "👤",
      color: "bg-green-100",
    },
    {
      key: "super_agent" as const,
      label: "Super Agent",
      icon: "⭐",
      color: "bg-yellow-100",
    },
    {
      key: "dealer" as const,
      label: "Dealer",
      icon: "🏪",
      color: "bg-blue-100",
    },
    {
      key: "super_dealer" as const,
      label: "Super Dealer",
      icon: "👑",
      color: "bg-purple-100",
    },
    {
      key: "default" as const,
      label: "Default",
      icon: "⚙️",
      color: "bg-gray-100",
    },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            💰
          </span>
          Wallet Configuration
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">
                Minimum Top-up Amounts
              </h3>
              <p className="text-sm text-green-700">
                Set the minimum amounts users can top-up their wallets with for
                each user type.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTypes.map(({ key, label, icon, color }) => (
                <div
                  key={key}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{label}</h4>
                      <p className="text-sm text-gray-600">
                        Minimum top-up amount
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minimumTopUpAmounts[key]}
                      onChange={(e) => handleAmountChange(key, e.target.value)}
                      placeholder="0.00"
                      leftIcon={<span className="text-gray-500">₵</span>}
                    />
                  </FormField>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 mt-0.5">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-900">
                    Important Notes
                  </h4>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
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
