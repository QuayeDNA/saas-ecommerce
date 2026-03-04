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
  Select,
} from "../../design-system";
import {
  settingsService,
  type FeeSettings,
} from "../../services/settings.service";

interface FeeSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FeeSettings | null;
  onSuccess: (settings: FeeSettings) => void;
}

const DEFAULT_FEE_SETTINGS: FeeSettings = {
  paystackCollectionFeePercent: 1.95,
  platformFeePercent: 0,
  delegateFeesToCustomer: true,
  paystackTransferFees: {
    mobile_money: 1.0,
    bank_account: 8.0,
  },
  payoutFeeBearer: "agent",
};

export const FeeSettingsDialog: React.FC<FeeSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FeeSettings>(
    currentSettings || DEFAULT_FEE_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentSettings) {
        setFormData(currentSettings);
      } else {
        // Load from server
        setLoadingSettings(true);
        settingsService
          .getFeeSettings()
          .then((data) => setFormData(data))
          .catch(() => setFormData(DEFAULT_FEE_SETTINGS))
          .finally(() => setLoadingSettings(false));
      }
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await settingsService.updateFeeSettings(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update fee settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(currentSettings || DEFAULT_FEE_SETTINGS);
    onClose();
  };

  // Preview calculation
  const totalFeePercent =
    formData.paystackCollectionFeePercent + formData.platformFeePercent;
  const sampleBase = 100; // GH₵ 100 sample
  const sampleCharge = formData.delegateFeesToCustomer
    ? sampleBase / (1 - totalFeePercent / 100)
    : sampleBase;
  const sampleFee = sampleCharge - sampleBase;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            💳
          </span>
          Fee & Payout Configuration
        </h2>
      </DialogHeader>

      {loadingSettings ? (
        <DialogBody>
          <div className="py-8 text-center text-gray-500">
            Loading fee settings…
          </div>
        </DialogBody>
      ) : (
        <Form onSubmit={handleSubmit}>
          <DialogBody>
            <div className="space-y-6">
              {/* ── Collection Fees Section ─────────────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Storefront Collection Fees
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Paystack fee (%)"
                      helperText="Paystack's collection fee — currently 1.95% in Ghana"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={String(formData.paystackCollectionFeePercent)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paystackCollectionFeePercent:
                              parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </FormField>

                    <FormField
                      label="Platform fee (%)"
                      helperText="Your additional platform fee on top of Paystack"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={String(formData.platformFeePercent)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            platformFeePercent:
                              parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </FormField>
                  </div>

                  <FormField label="Fee delegation">
                    <Select
                      value={formData.delegateFeesToCustomer ? "true" : "false"}
                      onChange={(v: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          delegateFeesToCustomer: v === "true",
                        }))
                      }
                      options={[
                        {
                          value: "true",
                          label:
                            "Customer pays fees (price adjusted upward)",
                        },
                        {
                          value: "false",
                          label:
                            "Platform absorbs fees (fees deducted from revenue)",
                        },
                      ]}
                    />
                  </FormField>

                  {/* Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm border border-blue-200 dark:border-blue-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                      Fee Preview (on GH₵ {sampleBase.toFixed(2)} order)
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500">
                          Total fee %
                        </div>
                        <div className="font-bold text-blue-600">
                          {totalFeePercent.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Customer pays
                        </div>
                        <div className="font-bold">
                          GH₵ {sampleCharge.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Fee amount
                        </div>
                        <div className="font-bold text-orange-600">
                          GH₵ {sampleFee.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Payout Fees Section ─────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Payout Transfer Fees
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Mobile Money transfer fee (GH₵)"
                      helperText="Paystack charges GH₵ 1.00 per MoMo transfer"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={String(
                          formData.paystackTransferFees.mobile_money
                        )}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paystackTransferFees: {
                              ...prev.paystackTransferFees,
                              mobile_money: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </FormField>

                    <FormField
                      label="Bank transfer fee (GH₵)"
                      helperText="Paystack charges GH₵ 8.00 per bank transfer"
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={String(
                          formData.paystackTransferFees.bank_account
                        )}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paystackTransferFees: {
                              ...prev.paystackTransferFees,
                              bank_account: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </FormField>
                  </div>

                  <FormField label="Who bears the transfer fee?">
                    <Select
                      value={formData.payoutFeeBearer}
                      onChange={(v: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          payoutFeeBearer: v as "platform" | "agent",
                        }))
                      }
                      options={[
                        {
                          value: "agent",
                          label:
                            "Agent bears fee (deducted from payout amount)",
                        },
                        {
                          value: "platform",
                          label:
                            "Platform bears fee (agent receives full amount)",
                        },
                      ]}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Fee Settings
            </Button>
          </DialogFooter>
        </Form>
      )}
    </Dialog>
  );
};

export default FeeSettingsDialog;
