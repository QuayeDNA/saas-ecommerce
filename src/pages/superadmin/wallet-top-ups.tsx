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
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "../../design-system";
import { Modal } from "../../design-system/components/modal";
import { SearchAndFilter } from "../../components/common/SearchAndFilter";
import type { WalletTransaction, WalletAnalytics } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";
import { websocketService } from "../../services/websocket.service";
import { userService, type User } from "../../services/user.service";

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
      <div className={`rounded-lg p-3 mb-4 flex items-center gap-3 ${isCredit ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isCredit ? "bg-green-500" : "bg-red-500"}`}>
          {user.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{user.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          {user.agentCode && <p className="text-xs text-blue-600 font-mono">{user.agentCode}</p>}
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <p className="text-xs text-gray-500">Balance</p>
          <p className="font-semibold text-sm text-gray-900">{fmt(user.walletBalance || 0)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
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

const USER_TYPE_OPTIONS = [
  { value: "agent", label: "Agent" },
  { value: "super_agent", label: "Super Agent" },
  { value: "dealer", label: "Dealer" },
  { value: "super_dealer", label: "Super Dealer" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

function userTypeBadgeColor(userType: string): "success" | "info" | "warning" | "error" | "gray" {
  switch (userType) {
    case "agent": return "success";
    case "super_agent": return "info";
    case "dealer": return "warning";
    case "super_dealer": return "error";
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
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4 pb-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 sm:p-6 text-white"
        style={{ background: 'linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FaWallet className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Wallet Management</h1>
              <p className="text-xs sm:text-sm text-white/70 mt-0.5">
                Credit or debit agent wallets · review pending top-up requests
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto border-white/40 text-white hover:bg-white/10"
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

        {/* ── Inline analytics strip ──────────────────────────────────────── */}
        {analytics ? (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                label: "Total Users",
                value: analytics.users.total,
                sub: `${analytics.users.withBalance} with balance`,
                icon: <FaUsers />,
                raw: true,
              },
              {
                label: "Total Balance",
                value: fmt(analytics.balance.total),
                sub: `Avg ${fmt(analytics.balance.average)}`,
                icon: <FaChartBar />,
                raw: false,
              },
              {
                label: "Credits",
                value: analytics.transactions.credits.count,
                sub: fmt(analytics.transactions.credits.total),
                icon: <FaArrowUp />,
                raw: true,
              },
              {
                label: "Pending Requests",
                value: pendingRequests.length,
                sub: pendingRequests.length > 0 ? "Needs attention" : "All clear",
                icon: <FaClock />,
                raw: true,
                highlight: pendingRequests.length > 0,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg px-3 py-2.5 flex items-center gap-2 ${stat.highlight ? "bg-yellow-500/30 border border-yellow-400/40" : "bg-white/15"
                  }`}
              >
                <span className="text-white/70 text-sm flex-shrink-0">{stat.icon}</span>
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide truncate">{stat.label}</p>
                  <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">{stat.value}</p>
                  <p className="text-blue-100/80 text-[10px] truncate">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/15 rounded-lg px-3 py-2.5">
                <Skeleton height="0.625rem" width="60%" className="mb-1 opacity-50" />
                <Skeleton height="1.25rem" width="80%" className="mb-1 opacity-60" />
                <Skeleton height="0.625rem" width="50%" className="opacity-40" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending top-up requests banner ──────────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <Card variant="outlined" className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <FaClock className="text-yellow-600 text-sm" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-yellow-900">Pending Top-up Requests</span>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    These requests need your approval before funds are credited.
                  </p>
                </div>
              </div>
              <Badge colorScheme="warning">{pendingRequests.length} pending</Badge>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {/* Mobile card view */}
            <div className="sm:hidden space-y-2">
              {pendingRequests.map((req) => {
                const u = typeof req.user === "object" ? req.user : null;
                return (
                  <div key={req._id} className="bg-white rounded-lg border border-yellow-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{u?.fullName ?? "Unknown"}</p>
                        {u?.agentCode && <p className="text-xs text-blue-600 font-mono">{u.agentCode}</p>}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                        {req.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{req.description}</p>}
                      </div>
                      <p className="text-base font-bold text-green-600 whitespace-nowrap flex-shrink-0">{fmt(req.amount)}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="xs"
                        className="flex-1"
                        onClick={() => handleProcessRequest(req._id, true)}
                        isLoading={processingId === req._id}
                        disabled={!!processingId}
                      >
                        <FaCheck className="mr-1" /> Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        className="flex-1"
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Agent</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell className="hidden md:table-cell">Note</TableHeaderCell>
                    <TableHeaderCell className="hidden lg:table-cell">Requested</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((req) => {
                    const u = typeof req.user === "object" ? req.user : null;
                    return (
                      <TableRow key={req._id} className="bg-white hover:bg-yellow-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center text-yellow-700 text-xs font-bold flex-shrink-0">
                              {(u?.fullName ?? "?").charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm">{u?.fullName ?? "Unknown"}</div>
                              <div className="text-xs text-gray-400 font-mono">{u?.agentCode ?? u?._id ?? ""}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-green-600 whitespace-nowrap text-sm">
                          {fmt(req.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                          {req.description || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              onClick={() => handleProcessRequest(req._id, true)}
                              isLoading={processingId === req._id}
                              disabled={!!processingId}
                            >
                              <FaCheck className="mr-1" /> Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleProcessRequest(req._id, false)}
                              isLoading={processingId === req._id}
                              disabled={!!processingId}
                            >
                              <FaTimes className="mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
        searchPlaceholder="Search by name, email or agent code…"
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
        <p className="text-xs text-gray-500 px-1">
          {pagination.total > 0
            ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )} of ${pagination.total} users`
            : "No users found"}
        </p>
      )}

      {/* ── Users list ──────────────────────────────────────────────────────── */}
      <Card noPadding>
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
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
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">No users found</p>
              <p className="text-sm mt-0.5">
                {hasFilters ? "Try adjusting your filters." : "No users in the system yet."}
              </p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(to bottom right, var(--color-primary-400), var(--color-primary-700))' }}
                    >
                      {user.fullName.charAt(0)}{user.fullName.split(" ")[1]?.charAt(0) ?? ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900">{user.fullName}</p>
                        <Badge colorScheme={userTypeBadgeColor(user.userType)} size="xs">
                          {user.userType.replace(/_/g, " ")}
                        </Badge>
                        <Badge colorScheme={statusBadgeColor(user.status)} size="xs">{user.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.agentCode && (
                        <p className="text-xs text-blue-600 font-mono mt-0.5">{user.agentCode}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Balance</p>
                          <p className="font-bold text-sm text-gray-900">{fmt(user.walletBalance || 0)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            onClick={() => {
                              setSelectedUser(user);
                              setTransactionModal({ isOpen: true, mode: "credit" });
                            }}
                          >
                            <FaArrowUp className="mr-1 text-xs" /> Credit
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell className="hidden md:table-cell">Status</TableHeaderCell>
                    <TableHeaderCell>Balance</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50/70 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(to bottom right, var(--color-primary-400), var(--color-primary-700))' }}
                          >
                            {user.fullName.charAt(0)}{user.fullName.split(" ")[1]?.charAt(0) ?? ""}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">{user.fullName}</div>
                            <div className="text-xs text-gray-400 truncate">{user.email}</div>
                            {user.agentCode && (
                              <div className="text-xs text-blue-600 font-mono">{user.agentCode}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme={userTypeBadgeColor(user.userType)}>
                          {user.userType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge colorScheme={statusBadgeColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm text-gray-900 whitespace-nowrap">{fmt(user.walletBalance || 0)}</p>
                          {(user.walletBalance ?? 0) === 0 && (
                            <p className="text-[10px] text-red-500">Zero balance</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button
                            size="xs"
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
                            variant="danger"
                            onClick={() => {
                              setSelectedUser(user);
                              setTransactionModal({ isOpen: true, mode: "debit" });
                            }}
                          >
                            <FaMinus className="mr-1" />
                            <span>Debit</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {pagination.pages > 1 && !loading && (
          <div className="border-t px-4 py-3">
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
