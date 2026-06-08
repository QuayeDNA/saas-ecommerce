import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaWallet,
  FaPlus,
  FaMinus,
  FaUsers,
  FaClock,
  FaCheck,
  FaTimes,
  FaSync,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
} from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";
import {
  Button,
  Input,
  Form,
  FormField,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Pagination,
  Skeleton,
  StatsGrid,
} from "../../design-system";
import type { StatCardProps } from "../../design-system/components/stats-card";
import { Modal } from "../../design-system/components/modal";
import { SearchAndFilter } from "../../components/common/SearchAndFilter";
import type { WalletTransaction, WalletAnalytics } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";
import { websocketService } from "../../services/websocket.service";
import { userService, type User } from "../../services/user.service";
import {
  BUSINESS_USER_TYPES,
  USER_TYPE_LABELS,
  getUserTypeColor,
} from "../../utils/userTypeHelpers";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n);

// ---------------------------------------------------------------------------
// Transaction Modal
// ---------------------------------------------------------------------------

interface WalletTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  mode: "credit" | "debit";
  onTransaction: (
    userId: string,
    amount: number,
    description: string,
    mode: "credit" | "debit"
  ) => Promise<void>;
}

function WalletTransactionModal({
  isOpen,
  onClose,
  user,
  mode,
  onTransaction,
}: WalletTransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await onTransaction(
        user._id,
        parseFloat(amount),
        description || `${mode === "credit" ? "Top-up" : "Debit"} by super admin`,
        mode
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const isCredit = mode === "credit";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isCredit ? "Credit Wallet" : "Debit Wallet"}>
      <div
        className="rounded-lg p-3 mb-4 flex items-center gap-3"
        style={{
          backgroundColor: `color-mix(in srgb, ${isCredit ? "var(--success)" : "var(--error)"} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${isCredit ? "var(--success)" : "var(--error)"} 30%, transparent)`,
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: isCredit ? "var(--success)" : "var(--error)" }}
        >
          {user.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{user.fullName}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
          {user.agentCode && <p className="text-xs font-mono" style={{ color: "var(--color-primary)" }}>{user.agentCode}</p>}
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Balance</p>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{fmt(user.walletBalance || 0)}</p>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
          style={{
            backgroundColor: `color-mix(in srgb, var(--error) 12%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--error) 30%, transparent)`,
            color: "var(--error)",
          }}
        >
          <FaExclamationTriangle className="flex-shrink-0" />
          {error}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <FormField label="Amount (GH₵)" required>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </FormField>
        <FormField label="Description (optional)">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Reason for ${isCredit ? "credit" : "debit"}`}
          />
        </FormField>
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant={isCredit ? "primary" : "danger"}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            isLoading={loading}
          >
            {isCredit ? <FaPlus className="mr-2" /> : <FaMinus className="mr-2" />}
            {loading ? "Processing..." : `${isCredit ? "Credit" : "Debit"} GH₵${amount || "0.00"}`}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_TYPE_OPTIONS = BUSINESS_USER_TYPES.map((type) => ({
  value: type,
  label: USER_TYPE_LABELS[type],
}));

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

function userTypeBadgeColor(userType: string): "success" | "info" | "warning" | "error" | "gray" {
  const color = getUserTypeColor(userType);
  switch (color) {
    case "green": return "success";
    case "blue": return "info";
    case "yellow": return "warning";
    case "red": return "error";
    default: return "gray";
  }
}

function statusBadgeColor(status: string): "success" | "error" | "warning" | "gray" {
  switch (status) {
    case "active": return "success";
    case "inactive": return "error";
    case "pending": return "warning";
    default: return "gray";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WalletTopUpsPage() {
  const { addToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<WalletTransaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transactionModal, setTransactionModal] = useState<{ isOpen: boolean; mode: "credit" | "debit" }>({
    isOpen: false,
    mode: "credit",
  });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const resp = await userService.getUsers({
        page,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        userType: userTypeFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(resp.users);
      setPagination({
        page: resp.pagination.page,
        limit: resp.pagination.limit,
        total: resp.pagination.total,
        pages: resp.pagination.pages,
      });
    } catch {
      addToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, userTypeFilter, statusFilter, itemsPerPage, addToast]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await walletService.getWalletAnalytics();
      setAnalytics(data);
    } catch { /* silent */ }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const resp = await walletService.getPendingRequests();
      setPendingRequests(resp.transactions);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, userTypeFilter, statusFilter, itemsPerPage]);

  const handleWalletUpdate = useCallback((data: unknown) => {
    if (data && typeof data === "object" && "userId" in data) {
      void fetchUsers(pagination.page);
      void fetchAnalytics();
    }
  }, [fetchUsers, fetchAnalytics, pagination.page]);

  useEffect(() => {
    void fetchAnalytics();
    void fetchPendingRequests();
    websocketService.connect("super_admin");
    websocketService.on("wallet_update", handleWalletUpdate as (data: unknown) => void);
    return () => websocketService.off("wallet_update", handleWalletUpdate as (data: unknown) => void);
  }, [handleWalletUpdate, fetchAnalytics, fetchPendingRequests]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleTransaction = async (
    userId: string,
    amount: number,
    description: string,
    mode: "credit" | "debit"
  ) => {
    if (mode === "credit") {
      await walletService.adminTopUpWallet(userId, amount, description);
      addToast(`Credited ${fmt(amount)} to wallet`, "success");
    } else {
      await walletService.adminDebitWallet(userId, amount, description);
      addToast(`Debited ${fmt(amount)} from wallet`, "success");
    }
    void fetchUsers(pagination.page);
    void fetchAnalytics();
  };

  const handleProcessRequest = async (id: string, approve: boolean) => {
    setProcessingId(id);
    try {
      await walletService.processTopUpRequest(id, approve);
      addToast(approve ? "Request approved" : "Request rejected", approve ? "success" : "warning");
      void fetchPendingRequests();
      void fetchAnalytics();
      void fetchUsers(pagination.page);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to process request", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // SearchAndFilter wiring
  // ---------------------------------------------------------------------------

  const hasFilters = useMemo(
    () => Boolean(searchTerm || userTypeFilter || statusFilter),
    [searchTerm, userTypeFilter, statusFilter]
  );

  const handleFilterChange = (key: string, value: string) => {
    if (key === "userType") setUserTypeFilter(value);
    if (key === "status") setStatusFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setUserTypeFilter("");
    setStatusFilter("");
    setPagination((p) => ({ ...p, page: 1 }));
  };

  // ---------------------------------------------------------------------------
  // Stat card data
  // ---------------------------------------------------------------------------

  const statCards: StatCardProps[] = useMemo(() => {
    if (!analytics) return [];
    return [
      {
        title: "Total Users",
        value: analytics.users.total,
        subtitle: `${analytics.users.withBalance} with balance`,
        icon: <FaUsers />,
        size: "sm",
      },
      {
        title: "Total Balance",
        value: fmt(analytics.balance.total),
        subtitle: `Avg ${fmt(analytics.balance.average)}`,
        icon: <FaChartBar />,
        size: "sm",
      },
      {
        title: "Credits",
        value: analytics.transactions.credits.count,
        subtitle: analytics.transactions.credits.total > 0 ? fmt(analytics.transactions.credits.total) : "No credits yet",
        icon: <FaArrowUp />,
        size: "sm",
      },
      {
        title: "Pending Requests",
        value: pendingRequests.length,
        subtitle: pendingRequests.length > 0 ? "Needs attention" : "All clear",
        icon: <FaClock />,
        size: "sm",
      },
    ];
  }, [analytics, pendingRequests]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Card noPadding>
        <div
          className="px-4 py-5 sm:px-6 sm:py-6 text-white"
          style={{ background: "var(--gradient-brand-dark)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, white 20%, transparent)" }}>
                <FaWallet className="text-xl sm:text-2xl" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Wallet Management</h1>
                <p className="text-xs sm:text-sm mt-0.5" style={{ color: "color-mix(in srgb, white 70%, transparent)" }}>
                  Credit or debit agent wallets &middot; review pending top-up requests
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start sm:self-center border-white/40 text-white hover:bg-white/10"
              onClick={() => {
                void fetchUsers(pagination.page);
                void fetchAnalytics();
                void fetchPendingRequests();
              }}
            >
              <FaSync className="mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      {analytics ? (
        <StatsGrid stats={statCards} columns={4} gap="sm" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="space-y-2">
                  <Skeleton height="0.625rem" width="60%" />
                  <Skeleton height="1.25rem" width="80%" />
                  <Skeleton height="0.625rem" width="50%" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pending top-up requests ─────────────────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <Card
          variant="outlined"
          className="rounded-xl"
          style={{
            borderColor: `color-mix(in srgb, var(--warning) 50%, transparent)`,
          }}
        >
          <CardHeader
            className="px-3 sm:px-4 pt-3 sm:pt-4 pb-0"
            style={{ borderBottom: "none" }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="p-2 rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--warning) 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, var(--warning) 30%, transparent)`,
                  }}
                >
                  <FaClock style={{ color: "var(--warning)" }} />
                </div>
                <div>
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    Pending Top-up Requests
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    These requests need your approval before funds are credited.
                  </p>
                </div>
              </div>
              <Badge
                colorScheme="warning"
                className="rounded-lg px-2 py-1"
              >
                {pendingRequests.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="px-3 sm:px-4 pb-3 sm:pb-4">
            {/* Mobile card view */}
            <div className="sm:hidden space-y-2">
              {pendingRequests.map((req) => {
                const u = typeof req.user === "object" ? req.user : null;
                return (
                  <div
                    key={req._id}
                    className="rounded-xl p-4 border shadow-sm"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: `color-mix(in srgb, var(--warning) 25%, transparent)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {u?.fullName ?? "Unknown"}
                        </p>
                        {u?.agentCode && (
                          <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-primary)" }}>
                            {u.agentCode}
                          </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                        {req.description && (
                          <p
                            className="text-xs mt-1 line-clamp-2 rounded-lg p-2 border"
                            style={{
                              color: "var(--text-secondary)",
                              backgroundColor: "var(--bg-surface-alt)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            {req.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold whitespace-nowrap" style={{ color: "var(--success)" }}>
                          {fmt(req.amount)}
                        </p>
                        <p className="text-xs font-medium" style={{ color: "var(--success)" }}>Top-up</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="xs"
                        className="flex-1 rounded-lg shadow-sm text-white border-0"
                        style={{ background: "var(--success)" }}
                        onClick={() => handleProcessRequest(req._id, true)}
                        isLoading={processingId === req._id}
                        disabled={!!processingId}
                      >
                        <FaCheck className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="xs"
                        className="flex-1 rounded-lg shadow-sm text-white border-0"
                        style={{ background: "var(--error)" }}
                        onClick={() => handleProcessRequest(req._id, false)}
                        isLoading={processingId === req._id}
                        disabled={!!processingId}
                      >
                        <FaTimes className="mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0 mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: `color-mix(in srgb, var(--warning) 20%, transparent)` }}>
                    <th className="text-left font-semibold py-2.5 px-3" style={{ color: "var(--text-primary)" }}>Agent</th>
                    <th className="text-left font-semibold py-2.5 px-3" style={{ color: "var(--text-primary)" }}>Amount</th>
                    <th className="hidden md:table-cell text-left font-semibold py-2.5 px-3" style={{ color: "var(--text-primary)" }}>Note</th>
                    <th className="hidden lg:table-cell text-left font-semibold py-2.5 px-3" style={{ color: "var(--text-primary)" }}>Requested</th>
                    <th className="text-left font-semibold py-2.5 px-3" style={{ color: "var(--text-primary)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => {
                    const u = typeof req.user === "object" ? req.user : null;
                    return (
                      <tr
                        key={req._id}
                        className="border-b transition-colors"
                        style={{
                          borderColor: `color-mix(in srgb, var(--warning) 10%, transparent)`,
                          backgroundColor: "transparent",
                        }}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{
                                backgroundColor: `color-mix(in srgb, var(--warning) 20%, transparent)`,
                                border: `1px solid color-mix(in srgb, var(--warning) 30%, transparent)`,
                                color: "var(--warning)",
                              }}
                            >
                              {(u?.fullName ?? "?").charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                                {u?.fullName ?? "Unknown"}
                              </div>
                              <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                                {u?.agentCode ?? u?._id ?? ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold whitespace-nowrap text-sm" style={{ color: "var(--success)" }}>
                            {fmt(req.amount)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell py-2.5 px-3">
                          <span className="text-sm max-w-[200px] truncate block" style={{ color: "var(--text-secondary)" }}>
                            {req.description || "\u2014"}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell py-2.5 px-3">
                          <span className="text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                            {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              className="text-white border-0"
                              style={{ background: "var(--success)" }}
                              onClick={() => handleProcessRequest(req._id, true)}
                              isLoading={processingId === req._id}
                              disabled={!!processingId}
                            >
                              <FaCheck className="mr-1" /> Approve
                            </Button>
                            <Button
                              size="xs"
                              className="text-white border-0"
                              style={{ background: "var(--error)" }}
                              onClick={() => handleProcessRequest(req._id, false)}
                              isLoading={processingId === req._id}
                              disabled={!!processingId}
                            >
                              <FaTimes className="mr-1" /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Search & filters ────────────────────────────────────────────────── */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search by name, email or agent code\u2026"
        filters={{
          userType: { value: userTypeFilter, options: USER_TYPE_OPTIONS, label: "User Type" },
          status: { value: statusFilter, options: STATUS_OPTIONS, label: "Status" },
        }}
        onFilterChange={handleFilterChange}
        onSearch={(e) => e.preventDefault()}
        onClearFilters={handleClearFilters}
        showSearchButton={false}
        isLoading={loading}
      />

      {/* ── Results count ───────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-xs px-1" style={{ color: "var(--text-muted)" }}>
          {pagination.total > 0
            ? `Showing ${(pagination.page - 1) * pagination.limit + 1}\u2013${Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )} of ${pagination.total} users`
            : "No users found"}
        </p>
      )}

      {/* ── Users list ──────────────────────────────────────────────────────── */}
      <Card noPadding className="overflow-hidden rounded-xl" style={{ background: "var(--gradient-brand-dark)" }}>
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ border: "1px solid color-mix(in srgb, white 20%, transparent)" }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton height="0.875rem" width="45%" />
                  <Skeleton height="0.75rem" width="60%" />
                  <Skeleton height="0.75rem" width="30%" />
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton height="1rem" width="80px" />
                  <Skeleton height="0.75rem" width="60px" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "color-mix(in srgb, white 20%, transparent)" }}
            >
              <FaUsers className="text-2xl" style={{ color: "color-mix(in srgb, white 60%, transparent)" }} />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: "color-mix(in srgb, white 80%, transparent)" }}>
                No users found
              </p>
              <p className="text-sm mt-0.5" style={{ color: "color-mix(in srgb, white 60%, transparent)" }}>
                {hasFilters ? "Try adjusting your filters." : "No users in the system yet."}
              </p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y" style={{ borderColor: "color-mix(in srgb, white 20%, transparent)" }}>
              {users.map((user) => (
                <div
                  key={user._id}
                  className="p-4 transition-colors"
                  style={{ borderColor: "color-mix(in srgb, white 12%, transparent)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg"
                            style={{ background: "var(--gradient-brand-dark)" }}
                          >
                            {user.fullName.charAt(0)}{user.fullName.split(" ")[1]?.charAt(0) ?? ""}
                          </div>
                          <p className="font-semibold text-sm text-white">{user.fullName}</p>
                          <Badge colorScheme={userTypeBadgeColor(user.userType)} size="xs">
                            {user.userType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <Badge colorScheme={statusBadgeColor(user.status)} size="xs">
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-xs truncate" style={{ color: "color-mix(in srgb, white 70%, transparent)" }}>
                        {user.email}
                      </p>
                      {user.agentCode && (
                        <p className="text-xs font-mono mt-0.5" style={{ color: "var(--color-primary-hover)" }}>
                          {user.agentCode}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div
                          className="rounded-xl px-3 py-2"
                          style={{
                            backgroundColor: "color-mix(in srgb, white 15%, transparent)",
                            border: "1px solid color-mix(in srgb, white 20%, transparent)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-wide" style={{ color: "color-mix(in srgb, white 80%, transparent)" }}>
                            Balance
                          </p>
                          <p className="font-bold text-sm text-white">{fmt(user.walletBalance || 0)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            className="text-white border-0 shadow-lg"
                            style={{ background: "var(--success)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setTransactionModal({ isOpen: true, mode: "credit" });
                            }}
                          >
                            <FaArrowUp className="mr-1 text-xs" /> Credit
                          </Button>
                          <Button
                            size="xs"
                            className="text-white border-0 shadow-lg"
                            style={{ background: "var(--error)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setTransactionModal({ isOpen: true, mode: "debit" });
                            }}
                          >
                            <FaArrowDown className="mr-1 text-xs" /> Debit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "color-mix(in srgb, white 20%, transparent)" }}>
                    <th className="text-left font-semibold py-3 px-4 text-white">User</th>
                    <th className="text-left font-semibold py-3 px-4 text-white">Type</th>
                    <th className="hidden md:table-cell text-left font-semibold py-3 px-4 text-white">Status</th>
                    <th className="text-left font-semibold py-3 px-4 text-white">Balance</th>
                    <th className="text-left font-semibold py-3 px-4 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-white/5"
                      style={{ borderBottom: "1px solid color-mix(in srgb, white 12%, transparent)" }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "var(--gradient-brand-dark)" }}
                          >
                            {user.fullName.charAt(0)}{user.fullName.split(" ")[1]?.charAt(0) ?? ""}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-white truncate">{user.fullName}</div>
                            <div className="text-xs truncate" style={{ color: "color-mix(in srgb, white 70%, transparent)" }}>
                              {user.email}
                            </div>
                            {user.agentCode && (
                              <div className="text-xs font-mono" style={{ color: "var(--color-primary-hover)" }}>
                                {user.agentCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge colorScheme={userTypeBadgeColor(user.userType)}>
                          {user.userType.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="hidden md:table-cell py-3 px-4">
                        <Badge colorScheme={statusBadgeColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-sm text-white whitespace-nowrap">{fmt(user.walletBalance || 0)}</p>
                          {(user.walletBalance ?? 0) === 0 && (
                            <p className="text-[10px]" style={{ color: "var(--error)" }}>Zero balance</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            className="text-white border-0 shadow-lg rounded-lg"
                            style={{ background: "var(--success)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setTransactionModal({ isOpen: true, mode: "credit" });
                            }}
                          >
                            <FaPlus className="mr-1" />
                            <span>Credit</span>
                          </Button>
                          <Button
                            size="xs"
                            className="text-white border-0 shadow-lg rounded-lg"
                            style={{ background: "var(--error)" }}
                            onClick={() => {
                              setSelectedUser(user);
                              setTransactionModal({ isOpen: true, mode: "debit" });
                            }}
                          >
                            <FaMinus className="mr-1" />
                            <span>Debit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {pagination.pages > 1 && !loading && (
          <div className="border-t px-4 py-3" style={{ borderColor: "color-mix(in srgb, white 20%, transparent)" }}>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(p) => {
                setPagination((prev) => ({ ...prev, page: p }));
                void fetchUsers(p);
              }}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setPagination((prev) => ({ ...prev, limit: n, page: 1 }));
              }}
            />
          </div>
        )}
      </Card>

      {/* ── Transaction modal ───────────────────────────────────────────────── */}
      <WalletTransactionModal
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ isOpen: false, mode: "credit" })}
        user={selectedUser}
        mode={transactionModal.mode}
        onTransaction={handleTransaction}
      />
    </div>
  );
}
