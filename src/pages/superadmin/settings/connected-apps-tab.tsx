import React, { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Wifi, WifiOff, RefreshCw, Edit, Loader2 } from "lucide-react";
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Badge } from "../../../design-system";
import { Card } from "../../../design-system/components/card";
import { useToast } from "../../../design-system/components/toast";
import { settingsService, type ConnectedApp } from "../../../services/settings.service";

export const ConnectedAppsTab: React.FC = () => {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ConnectedApp | null>(null);
  const [formData, setFormData] = useState({ appId: "", name: "", baseUrl: "", apiKey: "" });
  const [saving, setSaving] = useState(false);
  const [testingForm, setTestingForm] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsService.getConnectedApps();
      setApps(data);
    } catch {
      addToast("Failed to load connected apps", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const openAdd = () => {
    setEditingApp(null);
    setFormData({ appId: "", name: "", baseUrl: "", apiKey: "" });
    setDialogOpen(true);
  };

  const openEdit = (app: ConnectedApp) => {
    setEditingApp(app);
    setFormData({ appId: app.appId, name: app.name, baseUrl: app.baseUrl, apiKey: "" });
    setDialogOpen(true);
  };

  const handleTestForm = async () => {
    setTestingForm(true);
    try {
      const result = await settingsService.testConnectedApp(formData.appId || "new");
      addToast(result.verified ? "Connection successful" : "Connection failed", result.verified ? "success" : "error");
    } catch {
      addToast("Failed to test connection", "error");
    } finally {
      setTestingForm(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.baseUrl || !formData.apiKey) {
      addToast("Please fill in all fields", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingApp) {
        const updated = await settingsService.updateConnectedApp(editingApp.appId, formData);
        setApps(prev => prev.map(a => a.appId === editingApp.appId ? updated : a));
        addToast("Connected app updated", "success");
      } else {
        const created = await settingsService.addConnectedApp(formData);
        setApps(prev => [...prev, created]);
        addToast("Connected app added", "success");
      }
      setDialogOpen(false);
    } catch {
      addToast("Failed to save connected app", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (appId: string) => {
    setTestingId(appId);
    try {
      const result = await settingsService.testConnectedApp(appId);
      if (result.verified) {
        setApps(prev => prev.map(a => a.appId === appId ? { ...a, lastTestedAt: new Date().toISOString() } : a));
      }
      addToast(result.verified ? "Connection successful" : "Connection failed", result.verified ? "success" : "error");
    } catch {
      addToast("Failed to test connection", "error");
    } finally {
      setTestingId(null);
    }
  };

  const handleRemove = async (appId: string) => {
    try {
      await settingsService.removeConnectedApp(appId);
      setApps(prev => prev.filter(a => a.appId !== appId));
      addToast("Connected app removed", "success");
    } catch {
      addToast("Failed to remove connected app", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const toggleEnabled = async (app: ConnectedApp) => {
    try {
      const updated = await settingsService.updateConnectedApp(app.appId, { enabled: !app.enabled });
      setApps(prev => prev.map(a => a.appId === app.appId ? updated : a));
      addToast(`App ${updated.enabled ? "enabled" : "disabled"}`, "success");
    } catch {
      addToast("Failed to update app status", "error");
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
      <div className="flex flex-col sm:flex-row items:start sm:items-center justify-between space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Connected Apps</h3>
          <p className="text-sm text-[var(--text-secondary)]">Manage external application connections</p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" />Add Connection
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-[var(--text-muted)]">
            No connected apps configured. Click "Add Connection" to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <Card key={app.appId}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{app.name}</span>
                    <Badge colorScheme={app.enabled ? "success" : "error"}>{app.enabled ? "Enabled" : "Disabled"}</Badge>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1 truncate">{app.baseUrl}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Connected: {new Date(app.connectedAt).toLocaleDateString()}
                    {app.lastTestedAt && <> · Last tested: {new Date(app.lastTestedAt).toLocaleDateString()}</>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => toggleEnabled(app)} title={app.enabled ? "Disable" : "Enable"}>
                    {app.enabled ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleTest(app.appId)} disabled={testingId === app.appId} title="Test Connection">
                    <RefreshCw className={`w-4 h-4 ${testingId === app.appId ? "animate-spin" : ""}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(app)} title="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(app.appId)} title="Remove">
                    <Trash2 className="w-4 h-4 text-[var(--error)]" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} size="md">
        <DialogHeader>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editingApp ? "Edit" : "Add"} Connected App</h3>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">App ID</label>
              <input
                type="text"
                value={formData.appId}
                onChange={e => setFormData(p => ({ ...p, appId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-[var(--bg-surface)] text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-color)" }}
                placeholder="Auto-generated if empty"
                disabled={!!editingApp}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-[var(--bg-surface)] text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-color)" }}
                placeholder="My App"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Base URL</label>
              <input
                type="text"
                value={formData.baseUrl}
                onChange={e => setFormData(p => ({ ...p, baseUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-[var(--bg-surface)] text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-color)" }}
                placeholder="https://example.com/api"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={e => setFormData(p => ({ ...p, apiKey: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-[var(--bg-surface)] text-[var(--text-primary)]"
                style={{ borderColor: "var(--border-color)" }}
                placeholder={editingApp ? "Leave blank to keep current" : "Enter API key"}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={handleTestForm} disabled={testingForm || !formData.baseUrl}>
            {testingForm ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Test Connection
          </Button>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {editingApp ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} size="sm">
        <DialogHeader>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Remove Connected App</h3>
        </DialogHeader>
        <DialogBody>
          <p className="text-[var(--text-secondary)]">
            Are you sure you want to remove this connected app? This action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button onClick={() => confirmDelete && handleRemove(confirmDelete)}>
            <Trash2 className="w-4 h-4 mr-1" />Remove
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};