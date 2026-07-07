import React from "react";
import { Edit } from "lucide-react";
import { Button } from "../../../design-system/components/button";
import { Card } from "../../../design-system/components/card";
import { Badge } from "../../../design-system/components/badge";
import { SectionHeader } from "./components/section-header";
import type { WalletSettings, FeeSettings, MomoBridgeSettings } from "../../../services/settings.service";

interface FinanceTabProps {
  walletSettings: WalletSettings;
  momoBridgeSettings: MomoBridgeSettings;
  feeSettings: FeeSettings | null;
  onSetWalletDialogOpen: (v: boolean) => void;
  onSetMomoDialogOpen: (v: boolean) => void;
  onSetFeeDialogOpen: (v: boolean) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  walletSettings, momoBridgeSettings, feeSettings,
  onSetWalletDialogOpen, onSetMomoDialogOpen, onSetFeeDialogOpen,
}) => {
  const userTypeLabels: Record<string, string> = {
    agent: "Agent",
    super_agent: "Super Agent",
    dealer: "Dealer",
    super_dealer: "Super Dealer",
    elite_dealer: "Elite Dealer",
    master_dealer: "Master Dealer",
    default: "Default",
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          title="Wallet Settings"
          subtitle="Top-up limits & behaviour"
          action={<Button size="sm" variant="secondary" onClick={() => onSetWalletDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(walletSettings.minimumTopUpAmounts).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
              <div className="text-sm text-[var(--text-secondary)]">{userTypeLabels[key] || key}</div>
              <div className="font-medium">GH₵{value}</div>
            </div>
          ))}
          <div className="p-3 rounded-lg flex justify-between col-span-full sm:col-span-2" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Paystack Minimum</div>
            <div className="font-medium">GH₵{walletSettings.paystackMinimumTopUpAmount ?? 0}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="MoMo Bridge"
          subtitle="Mobile money wallet top-up via MoMo Bridge"
          action={<Button size="sm" variant="secondary" onClick={() => onSetMomoDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Status</div>
            <Badge colorScheme={momoBridgeSettings.momoBridgeEnabled ? "success" : "error"}>
              {momoBridgeSettings.momoBridgeEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm text-[var(--text-secondary)]">API Key</div>
            <div className="font-mono text-sm text-[var(--text-primary)]">
              {momoBridgeSettings.momoBridgeApiKey
                ? `${momoBridgeSettings.momoBridgeApiKey.slice(0, 6)}…${momoBridgeSettings.momoBridgeApiKey.slice(-4)}`
                : <span style={{ color: 'var(--text-muted)' }}>Not configured</span>}
            </div>
          </div>
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Relay URL</div>
            <div className="text-sm font-mono truncate max-w-[180px] text-[var(--text-primary)]">
              {momoBridgeSettings.momoBridgeRelayUrl || "Default"}
            </div>
          </div>
          <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Platform Fee</div>
            <div className="font-medium">{momoBridgeSettings.momoBridgeClaimFeePercent}%</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Storefront Collection Fees"
          subtitle="Fees applied to agent storefront payments via Paystack"
          action={<Button size="sm" variant="secondary" onClick={() => onSetFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Paystack Fee</div>
            <div className="font-medium">{feeSettings?.paystackCollectionFeePercent ?? 1.95}%</div>
          </div>
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Platform Fee</div>
            <div className="font-medium">{feeSettings?.platformFeePercent ?? 0}%</div>
          </div>
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Fee Bearer</div>
            <div className="font-medium">{(feeSettings?.delegateFeesToCustomer ?? true) ? "Customer" : "Platform"}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Wallet Top-Up Fees"
          subtitle="Fees applied when agents top up their wallet via Paystack"
          action={<Button size="sm" variant="secondary" onClick={() => onSetFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Paystack Fee</div>
            <div className="font-medium">{feeSettings?.walletTopUpCollectionFeePercent ?? 1.95}%</div>
          </div>
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Platform Fee</div>
            <div className="font-medium">{feeSettings?.walletTopUpPlatformFeePercent ?? 0}%</div>
          </div>
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Fee Bearer</div>
            <div className="font-medium">{(feeSettings?.walletTopUpDelegateFeesToCustomer ?? true) ? "Agent" : "Platform"}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Payout Transfer Fees"
          subtitle="Paystack transfer costs & payout configuration"
          action={<Button size="sm" variant="secondary" onClick={() => onSetFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Bank Transfer Fee</div>
            <div className="font-medium">GH₵{(feeSettings?.paystackTransferFees?.bank_account ?? 8.0).toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-lg flex justify-between" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
            <div className="text-sm text-[var(--text-secondary)]">Fee Bearer</div>
            <div className="font-medium capitalize">{feeSettings?.payoutFeeBearer ?? "agent"}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Referral Commission Rate"
          subtitle="Percentage of order value credited to referring agents"
          action={<Button size="sm" variant="secondary" onClick={() => onSetFeeDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 8%, transparent)' }}>
          <div>
            <div className="text-sm font-medium text-[var(--warning)]">Current rate</div>
            <div className="text-xs mt-1 text-[var(--warning)]">Configurable via Fee Settings dialog</div>
          </div>
          <div className="sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-[var(--warning)]">{feeSettings?.commissionRatePercent ?? 5}%</div>
            <div className="text-xs text-[var(--warning)]">GH₵ {((feeSettings?.commissionRatePercent ?? 5) * 100 / 100).toFixed(2)} per GH₵ 100 order</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
