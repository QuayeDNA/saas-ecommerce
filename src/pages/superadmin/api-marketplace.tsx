import { useState, useEffect, useCallback } from "react";
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { FaCode, FaKey, FaChartLine, FaCog, FaSearch, FaBan, FaCheck, FaTrash, FaSync, FaTimes, FaEye, FaInfoCircle } from "react-icons/fa";
import { Card, CardHeader, CardBody, Button, Badge, StatCard, Input, Select, Spinner, Dialog, DialogHeader, DialogBody, DialogFooter, Pagination, Tabs, TabsList, TabsTrigger, TabsContent, useToast } from "../../design-system";
import { ApiMarketplaceInfoDialog } from "../../components/api-marketplace/ApiMarketplaceInfoDialog";
import { adminMarketplaceService, type AdminKeyListItem, type AdminKeyDetail, type AdminUsageLogEntry, type AgentUsageSummary, type DailyCount } from "../../services/admin-marketplace.service";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const statusBadgeColor = (status: string) => {
  switch (status) {
    case "active": return "success" as const;
    case "suspended": return "warning" as const;
    case "revoked": return "error" as const;
    default: return "default" as const;
  }
};

const userTypeBadgeColor = (ut: string | null) => {
  switch (ut) {
    case "super_admin": return "error" as const;
    case "agent": return "success" as const;
    case "super_agent": return "warning" as const;
    case "dealer": return "info" as const;
    case "super_dealer": return "info" as const;
    default: return "default" as const;
  }
};

export default function SuperAdminApiMarketplacePage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          API Marketplace Management
        </h1>
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="What is API Marketplace?"
        >
          <FaInfoCircle className="w-4 h-4" />
          What's this?
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="overview"><FaChartLine className="w-4 h-4 mr-1.5" /> Overview</TabsTrigger>
          <TabsTrigger value="keys"><FaKey className="w-4 h-4 mr-1.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="usage"><FaCode className="w-4 h-4 mr-1.5" /> Usage Logs</TabsTrigger>
          <TabsTrigger value="settings"><FaCog className="w-4 h-4 mr-1.5" /> Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="keys"><KeysTab /></TabsContent>
        <TabsContent value="usage"><UsageTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>

      <ApiMarketplaceInfoDialog
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab() {
  const { addToast } = useToast();
  const [stats, setStats] = useState<{ usage: { totalRequests: number; errorCount: number; avgLatency: number; errorRate: number }; keys: { total: number; active: number; suspended: number; revoked: number } | null } | null>(null);
  const [topAgents, setTopAgents] = useState<AgentUsageSummary[]>([]);
  const [agentMeta, setAgentMeta] = useState<{ total: number; page: number; limit: number; hasMore: boolean } | null>(null);
  const [agentPage, setAgentPage] = useState(1);
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingAgent, setRevokingAgent] = useState<string | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const agentLimit = 10;

  const handleRevokeAllKeys = async () => {
    if (!revokingAgent) return;
    setRevokeLoading(true);
    try {
      const res = await adminMarketplaceService.revokeAllAgentKeys(revokingAgent);
      if (res.success) {
        addToast(`Revoked ${res.data.revokedCount} key(s)`, "success");
        setRevokingAgent(null);
      } else {
        addToast(res.message || "Failed to revoke keys", "error");
      }
    } catch {
      addToast("Failed to revoke keys", "error");
    } finally {
      setRevokeLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, agentsRes, dailyRes] = await Promise.allSettled([
        adminMarketplaceService.getAggregateStats(),
        adminMarketplaceService.getAgentUsageSummary({ page: agentPage, limit: agentLimit }),
        adminMarketplaceService.getDailyCounts(7),
      ]);
      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        setStats(statsRes.value.data);
      } else {
        setError("Failed to load aggregate stats");
      }
      if (agentsRes.status === "fulfilled" && agentsRes.value.success) {
        setTopAgents(agentsRes.value.data);
        if ("meta" in agentsRes.value && agentsRes.value.meta) {
          setAgentMeta(agentsRes.value.meta as { total: number; page: number; limit: number; hasMore: boolean });
        }
      }
      if (dailyRes.status === "fulfilled" && dailyRes.value.success) {
        setDailyCounts(dailyRes.value.data);
      }
    } catch {
      setError("Failed to load overview data");
    } finally {
      setLoading(false);
    }
  }, [agentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <Card variant="outlined">
        <CardBody className="flex justify-center py-12">
          <Spinner />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined">
        <CardBody>
          <div className="text-center py-8">
            <p style={{ color: "var(--error)" }}>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const root = document.documentElement;
  const primaryColor = getComputedStyle(root).getPropertyValue("--color-primary").trim() || "#3b82f6";
  const successColor = getComputedStyle(root).getPropertyValue("--success").trim() || "#00c781";
  const warningColor = getComputedStyle(root).getPropertyValue("--warning").trim() || "#f5a524";
  const errorColor = getComputedStyle(root).getPropertyValue("--error").trim() || "#ff4d67";

  const keyChartData = stats?.keys ? {
    labels: ["Active", "Suspended", "Revoked"],
    datasets: [{
      data: [stats.keys.active, stats.keys.suspended, stats.keys.revoked],
      backgroundColor: [`${successColor}D9`, `${warningColor}D9`, `${errorColor}D9`],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  } : null;

  const dailyChartData = dailyCounts.length > 0 ? {
    labels: dailyCounts.map((d) => {
      const date = new Date(d._id);
      return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Requests",
        data: dailyCounts.map((d) => d.count),
        borderColor: primaryColor,
        backgroundColor: `${primaryColor}1A`,
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
  } : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Stats Row */}
      {stats?.keys && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total Keys" value={stats.keys.total.toLocaleString()} icon={<FaKey />} size="sm" />
          <StatCard title="Active" value={stats.keys.active.toLocaleString()} icon={<FaKey />} size="sm" />
          <StatCard title="Suspended" value={stats.keys.suspended.toLocaleString()} icon={<FaBan />} size="sm" />
          <StatCard title="Revoked" value={stats.keys.revoked.toLocaleString()} icon={<FaTrash />} size="sm" />
        </div>
      )}

      {/* Usage Stats Row */}
      {stats?.usage && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Requests Today" value={stats.usage.totalRequests.toLocaleString()} icon={<FaChartLine />} size="sm" />
          <StatCard title="Errors" value={stats.usage.errorCount.toLocaleString()} icon={<FaCode />} size="sm" />
          <StatCard title="Avg Latency" value={`${stats.usage.avgLatency}ms`} icon={<FaChartLine />} size="sm" />
          <StatCard title="Error Rate" value={`${stats.usage.errorRate}%`} icon={<FaChartLine />} size="sm" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {stats?.keys && keyChartData && (
          <Card variant="outlined" className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Key Distribution</h3>
            </CardHeader>
            <CardBody className="flex items-center justify-center min-h-[220px]">
              <Doughnut
                data={keyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: {
                    legend: { position: "bottom", labels: { usePointStyle: true, padding: 12, boxWidth: 8, font: { size: 11 } } },
                  },
                }}
              />
            </CardBody>
          </Card>
        )}
        {dailyChartData && (
          <Card variant="outlined" className="lg:col-span-3">
            <CardHeader>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Usage Trend (7 Days)</h3>
            </CardHeader>
            <CardBody>
              <div className="min-h-[220px]">
                <Line
                  data={dailyChartData}
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
            </div>
          </CardBody>
        </Card>
      )}
      </div>

      {/* Top Agents */}
      {topAgents.length > 0 && (
        <Card variant="outlined">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Agent Usage Today
              </h2>
              {agentMeta && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {agentMeta.total} agent{agentMeta.total !== 1 ? "s" : ""} total
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>#</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Agent</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Email</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Type</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Requests</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Errors</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Avg Latency</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: "var(--text-muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {topAgents.map((entry, i) => (
                    <tr key={entry._id} className="border-b" style={{ borderColor: "var(--border-color)" }}>
                      <td className="py-3 px-2" style={{ color: "var(--text-secondary)" }}>{i + 1}</td>
                      <td className="py-3 px-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {entry.agent?.name || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {entry.agent?.email || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {entry.agent?.userType ? (
                          <Badge colorScheme={userTypeBadgeColor(entry.agent.userType)}>
                            {entry.agent.userType.replace("_", " ")}
                          </Badge>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                        {entry.totalRequests.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right" style={{ color: entry.errorCount > 0 ? "var(--error)" : "var(--text-secondary)" }}>
                        {entry.errorCount}
                      </td>
                      <td className="py-3 px-2 text-right" style={{ color: "var(--text-secondary)" }}>
                        {Math.round(entry.avgLatency)}ms
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => setRevokingAgent(entry._id)}
                          className="text-xs px-2 py-1 rounded transition-colors"
                          style={{ color: "var(--error)", backgroundColor: "transparent" }}
                          title="Revoke all API keys for this agent"
                        >
                          <FaTrash className="w-3 h-3 inline mr-1" /> Revoke All
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {agentMeta && agentMeta.total > 0 && (
              <div className="px-3 pt-3">
                <Pagination
                  currentPage={agentPage}
                  totalPages={Math.ceil(agentMeta.total / agentLimit)}
                  totalItems={agentMeta.total}
                  itemsPerPage={agentLimit}
                  onPageChange={(p) => { setAgentPage(p); }}
                  showPerPageSelector={false}
                  variant="compact"
                />
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {!stats && !error && (
        <Card variant="outlined">
          <CardBody className="text-center py-8">
            <p style={{ color: "var(--text-muted)" }}>No usage data available yet.</p>
          </CardBody>
        </Card>
      )}

      {/* Revoke All Keys Confirmation */}
      <Dialog isOpen={!!revokingAgent} onClose={() => setRevokingAgent(null)}>
        <DialogHeader>Revoke All API Keys</DialogHeader>
        <DialogBody>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to revoke <strong>all</strong> active and suspended API keys
            for this agent? This action cannot be undone. The agent will be notified.
          </p>
        </DialogBody>
        <DialogFooter justify="end">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setRevokingAgent(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeAllKeys} disabled={revokeLoading}>
              {revokeLoading ? "Revoking..." : "Revoke All Keys"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

// ─── Keys Tab ───────────────────────────────────────────────────────────────

function KeysTab() {
  const [keys, setKeys] = useState<AdminKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total: number; hasMore: boolean } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Detail dialog state
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminKeyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminMarketplaceService.listAllKeys({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      });
      if (res.success) {
        setKeys(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setError("Failed to load API keys");
      }
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleAction = async (id: string, action: "suspend" | "activate" | "revoke") => {
    setActionLoading(id);
    try {
      if (action === "suspend") await adminMarketplaceService.suspendKey(id);
      else if (action === "activate") await adminMarketplaceService.activateKey(id);
      else await adminMarketplaceService.revokeKey(id);
      await fetchKeys();
    } catch {
      setError(`Failed to ${action} key`);
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = async (id: string) => {
    setSelectedKeyId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const res = await adminMarketplaceService.getKeyById(id);
      if (res.success) {
        setDetail(res.data);
      } else {
        setDetailError("Failed to load key details");
      }
    } catch {
      setDetailError("Failed to load key details");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedKeyId(null);
    setDetail(null);
    setDetailError(null);
  };

  const getAgentName = (key: AdminKeyListItem): string => {
    if (!key.agent) return "—";
    return key.agent.name || key.agent.email || key.agent._id;
  };

  const getAgentEmail = (key: AdminKeyListItem): string | null => {
    return key.agent?.email || null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by label or key prefix..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<FaSearch />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "active", label: "Active" },
                  { value: "suspended", label: "Suspended" },
                  { value: "revoked", label: "Revoked" },
                ]}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card variant="outlined">
          <CardBody>
            <p style={{ color: "var(--error)" }}>{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Keys Table */}
      <Card variant="outlined">
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12">
              <FaKey className="mx-auto text-3xl mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)" }}>No API keys found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Agent</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Email</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Type</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Label</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Prefix</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
                    <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr
                      key={key._id}
                      className="border-b cursor-pointer transition-colors hover:bg-[var(--bg-surface-alt)]"
                      style={{ borderColor: "var(--border-color)" }}
                      onClick={() => openDetail(key._id)}
                    >
                      <td className="py-3 px-3">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {getAgentName(key)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {getAgentEmail(key) || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {key.agent?.userType ? (
                          <Badge colorScheme={userTypeBadgeColor(key.agent.userType)}>
                            {key.agent.userType.replace("_", " ")}
                          </Badge>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium" style={{ color: "var(--text-primary)" }}>
                        {key.label}
                      </td>
                      <td className="py-3 px-3">
                        <code className="text-xs" style={{ color: "var(--color-secondary)" }}>
                          {key.keyPrefix}...
                        </code>
                      </td>
                      <td className="py-3 px-3">
                        <Badge colorScheme={statusBadgeColor(key.status)}>{key.status}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          {key.status === "suspended" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(key._id, "activate")}
                              disabled={actionLoading === key._id}
                              title="Activate"
                            >
                              <FaCheck className="w-3 h-3" />
                            </Button>
                          )}
                          {key.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(key._id, "suspend")}
                              disabled={actionLoading === key._id}
                              title="Suspend"
                            >
                              <FaBan className="w-3 h-3" />
                            </Button>
                          )}
                          {key.status !== "revoked" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(key._id, "revoke")}
                              disabled={actionLoading === key._id}
                              title="Revoke"
                            >
                              <FaTrash className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetail(key._id)}
                            title="View Details"
                          >
                            <FaEye className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(meta.total / 20)}
          totalItems={meta.total}
          itemsPerPage={20}
          onPageChange={setPage}
          showPerPageSelector={false}
          variant="compact"
        />
      )}

      {/* Key Detail Dialog */}
      <Dialog isOpen={!!selectedKeyId} onClose={closeDetail} size="lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaKey style={{ color: "var(--color-primary)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                API Key Details
              </h2>
            </div>
            <button
              onClick={closeDetail}
              className="p-1 rounded hover:bg-[var(--bg-surface-alt)] transition-colors"
            >
              <FaTimes style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </DialogHeader>
        <DialogBody>
          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : detailError ? (
            <div className="text-center py-8">
              <FaInfoCircle className="mx-auto text-2xl mb-2" style={{ color: "var(--error)" }} />
              <p style={{ color: "var(--error)" }}>{detailError}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => selectedKeyId && openDetail(selectedKeyId)}>
                Retry
              </Button>
            </div>
          ) : detail ? (
            <div className="space-y-5">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                <Badge colorScheme={statusBadgeColor(detail.status)} size="lg">{detail.status}</Badge>
                <code className="text-sm font-mono" style={{ color: "var(--color-secondary)" }}>
                  {detail.keyPrefix}...
                </code>
              </div>

              {/* Agent info */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Agent</h3>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  {typeof detail.agentId === "object" && detail.agentId ? (
                    <>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Name</p>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {detail.agentId.name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Email</p>
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                          {detail.agentId.email || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>User Type</p>
                        <Badge colorScheme={userTypeBadgeColor(detail.agentId.userType)}>
                          {(detail.agentId.userType || "—").replace("_", " ")}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>ID</p>
                        <code className="text-xs" style={{ color: "var(--color-secondary)" }}>
                          {detail.agentId._id}
                        </code>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Agent ID: {String(detail.agentId)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key metadata */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Key Info</h3>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Label</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{detail.label}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Created</p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {new Date(detail.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Last Used</p>
                    <p className="text-sm" style={{ color: detail.lastUsedAt ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {detail.lastUsedAt ? new Date(detail.lastUsedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Expires</p>
                    <p className="text-sm" style={{ color: detail.expiresAt ? "var(--warning)" : "var(--text-muted)" }}>
                      {detail.expiresAt ? new Date(detail.expiresAt).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                {detail.status === "suspended" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => { await handleAction(detail._id, "activate"); closeDetail(); }}
                  >
                    <FaCheck className="w-3 h-3 mr-1" /> Activate
                  </Button>
                )}
                {detail.status === "active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => { await handleAction(detail._id, "suspend"); closeDetail(); }}
                  >
                    <FaBan className="w-3 h-3 mr-1" /> Suspend
                  </Button>
                )}
                {detail.status !== "revoked" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => { await handleAction(detail._id, "revoke"); closeDetail(); }}
                  >
                    <FaTrash className="w-3 h-3 mr-1" /> Revoke
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogBody>
      </Dialog>
    </div>
  );
}

// ─── Usage Tab ──────────────────────────────────────────────────────────────

function UsageTab() {
  const [logs, setLogs] = useState<AdminUsageLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total: number; hasMore: boolean } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminMarketplaceService.getUsageLogs({ limit: 20, page });
      if (res.success) {
        setLogs(res.data);
        if (res.meta) setMeta(res.meta);
      } else {
        setError("Failed to load usage logs");
      }
    } catch {
      setError("Failed to load usage logs");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const getAgentName = (log: AdminUsageLogEntry): string => {
    if (typeof log.agentId === "object" && log.agentId) {
      return log.agentId.name || log.agentId.email || log.agentId._id;
    }
    return String(log.agentId);
  };

  const getKeyLabel = (log: AdminUsageLogEntry): string => {
    if (typeof log.apiKeyId === "object" && log.apiKeyId) {
      return log.apiKeyId.label || log.apiKeyId.keyPrefix;
    }
    return String(log.apiKeyId);
  };

  return (
    <div className="space-y-4">
      <Card variant="outlined">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              API Usage Logs
            </h2>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <FaSync className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p style={{ color: "var(--error)" }}>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FaCode className="mx-auto text-3xl mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-muted)" }}>No usage logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border-color)" }}>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Agent</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Key</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Method</th>
                    <th className="text-left py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Path</th>
                    <th className="text-center py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Status</th>
                    <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Latency</th>
                    <th className="text-right py-3 px-3 font-medium" style={{ color: "var(--text-muted)" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b" style={{ borderColor: "var(--border-color)" }}>
                      <td className="py-2 px-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {getAgentName(log)}
                      </td>
                      <td className="py-2 px-3">
                        <code className="text-xs" style={{ color: "var(--color-secondary)" }}>
                          {getKeyLabel(log)}
                        </code>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-mono text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                          {log.method}
                        </span>
                      </td>
                      <td className="py-2 px-3 max-w-[200px] sm:max-w-[300px] truncate">
                        <code className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          {log.path}
                        </code>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className="text-xs font-medium"
                          style={{ color: log.statusCode >= 400 ? "var(--error)" : "var(--text-primary)" }}
                        >
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                        {log.responseTimeMs}ms
                      </td>
                      <td className="py-2 px-3 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {meta && meta.total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(meta.total / 20)}
          totalItems={meta.total}
          itemsPerPage={20}
          onPageChange={setPage}
          showPerPageSelector={false}
          variant="compact"
        />
      )}
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────────────

function SettingsTab() {
  const { addToast } = useToast();
  const [config, setConfig] = useState<{ defaultLimit: number; windowMs: number; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultLimit, setDefaultLimit] = useState(2000);
  const [windowSeconds, setWindowSeconds] = useState(60);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await adminMarketplaceService.getRateLimitConfig();
      if (res.success) {
        setConfig(res.data);
        setDefaultLimit(res.data.defaultLimit);
        setWindowSeconds(res.data.windowMs / 1000);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminMarketplaceService.updateRateLimitConfig({
        defaultLimit,
        windowMs: windowSeconds * 1000,
      });
      if (res.success) {
        addToast("Rate limit configuration saved", "success");
        fetchConfig();
      } else {
        addToast(res.message || "Failed to save", "error");
      }
    } catch {
      addToast("Failed to save rate limit configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card variant="outlined">
        <CardHeader>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Rate Limit Configuration
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : config ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                    Default Limit (requests per window)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={100000}
                    value={defaultLimit}
                    onChange={(e) => setDefaultLimit(Number(e.target.value))}
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Max API requests per key within the time window (1 – 100,000)
                  </p>
                </div>
                <div>
                  <Select
                    label="Time Window"
                    value={String(windowSeconds)}
                    onChange={(v) => setWindowSeconds(Number(v))}
                    options={[
                      { value: "30", label: "30 seconds" },
                      { value: "60", label: "60 seconds" },
                      { value: "120", label: "2 minutes" },
                      { value: "300", label: "5 minutes" },
                      { value: "600", label: "10 minutes" },
                    ]}
                    helperText="The sliding window duration for rate limit counting"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="secondary" onClick={fetchConfig} disabled={saving}>
                  Reset
                </Button>
              </div>

              <hr style={{ borderColor: "var(--border-color)" }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Effective Limit</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {config.defaultLimit.toLocaleString()}
                    <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}> requests / {config.windowMs / 1000}s</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Max Throughput</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {Math.round(config.defaultLimit / (config.windowMs / 1000) * 60).toLocaleString()}
                    <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}> req/min</span>
                  </p>
                </div>
              </div>

              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {config.description}
              </p>

              <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface-alt)" }}>
                <p className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Per-Key Rate Limiting
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Rate limits are applied independently per API key. Each key gets its own counter.
                  Changes take effect immediately for all new requests.
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>Could not load rate limit configuration.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}