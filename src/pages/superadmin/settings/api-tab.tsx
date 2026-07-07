import React from "react";
import { Edit, Smartphone, CreditCard } from "lucide-react";
import { Button } from "../../../design-system/components/button";
import { Card } from "../../../design-system/components/card";
import { Badge } from "../../../design-system/components/badge";
import { SectionHeader } from "./components/section-header";
import { MaskedValue } from "./components/masked-value";
import type { ApiSettings } from "../../../services/settings.service";

interface ApiTabProps {
  apiSettings: ApiSettings;
  revealKeys: Record<string, boolean>;
  onToggleRevealKey: (k: string) => void;
  onSetApiDialogOpen: (v: boolean) => void;
}

export const ApiTab: React.FC<ApiTabProps> = ({ apiSettings, revealKeys, onToggleRevealKey, onSetApiDialogOpen }) => (
  <div className="space-y-6">
    <Card>
      <SectionHeader
        title="API Settings"
        subtitle="External integrations & keys"
        action={<Button size="sm" variant="secondary" onClick={() => onSetApiDialogOpen(true)}><Edit className="w-3 h-3 mr-1" />Configure</Button>}
      />
      <div className="mt-4 space-y-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 8%, transparent)' }}>
          <div className="text-sm font-medium text-[var(--warning)]">API Endpoint</div>
          <div className="text-xs font-mono mt-1 text-[var(--warning)]">{apiSettings.apiEndpoint || "Not configured"}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />Telecel API Key</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <MaskedValue value={apiSettings.telecelApiKey} revealed={revealKeys.telecel} onToggle={() => onToggleRevealKey("telecel")} />
              <Badge colorScheme={apiSettings.telecelApiKey ? "success" : "error"}>{apiSettings.telecelApiKey ? "Active" : "Inactive"}</Badge>
            </div>
          </div>

          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
            <div className="text-sm font-medium flex items-center gap-2"><Smartphone className="w-4 h-4" style={{ color: 'var(--error)' }} />AirtelTigo API Key</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <MaskedValue value={apiSettings.airtelTigoApiKey} revealed={revealKeys.airtelTigo} onToggle={() => onToggleRevealKey("airtelTigo")} />
              <Badge colorScheme={apiSettings.airtelTigoApiKey ? "success" : "error"}>{apiSettings.airtelTigoApiKey ? "Active" : "Inactive"}</Badge>
            </div>
          </div>

          <div className="p-3 rounded-lg col-span-full sm:col-span-2" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />Paystack</div>
                <div className="text-xs mt-1 text-[var(--text-secondary)]">Payment gateway configuration (test & live keys)</div>
              </div>
              <Badge colorScheme={apiSettings.paystackEnabled ? "success" : "warning"}>{apiSettings.paystackEnabled ? "Enabled" : "Disabled"}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {import.meta.env.DEV && (
                <>
                  <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <div className="text-xs text-[var(--text-secondary)]">Test public key</div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <MaskedValue value={apiSettings.paystackTestPublicKey} revealed={revealKeys.paystackTestPublic} onToggle={() => onToggleRevealKey("paystackTestPublic")} />
                    </div>
                  </div>
                  <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <div className="text-xs text-[var(--text-secondary)]">Test secret key</div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      {apiSettings.paystackTestSecretKey !== undefined ? (
                        <MaskedValue value={apiSettings.paystackTestSecretKey} revealed={revealKeys.paystackTestSecret} onToggle={() => onToggleRevealKey("paystackTestSecret")} />
                      ) : (
                        <>
                          <div className="text-sm text-[var(--text-primary)]">{apiSettings.paystackTestSecretExists ? "Stored on server" : "Not configured"}</div>
                          <Button size="sm" variant="ghost" onClick={() => onSetApiDialogOpen(true)}>{apiSettings.paystackTestSecretExists ? "Replace" : "Set"}</Button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="text-xs text-[var(--text-secondary)]">Live public key</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <MaskedValue value={apiSettings.paystackLivePublicKey} revealed={revealKeys.paystackLivePublic} onToggle={() => onToggleRevealKey("paystackLivePublic")} />
                </div>
              </div>

              <div className="p-3 rounded border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div className="text-xs text-[var(--text-secondary)]">Live secret key</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  {import.meta.env.DEV && apiSettings.paystackLiveSecretKey !== undefined ? (
                    <MaskedValue value={apiSettings.paystackLiveSecretKey} revealed={revealKeys.paystackLiveSecret} onToggle={() => onToggleRevealKey("paystackLiveSecret")} />
                  ) : (
                    <>
                      <div className="text-sm text-[var(--text-primary)]">{apiSettings.paystackLiveSecretExists ? "Stored on server" : "Not configured"}</div>
                      <Button size="sm" variant="ghost" onClick={() => onSetApiDialogOpen(true)}>{apiSettings.paystackLiveSecretExists ? "Replace" : "Set"}</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);
