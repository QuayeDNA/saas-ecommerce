import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaHistory,
  FaEye,
  FaTimes,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaUsers,
  FaFilter,
} from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";
import {
  Button,
  Badge,
  Card,
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
import type { WalletTransaction } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserDisplayName(user: any): string {
  if (typeof user === "string") return user;
  if (user && typeof user === "object") return user.fullName || user.email || "Unknown";
  return "Unknown";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUserIdentifier(user: any): string {
  if (typeof user === "string") return user;
  if (user && typeof user === "object") return user.agentCode || user._id || "";
  return "";
}

function txnTypeBadgeColor(type: string): "success" | "error" | "gray" {
  if (type === "credit") return "success";
  if (type === "debit") return "error";
  return "gray";
}

function txnStatusBadgeColor(status: string): "success" | "error" | "warning" | "gray" {
  switch (status) {
    case "completed": return "success";
    case "rejected": return "error";
    case "pending": return "warning";
    default: return "gray";
  }
}

const TRANSACTION_TYPE_OPTIONS = [
  { value: "credit", label: "Credits" },
  { value: "debit", label: "Debits" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WalletHistoryPage() {
  const { addToast } = useToast();

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // Detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Hover states
  const [hoveredRefreshBtn, setHoveredRefreshBtn] = useState(false);
  const [hoveredClearFilter, setHoveredClearFilter] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredViewBtnId, setHoveredViewBtnId] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const resp = await walletService.getAdminTransactions(
        page,
        pagination.limit,
        (typeFilter as "credit" | "debit") || undefined,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined,
        searchTerm || undefined
      );
      setTransactions(resp.transactions);
      setPagination(resp.pagination);
    } catch {
      addToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, typeFilter, dateRange, searchTerm, addToast]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "type") setTypeFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setDateRange({ startDate: "", endDate: "" });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n);

  // Summary stats derived from current page
  const summary = useMemo(() => {
    const credits = transactions.filter((t) => t.type === "credit");
    const debits = transactions.filter((t) => t.type === "debit");
    return {
      totalCredits: credits.reduce((s, t) => s + t.amount, 0),
      totalDebits: debits.reduce((s, t) => s + t.amount, 0),
      creditCount: credits.length,
      debitCount: debits.length,
    };
  }, [transactions]);

  const hasActiveFilters = typeFilter !== "" || dateRange.startDate !== "" || dateRange.endDate !== "" || searchTerm.trim() !== "";

  return (
    <div className="space-y-4 pb-6">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 sm:p-6"
        style={{ backgroundImage: "linear-gradient(to right, #334155, #1e293b)", color: "var(--text-inverse)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, var(--text-inverse) 20%, transparent)" }}>
              <FaHistory className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Transaction History</h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                All admin wallet credits and debits across the platform
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            style={{
              borderColor: hoveredRefreshBtn ? "color-mix(in srgb, var(--text-inverse) 20%, transparent)" : "color-mix(in srgb, var(--text-inverse) 40%, transparent)",
              color: "var(--text-inverse)",
              backgroundColor: hoveredRefreshBtn ? "color-mix(in srgb, var(--text-inverse) 10%, transparent)" : undefined,
            }}
            onMouseEnter={() => setHoveredRefreshBtn(true)}
            onMouseLeave={() => setHoveredRefreshBtn(false)}
            onClick={() => fetchTransactions(pagination.page)}
          >
            <FaSync className="mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* ── Summary strip ──────────────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg px-3 py-2.5" style={{ backgroundColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)" }}>
                <Skeleton height="0.625rem" width="60%" className="mb-1 opacity-50" />
                <Skeleton height="1.25rem" width="80%" className="mb-1 opacity-60" />
                <Skeleton height="0.625rem" width="50%" className="opacity-40" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: "color-mix(in srgb, var(--text-inverse) 15%, transparent)" }}>
                <FaUsers className="text-sm flex-shrink-0" style={{ color: "color-mix(in srgb, var(--text-inverse) 60%, transparent)" }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--text-inverse) 70%, transparent)" }}>Total</p>
                  <p className="font-bold text-sm sm:text-base" style={{ color: "var(--text-inverse)" }}>{pagination.total}</p>
                  <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--text-tertiary) 80%, transparent)" }}>transactions</p>
                </div>
              </div>
              <div className="rounded-lg px-3 py-2.5 flex items-center gap-2 border" style={{ backgroundColor: "color-mix(in srgb, var(--success) 30%, transparent)", borderColor: "color-mix(in srgb, var(--success) 30%, transparent)" }}>
                <FaArrowUp className="text-sm flex-shrink-0" style={{ color: "var(--success)" }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--text-inverse) 70%, transparent)" }}>Credits</p>
                  <p className="font-bold text-sm sm:text-base" style={{ color: "var(--text-inverse)" }}>{fmt(summary.totalCredits)}</p>
                  <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--text-tertiary) 80%, transparent)" }}>{summary.creditCount} transactions</p>
                </div>
              </div>
              <div className="rounded-lg px-3 py-2.5 flex items-center gap-2 border" style={{ backgroundColor: "color-mix(in srgb, var(--error) 30%, transparent)", borderColor: "color-mix(in srgb, var(--error) 30%, transparent)" }}>
                <FaArrowDown className="text-sm flex-shrink-0" style={{ color: "var(--error)" }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--text-inverse) 70%, transparent)" }}>Debits</p>
                  <p className="font-bold text-sm sm:text-base" style={{ color: "var(--text-inverse)" }}>{fmt(summary.totalDebits)}</p>
                  <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--text-tertiary) 80%, transparent)" }}>{summary.debitCount} transactions</p>
                </div>
              </div>
              <div
                className="rounded-lg px-3 py-2.5 flex items-center gap-2 border"
                style={{
                  backgroundColor: summary.totalCredits - summary.totalDebits >= 0
                    ? "color-mix(in srgb, var(--success) 20%, transparent)"
                    : "color-mix(in srgb, var(--error) 20%, transparent)",
                  borderColor: summary.totalCredits - summary.totalDebits >= 0
                    ? "color-mix(in srgb, var(--success) 20%, transparent)"
                    : "color-mix(in srgb, var(--error) 20%, transparent)",
                }}
              >
                <FaExchangeAlt className="text-sm flex-shrink-0" style={{ color: "color-mix(in srgb, var(--text-inverse) 60%, transparent)" }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "color-mix(in srgb, var(--text-inverse) 70%, transparent)" }}>Net (page)</p>
                  <p
                    className="font-bold text-sm sm:text-base"
                    style={{ color: summary.totalCredits - summary.totalDebits >= 0 ? "var(--success)" : "var(--error)" }}
                  >
                    {summary.totalCredits - summary.totalDebits >= 0 ? "+" : ""}{fmt(summary.totalCredits - summary.totalDebits)}
                  </p>
                  <p className="text-[10px]" style={{ color: "color-mix(in srgb, var(--text-tertiary) 80%, transparent)" }}>this page</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search by user ID, name or reference…"
        filters={{
          type: { value: typeFilter, options: TRANSACTION_TYPE_OPTIONS, label: "Type" },
        }}
        onFilterChange={handleFilterChange}
        onSearch={(e) => e.preventDefault()}
        onClearFilters={handleClearFilters}
        showDateRange={true}
        dateRange={dateRange}
        onDateRangeChange={(start, end) => {
          setDateRange({ startDate: start, endDate: end });
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        showSearchButton={false}
        isLoading={loading}
      />

      {/* ── Results count ───────────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {pagination.total > 0
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} transactions`
              : "No transactions found"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs flex items-center gap-1"
              style={{ color: hoveredClearFilter ? "color-mix(in srgb, var(--color-primary) 80%, transparent)" : "var(--color-primary)" }}
              onMouseEnter={() => setHoveredClearFilter(true)}
              onMouseLeave={() => setHoveredClearFilter(false)}
            >
              <FaFilter className="text-[10px]" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Transaction list ─────────────────────────────────────────────────── */}
      <Card noPadding>
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 rounded-xl border" style={{ borderColor: "var(--border-color)" }}>
                <div className="flex items-start gap-3">
                  <Skeleton variant="circular" width={36} height={36} />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton height="0.875rem" width="40%" />
                    <Skeleton height="0.75rem" width="65%" />
                    <Skeleton height="0.75rem" width="30%" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton height="1rem" width="90px" />
                    <Skeleton height="0.75rem" width="70px" />
                  </div>
                </div>
                <div className="mt-2.5 ml-12 flex items-center gap-2">
                  <Skeleton height="1.5rem" width="100px" />
                  <Skeleton height="0.75rem" width="30px" />
                  <Skeleton height="1.5rem" width="100px" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: "var(--text-tertiary)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-muted)" }}>
              <FaHistory className="text-2xl" />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: "var(--text-secondary)" }}>No transactions found</p>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {hasActiveFilters ? "Try adjusting your filters or date range." : "No wallet transactions recorded yet."}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-[var(--border-color)]">
              {transactions.map((txn) => {
                const isCredit = txn.type === "credit";
                const balanceBefore = isCredit
                  ? txn.balanceAfter - txn.amount
                  : txn.balanceAfter + txn.amount;
                return (
                  <div
                    key={txn._id}
                    className="p-3 transition-colors border-l-4"
                    style={{
                      borderLeftColor: isCredit ? "var(--success)" : "var(--error)",
                      backgroundColor: hoveredRowId === txn._id ? "color-mix(in srgb, var(--bg-muted) 70%, transparent)" : undefined,
                    }}
                    onMouseEnter={() => setHoveredRowId(txn._id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: isCredit ? "color-mix(in srgb, var(--success) 15%, transparent)" : "color-mix(in srgb, var(--error) 15%, transparent)" }}
                      >
                        {isCredit
                          ? <FaArrowUp className="text-xs" style={{ color: "var(--success)" }} />
                          : <FaArrowDown className="text-xs" style={{ color: "var(--error)" }} />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-0.5">
                          <Badge colorScheme={txnTypeBadgeColor(txn.type)} size="xs">{txn.type}</Badge>
                          <Badge colorScheme={txnStatusBadgeColor(txn.status)} size="xs">{txn.status}</Badge>
                        </div>
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{getUserDisplayName(txn.user)}</p>
                        {getUserIdentifier(txn.user) && (
                          <p className="text-xs font-mono truncate" style={{ color: "var(--color-primary)" }}>{getUserIdentifier(txn.user)}</p>
                        )}
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{txn.description}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{formatDate(txn.createdAt)}</p>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <p className="font-bold text-base leading-tight" style={{ color: isCredit ? "var(--success)" : "var(--error)" }}>
                          {isCredit ? "+" : "\u2212"}{fmt(txn.amount)}
                        </p>
                        <button
                          onClick={() => { setSelectedTransaction(txn); setDetailModalOpen(true); }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color: "var(--color-primary)",
                            backgroundColor: hoveredViewBtnId === txn._id ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : undefined,
                          }}
                          onMouseEnter={() => setHoveredViewBtnId(txn._id)}
                          onMouseLeave={() => setHoveredViewBtnId(null)}
                          title="View details"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Balance timeline */}
                    <div className="mt-2 ml-12 flex items-center gap-1.5 text-xs flex-wrap">
                      <div className="flex flex-col items-center">
                        <span className="uppercase tracking-wide text-[9px] leading-none mb-0.5" style={{ color: "var(--text-tertiary)" }}>Before</span>
                        <span className="font-mono font-medium rounded px-1.5 py-0.5 whitespace-nowrap text-[10px]" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-muted)" }}>
                          {fmt(balanceBefore)}
                        </span>
                      </div>
                      <span className="font-semibold whitespace-nowrap text-[10px]" style={{ color: isCredit ? "var(--success)" : "var(--error)" }}>
                        {isCredit ? "\uFF0B" : "\uFF0D"}{fmt(txn.amount)} \u2192
                      </span>
                      <div className="flex flex-col items-center">
                        <span className="uppercase tracking-wide text-[9px] leading-none mb-0.5" style={{ color: "var(--text-tertiary)" }}>After</span>
                        <span className="font-mono font-semibold rounded px-1.5 py-0.5 whitespace-nowrap text-[10px] shadow-sm border" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>
                          {fmt(txn.balanceAfter)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Type / Status</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Balance Change</TableHeaderCell>
                    <TableHeaderCell className="hidden lg:table-cell">Description</TableHeaderCell>
                    <TableHeaderCell className="hidden xl:table-cell">Processed By</TableHeaderCell>
                    <TableHeaderCell>View</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const isCredit = txn.type === "credit";
                    const balanceBefore = isCredit
                      ? txn.balanceAfter - txn.amount
                      : txn.balanceAfter + txn.amount;
                    return (
                      <TableRow
                        key={txn._id}
                        className="transition-colors border-l-2"
                        style={{
                          borderLeftColor: isCredit ? "var(--success)" : "var(--error)",
                          backgroundColor: hoveredRowId === txn._id ? "color-mix(in srgb, var(--bg-muted) 70%, transparent)" : undefined,
                        }}
                        onMouseEnter={() => setHoveredRowId(txn._id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        <TableCell className="whitespace-nowrap text-xs" style={{ color: "var(--text-secondary)" }}>
                          {formatDate(txn.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{
                                color: "var(--text-inverse)",
                                backgroundColor: isCredit ? "var(--success)" : "var(--error)",
                              }}
                            >
                              {getUserDisplayName(txn.user).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm truncate max-w-[140px]" style={{ color: "var(--text-primary)" }}>{getUserDisplayName(txn.user)}</div>
                              <div className="text-xs font-mono truncate" style={{ color: "var(--text-tertiary)" }}>{getUserIdentifier(txn.user)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge colorScheme={txnTypeBadgeColor(txn.type)} size="xs">{txn.type}</Badge>
                            <Badge colorScheme={txnStatusBadgeColor(txn.status)} size="xs">{txn.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="font-bold text-sm" style={{ color: isCredit ? "var(--success)" : "var(--error)" }}>
                            {isCredit ? "+" : "\u2212"}{fmt(txn.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs flex-wrap">
                            <span className="font-mono px-1.5 py-0.5 rounded whitespace-nowrap" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-muted)" }}>{fmt(balanceBefore)}</span>
                            <span className="font-semibold text-[10px]" style={{ color: isCredit ? "var(--success)" : "var(--error)" }}>→</span>
                            <span className="font-mono font-semibold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm border" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>{fmt(txn.balanceAfter)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm max-w-[200px] truncate" style={{ color: "var(--text-secondary)" }}>
                          {txn.description}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs" style={{ color: "var(--text-secondary)" }}>
                          {txn.approvedBy ? getUserDisplayName(txn.approvedBy) : "—"}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => { setSelectedTransaction(txn); setDetailModalOpen(true); }}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{
                              color: hoveredViewBtnId === txn._id ? "color-mix(in srgb, var(--color-primary) 80%, transparent)" : "var(--color-primary)",
                              backgroundColor: hoveredViewBtnId === txn._id ? "color-mix(in srgb, var(--color-primary) 8%, transparent)" : undefined,
                            }}
                            onMouseEnter={() => setHoveredViewBtnId(txn._id)}
                            onMouseLeave={() => setHoveredViewBtnId(null)}
                            title="View details"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {pagination.pages > 1 && !loading && (
          <div className="border-t border-[var(--border-color)] px-4 py-3">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(p) => {
                setPagination((prev) => ({ ...prev, page: p }));
                void fetchTransactions(p);
              }}
              onItemsPerPageChange={(n) => {
                setPagination((prev) => ({ ...prev, limit: n, page: 1 }));
              }}
            />
          </div>
        )}
      </Card>

      {/* ── Transaction detail modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedTransaction(null); }}
        title="Transaction Details"
      >
        {selectedTransaction && (() => {
          const isCredit = selectedTransaction.type === "credit";
          const balanceBefore = isCredit
            ? selectedTransaction.balanceAfter - selectedTransaction.amount
            : selectedTransaction.balanceAfter + selectedTransaction.amount;
          return (
            <div className="space-y-4">
              {/* Banner */}
              <div
                className="rounded-xl p-4 flex items-center gap-4 border"
                style={{
                  backgroundColor: isCredit ? "color-mix(in srgb, var(--success) 8%, transparent)" : "color-mix(in srgb, var(--error) 8%, transparent)",
                  borderColor: isCredit ? "color-mix(in srgb, var(--success) 30%, transparent)" : "color-mix(in srgb, var(--error) 30%, transparent)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    color: "var(--text-inverse)",
                    backgroundColor: isCredit ? "var(--success)" : "var(--error)",
                  }}
                >
                  {isCredit ? <FaArrowUp className="text-lg" /> : <FaArrowDown className="text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{getUserDisplayName(selectedTransaction.user)}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>{getUserIdentifier(selectedTransaction.user)}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge colorScheme={txnTypeBadgeColor(selectedTransaction.type)} size="xs">{selectedTransaction.type}</Badge>
                    <Badge colorScheme={txnStatusBadgeColor(selectedTransaction.status)} size="xs">{selectedTransaction.status}</Badge>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-xl leading-tight" style={{ color: isCredit ? "var(--success)" : "var(--error)" }}>
                    {isCredit ? "+" : "\u2212"}{fmt(selectedTransaction.amount)}
                  </p>
                </div>
              </div>

              {/* Balance timeline */}
              <div className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-muted)" }}>
                <p className="text-xs mb-2 font-medium uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>Balance Change</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>Before</span>
                    <span className="font-mono font-medium rounded-lg px-3 py-1.5 text-sm border" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>{fmt(balanceBefore)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-transparent mb-1">_</span>
                    <span className="font-semibold text-sm" style={{ color: isCredit ? "var(--success)" : "var(--error)" }}>
                      {isCredit ? "\uFF0B" : "\uFF0D"}{fmt(selectedTransaction.amount)} →
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>After</span>
                    <span className="font-mono font-bold rounded-lg px-3 py-1.5 text-sm shadow-sm border-2" style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-surface)", borderColor: "var(--border-color)" }}>{fmt(selectedTransaction.balanceAfter)}</span>
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-muted)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Date</p>
                  <p className="font-medium text-xs" style={{ color: "var(--text-primary)" }}>{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-muted)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Reference</p>
                  <p className="font-mono text-[11px] break-all" style={{ color: "var(--text-primary)" }}>{selectedTransaction.reference || selectedTransaction._id}</p>
                </div>
                {selectedTransaction.approvedBy && (
                  <div className="rounded-lg p-3 col-span-2" style={{ backgroundColor: "var(--bg-muted)" }}>
                    <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>Processed By</p>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{getUserDisplayName(selectedTransaction.approvedBy)}</p>
                  </div>
                )}
              </div>

              <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-muted)" }}>
                <p className="text-xs mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>Description</p>
                <p className="text-sm break-words" style={{ color: "var(--text-primary)" }}>{selectedTransaction.description || "No description provided"}</p>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="outline" onClick={() => { setDetailModalOpen(false); setSelectedTransaction(null); }}>
                  <FaTimes className="mr-2" /> Close
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
