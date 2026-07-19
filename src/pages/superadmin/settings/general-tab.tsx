import React, { useState } from "react";
import { Edit, Key as KeyIcon } from "lucide-react";
import { Button } from "../../../design-system/components/button";
import { Card } from "../../../design-system/components/card";
import { Switch } from "../../../design-system";
import { SectionHeader } from "./components/section-header";
import { SettingRow } from "./components/setting-row";
import KnownNumbersDialog from "./components/KnownNumbersDialog";
import type { SiteSettings, BryteLinksSettings, MtnRestrictionSettings } from "../../../services/settings.service";

interface GeneralTabProps {
  data: {
    siteSettings: SiteSettings;
    signupApproval: { requireApprovalForSignup: boolean };
    autoApproveStorefronts: { autoApproveStorefronts: boolean };
    bryteLinksSettings: BryteLinksSettings;
    mtnRestriction: MtnRestrictionSettings;
  };
  busyKeys: Record<string, boolean>;
  mtnNumbersCount: number | null;
  onToggleSite: () => void;
  onToggleStorefronts: () => void;
  onToggleSignupApproval: () => void;
  onToggleAutoApprove: () => void;
  onTogglePaymentGate: () => void;
  onToggleAutoSuspend: () => void;
  onToggleMtnRestriction: () => void;
  onSaveCreationFee: () => void;
  onSaveInactivityThreshold: () => void;
  onUpdateBryteLinks: (patch: Partial<BryteLinksSettings>) => void;
  onSetSiteDialogOpen: (v: boolean) => void;
  onSetPasswordDialogOpen: (v: boolean) => void;
  onRefreshMtnStats: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  data, busyKeys, mtnNumbersCount,
  onToggleSite, onToggleStorefronts, onToggleSignupApproval, onToggleAutoApprove,
  onTogglePaymentGate, onToggleAutoSuspend, onToggleMtnRestriction,
  onSaveCreationFee, onSaveInactivityThreshold, onUpdateBryteLinks,
  onSetSiteDialogOpen, onSetPasswordDialogOpen, onRefreshMtnStats, }) => {
  const siteOpen = data.siteSettings.isSiteOpen ?? false;
  const storefrontsOpen = data.siteSettings.storefrontsOpen ?? true;
  const signupRequired = data.signupApproval.requireApprovalForSignup ?? false;
  const autoApprove = data.autoApproveStorefronts.autoApproveStorefronts ?? false;
  const paymentGate = data.bryteLinksSettings.requirePaymentForStorefrontCreation ?? false;
  const creationFee = data.bryteLinksSettings.storefrontCreationFee ?? 50;
  const autoSuspend = data.bryteLinksSettings.autoSuspendInactiveStores ?? false;
  const mtnRestrictionEnabled = data.mtnRestriction.mtnOrderRestrictionEnabled ?? false;
  const inactivityDays = data.bryteLinksSettings.inactivityThresholdDays ?? 14;
  const [showKnownNumbers, setShowKnownNumbers] = useState(false);

  return (
    <div className="space-y-6">

      <Card>
        <SectionHeader
          title="Site Management"
          subtitle="Control availability and maintenance message"
          action={<Button size="sm" variant="secondary" onClick={() => onSetSiteDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
        />
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Site status</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">{siteOpen ? "Open to users" : "Closed for maintenance"}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: siteOpen ? 'var(--success)' : 'var(--error)' }}>{siteOpen ? "Open" : "Closed"}</span>
              <Switch checked={siteOpen} onCheckedChange={onToggleSite} isDisabled={!!busyKeys["siteToggle"]} />
            </div>
          </div>

          <SettingRow>
            <div className="text-sm font-medium text-[var(--text-primary)]">Maintenance message</div>
            <div className="text-xs mt-1 text-[var(--text-secondary)]">{data.siteSettings.customMessage || "No custom message set"}</div>
          </SettingRow>

          <SettingRow>
            <div className="text-sm font-medium text-[var(--text-primary)]">Dashboard greeting</div>
            <div className="text-xs mt-1 text-[var(--text-secondary)]">{data.siteSettings.greetingText || "Default time-based greeting"}</div>
          </SettingRow>

          <SettingRow>
            <div className="text-sm font-medium text-[var(--text-primary)]">Welcome message</div>
            <div className="text-xs mt-1 text-[var(--text-secondary)]">{data.siteSettings.welcomeMessage || "Welcome back!"}</div>
            <div className="text-xs mt-1 text-[var(--text-secondary)]">Icon enabled: {data.siteSettings.showGreetingIcon ? "Yes" : "No"}</div>
          </SettingRow>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Storefront availability</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">
                {storefrontsOpen ? "All storefronts are open to customers" : "All storefronts are closed by admin"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: storefrontsOpen ? 'var(--success)' : 'var(--error)' }}>{storefrontsOpen ? "Open" : "Closed"}</span>
              <Switch checked={storefrontsOpen} onCheckedChange={onToggleStorefronts} isDisabled={!!busyKeys["storefrontsToggle"]} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Require admin approval for signups</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">{signupRequired ? "Approval required" : "Auto-approve new users"}</div>
            </div>
            <Switch checked={signupRequired} onCheckedChange={onToggleSignupApproval} isDisabled={!!busyKeys["signupToggle"]} />
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Auto-approve storefronts</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">{autoApprove ? "Auto" : "Manual"}</div>
            </div>
            <Switch checked={autoApprove} onCheckedChange={onToggleAutoApprove} isDisabled={!!busyKeys["autoApproveToggle"]} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Storefront Policies" subtitle="Payment gate and inactivity auto-suspension" />
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Require payment for storefront creation</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">
                {paymentGate ? `Agents must pay GH₵${creationFee} before creating a store` : "No payment required"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: paymentGate ? 'var(--success)' : 'var(--text-secondary)' }}>{paymentGate ? "On" : "Off"}</span>
              <Switch checked={paymentGate} onCheckedChange={onTogglePaymentGate} isDisabled={!!busyKeys["paymentGateToggle"]} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Storefront creation fee (GH₵)</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">Amount deducted from agent wallet on creation</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={1}
                value={creationFee}
                onChange={e => onUpdateBryteLinks({ storefrontCreationFee: parseFloat(e.target.value) || 0 })}
                className="w-24 px-3 py-1.5 text-sm rounded-lg border text-right"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                disabled={!!busyKeys["creationFeeSave"]}
              />
              <Button size="sm" variant="secondary" onClick={onSaveCreationFee} isLoading={!!busyKeys["creationFeeSave"]}>Save</Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Auto-suspend inactive stores</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">
                {autoSuspend ? `Suspends stores with no activity for ${inactivityDays} days` : "Disabled"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: autoSuspend ? 'var(--success)' : 'var(--text-secondary)' }}>{autoSuspend ? "On" : "Off"}</span>
              <Switch checked={autoSuspend} onCheckedChange={onToggleAutoSuspend} isDisabled={!!busyKeys["autoSuspendToggle"]} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Inactivity threshold (days)</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">Number of days without activity before auto-suspension</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                step={1}
                value={inactivityDays}
                onChange={e => onUpdateBryteLinks({ inactivityThresholdDays: parseInt(e.target.value, 10) || 14 })}
                className="w-24 px-3 py-1.5 text-sm rounded-lg border text-right"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                disabled={!!busyKeys["inactivityDaysSave"]}
              />
              <Button size="sm" variant="secondary" onClick={onSaveInactivityThreshold} isLoading={!!busyKeys["inactivityDaysSave"]}>Save</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="MTN Order Restriction" subtitle="Block new (unseen) MTN numbers from processing" />
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Restriction status</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">
                {mtnRestrictionEnabled ? "Orders from unknown MTN numbers will be blocked" : "All MTN numbers allowed (no restriction)"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: mtnRestrictionEnabled ? 'var(--success)' : 'var(--text-secondary)' }}>{mtnRestrictionEnabled ? "On" : "Off"}</span>
              <Switch checked={mtnRestrictionEnabled} onCheckedChange={onToggleMtnRestriction} isDisabled={!!busyKeys["mtnRestriction"]} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Known numbers</div>
              <div className="text-xs mt-1 text-[var(--text-secondary)]">
                {mtnNumbersCount !== null ? `${mtnNumbersCount.toLocaleString()} numbers in the allowlist` : "Loading..."}
              </div>
            </div>
            <button
              onClick={() => setShowKnownNumbers(true)}
              className="px-3 py-1.5 text-sm border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)]"
            >
              Manage
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="User Management"
          subtitle="Admin & security settings"
          action={<Button size="sm" variant="secondary" onClick={() => onSetPasswordDialogOpen(true)}><KeyIcon className="w-3 h-3 mr-1" />Change Password</Button>}
        />
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, transparent)' }}>
          <div className="text-sm font-medium text-[var(--success)]">Admin account security</div>
          <div className="text-xs mt-1 text-[var(--success)]">Change your admin password regularly. You'll be required to log in again after changing it.</div>
        </div>
      </Card>

      <KnownNumbersDialog
        isOpen={showKnownNumbers}
        onClose={() => setShowKnownNumbers(false)}
        onStatsChange={onRefreshMtnStats}
      />
    </div>
  );
};
