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
  FaMoneyBillWave,
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
  StatCard,
  Pagination,
  Spinner,
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
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wallet Top-ups</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Credit or debit agent wallets and review pending top-up requests.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void fetchUsers(pagination.page);
            void fetchAnalytics();
            void fetchPendingRequests();
          }}
        >
          <FaSync className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Users"
            value={analytics.users.total}
            subtitle={`${analytics.users.withBalance} with balance`}
            icon={<FaUsers />}
            size="sm"
          />
          <StatCard
            title="Total Balance"
            value={fmt(analytics.balance.total)}
            subtitle={`Avg ${fmt(analytics.balance.average)}`}
            icon={<FaWallet />}
            size="sm"
          />
          <StatCard
            title="Credits"
            value={analytics.transactions.credits.count}
            subtitle={fmt(analytics.transactions.credits.total)}
            icon={<FaPlus />}
            size="sm"
          />
          <StatCard
            title="Pending Requests"
            value={pendingRequests.length}
            subtitle="Awaiting review"
            icon={<FaMoneyBillWave />}
            size="sm"
          />
        </div>
      )}

      {/* Pending top-up requests */}
      {pendingRequests.length > 0 && (
        <Card variant="outlined">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FaClock className="text-yellow-500" />
              <span className="font-semibold text-sm">Pending Top-up Requests</span>
              <Badge colorScheme="warning">{pendingRequests.length}</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Requests submitted by agents waiting for admin approval.
            </p>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Agent</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell className="hidden sm:table-cell">Note</TableHeaderCell>
                    <TableHeaderCell className="hidden md:table-cell">Requested</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((req) => {
                    const u = typeof req.user === "object" ? req.user : null;
                    return (
                      <TableRow key={req._id}>
                        <TableCell>
                          <div className="font-medium text-sm">{u?.fullName ?? "Unknown"}</div>
                          <div className="text-xs text-gray-400">{u?.agentCode ?? u?._id ?? ""}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 whitespace-nowrap">
                          {fmt(req.amount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                          {req.description || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-gray-500 whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              onClick={() => handleProcessRequest(req._id, true)}
                              isLoading={processingId === req._id}
                              disabled={!!processingId}
                            >
                              <FaCheck className="mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              onClick={() => handleProcessRequest(req._id, false)}
                              isLoading={processingId === req._id}
                              disabled={!!processingId}
                            >
                              <FaTimes className="mr-1" />
                              Reject
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

      {/* Search & filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search by name, email or agent code..."
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



      {/* Users table */}
      <Card noPadding>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size="lg" color="primary" />
            <p className="text-sm text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <FaUsers className="text-4xl" />
            <p className="font-medium text-gray-600">No users found</p>
            <p className="text-sm text-center px-4">
              {hasFilters ? "Try adjusting your filters." : "No users in the system yet."}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell className="hidden sm:table-cell">Type</TableHeaderCell>
                  <TableHeaderCell className="hidden md:table-cell">Status</TableHeaderCell>
                  <TableHeaderCell>Balance</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.fullName.charAt(0)}{user.fullName.split(" ")[1]?.charAt(0) ?? ""}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{user.fullName}</div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                          {user.agentCode && (
                            <div className="text-xs text-blue-600 font-mono">{user.agentCode}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge colorScheme={userTypeBadgeColor(user.userType)}>
                        {user.userType.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge colorScheme={statusBadgeColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-sm whitespace-nowrap">
                      {fmt(user.walletBalance || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          onClick={() => {
                            setSelectedUser(user);
                            setTransactionModal({ isOpen: true, mode: "credit" });
                          }}
                        >
                          <FaPlus className="mr-1" />
                          <span className="hidden sm:inline">Credit</span>
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
                          <span className="hidden sm:inline">Debit</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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

      {/* Transaction modal */}
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
