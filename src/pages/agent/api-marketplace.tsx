import { useState, useEffect, useCallback } from "react";
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Alert,
  Skeleton,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StatCard,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Pagination,
} from "../../design-system";
import { useToast } from "../../design-system";
import { ApiMarketplaceInfoDialog } from "../../components/api-marketplace/ApiMarketplaceInfoDialog";
import {
  apiMarketplaceService,
  type ApiKeyData,
  type CreatedApiKey,
  type UsageStats,
  type UsageLogEntry,
  type DailyCount,
  type WebhookEndpointData,
  type WebhookDeliveryLogData,
  type OrderListItem,
  type OrderDetail,
  type PerKeyUsageData,
} from "../../services/api-marketplace.service";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  Activity,
  AlertTriangle,
  Clock,
  Book,
  ExternalLink,
  Info,
  Ban,
  Check,
  RefreshCw,
  Webhook,
  Package,
  Eye,
  Edit3,
  Play,
  Loader2,
  Wallet,
} from "lucide-react";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "keys", label: "API Keys" },
  { id: "usage", label: "Usage Analytics" },
  { id: "webhooks", label: "Webhooks" },
  { id: "wallet", label: "Wallet" },
  { id: "orders", label: "Orders" },
];

interface WebhookCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { url: string; secret: string; events: string[]; description?: string; active?: boolean }) => void;
  availableEvents: string[];
}

function WebhookCreateDialog({ isOpen, onClose, onCreate, availableEvents }: WebhookCreateDialogProps) {
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [events, setEvents] = useState<string[]>(["order.completed"]);
  const [creating, setCreating] = useState(false);
  const [showSecretHint, setShowSecretHint] = useState(false);

  const handleToggleEvent = (ev: string) => {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev],
    );
  };

  const handleSubmit = async () => {
    if (!url.trim() || !secret.trim() || events.length === 0) return;
    setCreating(true);
    await onCreate({ url: url.trim(), secret: secret.trim(), description: description.trim(), active, events });
    setCreating(false);
    setUrl("");
    setSecret("");
    setDescription("");
    setActive(true);
    setEvents(["order.completed"]);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>Add Webhook Endpoint</DialogHeader>
      <DialogBody className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Endpoint URL</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-server.com/webhooks/momo" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Secret (for HMAC verification)</label>
            <Info
              className="w-3.5 h-3.5 cursor-help shrink-0"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setShowSecretHint((p) => !p)}
            />
          </div>
          {showSecretHint && (
            <div
              className="mb-2 p-2.5 rounded-lg text-xs"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)" }}
            >
              <p className="font-medium mb-0.5" style={{ color: "var(--text-primary)" }}>What is HMAC?</p>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                HMAC (Hash-based Message Authentication Code) signs each webhook payload so your endpoint
                can cryptographically verify it came from BryteLinks. Use a random string at least 16
                characters long — like <code className="text-[10px] font-mono px-0.5">whsec_abc123def456ghi789</code>.
              </p>
            </div>
          )}
          <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="whsec_abc123def456ghi789" className="font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>Description (optional)</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. My order notification server" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Events</label>
          <div className="flex flex-wrap gap-2">
            {availableEvents.map((ev) => (
              <label key={ev} className="flex items-center gap-1.5 cursor-pointer text-sm px-2 py-1 rounded border" style={{ borderColor: events.includes(ev) ? "var(--color-secondary)" : "var(--border-color)", backgroundColor: events.includes(ev) ? "var(--color-secondary)" : "transparent", color: events.includes(ev) ? "white" : "var(--text-primary)" }}>
                <input type="checkbox" checked={events.includes(ev)} onChange={() => handleToggleEvent(ev)} className="sr-only" />
                {ev}
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded" />
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Active on creation</span>
        </label>
      </DialogBody>
      <DialogFooter justify="end">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!url.trim() || !secret.trim() || events.length === 0 || creating}>
            {creating ? "Creating..." : "Create Webhook"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

export const ApiMarketplacePage = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  const [totalKeys, setTotalKeys] = useState(0);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  const [usageLogs, setUsageLogs] = useState<UsageLogEntry[]>([]);
  const [usageLogsLoading, setUsageLogsLoading] = useState(false);
  const [usageLogsError, setUsageLogsError] = useState<string | null>(null);
  const [usageLogsMeta, setUsageLogsMeta] = useState<{ total: number; page: number; limit: number; hasMore: boolean } | null>(null);
  const [usageLogsPage, setUsageLogsPage] = useState(1);
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // ─── Wallet state ─────────────────────────────────────────────────────
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletCurrency, setWalletCurrency] = useState("GHS");
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupResult, setTopupResult] = useState<{
    success: boolean;
    data?: { reference: string; authorizationUrl: string; amount: number };
    message?: string;
  } | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Key detail dialog
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [keyDetail, setKeyDetail] = useState<ApiKeyData | null>(null);
  const [keyDetailLoading, setKeyDetailLoading] = useState(false);
  const [keyDetailError, setKeyDetailError] = useState<string | null>(null);

  // Edit label dialog
  const [showEditLabel, setShowEditLabel] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState("");
  const [isSavingLabel, setIsSavingLabel] = useState(false);

  // Suspend/activate/regenerate
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookEndpointData[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [webhooksError, setWebhooksError] = useState<string | null>(null);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [showWebhookDetail, setShowWebhookDetail] = useState<string | null>(null);
  const [webhookDeliveryLogs, setWebhookDeliveryLogs] = useState<WebhookDeliveryLogData[]>([]);
  const [deliveryLogsLoading, setDeliveryLogsLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersMeta, setOrdersMeta] = useState<{ total: number; page: number; limit: number; hasMore: boolean } | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  // Per-key usage
  const [perKeyUsage, setPerKeyUsage] = useState<PerKeyUsageData[]>([]);

  const loadOverview = useCallback(async () => {
    try {
      const result = await apiMarketplaceService.getStats();
      if (result.success) {
        setTotalKeys(result.data.totalKeys);
        setUsageStats(result.data.usageStats);
      }
    } catch (err) {
      console.error("Failed to load overview:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadKeys = useCallback(async () => {
    setKeysLoading(true);
    setKeysError(null);
    try {
      const result = await apiMarketplaceService.getKeys();
      if (result.success) {
        setKeys(result.data);
      } else {
        setKeysError(result.message);
      }
    } catch {
      setKeysError("Failed to load API keys");
    } finally {
      setKeysLoading(false);
    }
  }, []);

  const loadUsageLogs = useCallback(async () => {
    setUsageLogsLoading(true);
    setUsageLogsError(null);
    try {
      const result = await apiMarketplaceService.getUsageLogs(10, usageLogsPage);
      if (result.success) {
        setUsageLogs(result.data);
        if ("meta" in result && result.meta) {
          setUsageLogsMeta(result.meta as { total: number; page: number; limit: number; hasMore: boolean });
        }
      } else {
        setUsageLogsError(result.message);
      }
    } catch {
      setUsageLogsError("Failed to load usage logs");
    } finally {
      setUsageLogsLoading(false);
    }
  }, [usageLogsPage]);

  const loadDailyCounts = useCallback(async () => {
    try {
      const result = await apiMarketplaceService.getDailyCounts(7);
      if (result.success) setDailyCounts(result.data);
    } catch {
      // silent
    }
  }, []);

  const loadWebhooks = useCallback(async () => {
    setWebhooksLoading(true);
    setWebhooksError(null);
    try {
      const result = await apiMarketplaceService.getWebhooks();
      if (result.success) {
        setWebhooks(result.data);
      } else {
        setWebhooksError(result.message);
      }
    } catch {
      setWebhooksError("Failed to load webhooks");
    } finally {
      setWebhooksLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params: { status?: string; page: number; limit: number } = { page: ordersPage, limit: 10 };
      if (orderStatusFilter) params.status = orderStatusFilter;
      const result = await apiMarketplaceService.getOrders(params);
      if (result.success) {
        setOrders(result.data);
        if ("meta" in result && result.meta) {
          setOrdersMeta(result.meta as { total: number; page: number; limit: number; hasMore: boolean });
        }
      } else {
        setOrdersError(result.message);
      }
    } catch {
      setOrdersError("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersPage, orderStatusFilter]);

  const loadPerKeyUsage = useCallback(async () => {
    try {
      const result = await apiMarketplaceService.getPerKeyUsageStats();
      if (result.success) setPerKeyUsage(result.data);
    } catch {
      // silent
    }
  }, []);

  const loadKeyDetail = useCallback(async (id: string) => {
    setKeyDetailLoading(true);
    setKeyDetailError(null);
    try {
      const result = await apiMarketplaceService.getKeyById(id);
      if (result.success) {
        setKeyDetail(result.data);
      } else {
        setKeyDetailError(result.message);
      }
    } catch {
      setKeyDetailError("Failed to load key details");
    } finally {
      setKeyDetailLoading(false);
    }
  }, []);

  const loadDeliveryLogs = useCallback(async (webhookId: string) => {
    setDeliveryLogsLoading(true);
    try {
      const result = await apiMarketplaceService.getWebhookDeliveryLogs(webhookId, { limit: 20 });
      if (result.success) setWebhookDeliveryLogs(result.data);
    } catch {
      // silent
    } finally {
      setDeliveryLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === "keys") loadKeys();
  }, [activeTab, loadKeys]);

  useEffect(() => {
    if (activeTab === "usage") {
      loadUsageLogs();
      loadDailyCounts();
      loadPerKeyUsage();
      const interval = setInterval(loadUsageLogs, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab, loadUsageLogs, loadDailyCounts, loadPerKeyUsage]);

  useEffect(() => {
    if (activeTab === "webhooks") loadWebhooks();
  }, [activeTab, loadWebhooks]);

  useEffect(() => {
    if (activeTab === "orders") loadOrders();
  }, [activeTab, loadOrders]);

  useEffect(() => {
    if (activeTab === "wallet") loadWalletBalance();
  }, [activeTab]);

  const loadWalletBalance = useCallback(async () => {
    setWalletLoading(true);
    try {
      const result = await apiMarketplaceService.getWalletBalance();
      if (result.success) {
        setWalletBalance(result.data.balance);
        setWalletCurrency(result.data.currency);
      }
    } catch {
      // silent
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const handleInitiateTopup = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount < 1) return;
    setTopupLoading(true);
    setTopupResult(null);
    try {
      const result = await apiMarketplaceService.initiateTopup(amount);
      if (result.success) {
        setTopupResult({ success: true, data: result.data });
        addToast("Top-up initiated", "success");
        loadWalletBalance();
      } else {
        setTopupResult({ success: false, message: result.message || "Top-up failed" });
      }
    } catch {
      setTopupResult({ success: false, message: "Failed to initiate top-up" });
    } finally {
      setTopupLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyLabel.trim()) return;
    setIsCreating(true);
    try {
      const result = await apiMarketplaceService.createKey(newKeyLabel.trim());
      if (result.success) {
        setCreatedKey(result.data);
        addToast("API key created successfully", "success");
        setNewKeyLabel("");
        loadKeys();
      } else {
        addToast(result.message || "Failed to create key", "error");
      }
    } catch {
      addToast("Failed to create API key", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedIndex("created");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyKeyFromTable = (prefix: string, id: string) => {
    navigator.clipboard.writeText(prefix);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRevokeKey = async () => {
    if (!showRevokeConfirm) return;
    setIsRevoking(true);
    try {
      const result = await apiMarketplaceService.revokeKey(showRevokeConfirm);
      if (result.success) {
        addToast("API key revoked successfully", "success");
        setShowRevokeConfirm(null);
        loadKeys();
      } else {
        addToast(result.message || "Failed to revoke key", "error");
      }
    } catch {
      addToast("Failed to revoke API key", "error");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleKeyAction = async (id: string, action: "suspend" | "activate" | "revoke") => {
    setActionLoading(id);
    try {
      let result;
      if (action === "suspend") result = await apiMarketplaceService.suspendKey(id);
      else if (action === "activate") result = await apiMarketplaceService.activateKey(id);
      else result = await apiMarketplaceService.revokeKey(id);
      if (result.success) {
        addToast(`Key ${action}ed successfully`, "success");
        loadKeys();
      } else {
        addToast(result.message || `Failed to ${action} key`, "error");
      }
    } catch {
      addToast(`Failed to ${action} key`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenKeyDetail = async (id: string) => {
    setSelectedKeyId(id);
    setKeyDetail(null);
    setKeyDetailError(null);
    await loadKeyDetail(id);
  };

  const handleCloseKeyDetail = () => {
    setSelectedKeyId(null);
    setKeyDetail(null);
    setKeyDetailError(null);
  };

  const handleEditLabelOpen = (id: string, currentLabel: string) => {
    setShowEditLabel(id);
    setEditLabelValue(currentLabel);
  };

  const handleSaveLabel = async () => {
    if (!showEditLabel || !editLabelValue.trim()) return;
    setIsSavingLabel(true);
    try {
      const result = await apiMarketplaceService.updateKeyLabel(showEditLabel, editLabelValue.trim());
      if (result.success) {
        addToast("Label updated", "success");
        setShowEditLabel(null);
        loadKeys();
        if (selectedKeyId) loadKeyDetail(selectedKeyId);
      } else {
        addToast(result.message || "Failed to update label", "error");
      }
    } catch {
      addToast("Failed to update label", "error");
    } finally {
      setIsSavingLabel(false);
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (!window.confirm("Regenerate this API key? The old key will stop working immediately.")) return;
    setActionLoading(id);
    try {
      const result = await apiMarketplaceService.regenerateKey(id);
      if (result.success) {
        setCreatedKey(result.data);
        addToast("Key regenerated — copy it now", "success");
        loadKeys();
      } else {
        addToast(result.message || "Failed to regenerate key", "error");
      }
    } catch {
      addToast("Failed to regenerate key", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetExpiry = async (id: string) => {
    const daysStr = window.prompt("Set expiration (days from now, or empty for no expiry):");
    if (daysStr === null) return;
    const expiresAt = daysStr.trim()
      ? new Date(Date.now() + parseInt(daysStr) * 86400000).toISOString()
      : null;
    try {
      const result = await apiMarketplaceService.setKeyExpiration(id, expiresAt);
      if (result.success) {
        addToast(expiresAt ? "Expiration set" : "Expiration cleared", "success");
        loadKeys();
        if (selectedKeyId) loadKeyDetail(selectedKeyId);
      } else {
        addToast(result.message || "Failed to set expiration", "error");
      }
    } catch {
      addToast("Failed to set expiration", "error");
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreatedKey(null);
    setNewKeyLabel("");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge colorScheme="success">Active</Badge>;
      case "revoked":
        return <Badge colorScheme="warning">Revoked</Badge>;
      case "suspended":
        return <Badge colorScheme="error">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const WEBHOOK_EVENTS = ["order.placed", "order.processing", "order.completed", "order.failed"];

  const handleCreateWebhook = async (data: { url: string; secret: string; events: string[]; description?: string; active?: boolean }) => {
    try {
      const result = await apiMarketplaceService.createWebhook(data);
      if (result.success) {
        addToast("Webhook created", "success");
        setShowCreateWebhook(false);
        loadWebhooks();
      } else {
        addToast(result.message || "Failed to create webhook", "error");
      }
    } catch {
      addToast("Failed to create webhook", "error");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!window.confirm("Delete this webhook endpoint? This cannot be undone.")) return;
    try {
      const result = await apiMarketplaceService.deleteWebhook(id);
      if (result.success) {
        addToast("Webhook deleted", "success");
        loadWebhooks();
        setShowWebhookDetail(null);
      } else {
        addToast(result.message || "Failed to delete webhook", "error");
      }
    } catch {
      addToast("Failed to delete webhook", "error");
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const result = await apiMarketplaceService.testWebhook(id);
      if (result.success) {
        addToast(`Test delivery: ${result.data.success ? "success" : "failed"} (${result.data.statusCode})`, result.data.success ? "success" : "warning");
        loadDeliveryLogs(id);
      } else {
        addToast(result.message || "Test failed", "error");
      }
    } catch {
      addToast("Test request failed", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Card variant="outlined">
          <CardBody>
            <Skeleton variant="text" height="1.75rem" width="200px" />
            <Skeleton variant="text" height="0.875rem" width="300px" className="mt-2" />
          </CardBody>
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="outlined">
              <CardBody>
                <Skeleton variant="text" height="0.75rem" width="70px" className="mb-2" />
                <Skeleton variant="text" height="1.75rem" width="110px" className="mb-1" />
                <Skeleton variant="text" height="0.75rem" width="90px" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                <Key className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                API Marketplace
              </h1>
              <p className="text-sm sm:text-base mt-1" style={{ color: "var(--text-secondary)" }}>
                Manage API keys and monitor usage for your storefront integrations
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setShowInfo(true)}
                aria-label="What is API Marketplace?"
              >
                <Info className="w-4 h-4 mr-1.5" />
                What's this?
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = "/agent/dashboard/api-marketplace/docs"}
              >
                <Book className="w-4 h-4 mr-1.5" />
                API Docs
              </Button>
              <Button className="w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create API Key
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="gap-1 px-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="API Keys"
                value={totalKeys}
                subtitle={totalKeys === 1 ? "1 key created" : `${totalKeys} keys created`}
                icon={<Key className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Requests Today"
                value={usageStats?.totalRequests ?? 0}
                subtitle="API calls in last 24h"
                icon={<Activity className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Error Rate"
                value={usageStats ? `${usageStats.errorRate}%` : "0%"}
                subtitle={`${usageStats?.errorCount ?? 0} errors today`}
                icon={<AlertTriangle className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Avg Latency"
                value={usageStats ? `${usageStats.avgLatency}ms` : "—"}
                subtitle="Average response time"
                icon={<Clock className="w-4 h-4" />}
                size="md"
              />
            </div>

            {totalKeys === 0 && (
              <Card variant="outlined">
                <CardBody>
                  <EmptyState
                    icon={<Key className="w-6 h-6" />}
                    title="No API keys yet"
                    description="Create your first API key to start integrating your storefront with your own platform."
                    action={
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button className="w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                          <Plus className="w-4 h-4 mr-1.5" />
                          Create API Key
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto"
                          onClick={() => window.location.href = "/agent/dashboard/api-marketplace/docs"}
                        >
                          <Book className="w-4 h-4 mr-1.5" />
                          Read the Docs
                        </Button>
                      </div>
                    }
                  />
                </CardBody>
              </Card>
            )}

            {/* Quick Start */}
            {totalKeys > 0 && (
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5" style={{ color: "var(--color-secondary)" }} />
                    <h2 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      Quick Start
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Alert status="info" variant="subtle">
                    Your API key prefix is{" "}
                    <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                      {keys.find(k => k.status === "active")?.keyPrefix || "bl_live_"}...
                    </code>
                    . See the full API docs for code examples and endpoint reference.
                  </Alert>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => window.location.href = "/agent/dashboard/api-marketplace/docs"}
                  >
                    <Book className="w-4 h-4 mr-1.5" />
                    View Full API Documentation
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── API Keys Tab ───────────────────────────────────────────── */}
        <TabsContent value="keys">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button className="w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create API Key
              </Button>
            </div>

            {keysLoading ? (
              <Card variant="outlined">
                <CardBody>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} variant="rectangular" height="3rem" />
                    ))}
                  </div>
                </CardBody>
              </Card>
            ) : keysError ? (
              <Card variant="outlined">
                <CardBody>
                  <Alert status="error" variant="left-accent">{keysError}</Alert>
                </CardBody>
              </Card>
            ) : keys.length === 0 ? (
              <Card variant="outlined">
                <CardBody>
                  <EmptyState
                    icon={<Key className="w-6 h-6" />}
                    title="No API keys"
                    description="Create an API key to access the marketplace API."
                    action={
                      <Button className="w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Create API Key
                      </Button>
                    }
                  />
                </CardBody>
              </Card>
            ) : (
              <Card variant="outlined">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Label</TableHeaderCell>
                        <TableHeaderCell>Key Prefix</TableHeaderCell>
                        <TableHeaderCell>Permissions</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Created</TableHeaderCell>
                        <TableHeaderCell>Last Used</TableHeaderCell>
                        <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((key) => {
                        const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                        return (
                          <TableRow
                            key={key._id}
                            className="cursor-pointer transition-colors hover:bg-[var(--bg-surface-alt)]"
                            onClick={() => handleOpenKeyDetail(key._id)}
                          >
                            <TableCell className="font-medium">{key.label}</TableCell>
                            <TableCell>
                              <code className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                                {key.keyPrefix}...
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {key.permissions.slice(0, 2).map((p) => (
                                  <Badge key={p} colorScheme="primary" className="text-xs">{p.split(":")[0]}</Badge>
                                ))}
                                {key.permissions.length > 2 && (
                                  <Badge className="text-xs">+{key.permissions.length - 2}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(isExpired ? "expired" : key.status)}
                            </TableCell>
                            <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {formatDate(key.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {key.lastUsedAt ? formatDate(key.lastUsedAt) : <span className="italic" style={{ opacity: 0.6 }}>Never</span>}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLabelOpen(key._id, key.label)}
                                  title="Edit label"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyKeyFromTable(key.keyPrefix, key._id)}
                                  title="Copy key prefix"
                                >
                                  {copiedIndex === key._id ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                                {key.status === "suspended" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleKeyAction(key._id, "activate")}
                                    disabled={actionLoading === key._id}
                                    title="Activate"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                {key.status === "active" && !isExpired && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleKeyAction(key._id, "suspend")}
                                    disabled={actionLoading === key._id}
                                    title="Suspend"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                {key.status !== "revoked" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleKeyAction(key._id, "revoke")}
                                    disabled={actionLoading === key._id}
                                    title="Revoke"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── Usage Analytics Tab ──────────────────────────────────────── */}
        <TabsContent value="usage">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Requests Today"
                value={usageStats?.totalRequests ?? 0}
                subtitle="Total API calls"
                icon={<Activity className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Errors"
                value={usageStats?.errorCount ?? 0}
                subtitle={`${usageStats?.errorRate ?? 0}% error rate`}
                icon={<AlertTriangle className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Avg Response Time"
                value={usageStats ? `${usageStats.avgLatency}ms` : "—"}
                subtitle="Across all endpoints"
                icon={<Clock className="w-4 h-4" />}
                size="md"
              />
              <StatCard
                title="Rate Limit"
                value="2,000/min"
                subtitle="Per API key"
                icon={<Activity className="w-4 h-4" />}
                size="md"
              />
            </div>

            {/* Usage Trend Chart */}
            {dailyCounts.length > 0 && (
              <Card variant="outlined">
                <CardHeader>
                  <h2 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Usage Trend (7 Days)
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="min-h-[180px]">
                    {(() => {
                      const root = document.documentElement;
                      const primary = getComputedStyle(root).getPropertyValue("--color-primary").trim() || "#3b82f6";
                      const errorColor = getComputedStyle(root).getPropertyValue("--error").trim() || "#ff4d67";
                      return (
                        <Line
                          data={{
                            labels: dailyCounts.map((d) => {
                              const date = new Date(d._id);
                              return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                            }),
                            datasets: [
                              {
                                label: "Requests",
                                data: dailyCounts.map((d) => d.count),
                                borderColor: primary,
                                backgroundColor: `${primary}1A`,
                                fill: true,
                                tension: 0.3,
                                pointRadius: 3,
                                pointHoverRadius: 6,
                              },
                              {
                                label: "Errors",
                                data: dailyCounts.map((d) => d.errors),
                                borderColor: errorColor,
                                backgroundColor: `${errorColor}1A`,
                                fill: true,
                                tension: 0.3,
                                pointRadius: 3,
                                pointHoverRadius: 6,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { intersect: false, mode: "index" },
                            plugins: {
                              legend: { position: "top", labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
                            },
                            scales: {
                              x: { ticks: { color: "var(--text-muted)", font: { size: 11 } }, grid: { display: false } },
                              y: { beginAtZero: true, ticks: { color: "var(--text-muted)", font: { size: 11 } }, grid: { color: "var(--border-color)" } },
                            },
                          }}
                        />
                      );
                    })()}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Latency Trend */}
            {dailyCounts.some((d) => d.avgLatency > 0) && (
              <Card variant="outlined">
                <CardHeader>
                  <h2 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Avg Response Time (7 Days)
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="min-h-[140px]">
                    {(() => {
                      const root = document.documentElement;
                      const warning = getComputedStyle(root).getPropertyValue("--warning").trim() || "#f5a524";
                      return (
                        <Bar
                          data={{
                            labels: dailyCounts.map((d) => {
                              const date = new Date(d._id);
                              return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                            }),
                            datasets: [{
                              label: "Avg Latency (ms)",
                              data: dailyCounts.map((d) => Math.round(d.avgLatency)),
                              backgroundColor: `${warning}B3`,
                              borderRadius: 4,
                            }],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                            },
                            scales: {
                              x: { ticks: { color: "var(--text-muted)", font: { size: 11 } }, grid: { display: false } },
                              y: { beginAtZero: true, ticks: { color: "var(--text-muted)", font: { size: 11 } }, grid: { color: "var(--border-color)" } },
                            },
                          }}
                        />
                      );
                    })()}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Per-Key Usage */}
            {perKeyUsage.length > 0 && (
              <Card variant="outlined">
                <CardHeader>
                  <h2 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Per-Key Usage (Today)
                  </h2>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHeaderCell>Key</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                          <TableHeaderCell>Requests</TableHeaderCell>
                          <TableHeaderCell>Errors</TableHeaderCell>
                          <TableHeaderCell>Avg Latency</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {perKeyUsage.map((pk) => (
                          <TableRow key={pk.apiKeyId}>
                            <TableCell>
                              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{pk.label}</span>
                              <code className="text-xs ml-2" style={{ color: "var(--color-secondary)" }}>{pk.keyPrefix}...</code>
                            </TableCell>
                            <TableCell>{getStatusBadge(pk.status)}</TableCell>
                            <TableCell className="text-sm">{pk.totalRequests}</TableCell>
                            <TableCell className="text-sm" style={{ color: pk.errorCount > 0 ? "var(--error)" : "var(--text-secondary)" }}>{pk.errorCount}</TableCell>
                            <TableCell className="text-sm">{Math.round(pk.avgLatency)}ms</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card variant="outlined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    Recent Requests
                  </h2>
                  {usageLogsMeta && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {usageLogsMeta.total} total
                    </span>
                  )}
                </div>
              </CardHeader>
              {usageLogsLoading ? (
                <CardBody>
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} variant="rectangular" height="2.5rem" />
                    ))}
                  </div>
                </CardBody>
              ) : usageLogsError ? (
                <CardBody>
                  <Alert status="error" variant="left-accent">{usageLogsError}</Alert>
                </CardBody>
              ) : usageLogs.length === 0 ? (
                <CardBody>
                  <EmptyState
                    icon={<Activity className="w-6 h-6" />}
                    title="No usage data yet"
                    description="Start making API calls to see your usage logs."
                    action={
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => window.location.href = "/agent/dashboard/api-marketplace/docs"}
                      >
                        <Book className="w-4 h-4 mr-1.5" />
                        API Docs
                      </Button>
                    }
                  />
                </CardBody>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHeaderCell>Time</TableHeaderCell>
                          <TableHeaderCell>Method</TableHeaderCell>
                          <TableHeaderCell>Path</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                          <TableHeaderCell>Duration</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usageLogs.map((log) => (
                          <TableRow key={log._id}>
                            <TableCell className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                              {new Date(log.timestamp).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                colorScheme={
                                  log.method === "GET" ? "primary" :
                                  log.method === "POST" ? "success" :
                                  log.method === "DELETE" ? "error" : "warning"
                                }
                              >
                                {log.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm max-w-[200px] sm:max-w-[300px] truncate">
                              {log.path}
                            </TableCell>
                            <TableCell>
                              <Badge
                                colorScheme={
                                  log.statusCode < 300 ? "success" :
                                  log.statusCode < 400 ? "warning" : "error"
                                }
                              >
                                {log.statusCode}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {log.responseTimeMs}ms
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {usageLogsMeta && usageLogsMeta.total > 0 && (
                    <div className="px-3 pb-3">
                      <Pagination
                        currentPage={usageLogsPage}
                        totalPages={Math.ceil(usageLogsMeta.total / 10)}
                        totalItems={usageLogsMeta.total}
                        itemsPerPage={10}
                        onPageChange={(p) => setUsageLogsPage(p)}
                        showPerPageSelector={false}
                        variant="compact"
                      />
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ── Webhooks Tab ──────────────────────────────────────────── */}
        <TabsContent value="webhooks">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button className="w-full sm:w-auto" onClick={() => setShowCreateWebhook(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Webhook
              </Button>
            </div>

            {webhooksLoading ? (
              <Card variant="outlined">
                <CardBody><div className="space-y-3">{[...Array(2)].map((_, i) => (<Skeleton key={i} variant="rectangular" height="4rem" />))}</div></CardBody>
              </Card>
            ) : webhooksError ? (
              <Card variant="outlined"><CardBody><Alert status="error" variant="left-accent">{webhooksError}</Alert></CardBody></Card>
            ) : webhooks.length === 0 ? (
              <Card variant="outlined">
                <CardBody>
                  <EmptyState
                    icon={<Webhook className="w-6 h-6" />}
                    title="No webhooks configured"
                    description="Create a webhook endpoint to receive real-time order status updates."
                    action={
                      <Button className="w-full sm:w-auto" onClick={() => setShowCreateWebhook(true)}>
                        <Plus className="w-4 h-4 mr-1.5" /> Add Webhook
                      </Button>
                    }
                  />
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <Card key={wh._id} variant="outlined">
                    <CardBody>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge colorScheme={wh.active ? "success" : "warning"}>{wh.active ? "Active" : "Inactive"}</Badge>
                            <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                              {wh.description || wh.url}
                            </span>
                          </div>
                          <code className="text-xs font-mono block truncate" style={{ color: "var(--color-secondary)" }}>
                            {wh.url}
                          </code>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {wh.events.map((ev) => (
                              <Badge key={ev} colorScheme="info" className="text-xs">{ev}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => handleTestWebhook(wh._id)} title="Test webhook">
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setShowWebhookDetail(showWebhookDetail === wh._id ? null : wh._id); if (showWebhookDetail !== wh._id) loadDeliveryLogs(wh._id); }} title="View deliveries">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(wh._id)} title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Delivery Logs */}
                      {showWebhookDetail === wh._id && (
                        <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Recent Deliveries</p>
                          {deliveryLogsLoading ? (
                            <Skeleton variant="rectangular" height="3rem" />
                          ) : webhookDeliveryLogs.length === 0 ? (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No delivery attempts yet.</p>
                          ) : (
                            <div className="space-y-1">
                              {webhookDeliveryLogs.slice(0, 5).map((log) => (
                                <div key={log._id} className="flex items-center gap-2 text-xs py-1" style={{ color: "var(--text-secondary)" }}>
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                                  <span className="font-mono">{log.event}</span>
                                  <span>{log.statusCode || "—"}</span>
                                  <span>{log.durationMs}ms</span>
                                  <span className="text-[var(--text-muted)]">attempt {log.attempt}/{log.maxAttempts}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Wallet Tab ─────────────────────────────────────────────── */}
        <TabsContent value="wallet">
          <div className="space-y-4">
            <Card variant="outlined">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Wallet Balance</p>
                    {walletLoading ? (
                      <div className="h-8 w-32 rounded" style={{ backgroundColor: "var(--bg-surface-alt)" }} />
                    ) : (
                      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        {walletCurrency} {walletBalance !== null ? walletBalance.toFixed(2) : "—"}
                      </p>
                    )}
                  </div>
                  <Wallet className="w-10 h-10" style={{ color: "var(--color-secondary)", opacity: 0.5 }} />
                </div>
              </CardBody>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <h2 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Top Up Wallet
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Initiate a wallet top-up via Paystack. You'll be redirected to complete payment.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    Amount (GHS)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="e.g. 100"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleInitiateTopup}
                      disabled={!topupAmount || Number(topupAmount) < 1 || topupLoading}
                    >
                      {topupLoading ? "Processing..." : "Top Up"}
                    </Button>
                  </div>
                </div>

                {topupResult && (
                  <div className="rounded-lg border p-3" style={{
                    borderColor: topupResult.success ? "var(--success)" : "var(--error)",
                    backgroundColor: topupResult.success ? "color-mix(in srgb, var(--success) 8%, transparent)" : "color-mix(in srgb, var(--error) 8%, transparent)",
                  }}>
                    {topupResult.success && topupResult.data ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Top-up initiated successfully
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Reference: <code className="font-mono">{topupResult.data.reference}</code>
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Amount: {walletCurrency} {topupResult.data!.amount.toFixed(2)}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(topupResult.data!.authorizationUrl, "_blank")}
                        >
                          Complete Payment
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "var(--error)" }}>
                        {topupResult.message}
                      </p>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </TabsContent>

        {/* ── Orders Tab ────────────────────────────────────────────── */}
        <TabsContent value="orders">
          <div className="space-y-4">
            <Card variant="outlined">
              <CardBody>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-48">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => { setOrderStatusFilter(e.target.value); setOrdersPage(1); }}
                      className="w-full text-sm rounded-md px-3 py-2 border"
                      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {ordersLoading ? (
              <Card variant="outlined">
                <CardBody><div className="space-y-3">{[...Array(3)].map((_, i) => (<Skeleton key={i} variant="rectangular" height="3rem" />))}</div></CardBody>
              </Card>
            ) : ordersError ? (
              <Card variant="outlined"><CardBody><Alert status="error" variant="left-accent">{ordersError}</Alert></CardBody></Card>
            ) : orders.length === 0 ? (
              <Card variant="outlined">
                <CardBody>
                  <EmptyState
                    icon={<Package className="w-6 h-6" />}
                    title="No orders found"
                    description={orderStatusFilter ? "No orders match the selected status." : "Orders placed via API will appear here."}
                  />
                </CardBody>
              </Card>
            ) : (
              <Card variant="outlined">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Order #</TableHeaderCell>
                        <TableHeaderCell>Bundle</TableHeaderCell>
                        <TableHeaderCell>Customer</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Payment</TableHeaderCell>
                        <TableHeaderCell>Date</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order._id}
                          className="cursor-pointer transition-colors hover:bg-[var(--bg-surface-alt)]"
                          onClick={() => { setOrderDetail(order as unknown as OrderDetail); setShowOrderDetail(true); }}
                        >
                          <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                          <TableCell className="text-sm">{order.bundle?.name || "—"}</TableCell>
                          <TableCell className="text-sm">{order.customerPhone}</TableCell>
                          <TableCell className="text-sm font-medium">GH₵{order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge colorScheme={
                              order.status === "completed" ? "success" :
                              order.status === "processing" ? "info" :
                              order.status === "failed" ? "error" : "warning"
                            }>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge colorScheme={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {ordersMeta && ordersMeta.total > 0 && (
                  <div className="px-3 pb-3">
                    <Pagination
                      currentPage={ordersPage}
                      totalPages={Math.ceil(ordersMeta.total / 10)}
                      totalItems={ordersMeta.total}
                      itemsPerPage={10}
                      onPageChange={(p) => setOrdersPage(p)}
                      showPerPageSelector={false}
                      variant="compact"
                    />
                  </div>
                )}
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Create Key Modal ────────────────────────────────────────── */}
      <Dialog isOpen={showCreateModal} onClose={handleCloseCreateModal}>
        <DialogHeader>
          {createdKey ? "API Key Created" : "Create API Key"}
        </DialogHeader>
        <DialogBody className="space-y-4">
          {createdKey ? (
            <>
              <Alert status="warning" variant="left-accent">
                This is the only time you'll see this key. Store it securely — it cannot be recovered.
              </Alert>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Your API Key
                </label>
                <div className="flex gap-2">
                  <Input value={createdKey.key} readOnly className="font-mono text-sm flex-1" />
                  <Button onClick={() => handleCopyKey(createdKey.key)}>
                    {copiedIndex === "created" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Label
                </label>
                <Input value={createdKey.label} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Permissions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {createdKey.permissions.map((perm) => (
                    <Badge key={perm} colorScheme="primary">{perm}</Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Create a new API key to access the marketplace API. Give it a descriptive label so you can
                identify it later.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Label
                </label>
                <Input
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder="e.g. Production, Staging, My App"
                  maxLength={50}
                />
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter justify="end">
          {createdKey ? (
            <Button onClick={handleCloseCreateModal}>Done</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCloseCreateModal}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateKey}
                disabled={!newKeyLabel.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create Key"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </Dialog>

      {/* ── Revoke Confirmation Dialog ─────────────────────────────── */}
      <Dialog isOpen={!!showRevokeConfirm} onClose={() => setShowRevokeConfirm(null)}>
        <DialogHeader>Revoke API Key</DialogHeader>
        <DialogBody>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to revoke this API key? Any applications using it will immediately lose
            access. This action cannot be undone.
          </p>
        </DialogBody>
        <DialogFooter justify="end">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowRevokeConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRevokeKey}
              disabled={isRevoking}
            >
              {isRevoking ? "Revoking..." : "Revoke Key"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {/* ── Key Detail Dialog ────────────────────────────────────────── */}
      <Dialog isOpen={!!selectedKeyId} onClose={handleCloseKeyDetail} size="lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" style={{ color: "var(--color-secondary)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                API Key Details
              </h2>
            </div>
            <button onClick={handleCloseKeyDetail} className="p-1 rounded hover:bg-[var(--bg-surface-alt)]" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </DialogHeader>
        <DialogBody>
          {keyDetailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--color-secondary)" }} />
            </div>
          ) : keyDetailError ? (
            <div className="text-center py-8">
              <p style={{ color: "var(--error)" }}>{keyDetailError}</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => selectedKeyId && loadKeyDetail(selectedKeyId)}>
                Retry
              </Button>
            </div>
          ) : keyDetail ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                {getStatusBadge(keyDetail.status)}
                <code className="text-sm font-mono" style={{ color: "var(--color-secondary)" }}>{keyDetail.keyPrefix}...</code>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Key Info</h3>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Label</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{keyDetail.label}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Created</p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>{formatDateTime(keyDetail.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Last Used</p>
                    <p className="text-sm" style={{ color: keyDetail.lastUsedAt ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {keyDetail.lastUsedAt ? formatDateTime(keyDetail.lastUsedAt) : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Expires</p>
                    <p className="text-sm" style={{ color: keyDetail.expiresAt ? "var(--warning)" : "var(--text-muted)" }}>
                      {keyDetail.expiresAt ? formatDate(keyDetail.expiresAt) : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Allowed IPs</p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {keyDetail.allowedIps?.length ? keyDetail.allowedIps.join(", ") : "Any"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Rate Limit Override</p>
                    <p className="text-sm" style={{ color: keyDetail.rateLimitOverride ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {keyDetail.rateLimitOverride ? `${keyDetail.rateLimitOverride}/min` : "Default"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {keyDetail.permissions.map((p) => (
                    <span key={p} className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                <Button variant="ghost" size="sm" onClick={() => handleEditLabelOpen(keyDetail._id, keyDetail.label)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Label
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleRegenerateKey(keyDetail._id)} disabled={actionLoading === keyDetail._id}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleSetExpiry(keyDetail._id)}>
                  <Clock className="w-3.5 h-3.5 mr-1" /> Set Expiry
                </Button>
                {keyDetail.status === "suspended" && (
                  <Button variant="ghost" size="sm" onClick={() => { handleKeyAction(keyDetail._id, "activate"); handleCloseKeyDetail(); }}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Activate
                  </Button>
                )}
                {keyDetail.status === "active" && (
                  <Button variant="ghost" size="sm" onClick={() => { handleKeyAction(keyDetail._id, "suspend"); handleCloseKeyDetail(); }}>
                    <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                  </Button>
                )}
                {keyDetail.status !== "revoked" && (
                  <Button variant="ghost" size="sm" onClick={() => { handleKeyAction(keyDetail._id, "revoke"); handleCloseKeyDetail(); }}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Revoke
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogBody>
      </Dialog>

      {/* ── Edit Label Dialog ────────────────────────────────────────── */}
      <Dialog isOpen={!!showEditLabel} onClose={() => setShowEditLabel(null)}>
        <DialogHeader>Edit Key Label</DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              Label
            </label>
            <Input
              value={editLabelValue}
              onChange={(e) => setEditLabelValue(e.target.value)}
              placeholder="e.g. Production, Staging"
              maxLength={50}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveLabel(); }}
            />
          </div>
        </DialogBody>
        <DialogFooter justify="end">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowEditLabel(null)}>Cancel</Button>
            <Button onClick={handleSaveLabel} disabled={!editLabelValue.trim() || isSavingLabel}>
              {isSavingLabel ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {/* ── Create Webhook Dialog ────────────────────────────────────── */}
      <WebhookCreateDialog
        isOpen={showCreateWebhook}
        onClose={() => setShowCreateWebhook(false)}
        onCreate={handleCreateWebhook}
        availableEvents={WEBHOOK_EVENTS}
      />

      {/* ── Order Detail Dialog ──────────────────────────────────────── */}
      <Dialog isOpen={showOrderDetail} onClose={() => setShowOrderDetail(false)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: "var(--color-secondary)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Order {orderDetail?.orderNumber || ""}
            </h2>
          </div>
        </DialogHeader>
        <DialogBody>
          {orderDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Status</p>
                  <Badge colorScheme={
                    orderDetail.status === "completed" ? "success" :
                    orderDetail.status === "processing" ? "info" :
                    orderDetail.status === "failed" ? "error" : "warning"
                  }>{orderDetail.status}</Badge>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Payment</p>
                  <Badge colorScheme={orderDetail.paymentStatus === "paid" ? "success" : "warning"}>{orderDetail.paymentStatus}</Badge>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Bundle</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{orderDetail.bundle?.name || "—"}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Quantity</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{orderDetail.quantity}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Customer</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{orderDetail.customerPhone}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>GH₵{orderDetail.total.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Created</p>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{formatDateTime(orderDetail.createdAt)}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Served By</p>
                  <p className="text-sm" style={{ color: orderDetail.servedBy ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {orderDetail.servedBy || "—"}
                  </p>
                </div>
              </div>
              {orderDetail.notes && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Notes</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{orderDetail.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter justify="end">
          <Button variant="ghost" onClick={() => setShowOrderDetail(false)}>Close</Button>
        </DialogFooter>
      </Dialog>

      {/* Info dialog */}
      <ApiMarketplaceInfoDialog
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
};
