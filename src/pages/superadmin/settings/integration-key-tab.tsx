import React, { useEffect, useState, useCallback } from "react";
import { Copy, RefreshCw, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter } from "../../../design-system";
import { Card } from "../../../design-system/components/card";
import { useToast } from "../../../design-system/components/toast";
import { settingsService, type IntegrationKeyInfo } from "../../../services/settings.service";

export const IntegrationKeyTab: React.FC = () => {
  const [keyInfo, setKeyInfo] = useState<IntegrationKeyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { addToast } = useToast();

  const baseUrl = window.location.origin + "/api";

  const fetchKey = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsService.getIntegrationKey();
      setKeyInfo(data);
    } catch {
      addToast("Failed to load integration key", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchKey(); }, [fetchKey]);

  const handleCopyKey = async () => {
    if (!keyInfo?.keyPreview) return;
    try {
      await navigator.clipboard.writeText(keyInfo.keyPreview);
      addToast("Key copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleCopyBaseUrl = async () => {
    try {
      await navigator.clipboard.writeText(baseUrl);
      addToast("Base URL copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleCopyNewKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      addToast("New key copied to clipboard", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setConfirmOpen(false);
    try {
      const result = await settingsService.regenerateIntegrationKey();
      setNewKey(result.key);
      setKeyInfo(prev => prev ? { ...prev, regeneratedAt: new Date().toISOString(), keyPreview: null } : prev);
      addToast("Integration key regenerated", "success");
    } catch {
      addToast("Failed to regenerate integration key", "error");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Your Integration Key</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Use this key to authenticate external integrations</p>

          {newKey && (
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--warning) 12%, transparent)", border: "1px solid var(--warning)" }}>
              <p className="text-sm font-semibold text-[var(--warning)]">New Key Generated — Save It Now</p>
              <p className="text-xs text-[var(--warning)] mt-1">This key will not be shown again. Copy and store it securely.</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded text-sm font-mono break-all bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--border-color)" }}>
                  {newKey}
                </code>
                <Button size="sm" variant="secondary" onClick={handleCopyNewKey}>
                  <Copy className="w-4 h-4 mr-1" />Copy
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Key Preview</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded text-sm font-mono bg-[var(--bg-muted)] text-[var(--text-primary)]"
                  style={{ border: "1px solid var(--border-color)" }}>
                  {keyInfo?.keyPreview ? `...${keyInfo.keyPreview.slice(-4)}` : "No key configured"}
                </code>
                {keyInfo?.keyPreview && (
                  <Button size="sm" variant="ghost" onClick={handleCopyKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {keyInfo?.createdAt && `Created: ${new Date(keyInfo.createdAt).toLocaleDateString()}`}
                {keyInfo?.regeneratedAt && ` · Last regenerated: ${new Date(keyInfo.regeneratedAt).toLocaleDateString()}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Your Base URL</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded text-sm font-mono bg-[var(--bg-muted)] text-[var(--color-primary)]"
                  style={{ border: "1px solid var(--border-color)" }}>
                  {baseUrl}
                </code>
                <Button size="sm" variant="ghost" onClick={handleCopyBaseUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4" style={{ borderTop: "1px solid var(--border-color)" }}>
            <Button onClick={() => setConfirmOpen(true)} disabled={regenerating} variant="secondary">
              {regenerating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
              Regenerate Key
            </Button>
          </div>
        </div>
      </Card>

      <Dialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
        <DialogHeader>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Regenerate Integration Key</h3>
        </DialogHeader>
        <DialogBody>
          <p className="text-[var(--text-secondary)]">
            Regenerating will invalidate all existing connections. Connected apps using this key will stop working until they update their configuration.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRegenerate}>
            <RefreshCw className="w-4 h-4 mr-1" />Regenerate
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};