import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../hooks";
import { type WalletTransaction } from "../types/wallet";
import {
  commissionService,
  type CommissionRecord,
  type CommissionStatistics,
} from "../services/commission.service";
import {
  FaWallet,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaWifi,
  FaCoins,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import { Alert } from "../design-system";
import { TopUpRequestModal } from "../components/wallet/TopUpRequestModal";

export const WalletPage = () => {
  const {
    walletBalance,
    refreshWallet,
    isLoading,
    error,
    getTransactionHistory,
    requestTopUp,
    connectionStatus,
  } = useWallet();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Commission state
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [commissionStats, setCommissionStats] =
    useState<CommissionStatistics | null>(null);
  const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallet" | "commissions">(
    "wallet"
  );

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
      const [commissionsData, statsData] = await Promise.all([
        commissionService.getAgentCommissions({ status: "paid" }),
        commissionService.getCommissionStatistics(),
      ]);
      setCommissions(commissionsData);
      setCommissionStats(statsData);
    } catch {
      // Failed to load commissions
    } finally {
      setIsLoadingCommissions(false);
    }
  }, []);

  // Fetch transaction history on page load and when page changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Load commissions on component mount
  useEffect(() => {
    loadCommissions();
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
  const getConnectionStatusIndicator = () => {
    const statusColors = {
      websocket: "text-green-500",
      polling: "text-yellow-500",
      disconnected: "text-red-500",
    };

    const statusText = {
      websocket: "Real-time (WebSocket)",
      polling: "Polling (Fallback)",
      disconnected: "Disconnected",
    };

    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <FaWifi className={statusColors[connectionStatus]} />
        <span className={`${statusColors[connectionStatus]} hidden sm:inline`}>
          {statusText[connectionStatus]}
        </span>
        <span className={`${statusColors[connectionStatus]} sm:hidden`}>
          {connectionStatus === "websocket"
            ? "Live"
            : connectionStatus === "polling"
            ? "Polling"
            : "Offline"}
        </span>
      </div>
    );
  };

  const handleTopUpRequest = async (amount: number, description: string) => {
    setIsSubmittingRequest(true);
    try {
      await requestTopUp(amount, description);
      setSuccessMessage("Top-up request submitted successfully!");
      setShowTopUpModal(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      // Failed to submit top-up request
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Wallet & Commissions
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your wallet balance and view commission earnings
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {getConnectionStatusIndicator()}
            <button
              onClick={() => refreshWallet()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("wallet")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "wallet"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaWallet className="inline mr-2" />
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("commissions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "commissions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FaCoins className="inline mr-2" />
              Commissions
            </button>
          </nav>
        </div>
      </div>

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

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Current Balance
              </h2>
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FaPlus />
                <span className="hidden sm:inline">Request Top-up</span>
                <span className="sm:hidden">Top-up</span>
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {formatCurrency(walletBalance)}
            </div>

            <p className="text-sm sm:text-base text-gray-600">
              Available for transactions and purchases
            </p>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Transaction History
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <FaSync className="animate-spin text-blue-600 text-xl" />
                  <span className="ml-2 text-gray-600">
                    Loading transactions...
                  </span>
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
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm"
                    >
                      Previous
                    </button>

                    <span className="px-3 py-2 text-gray-600 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Commissions Tab Content */
        <>
          {/* Commission Statistics Cards */}
          {commissionStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaCoins className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Paid</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {formatCurrency(commissionStats.totalPaid)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FaCalendarAlt className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Payment</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                      {formatCurrency(commissionStats.totalPending)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaChartLine className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Count</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {commissionStats.pendingCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaCalendarAlt className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">This Month Paid</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">
                      {formatCurrency(commissionStats.thisMonth.totalPaid)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commission History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Commission History
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              {isLoadingCommissions ? (
                <div className="flex items-center justify-center py-8">
                  <FaSync className="animate-spin text-blue-600 text-xl" />
                  <span className="ml-2 text-gray-600">
                    Loading commissions...
                  </span>
                </div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaCoins className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>No commissions yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your commission history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {commissions.map((commission) => (
                    <div
                      key={commission._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                          <FaCoins className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                commission.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : commission.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {commission.status === "paid"
                                ? "Paid"
                                : commission.status === "pending"
                                ? "Pending"
                                : "Cancelled"}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {commission.period} Commission
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {commission.totalOrders} orders •{" "}
                            {formatCurrency(commission.totalRevenue)} revenue
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(
                              commission.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 mt-3 sm:mt-0 sm:ml-4">
                        <p className="font-semibold text-lg text-green-600">
                          {formatCurrency(commission.amount)}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {(commission.commissionRate * 100).toFixed(1)}% rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Top-up Request Modal */}
      <TopUpRequestModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSubmit={handleTopUpRequest}
        isSubmitting={isSubmittingRequest}
      />
    </div>
  );
};
