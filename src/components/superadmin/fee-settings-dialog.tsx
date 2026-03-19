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
import { useToast } from "../../design-system/components/toast";
import {
  settingsService,
  type FeeSettings,
} from "../../services/settings.service";
import { walletService } from "../../services/wallet-service";

// ─── Section wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: string;
  iconBg: string;
  panelBg: string;
  panelBorder: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  title, icon, iconBg, panelBg, panelBorder, children,
}) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center text-base`}>
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
    <div className={`${panelBg} ${panelBorder} border rounded-xl p-4 space-y-4`}>
      {children}
    </div>
  </div>
);

// ─── Preview stat cell ────────────────────────────────────────────────────────

const PreviewCell: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label, value, valueClass = "text-gray-900",
}) => (
  <div className="text-center">
    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
    <div className={`text-sm font-bold ${valueClass}`}>{value}</div>
  </div>
);

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
  walletTopUpCollectionFeePercent: 1.95,
  walletTopUpPlatformFeePercent: 0,
  walletTopUpDelegateFeesToCustomer: true,
  paystackTransferFees: { mobile_money: 1.0, bank_account: 8.0 },
  payoutFeeBearer: "agent",
  platformPayoutFeePercent: 0,
  autoPayoutEnabled: false,
  minimumPayoutAmounts: { mobile_money: 1.0, bank_account: 50.0 },
};

const mergeWithDefaults = (data: Partial<FeeSettings>): FeeSettings => ({
  ...DEFAULT_FEE_SETTINGS,
  ...data,
  paystackTransferFees: {
    ...DEFAULT_FEE_SETTINGS.paystackTransferFees,
    ...(data.paystackTransferFees ?? {}),
  },
  minimumPayoutAmounts: {
    ...DEFAULT_FEE_SETTINGS.minimumPayoutAmounts,
    ...(data.minimumPayoutAmounts ?? {}),
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

export const FeeSettingsDialog: React.FC<FeeSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<FeeSettings>(
    currentSettings || DEFAULT_FEE_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [autoPayoutStatus, setAutoPayoutStatus] = useState<{
    canAutoPayout: boolean;
    paystackConfigured: boolean;
    message: string;
  } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentSettings) {
        setFormData(mergeWithDefaults(currentSettings));
      } else {
        setLoadingSettings(true);
        settingsService
          .getFeeSettings()
          .then((data) => setFormData(mergeWithDefaults(data)))
          .catch(() => setFormData(DEFAULT_FEE_SETTINGS))
          .finally(() => setLoadingSettings(false));
      }

      // Check whether auto payout is actually available (Paystack keys + config)
      setAvailabilityLoading(true);
      walletService.getAutoPayoutAvailability()
        .then((status) => setAutoPayoutStatus(status))
        .catch((err) => {
          console.warn('Failed to load auto payout availability', err);
          setAutoPayoutStatus({
            canAutoPayout: false,
            paystackConfigured: false,
            message: 'Unable to determine Paystack payout availability',
          });
        })
        .finally(() => setAvailabilityLoading(false));
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent enabling auto payout when it's not available.
    if (formData.autoPayoutEnabled && autoPayoutStatus && !autoPayoutStatus.canAutoPayout) {
      addToast(
        autoPayoutStatus.paystackConfigured
          ? 'Auto payout is currently unavailable. Verify Paystack settings or use manual payout mode.'
          : 'Auto payout requires Paystack to be configured (API keys). Configure Paystack in API settings first.',
        'error'
      );
      setFormData((prev) => ({ ...prev, autoPayoutEnabled: false }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await settingsService.updateFeeSettings(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update fee settings:", error);
      addToast('Failed to update fee settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(
      currentSettings ? mergeWithDefaults(currentSettings) : DEFAULT_FEE_SETTINGS
    );
    onClose();
  };

  // ── Preview: collection fee on a GH₵ 100 storefront order ─────────────
  const totalCollectionFeePercent =
    formData.paystackCollectionFeePercent + formData.platformFeePercent;
  const sampleBase = 100;
  const sampleCharge = formData.delegateFeesToCustomer
    ? sampleBase / (1 - totalCollectionFeePercent / 100)
    : sampleBase;
  const sampleFee = sampleCharge - sampleBase;

  // ── Preview: collection fee on a GH₵ 100 wallet top-up ──────────────────
  const totalWalletTopUpFeePercent =
    formData.walletTopUpCollectionFeePercent + formData.walletTopUpPlatformFeePercent;
  const sampleWalletBase = 100;
  const sampleWalletCharge = formData.walletTopUpDelegateFeesToCustomer
    ? sampleWalletBase / (1 - totalWalletTopUpFeePercent / 100)
    : sampleWalletBase;
  const sampleWalletFee = sampleWalletCharge - sampleWalletBase;

  // ── Preview: payout fee on a GH₵ 50 MoMo withdrawal ────────────────────
  const samplePayout = 50;
  const paystackMomoFee = formData.paystackTransferFees?.mobile_money ?? 1.0;
  const platformPayoutFee =
    Math.round(samplePayout * (formData.platformPayoutFeePercent || 0)) / 100;
  const totalPayoutFee = paystackMomoFee + platformPayoutFee;
  const agentReceives =
    formData.payoutFeeBearer === "agent"
      ? Math.max(0, samplePayout - totalPayoutFee)
      : samplePayout;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            💳
          </span>
          Fee &amp; Payout Configuration
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

              {/* ── Collection Fees ──────────────────────────────────────── */}
              <Section
                title="Storefront Collection Fees"
                icon="🛒"
                iconBg="bg-blue-100"
                panelBg="bg-blue-50"
                panelBorder="border-blue-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Paystack collection fee (%)">
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
                      helperText="Paystack's fee — currently 1.95% in Ghana"
                      rightIcon={
                        <span className="text-xs font-medium text-gray-500">%</span>
                      }
                    />
                  </FormField>

                  <FormField label="Platform surcharge (%)">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      value={String(formData.platformFeePercent)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          platformFeePercent: parseFloat(e.target.value) || 0,
                        }))
                      }
                      helperText="Your additional fee on top of Paystack"
                      rightIcon={
                        <span className="text-xs font-medium text-gray-500">%</span>
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
                        label: "Customer pays fees (price adjusted upward)",
                      },
                      {
                        value: "false",
                        label: "Platform absorbs fees (deducted from revenue)",
                      },
                    ]}
                  />
                </FormField>

                {/* Collection fee preview */}
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    Preview — GH₵ {sampleBase.toFixed(2)} order
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <PreviewCell
                      label="Total fee"
                      value={`${totalCollectionFeePercent.toFixed(2)}%`}
                      valueClass="text-blue-700"
                    />
                    <PreviewCell
                      label="Customer pays"
                      value={`GH₵ ${sampleCharge.toFixed(2)}`}
                    />
                    <PreviewCell
                      label="Fee amount"
                      value={`GH₵ ${sampleFee.toFixed(2)}`}
                      valueClass="text-orange-600"
                    />
                  </div>
                </div>
              </Section>

              {/* ── Wallet Top-Up Fees ─────────────────────────────────── */}
              <Section
                title="Wallet Top-Up Fees"
                icon="💰"
                iconBg="bg-violet-100"
                panelBg="bg-violet-50"
                panelBorder="border-violet-200"
              >
                <p className="text-xs text-gray-500 -mt-1">
                  Applied when agents top up their wallet via Paystack. Independent of storefront fees.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Paystack top-up fee (%)">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={String(formData.walletTopUpCollectionFeePercent)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          walletTopUpCollectionFeePercent: parseFloat(e.target.value) || 0,
                        }))
                      }
                      helperText="Paystack's fee — currently 1.95% in Ghana"
                      rightIcon={<span className="text-xs font-medium text-gray-500">%</span>}
                    />
                  </FormField>

                  <FormField label="Platform surcharge (%)">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      value={String(formData.walletTopUpPlatformFeePercent)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          walletTopUpPlatformFeePercent: parseFloat(e.target.value) || 0,
                        }))
                      }
                      helperText="Your additional fee on top of Paystack"
                      rightIcon={<span className="text-xs font-medium text-gray-500">%</span>}
                    />
                  </FormField>
                </div>

                <FormField label="Fee delegation">
                  <Select
                    value={formData.walletTopUpDelegateFeesToCustomer ? "true" : "false"}
                    onChange={(v: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        walletTopUpDelegateFeesToCustomer: v === "true",
                      }))
                    }
                    options={[
                      { value: "true", label: "Agent pays fees (amount adjusted upward)" },
                      { value: "false", label: "Platform absorbs fees (deducted from revenue)" },
                    ]}
                  />
                </FormField>

                {/* Wallet top-up fee preview */}
                <div className="bg-white border border-violet-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-violet-900 mb-2">
                    Preview — GH₵ {sampleWalletBase.toFixed(2)} wallet top-up
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <PreviewCell
                      label="Total fee"
                      value={`${totalWalletTopUpFeePercent.toFixed(2)}%`}
                      valueClass="text-violet-700"
                    />
                    <PreviewCell
                      label="Agent charged"
                      value={`GH₵ ${sampleWalletCharge.toFixed(2)}`}
                    />
                    <PreviewCell
                      label="Fee amount"
                      value={`GH₵ ${sampleWalletFee.toFixed(2)}`}
                      valueClass="text-orange-600"
                    />
                  </div>
                </div>
              </Section>

              {/* ── Payout Transfer Fees ─────────────────────────────────── */}
              <Section
                title="Payout Transfer Fees"
                icon="💸"
                iconBg="bg-green-100"
                panelBg="bg-green-50"
                panelBorder="border-green-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Mobile Money flat fee">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(
                        formData.paystackTransferFees?.mobile_money ?? 1.0
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
                      helperText="Paystack charges GH₵ 1.00 per MoMo transfer"
                      leftIcon={
                        <span className="text-xs font-medium text-gray-500">GH₵</span>
                      }
                    />
                  </FormField>

                  <FormField label="Bank transfer flat fee">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(
                        formData.paystackTransferFees?.bank_account ?? 8.0
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
                      helperText="Paystack charges GH₵ 8.00 per bank transfer"
                      leftIcon={
                        <span className="text-xs font-medium text-gray-500">GH₵</span>
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Platform payout fee (%)">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={String(formData.platformPayoutFeePercent ?? 0)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        platformPayoutFeePercent:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                    helperText="Percentage the platform earns on each withdrawal, charged on top of Paystack's flat fee"
                    rightIcon={
                      <span className="text-xs font-medium text-gray-500">%</span>
                    }
                  />
                </FormField>

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
                        label: "Agent bears fee (deducted from payout amount)",
                      },
                      {
                        value: "platform",
                        label: "Platform bears fee (agent receives full amount)",
                      },
                    ]}
                  />
                </FormField>

                {/* Payout fee preview */}
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-900 mb-2">
                    Preview — GH₵ {samplePayout.toFixed(2)} MoMo withdrawal
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <PreviewCell
                      label="Paystack fee"
                      value={`GH₵ ${paystackMomoFee.toFixed(2)}`}
                      valueClass="text-gray-700"
                    />
                    <PreviewCell
                      label="Platform fee"
                      value={`GH₵ ${platformPayoutFee.toFixed(2)}`}
                      valueClass="text-blue-700"
                    />
                    <PreviewCell
                      label="Total fees"
                      value={`GH₵ ${totalPayoutFee.toFixed(2)}`}
                      valueClass="text-orange-600"
                    />
                    <PreviewCell
                      label="Agent receives"
                      value={`GH₵ ${agentReceives.toFixed(2)}`}
                      valueClass="text-green-700"
                    />
                  </div>
                </div>
              </Section>

              {/* ── Minimum Payout Amounts ───────────────────────────────── */}
              <Section
                title="Minimum Payout Amounts"
                icon="🔒"
                iconBg="bg-orange-100"
                panelBg="bg-orange-50"
                panelBorder="border-orange-200"
              >
                <p className="text-xs text-gray-500 -mt-1">
                  The lowest amount an agent can request per destination type. Requests below this are rejected.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Mobile Money minimum">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(formData.minimumPayoutAmounts?.mobile_money ?? 1.0)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minimumPayoutAmounts: {
                            ...prev.minimumPayoutAmounts,
                            mobile_money: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      helperText="Min amount for MoMo withdrawals"
                      leftIcon={
                        <span className="text-xs font-medium text-gray-500">GH₵</span>
                      }
                    />
                  </FormField>

                  <FormField label="Bank transfer minimum">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(formData.minimumPayoutAmounts?.bank_account ?? 50.0)}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minimumPayoutAmounts: {
                            ...prev.minimumPayoutAmounts,
                            bank_account: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      helperText="Min amount for bank transfers"
                      leftIcon={
                        <span className="text-xs font-medium text-gray-500">GH₵</span>
                      }
                    />
                  </FormField>
                </div>
              </Section>

              {/* ── Auto-Payout ──────────────────────────────────────────── */}
              <Section
                title="Automatic Payout"
                icon="⚡"
                iconBg="bg-purple-100"
                panelBg="bg-purple-50"
                panelBorder="border-purple-200"
              >
                <FormField label="Payout mode">
                  <Select
                    value={formData.autoPayoutEnabled ? "true" : "false"}
                    onChange={(v: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        autoPayoutEnabled: v === "true",
                      }))
                    }
                    options={[
                      {
                        value: "false",
                        label:
                          "Manual — Admin reviews and approves each request",
                      },
                      {
                        value: "true",
                        label:
                          "Automatic — Transfer sent instantly via Paystack (no admin step)",
                      },
                    ]}
                  />
                </FormField>

                <div
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 border text-sm ${
                    formData.autoPayoutEnabled ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  <span className="mt-0.5 flex-shrink-0">
                    {formData.autoPayoutEnabled ? "⚠️" : "ℹ️"}
                  </span>
                  <span>
                    {availabilityLoading
                      ? "Checking Paystack auto-payout availability…"
                      : autoPayoutStatus && !autoPayoutStatus.canAutoPayout
                      ? `Auto payout is unavailable: ${autoPayoutStatus.message}`
                      : formData.autoPayoutEnabled
                      ? "Automatic mode deducts funds from your Paystack balance immediately. Ensure Paystack transfers are enabled and your account balance is sufficient."
                      : "Manual mode gives you full control — each payout request waits for an admin to approve and trigger the transfer."}
                  </span>
                </div>
              </Section>

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
