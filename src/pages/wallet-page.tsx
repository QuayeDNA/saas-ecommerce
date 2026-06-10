/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useWallet } from "../hooks";
import { type WalletTransaction } from "../types/wallet";
import {
  FaWallet,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaMoneyBillAlt,
  FaFilter,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaReceipt,
} from "react-icons/fa";
import {
  Alert,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Spinner,
  Pagination,
  Card,
  CardHeader,
  CardBody,
} from "../design-system";
import { useToast } from "../design-system/components/toast";
import { TopUpRequestModal } from "../components/wallet/TopUpRequestModal";
import { EarningsManager } from "../components/storefront/earnings-manager";


export const WalletPage = () => {
  const {
    walletBalance,
    refreshWallet,
    isLoading,
    error,
    getTransactionHistory,
    requestTopUp,
  } = useWallet();

  const { addToast } = useToast();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Transaction history filters
  const [txTypeFilter, setTxTypeFilter] = useState<"credit" | "debit" | "">("");
  const [txStartDate, setTxStartDate] = useState("");
  const [txEndDate, setTxEndDate] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [showTxFilters, setShowTxFilters] = useState(false);

  const [activeTab, setActiveTab] = useState<"wallet" | "earnings">("wallet");

  // Load transactions function
  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const result = await getTransactionHistory(
        currentPage,
        20,
        txTypeFilter || undefined,
        txStartDate || undefined,
        txEndDate || undefined,
      );
      if (result) {
        setTransactions(result.transactions);
        setTotalPages(result.pagination.pages);
        setTotalTransactions(result.pagination.total);
      }
    } catch {
      // Failed to load transactions
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [
    currentPage,
    getTransactionHistory,
    txTypeFilter,
    txStartDate,
    txEndDate,
  ]);

  // Fetch transaction history on page load and when page changes or filters change
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [txTypeFilter, txStartDate, txEndDate]);

  // Listen for postMessage events from payment popups (Paystack)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;
      const data = event.data as
        | {
            type?: string;
            status?: string;
            reference?: string;
            message?: string;
          }
        | undefined;
      if (!data || data.type !== "PAYSTACK_TOPUP") return;

      if (data.status === "success") {
        addToast("Payment completed — wallet updated.", "success");
        // Refresh wallet and transactions
        refreshWallet();
        loadTransactions();
      } else {
        addToast(
          data.message || "Payment pending — webhook will reconcile.",
          "info",
        );
      }

      try {
        window.focus();
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refreshWallet, loadTransactions, addToast]);

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

  const getTransactionColor = (
    type: string,
    transaction?: WalletTransaction,
  ): string => {
    if (
      transaction &&
      transaction.type === "credit" &&
      transaction.status === "rejected"
    ) {
      return "var(--error)";
    }

    switch (type) {
      case "credit":
        return "var(--success)";
      case "debit":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  };

  const getTransactionIcon = (
    type: string,
    transaction?: WalletTransaction,
  ): ReactNode => {
    const color = getTransactionColor(type, transaction);

    if (
      transaction &&
      transaction.type === "credit" &&
      transaction.status === "rejected"
    ) {
      return <FaTimesCircle style={{ color }} />;
    }

    switch (type) {
      case "credit":
        return <FaArrowUp style={{ color }} />;
      case "debit":
        return <FaArrowDown style={{ color }} />;
      default:
        return <FaWallet style={{ color: "var(--text-muted)" }} />;
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

  // Client-side text search applied on top of the server-filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!txSearch.trim()) return transactions;
    const q = txSearch.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.reference && t.reference.toLowerCase().includes(q)),
    );
  }, [transactions, txSearch]);

  // Summary stats for the filtered view
  const txSummary = useMemo(() => {
    const totalCredits = filteredTransactions
      .filter((t) => t.type === "credit")
      .reduce((s, t) => s + t.amount, 0);
    const totalDebits = filteredTransactions
      .filter((t) => t.type === "debit")
      .reduce((s, t) => s + t.amount, 0);
    return { totalCredits, totalDebits, net: totalCredits - totalDebits };
  }, [filteredTransactions]);

  const hasActiveFilters =
    txTypeFilter !== "" ||
    txStartDate !== "" ||
    txEndDate !== "" ||
    txSearch.trim() !== "";

  const clearTxFilters = () => {
    setTxTypeFilter("");
    setTxStartDate("");
    setTxEndDate("");
    setTxSearch("");
  };

  return (
    <>
      {/* Header */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Wallet
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Manage your wallet balance and storefront earnings
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
        <div className="mt-6">
          <Tabs
            value={activeTab}
            onValueChange={(v: string) =>
              setActiveTab(v as "wallet" | "earnings")
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="wallet" className="flex-1 min-w-0">
                <FaWallet className="inline shrink-0 mr-1.5" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex-1 min-w-0">
                <FaMoneyBillAlt className="inline shrink-0 mr-1.5" />
                Earnings
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
          <Card className="mb-6">
            <CardHeader className="flex flex-col items-start justify-between">
              <div>
                <h2
                  className="text-lg sm:text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Current Balance
                </h2>
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
              <div
                className="text-3xl sm:text-4xl font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {formatCurrency(walletBalance)}
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Available for transactions and purchases
              </p>
            </CardBody>
          </Card>

          {/* Transaction History */}
          <Card className="mb-6">
            <CardHeader
              className="p-4"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2
                    className="text-lg sm:text-xl font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Transaction History
                  </h2>
                  {totalTransactions > 0 && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {totalTransactions} transaction
                      {totalTransactions !== 1 ? "s" : ""} total
                      {hasActiveFilters &&
                        ` · ${filteredTransactions.length} shown`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearTxFilters}
                      className="flex items-center gap-1 text-xs transition-colors"
                      style={{ color: "var(--error)" }}
                    >
                      <FaTimes className="text-xs" /> Clear filters
                    </button>
                  )}
                  <button
                    onClick={() => setShowTxFilters((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors"
                    style={
                      showTxFilters || hasActiveFilters
                        ? {
                            backgroundColor: `color-mix(in srgb, var(--color-secondary) 10%, transparent)`,
                            borderColor: "var(--color-secondary)",
                            color: "var(--color-secondary)",
                          }
                        : {
                            backgroundColor: "var(--bg-surface)",
                            borderColor: "var(--border-color)",
                            color: "var(--text-secondary)",
                          }
                    }
                  >
                    <FaFilter className="text-xs" />
                    Filter
                    {hasActiveFilters && (
                      <span
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs"
                        style={{
                          backgroundColor: "var(--color-secondary)",
                          color: "var(--text-inverse)",
                        }}
                      >
                        {
                          [
                            txTypeFilter,
                            txStartDate,
                            txEndDate,
                            txSearch.trim(),
                          ].filter(Boolean).length
                        }
                      </span>
                    )}
                  </button>
                  <button
                    onClick={loadTransactions}
                    disabled={isLoadingTransactions}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      borderColor: "var(--border-color)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <FaSync
                      className={
                        isLoadingTransactions
                          ? "animate-spin text-xs"
                          : "text-xs"
                      }
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Expandable filter panel */}
              {showTxFilters && (
                <div
                  className="mt-3 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                  style={{ borderTop: "1px solid var(--border-color)" }}
                >
                  {/* Text search */}
                  <div className="relative">
                    <FaSearch
                      className="absolute left-2.5 top-2.5 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="text"
                      placeholder="Search description or ref…"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm rounded-lg"
                      style={{
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius-lg)",
                        outline: "none",
                      }}
                    />
                  </div>
                  {/* Type filter */}
                  <select
                    value={txTypeFilter}
                    onChange={(e) =>
                      setTxTypeFilter(e.target.value as "credit" | "debit" | "")
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg"
                    style={{
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      borderRadius: "var(--radius-lg)",
                      outline: "none",
                    }}
                  >
                    <option value="">All types</option>
                    <option value="credit">Credits only</option>
                    <option value="debit">Debits only</option>
                  </select>
                  {/* Start date */}
                  <div>
                    <label
                      className="block text-xs mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      From
                    </label>
                    <input
                      type="date"
                      value={txStartDate}
                      onChange={(e) => setTxStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg"
                      style={{
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius-lg)",
                        outline: "none",
                      }}
                    />
                  </div>
                  {/* End date */}
                  <div>
                    <label
                      className="block text-xs mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      To
                    </label>
                    <input
                      type="date"
                      value={txEndDate}
                      onChange={(e) => setTxEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg"
                      style={{
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius-lg)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Filter summary stats bar */}
              {filteredTransactions.length > 0 &&
                (hasActiveFilters || transactions.length > 0) && (
                  <div
                    className="mt-3 pt-3 grid grid-cols-3 gap-2 text-center"
                    style={{ borderTop: "1px solid var(--border-color)" }}
                  >
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Total In
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--success)" }}
                      >
                        {formatCurrency(txSummary.totalCredits)}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Total Out
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--error)" }}
                      >
                        {formatCurrency(txSummary.totalDebits)}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Net
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color:
                            txSummary.net >= 0
                              ? "var(--success)"
                              : "var(--error)",
                        }}
                      >
                        {txSummary.net >= 0 ? "+" : ""}
                        {formatCurrency(txSummary.net)}
                      </p>
                    </div>
                  </div>
                )}
            </CardHeader>

            <CardBody>
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" color="primary" />
                  <span className="ml-3" style={{ color: "var(--text-secondary)" }}>
                    Loading transactions...
                  </span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                  <FaWallet className="text-4xl mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
                  <p>
                    {hasActiveFilters
                      ? "No transactions match your filters"
                      : "No transactions found"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearTxFilters}
                      className="mt-2 text-sm hover:underline" style={{ color: "var(--color-primary)" }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredTransactions.map((transaction) => {
                    const meta = (transaction.metadata || {}) as any;
                    const desc = String(transaction.description || "");
                    const isTopUp =
                      transaction.type === "credit" &&
                      (Boolean(
                        meta && (meta.type === "wallet_topup" || meta.isTopUp),
                      ) ||
                        /top-?up/i.test(desc));
                    const txColor = getTransactionColor(
                      transaction.type,
                      transaction,
                    );
                    const orderRef =
                      typeof transaction.relatedOrder === "object" &&
                      transaction.relatedOrder !== null
                        ? (transaction.relatedOrder as { orderNumber?: string })
                            .orderNumber
                        : null;

                    return (
                      <div
                        key={transaction._id}
                        className="p-3 sm:p-4 border rounded-xl transition-all"
                        style={{
                          borderColor: `color-mix(in srgb, ${txColor} 30%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${txColor} 8%, var(--bg-surface))`,
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 mt-0.5"
                            style={{
                              backgroundColor: "var(--bg-surface)",
                              boxShadow: "var(--shadow-sm)",
                            }}
                          >
                            {getTransactionIcon(transaction.type, transaction)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: `color-mix(in srgb, ${txColor} 15%, transparent)`,
                                  color: txColor,
                                }}
                              >
                                {isTopUp
                                  ? "Top-up"
                                  : transaction.type === "credit"
                                    ? "Credit"
                                    : "Debit"}
                              </span>
                              {transaction.status &&
                                transaction.status !== "completed" && (
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: `color-mix(in srgb, ${transaction.status === "pending" ? "var(--warning)" : "var(--error)"} 15%, transparent)`,
                                      color:
                                        transaction.status === "pending"
                                          ? "var(--warning)"
                                          : "var(--error)",
                                    }}
                                  >
                                    {transaction.status}
                                  </span>
                                )}
                              {orderRef && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                  style={{
                                    backgroundColor: "var(--bg-surface-alt)",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  <FaReceipt className="text-xs" /> {orderRef}
                                </span>
                              )}
                            </div>
                            <p
                              className="font-medium text-sm truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {transaction.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <p
                                className="text-xs"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {formatDate(transaction.createdAt)}
                              </p>
                              {transaction.reference &&
                                !transaction.reference.startsWith("TXN") && (
                                  <p
                                    className="text-xs font-mono truncate max-w-[180px]"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    Ref: {transaction.reference.slice(0, 24)}
                                  </p>
                                )}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 ml-2">
                            <p
                              className="font-bold text-base sm:text-lg leading-tight"
                              style={{ color: txColor }}
                            >
                              {transaction.type === "credit" ? "+" : "−"}
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>

                        {isTopUp && transaction.status === "pending" ? (
                          <div
                            className="mt-2.5 ml-12 text-xs"
                            style={{ color: "var(--warning)" }}
                          >
                            Pending top-up — wallet will be updated once payment
                            confirmation is received.
                          </div>
                        ) : (
                          (() => {
                            const balanceBefore =
                              transaction.type === "credit"
                                ? transaction.balanceAfter - transaction.amount
                                : transaction.balanceAfter + transaction.amount;
                            return (
                              <div className="mt-2.5 ml-12 flex items-center gap-1.5 text-xs flex-wrap">
                                <div className="flex flex-col items-center">
                                  <span
                                    className="uppercase tracking-wide text-[10px] leading-none mb-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    Before
                                  </span>
                                  <span
                                    className="font-mono font-medium rounded px-1.5 py-0.5 whitespace-nowrap"
                                    style={{
                                      color: "var(--text-secondary)",
                                      backgroundColor: "var(--bg-surface)",
                                      border: "1px solid var(--border-color)",
                                    }}
                                  >
                                    {formatCurrency(balanceBefore)}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span
                                    className="text-[10px] leading-none mb-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    &nbsp;
                                  </span>
                                  <span
                                    className="font-semibold whitespace-nowrap"
                                    style={{ color: txColor }}
                                  >
                                    {transaction.type === "credit"
                                      ? "＋"
                                      : "－"}
                                    {formatCurrency(transaction.amount)} →
                                  </span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span
                                    className="uppercase tracking-wide text-[10px] leading-none mb-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    After
                                  </span>
                                  <span
                                    className="font-mono font-semibold rounded px-1.5 py-0.5 whitespace-nowrap"
                                    style={{
                                      color: "var(--text-primary)",
                                      backgroundColor: "var(--bg-surface)",
                                      border: "1px solid var(--border-color)",
                                      boxShadow: "var(--shadow-sm)",
                                    }}
                                  >
                                    {formatCurrency(transaction.balanceAfter)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()
                        )}
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
                    totalItems={totalTransactions}
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
        /* Earnings & Payouts Tab Content */
        <>
          <div
            className="mb-4 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: `color-mix(in srgb, var(--color-secondary) 8%, transparent)`,
              border: `1px solid color-mix(in srgb, var(--color-secondary) 20%, transparent)`,
              color: 'var(--color-secondary)',
            }}
          >
            <strong>Your storefront earnings</strong> are stored securely in
            your account. You can request a payout at any time — even if your
            storefront is inactive or closed.
          </div>
          <EarningsManager />
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
