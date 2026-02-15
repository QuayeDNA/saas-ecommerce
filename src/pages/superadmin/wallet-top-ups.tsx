import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaMoneyBillWave,
  FaWallet,
  FaPlus,
  FaMinus,
  FaClock,
  FaUsers,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
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
import { userService } from "../../services/user.service";
import { Card, CardHeader } from "@/design-system";
import { type User } from "../../services/user.service";

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
    if (!user || !amount || !description) return;

    setLoading(true);
    setError(null);

    try {
      await onTransaction(user._id, parseFloat(amount), description, mode);
      setAmount("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === "credit" ? "Credit" : "Debit"} Wallet`}
    >
      <Form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">User Details</h4>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {user.fullName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Agent Code:</strong> {user.agentCode || "N/A"}
              </p>
            </div>
          )}

          <FormField>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (GH₵) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </FormField>

          <FormField>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transaction description"
              required
            />
          </FormField>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount || !description}
              className={
                mode === "credit"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              {mode === "credit" ? "Credit" : "Debit"} GH₵{amount || "0.00"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}

export default function WalletTopUpsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [pendingRequests, setPendingRequests] = useState<WalletTransaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    mode: "credit" | "debit";
  }>({ isOpen: false, mode: "credit" });

  const { addToast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users whenever filters/search/pagination change
  useEffect(() => {
    fetchUsers(usersPagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, userTypeFilter, statusFilter, usersPagination.page, itemsPerPage]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClearFilters();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [debouncedSearchTerm, userTypeFilter, statusFilter]);

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

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await userService.getUsers({
        page,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        userType: userTypeFilter || undefined,
        status: statusFilter || undefined,
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

  const handleWalletUpdate = useCallback((data: unknown) => {
    if (data && typeof data === "object" && "userId" in data) {
      // Refresh user data when wallet is updated
      fetchUsers();
      fetchAnalytics();
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
    fetchPendingRequests();

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
  }, [handleWalletUpdate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect with debouncedSearchTerm
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setUserTypeFilter("");
    setStatusFilter("");
    setUsersPagination((p) => ({ ...p, page: 1 }));
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
          "success",
          4000
        );
      }
      // Refresh data
      fetchUsers();
      fetchAnalytics();
      fetchPendingRequests();
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Transaction failed"
      );
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
      await fetchUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process request";
      addToast(errorMessage, "error", 5000);
    }
  };

  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toFixed(2)}`;
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "super_dealer":
        return "bg-orange-100 text-orange-800";
      case "dealer":
        return "bg-yellow-100 text-yellow-800";
      case "super_agent":
        return "bg-blue-100 text-blue-800";
      case "agent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              Wallet Top-ups
            </h1>
            <p className="text-gray-600">Credit and debit agent wallets</p>
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
            subtitle={`${analytics.users.newThisPeriod || 0} new this period`}
            icon={<FaUsers />}
            size="md"
          />

          <StatCard
            title="Total Balance"
            value={formatCurrency(analytics.balance.total)}
            subtitle={`${analytics.wallet?.transactions?.credits?.count || 0} credits`}
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
            title="Today's Transactions"
            value={analytics.transactions.credits.count + analytics.transactions.debits.count}
            subtitle="Transactions today"
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
                {pendingRequests.map((request) => {
                  const user =
                    typeof request.user === "object" ? request.user : null;
                  return (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user?.fullName || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.agentCode || user?._id || "No ID"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(request.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {request.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleProcessRequest(request._id, true)
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <FaCheck className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleProcessRequest(request._id, false)
                            }
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <FaTimes className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            {searchStats.hasFilters && (
              <span className="ml-2 text-blue-600">(filters applied)</span>
            )}
          </div>
          {searchStats.hasFilters && (
            <Button size="xs" variant="outline" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {user.fullName.charAt(0)}
                            {user.fullName.split(" ")[1]?.charAt(0) ?? ""}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          {user.agentCode && (
                            <div className="text-xs text-blue-600 font-mono">
                              {user.agentCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(
                          user.userType
                        )}`}
                      >
                        {user.userType.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(user.walletBalance || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setTransactionModal({
                              isOpen: true,
                              mode: "credit",
                            });
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <FaPlus className="mr-1" />
                          Credit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setTransactionModal({
                              isOpen: true,
                              mode: "debit",
                            });
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <FaMinus className="mr-1" />
                          Debit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchStats.hasFilters
                ? "Try adjusting your search criteria or clearing filters."
                : "Get started by adding some users to the system."}
            </p>
          </div>
        )}
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

      {/* Transaction Modal */}
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
