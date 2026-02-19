import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../hooks";
import { type WalletTransaction } from "../types/wallet";
import {
  commissionService,
  type CommissionRecord,
  type CurrentMonthStatistics,
  type CommissionMonthlySummary,
  type CommissionFilters,
} from "../services/commission.service";
import { websocketService } from "../services/websocket.service";
import {
  FaWallet,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaCoins,
  FaCalendarAlt,
  FaClock,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
} from "react-icons/fa";
import { Alert, Button, Tabs, TabsList, TabsTrigger, Spinner, Pagination, StatsGrid, Card, CardHeader, CardBody } from "../design-system";
import { TopUpRequestModal } from "../components/wallet/TopUpRequestModal";
import { SearchAndFilter } from "../components/common/SearchAndFilter";

export const WalletPage = () => {
  const {
    walletBalance,
    refreshWallet,
    isLoading,
    error,
    getTransactionHistory,
    requestTopUp,
  } = useWallet();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Commission state
  const [currentMonthAccumulating, setCurrentMonthAccumulating] = useState<
    CommissionRecord[]
  >([]);
  const [finalizedCommissions, setFinalizedCommissions] = useState<
    CommissionRecord[]
  >([]);
  const [currentMonthStats, setCurrentMonthStats] =
    useState<CurrentMonthStatistics | null>(null);
  const [monthlySummaries, setMonthlySummaries] = useState<
    CommissionMonthlySummary[]
  >([]);
  const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallet" | "commissions">(
    "wallet"
  );

  // Commission filters
  const [commissionStatusFilter, setCommissionStatusFilter] =
    useState<CommissionFilters['status'] | 'all'>("all");
  const [commissionPeriodFilter, setCommissionPeriodFilter] =
    useState<CommissionFilters['period'] | 'all'>("all");

  // Search + date range for filters (used by SearchAndFilter)
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Monthly history expansion
  const [expandedMonthlyHistory, setExpandedMonthlyHistory] = useState(false);

  // Load transactions function
  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const result = await getTransactionHistory(currentPage);
      if (result) {
        setTransactions(result.transactions);
        setTotalPages(result.pagination.pages);
      }
    } catch {
      // Failed to load transactions
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [currentPage, getTransactionHistory]);

  // Load commissions function
  const loadCommissions = useCallback(async () => {
    setIsLoadingCommissions(true);
    try {
      const filters: Partial<CommissionFilters> = {};
      if (commissionStatusFilter && commissionStatusFilter !== "all")
        filters.status = commissionStatusFilter;
      if (commissionPeriodFilter && commissionPeriodFilter !== "all")
        filters.period = commissionPeriodFilter;
      if (searchTerm && searchTerm.trim()) filters.search = searchTerm.trim();

      const [commissionsData, statsData, summariesData] = await Promise.all([
        commissionService.getAgentCommissions(filters),
        commissionService.getCurrentMonthStatistics(),
        commissionService.getAgentMonthlySummaries({ limit: 12 }),
      ]);

      // Separate commissions into accumulating and finalized
      // Accumulating: daily commissions (always pending until finalized) + current month non-finalized
      // Finalized: monthly commissions that have been finalized (isFinal: true)
      const accumulating = commissionsData.filter(
        (c) => c.period === "daily" || (c.period === "monthly" && !c.isFinal)
      );
      const finalized = commissionsData.filter(
        (c) => c.period === "monthly" && c.isFinal
      );

      setCurrentMonthAccumulating(accumulating);
      setFinalizedCommissions(finalized);
      setCurrentMonthStats(statsData);
      setMonthlySummaries(summariesData);
    } catch {
      // Failed to load commissions
    } finally {
      setIsLoadingCommissions(false);
    }
  }, [commissionStatusFilter, commissionPeriodFilter, searchTerm]);

  // Fetch transaction history on page load and when page changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Load commissions on component mount
  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  // WebSocket listeners for real-time commission updates
  useEffect(() => {
    const handleCommissionUpdated = () => {
      // Refresh commissions when a commission is updated
      loadCommissions();
    };

    const handleCommissionFinalized = () => {
      // Refresh commissions when a commission is finalized
      loadCommissions();
    };

    // Add WebSocket listeners
    websocketService.on("commission_updated", handleCommissionUpdated);
    websocketService.on("commission_finalized", handleCommissionFinalized);

    // Cleanup listeners on unmount
    return () => {
      websocketService.off("commission_updated", handleCommissionUpdated);
      websocketService.off("commission_finalized", handleCommissionFinalized);
    };
  }, [loadCommissions]);

  // Listen for wallet balance changes and refresh transactions
  useEffect(() => {
    // Refresh transactions when wallet balance changes (indicating a transaction occurred)
    loadTransactions();
  }, [walletBalance, loadTransactions]);

  // Format date for display
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  // Get transaction type styling
  const getTransactionTypeStyles = (type: string) => {
    switch (type) {
      case "credit":
        return {
          icon: <FaArrowUp className="text-green-600" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          amountColor: "text-green-600",
          badgeBg: "bg-green-100",
          badgeText: "text-green-800",
        };
      case "debit":
        return {
          icon: <FaArrowDown className="text-red-600" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          amountColor: "text-red-600",
          badgeBg: "bg-red-100",
          badgeText: "text-red-800",
        };
      default:
        return {
          icon: <FaWallet className="text-gray-600" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          amountColor: "text-gray-600",
          badgeBg: "bg-gray-100",
          badgeText: "text-gray-800",
        };
    }
  };

  // Get connection status indicator


  const handleTopUpRequest = async (amount: number, description: string) => {
    setIsSubmittingRequest(true);
    try {
      await requestTopUp(amount, description);
      setSuccessMessage("Top-up request submitted successfully!");
      setShowTopUpModal(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      // Error is handled in the hook, but we can show it in the modal
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit top-up request";
      // The error will be displayed in the modal through the hook's error state
      console.error("Top-up request error:", errorMessage);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (<>
    {/* Header */}
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Wallet & Commissions
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your wallet balance and view commission earnings
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="primary"
            size="md"
            leftIcon={<FaSync className={isLoading ? "animate-spin" : ""} />}
            onClick={() => refreshWallet()}
            isLoading={isLoading}
          >
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Sync</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-6 border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'wallet' | 'commissions')}>
          <TabsList className="w-full justify-center space-x-8">
            <TabsTrigger value="wallet">
              <FaWallet className="inline mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <FaCoins className="inline mr-2" />
              Commissions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </Card>

    {/* Tab Content */}
    {activeTab === "wallet" ? (
      <>
        {/* Error Alert */}
        {error && (
          <Alert status="error" title="Error">
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert status="success" title="Success">
            {successMessage}
          </Alert>
        )}

        {/* Wallet Balance Card (design-system) */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Current Balance</h2>
            </div>
            <Button
              variant="success"
              size="md"
              leftIcon={<FaPlus />}
              onClick={() => setShowTopUpModal(true)}
              isLoading={isSubmittingRequest}
            >
              <span className="hidden sm:inline">Request Top-up</span>
              <span className="sm:hidden">Top-up</span>
            </Button>
          </CardHeader>
          <CardBody className="py-3">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{formatCurrency(walletBalance)}</div>
            <p className="text-sm text-gray-600">Available for transactions and purchases</p>
          </CardBody>
        </Card>

        {/* Transaction History */}
        <Card className="mb-6">
          <CardHeader className="p-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Transaction History</h2>
          </CardHeader>

          <CardBody className="p-4">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" color="primary" />
                <span className="ml-3 text-gray-600">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaWallet className="text-4xl mx-auto mb-4 text-gray-300" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((transaction) => {
                  const styles = getTransactionTypeStyles(transaction.type);
                  return (
                    <div
                      key={transaction._id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors ${styles.borderColor}`}
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${styles.bgColor} flex-shrink-0`}
                        >
                          {styles.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles.badgeBg} ${styles.badgeText}`}
                            >
                              {transaction.type === "credit"
                                ? "Credit"
                                : transaction.type === "debit"
                                  ? "Debit"
                                  : "Transaction"}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 mt-3 sm:mt-0 sm:ml-4">
                        <p
                          className={`font-semibold text-sm sm:text-base ${styles.amountColor}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Balance: {formatCurrency(transaction.balanceAfter)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 w-full">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalPages * 20}
                  itemsPerPage={20}
                  onPageChange={(p) => setCurrentPage(p)}
                  variant="compact"
                />
              </div>
            )}
          </CardBody>
        </Card>
      </>
    ) : (
      /* Commissions Tab Content */
      <>
        {/* Current Month Daily Accumulation */}
        {currentMonthAccumulating.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  This Month's Commission Progress
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Daily commission accumulation from completed orders
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FaCoins className="text-green-600 text-xl" />
              </div>
            </div>

            {/* Monthly Total Summary */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Month-to-Date Total
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentMonthAccumulating.reduce(
                      (sum, c) => sum + c.totalOrders,
                      0
                    )}{" "}
                    orders processed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      currentMonthAccumulating.reduce(
                        (sum, c) => sum + c.amount,
                        0
                      )
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(
                      currentMonthAccumulating.reduce(
                        (sum, c) => sum + c.totalRevenue,
                        0
                      )
                    )}{" "}
                    revenue
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 text-sm">
                Daily Breakdown
              </h3>
              {currentMonthAccumulating
                .filter((c) => c.period === "daily")
                .sort(
                  (a, b) =>
                    new Date(b.periodStart).getTime() -
                    new Date(a.periodStart).getTime()
                )
                .map((commission) => (
                  <div
                    key={commission._id}
                    className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 flex-shrink-0">
                        <FaCoins className="text-green-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {new Date(
                            commission.periodStart
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {commission.totalOrders} orders •{" "}
                          {formatCurrency(commission.totalRevenue)} revenue
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(commission.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {commission.formattedRate} rate
                      </p>
                    </div>
                  </div>
                ))}

              {/* Monthly accumulating record (if exists) */}
              {currentMonthAccumulating
                .filter((c) => c.period === "monthly")
                .map((commission) => (
                  <div
                    key={commission._id}
                    className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 flex-shrink-0">
                        <FaCalendarAlt className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          Monthly Total (Real-time)
                        </p>
                        <p className="text-xs text-gray-600">
                          {commission.totalOrders} orders •{" "}
                          {formatCurrency(commission.totalRevenue)} revenue
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(commission.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {commission.formattedRate} rate
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <FaClock className="inline mr-1" />
                Commissions accumulate daily and will be finalized at the end
                of {new Date().toLocaleDateString("en-US", { month: "long" })}
                . You'll receive notifications for each day's earnings!
              </p>
            </div>
          </div>
        )}

        {/* Current Month Statistics */}
        {currentMonthStats && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {currentMonthStats.currentMonth.month}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Finalized Commission Performance
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>

            <StatsGrid
              stats={[
                { title: 'Earned', value: formatCurrency(currentMonthStats.currentMonth.totalEarned), subtitle: 'Month-to-date', icon: <FaCoins /> },
                { title: 'Paid', value: formatCurrency(currentMonthStats.currentMonth.totalPaid), subtitle: 'Paid so far', icon: <FaWallet /> },
                { title: `Pending (${currentMonthStats.currentMonth.pendingCount})`, value: formatCurrency(currentMonthStats.currentMonth.totalPending), subtitle: 'Awaiting finalization', icon: <FaClock /> },
                { title: 'Rejected', value: formatCurrency(currentMonthStats.currentMonth.totalRejected), subtitle: 'Rejected', icon: <FaTimesCircle /> },
              ]}
              columns={4}
              gap="sm"
            />

            {currentMonthStats.currentMonth.pendingCount > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <FaClock className="inline mr-1" />
                  You have{" "}
                  {formatCurrency(
                    currentMonthStats.currentMonth.totalPending
                  )}{" "}
                  in pending commissions. These will be processed by the
                  admin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={(v) => setSearchTerm(v)}
          onSearch={(e) => { e.preventDefault(); /* searchTerm change will trigger loadCommissions via effect */ }}
          filters={{
            status: {
              value: (commissionStatusFilter || 'all') as string,
              label: 'Status',
              placeholder: 'All Statuses',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'rejected', label: 'Rejected' },
              ],
            },
            period: {
              value: (commissionPeriodFilter || 'all') as string,
              label: 'Period',
              placeholder: 'All Periods',
              options: [
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ],
            },
          }}
          onFilterChange={(key, value) => {
            if (key === 'status') setCommissionStatusFilter(value as CommissionFilters['status'] | 'all');
            if (key === 'period') setCommissionPeriodFilter(value as CommissionFilters['period'] | 'all');
          }}
          onClearFilters={() => {
            setSearchTerm('');
            setCommissionStatusFilter('all');
            setCommissionPeriodFilter('all');
          }}
          showFilterToggle={false}
          isLoading={isLoadingCommissions}
        />

        {/* Finalized Commission Records */}
        <Card className="mb-6">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Finalized Commission Records
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {
                finalizedCommissions.filter((c) => {
                  if (
                    commissionStatusFilter !== "all" &&
                    c.status !== commissionStatusFilter
                  )
                    return false;
                  if (
                    commissionPeriodFilter !== "all" &&
                    c.period !== commissionPeriodFilter
                  )
                    return false;
                  return true;
                }).length
              }{" "}
              of {finalizedCommissions.length} finalized commissions
            </p>
          </CardHeader>

          <CardBody className="p-4 sm:p-6">
            {isLoadingCommissions ? (
              <div className="flex items-center justify-center py-8">
                <FaSync className="animate-spin text-blue-600 text-xl" />
                <span className="ml-2 text-gray-600">
                  Loading commissions...
                </span>
              </div>
            ) : finalizedCommissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaCoins className="text-4xl mx-auto mb-4 text-gray-300" />
                <p>No finalized commissions yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Finalized commissions will appear here at the end of each
                  month
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {finalizedCommissions
                  .filter((c) => {
                    if (
                      commissionStatusFilter !== "all" &&
                      c.status !== commissionStatusFilter
                    )
                      return false;
                    if (
                      commissionPeriodFilter !== "all" &&
                      c.period !== commissionPeriodFilter
                    )
                      return false;
                    return true;
                  })
                  .map((commission) => (
                    <div
                      key={commission._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${commission.status === "paid"
                            ? "bg-green-100"
                            : commission.status === "pending"
                              ? "bg-yellow-100"
                              : "bg-red-100"
                            }`}
                        >
                          {commission.status === "paid" ? (
                            <FaCheckCircle className="text-green-600" />
                          ) : commission.status === "pending" ? (
                            <FaClock className="text-yellow-600" />
                          ) : (
                            <FaTimesCircle className="text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${commission.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : commission.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                                }`}
                            >
                              {commission.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {commission.period}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              FINALIZED
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {commission.totalOrders} orders •{" "}
                            {formatCurrency(commission.totalRevenue)} revenue
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(commission.periodStart)} -{" "}
                            {formatDate(commission.periodEnd).split(",")[0]}
                          </p>
                          {commission.finalizedAt && (
                            <p className="text-xs text-blue-600 mt-1">
                              Finalized on{" "}
                              {formatDate(commission.finalizedAt)}
                            </p>
                          )}
                          {commission.status === "paid" &&
                            commission.paidAt && (
                              <p className="text-xs text-green-600 mt-1">
                                Paid on {formatDate(commission.paidAt)}
                                {commission.paymentReference &&
                                  ` • Ref: ${commission.paymentReference}`}
                              </p>
                            )}
                          {commission.status === "rejected" &&
                            commission.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">
                                Rejected: {commission.rejectionReason}
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 mt-3 sm:mt-0 sm:ml-4">
                        <p
                          className={`font-semibold text-base sm:text-lg ${commission.status === "paid"
                            ? "text-green-600"
                            : commission.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                            }`}
                        >
                          {formatCurrency(commission.amount)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {commission.formattedRate} rate
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Monthly History Section */}
        {monthlySummaries.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6 border-b border-gray-200">
              <button
                onClick={() =>
                  setExpandedMonthlyHistory(!expandedMonthlyHistory)
                }
                className="w-full flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-left">
                    Monthly History
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 text-left">
                    {monthlySummaries.length} archived month(s)
                  </p>
                </div>
                {expandedMonthlyHistory ? (
                  <FaChevronUp className="text-gray-600" />
                ) : (
                  <FaChevronDown className="text-gray-600" />
                )}
              </button>
            </CardHeader>

            {expandedMonthlyHistory && (
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {monthlySummaries.map((summary) => (
                    <div
                      key={summary._id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {summary.monthName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {summary.recordCount} record(s) •{" "}
                            {summary.orderCount} orders
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${summary.paymentStatus === "fully_paid"
                            ? "bg-green-100 text-green-800"
                            : summary.paymentStatus === "partially_paid"
                              ? "bg-yellow-100 text-yellow-800"
                              : summary.paymentStatus === "unpaid"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {summary.paymentStatus.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">
                            Total Earned
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {formatCurrency(summary.totalEarned)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Paid</p>
                          <p className="font-semibold text-green-600 text-sm">
                            {formatCurrency(summary.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pending</p>
                          <p className="font-semibold text-yellow-600 text-sm">
                            {formatCurrency(summary.totalPending)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rejected</p>
                          <p className="font-semibold text-red-600 text-sm">
                            {formatCurrency(summary.totalRejected)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Revenue: {formatCurrency(summary.revenue)}
                          </span>
                          <span>Rate: {summary.formattedRate}</span>
                          <span>
                            Payment: {summary.paymentPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            )}
          </Card>
        )}
      </>
    )}

    {/* Top-up Request Modal */}
    <TopUpRequestModal
      isOpen={showTopUpModal}
      onClose={() => setShowTopUpModal(false)}
      onSubmit={handleTopUpRequest}
      isSubmitting={isSubmittingRequest}
      error={error}
    />
  </>
  );
};
