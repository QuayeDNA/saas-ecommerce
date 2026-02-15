import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaCheck,
  FaTimes,
  FaClock,
  FaMoneyBillWave,
  FaDownload,
  FaUsers,
  FaWallet,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { useWallet } from "../../hooks/use-wallet";
import { useToast } from "../../design-system/components/toast";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { Modal } from "../../design-system/components/modal";
import { Form } from "../../design-system/components/form";
import { FormField } from "../../design-system/components/form-field";
import { Select } from "../../design-system/components/select";
import { colors } from "../../design-system/tokens";
import { StatCard } from "../../design-system/components/stats-card";
import { Pagination } from "../../design-system/components/pagination";
import type { WalletTransaction, WalletAnalytics } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";
import { websocketService } from "../../services/websocket.service";
import { Card, CardHeader } from "@/design-system";
import { type User } from "../../services/user.service";
import { userService } from "../../services/user.service";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setError(null);

    try {
      await onTransaction(
        user._id,
        parseFloat(amount),
        description ||
        `${mode === "credit" ? "Top-up" : "Debit"} by super admin`,
        mode
      );
      setAmount("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `${mode === "credit" ? "Top-up" : "Debit"} failed`
      );
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    return mode === "credit" ? "Credit Wallet" : "Debit Wallet";
  };

  const getActionButtonText = () => {
    return loading ? "Processing..." : mode === "credit" ? "Credit" : "Debit";
  };

  const getIcon = () => {
    return mode === "credit" ? (
      <FaPlus className="w-4 h-4" />
    ) : (
      <FaMinus className="w-4 h-4" />
    );
  };

  if (!isOpen || !user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()}>
      <div className="mb-4">
        <p className="text-sm text-gray-600">User: {user.fullName}</p>
        <p className="text-sm text-gray-600">Email: {user.email}</p>
        <p className="text-sm text-gray-600">
          Current Balance: GH₵{user.walletBalance.toFixed(2)}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <FormField>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (GH₵)
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0.01"
            step="0.01"
            required
          />
        </FormField>

        <FormField>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Reason for ${mode === "credit" ? "credit" : "debit"}`}
          />
        </FormField>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            variant={mode === "credit" ? "primary" : "danger"}
          >
            {getIcon()}
            <span className="ml-2">{getActionButtonText()}</span>
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default function SuperAdminWalletPage() {
  const { refreshWallet } = useWallet();
  const { addToast } = useToast();

  // State for users (server-side pagination + search)
  const [users, setUsers] = useState<User[]>([]);
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for analytics
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);

  // State for filters and search (server-side)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);


  // State for modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transactionMode, setTransactionMode] = useState<"credit" | "debit">(
    "credit"
  );

  // State for pending requests
  const [pendingRequests, setPendingRequests] = useState<WalletTransaction[]>(
    []
  );

  // State for admin transactions
  const [adminTransactions, setAdminTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [adminTransactionsLoading, setAdminTransactionsLoading] =
    useState(false);
  const [adminTransactionsPagination, setAdminTransactionsPagination] =
    useState({
      total: 0,
      page: 1,
      limit: 20,
      pages: 0,
    });
  const [adminTransactionFilters, setAdminTransactionFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
    userId: "",
  });

  // WebSocket handlers
  const handleWalletUpdate = useCallback(
    (data: { type: string; userId?: string; balance?: number }) => {
      if (data.type === "wallet_update") {
        // Update user's wallet balance in real-time
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === data.userId
              ? { ...user, walletBalance: data.balance || user.walletBalance }
              : user
          )
        );

        // Refresh analytics if needed
        fetchAnalytics();
      }
    },
    []
  );



  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users whenever filters/search/pagination change
  useEffect(() => {
    fetchUsers(usersPagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, userTypeFilter, statusFilter, usersPagination.page, itemsPerPage]);

  // Clear filters function
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setUserTypeFilter("");
    setStatusFilter("");
    setUsersPagination((p) => ({ ...p, page: 1 }));
    addToast("Filters cleared", "info", 2000);
  }, [addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to clear filters
      if (
        event.key === "Escape" &&
        (debouncedSearchTerm || userTypeFilter || statusFilter)
      ) {
        handleClearFilters();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [debouncedSearchTerm, userTypeFilter, statusFilter, handleClearFilters]);

  // Memoized search statistics (server-driven)
  const searchStats = useMemo(() => {
    const hasFilters = Boolean(debouncedSearchTerm || userTypeFilter || statusFilter);
    const total = usersPagination.total || 0;
    const filtered = users.length;
    return {
      total,
      filtered,
      hasFilters,
      percentage: total > 0 ? Math.round((filtered / total) * 100) : 0,
    };
  }, [users.length, usersPagination.total, debouncedSearchTerm, userTypeFilter, statusFilter]);

  const fetchAdminTransactions = useCallback(
    async (page = 1) => {
      setAdminTransactionsLoading(true);
      try {
        const response = await walletService.getAdminTransactions(
          page,
          adminTransactionsPagination.limit,
          (adminTransactionFilters.type as "credit" | "debit") || undefined,
          adminTransactionFilters.startDate || undefined,
          adminTransactionFilters.endDate || undefined,
          adminTransactionFilters.userId || undefined
        );
        setAdminTransactions(response.transactions);
        setAdminTransactionsPagination(response.pagination);
      } catch {
        addToast("Failed to fetch admin transactions", "error", 4000);
      } finally {
        setAdminTransactionsLoading(false);
      }
    },
    [adminTransactionsPagination.limit, adminTransactionFilters, addToast]
  );

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
    fetchPendingRequests();
    fetchAdminTransactions();

    // Connect to WebSocket for real-time updates
    websocketService.connect("super_admin");
    websocketService.on(
      "wallet_update",
      handleWalletUpdate as (data: unknown) => void
    );

    return () => {
      websocketService.off(
        "wallet_update",
        handleWalletUpdate as (data: unknown) => void
      );
    };
  }, [handleWalletUpdate, fetchAdminTransactions]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await userService.getUsersWithWallet({
        page,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        userTypes: "agent,super_agent,dealer,super_dealer",
        status: statusFilter || undefined,
        includeWallet: true,
      });

      setUsers(resp.users);
      setUsersPagination({
        page: resp.pagination.page,
        limit: resp.pagination.limit,
        total: resp.pagination.total,
        pages: resp.pagination.pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await walletService.getWalletAnalytics();
      setAnalytics(analyticsData);
    } catch {
      // Error fetching analytics
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await walletService.getPendingRequests();
      setPendingRequests(response.transactions);
    } catch {
      // Error fetching pending requests
    }
  };

  const handleTransaction = async (
    userId: string,
    amount: number,
    description: string,
    mode: "credit" | "debit"
  ) => {
    try {
      if (mode === "credit") {
        await walletService.adminTopUpWallet(userId, amount, description);
        addToast(
          `Successfully credited GH₵${amount.toFixed(2)} to wallet`,
          "success",
          4000
        );
      } else {
        await walletService.adminDebitWallet(userId, amount, description);
        addToast(
          `Successfully debited GH₵${amount.toFixed(2)} from wallet`,
          "warning",
          4000
        );
      }

      await fetchUsers();
      await fetchAnalytics();
      await refreshWallet();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to ${mode} wallet`;
      addToast(errorMessage, "error", 5000);
      throw new Error(errorMessage);
    }
  };

  const handleProcessRequest = async (
    transactionId: string,
    approve: boolean
  ) => {
    try {
      await walletService.processTopUpRequest(transactionId, approve);

      if (approve) {
        addToast("Top-up request approved successfully", "success", 4000);
      } else {
        addToast("Top-up request rejected", "warning", 4000);
      }

      await fetchPendingRequests();
      await fetchAnalytics();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process request";
      addToast(errorMessage, "error", 5000);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is now handled automatically by the useEffect hook
    // This function provides immediate feedback when user hits search button
    const activeFilters = [
      debouncedSearchTerm && "search term",
      userTypeFilter && "user type",
      statusFilter && "status",
    ].filter(Boolean);

    if (activeFilters.length > 0) {
      addToast(
        `Found ${searchStats.filtered} user${searchStats.filtered !== 1 ? "s" : ""
        } matching ${activeFilters.join(", ")} (${searchStats.percentage}%)`,
        "info",
        3000
      );
    } else {
      addToast(`Showing all ${searchStats.filtered} users`, "info", 2000);
    }
  };

  const openTransactionModal = (user: User, mode: "credit" | "debit") => {
    setSelectedUser(user);
    setTransactionMode(mode);
    setShowTransactionModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "inactive":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="outlined">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardHeader className="text-center">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: colors.brand.primary }}
            >
              Wallet Management
            </h1>
            <p className="text-gray-600">
              Manage agent wallets and transactions
            </p>
          </CardHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchUsers()}>
              <FaDownload className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Analytics Cards (2x2 grid using StatCard) */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <StatCard
            title="Total Users"
            value={analytics.users.total}
            subtitle={`${analytics.users.withBalance} with balance`}
            icon={<FaUsers />}
            size="md"
          />

          <StatCard
            title="Total Balance"
            value={formatCurrency(analytics.balance.total)}
            subtitle={`${analytics.transactions.credits.count} credits`}
            icon={<FaMoneyBillWave />}
            size="md"
          />

          <StatCard
            title="Pending Top-ups"
            value={pendingRequests.length}
            subtitle="Requests awaiting review"
            icon={<FaClock />}
            size="md"
          />

          <StatCard
            title="Avg Balance"
            value={formatCurrency(analytics.balance.average)}
            subtitle="Average wallet balance"
            icon={<FaWallet />}
            size="md"
          />
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Pending Top-Up Requests
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {typeof request.user === "string"
                          ? request.user
                          : request.user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            handleProcessRequest(request._id, true)
                          }
                        >
                          <FaCheck className="w-3 h-3" />
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() =>
                            handleProcessRequest(request._id, false)
                          }
                        >
                          <FaTimes className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <Form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                label="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, ID, or agent code... (Press Enter to search, Esc to clear)"
                leftIcon={<FaSearch className="text-gray-400" />}
                rightIcon={
                  searchTerm !== debouncedSearchTerm ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : undefined
                }
              />
            </div>
            <div>
              <Select
                label="User Type"
                value={userTypeFilter}
                onChange={setUserTypeFilter}
                options={[
                  { value: "", label: "All Types" },
                  { value: "agent", label: "Agent" },
                  { value: "super_agent", label: "Super Agent" },
                  { value: "dealer", label: "Dealer" },
                  { value: "super_dealer", label: "Super Dealer" },
                  { value: "admin", label: "Admin" },
                  { value: "super_admin", label: "Super Admin" },
                ]}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={loading}>
                <FaSearch className="mr-2" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
              >
                <FaFilter className="mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </Form>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="flex justify-between items-center bg-gray-50 px-6 py-3 border-b">
          <div className="text-sm text-gray-700">
            Showing {(usersPagination.page - 1) * usersPagination.limit + 1} to {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of {usersPagination.total} users
            {(searchStats.hasFilters) && (
              <span className="ml-2 text-blue-600">(filters applied)</span>
            )}
          </div>
          {(searchStats.hasFilters) && (
            <Button size="xs" variant="outline" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Admin Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Admin Transactions
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchAdminTransactions(1)}
                disabled={adminTransactionsLoading}
              >
                <FaDownload className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Select
                label="Type"
                value={adminTransactionFilters.type}
                onChange={(value) =>
                  setAdminTransactionFilters((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
                options={[
                  { value: "", label: "All Types" },
                  { value: "credit", label: "Credits" },
                  { value: "debit", label: "Debits" },
                ]}
              />
            </div>
            <div>
              <Input
                label="Start Date"
                type="date"
                value={adminTransactionFilters.startDate}
                onChange={(e) =>
                  setAdminTransactionFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Input
                label="End Date"
                type="date"
                value={adminTransactionFilters.endDate}
                onChange={(e) =>
                  setAdminTransactionFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Input
                label="User ID"
                value={adminTransactionFilters.userId}
                onChange={(e) =>
                  setAdminTransactionFilters((prev) => ({
                    ...prev,
                    userId: e.target.value,
                  }))
                }
                placeholder="Filter by user ID"
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
                variant="primary"
                onClick={() => fetchAdminTransactions(1)}
                disabled={adminTransactionsLoading}
              >
                <FaFilter className="mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {adminTransactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : adminTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No admin transactions found
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {typeof transaction.user === "object" &&
                              transaction.user?.fullName
                              ? transaction.user.fullName
                              : "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {typeof transaction.user === "object" &&
                              transaction.user?.email
                              ? transaction.user.email
                              : typeof transaction.user === "object"
                                ? transaction.user?._id
                                : transaction.user}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === "credit"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {transaction.type === "credit" ? (
                          <FaPlus className="mr-1" />
                        ) : (
                          <FaMinus className="mr-1" />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {transaction.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {transaction.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {adminTransactionsPagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing{" "}
              {(adminTransactionsPagination.page - 1) *
                adminTransactionsPagination.limit +
                1}{" "}
              to{" "}
              {Math.min(
                adminTransactionsPagination.page *
                adminTransactionsPagination.limit,
                adminTransactionsPagination.total
              )}{" "}
              of {adminTransactionsPagination.total} transactions
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={adminTransactionsPagination.page === 1}
                onClick={() =>
                  fetchAdminTransactions(adminTransactionsPagination.page - 1)
                }
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={
                  adminTransactionsPagination.page ===
                  adminTransactionsPagination.pages
                }
                onClick={() =>
                  fetchAdminTransactions(adminTransactionsPagination.page + 1)
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 w-40">
                  Agent Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {usersPagination.total === 0
                      ? "No users found."
                      : "No users match your search criteria."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-32 w-40">
                      <span className="text-sm text-gray-900">
                        {user.agentCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(user.walletBalance)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openTransactionModal(user, "credit")}
                        >
                          <FaPlus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => openTransactionModal(user, "debit")}
                        >
                          <FaMinus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `/superadmin/users/${user._id}`,
                              "_blank"
                            )
                          }
                        >
                          <FaEye className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination for users */}
        {usersPagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={usersPagination.page}
              totalPages={usersPagination.pages}
              totalItems={usersPagination.total}
              itemsPerPage={usersPagination.limit}
              onPageChange={(p) => {
                setUsersPagination((prev) => ({ ...prev, page: p }));
                fetchUsers(p);
              }}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setUsersPagination((prev) => ({ ...prev, limit: n, page: 1 }));
                fetchUsers(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Wallet Transaction Modal */}
      <WalletTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        user={selectedUser}
        mode={transactionMode}
        onTransaction={handleTransaction}
      />
    </div>
  );
}
