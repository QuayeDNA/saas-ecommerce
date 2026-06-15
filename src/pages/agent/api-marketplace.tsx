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
} from "lucide-react";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "keys", label: "API Keys" },
  { id: "usage", label: "Usage Analytics" },
];

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

  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

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
    } catch (err) {
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
      const interval = setInterval(loadUsageLogs, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab, loadUsageLogs, loadDailyCounts]);

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
        <div className="overflow-x-auto flex justify-center -mx-1 sm:mx-0">
          <TabsList className="inline-flex justify-center sm:grid sm:w-full sm:grid-cols-3 sm:justify-items-center gap-1 min-w-max sm:min-w-0 px-1 sm:px-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap px-3 sm:px-4 py-2 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Created</TableHeaderCell>
                        <TableHeaderCell>Last Used</TableHeaderCell>
                        <TableHeaderCell>Expires</TableHeaderCell>
                        <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((key) => {
                        const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                        return (
                          <TableRow key={key._id}>
                            <TableCell className="font-medium">{key.label}</TableCell>
                            <TableCell>
                              <code className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                                {key.keyPrefix}...
                              </code>
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
                            <TableCell className="text-sm" style={{ color: isExpired ? "var(--error)" : "var(--text-secondary)" }}>
                              {key.expiresAt ? formatDate(key.expiresAt) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>Never</span>}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button
                                  variant="secondary"
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
                                {key.status === "active" && !isExpired && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setShowRevokeConfirm(key._id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Revoke
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

      {/* Info dialog */}
      <ApiMarketplaceInfoDialog
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
};
