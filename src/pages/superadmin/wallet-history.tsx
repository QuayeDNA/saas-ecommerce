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
  const [searchTerm, setSearchTerm] = useState(""); // userId search
  const [typeFilter, setTypeFilter] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // Detail modal
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <FaHistory className="text-xl sm:text-2xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Transaction History</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                All admin wallet credits and debits across the platform
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto border-white/40 text-white hover:bg-white/10"
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
              <div key={i} className="bg-white/15 rounded-lg px-3 py-2.5">
                <Skeleton height="0.625rem" width="60%" className="mb-1 opacity-50" />
                <Skeleton height="1.25rem" width="80%" className="mb-1 opacity-60" />
                <Skeleton height="0.625rem" width="50%" className="opacity-40" />
              </div>
            ))
          ) : (
            <>
              <div className="bg-white/15 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <FaUsers className="text-white/60 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Total</p>
                  <p className="text-white font-bold text-sm sm:text-base">{pagination.total}</p>
                  <p className="text-slate-300/80 text-[10px]">transactions</p>
                </div>
              </div>
              <div className="bg-green-500/30 border border-green-400/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <FaArrowUp className="text-green-300 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Credits</p>
                  <p className="text-white font-bold text-sm sm:text-base">{fmt(summary.totalCredits)}</p>
                  <p className="text-slate-300/80 text-[10px]">{summary.creditCount} transactions</p>
                </div>
              </div>
              <div className="bg-red-500/30 border border-red-400/30 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <FaArrowDown className="text-red-300 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Debits</p>
                  <p className="text-white font-bold text-sm sm:text-base">{fmt(summary.totalDebits)}</p>
                  <p className="text-slate-300/80 text-[10px]">{summary.debitCount} transactions</p>
                </div>
              </div>
              <div className={`rounded-lg px-3 py-2.5 flex items-center gap-2 ${summary.totalCredits - summary.totalDebits >= 0 ? "bg-green-500/20 border border-green-400/20" : "bg-red-500/20 border border-red-400/20"}`}>
                <FaExchangeAlt className="text-white/60 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Net (page)</p>
                  <p className={`font-bold text-sm sm:text-base ${summary.totalCredits - summary.totalDebits >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {summary.totalCredits - summary.totalDebits >= 0 ? "+" : ""}{fmt(summary.totalCredits - summary.totalDebits)}
                  </p>
                  <p className="text-slate-300/80 text-[10px]">this page</p>
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
          <p className="text-xs text-gray-500">
            {pagination.total > 0
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} transactions`
              : "No transactions found"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
              <div key={i} className="p-3 border border-gray-100 rounded-xl">
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
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <FaHistory className="text-2xl" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-600">No transactions found</p>
              <p className="text-sm mt-0.5">
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
            <div className="sm:hidden divide-y divide-gray-100">
              {transactions.map((txn) => {
                const isCredit = txn.type === "credit";
                const balanceBefore = isCredit
                  ? txn.balanceAfter - txn.amount
                  : txn.balanceAfter + txn.amount;
                return (
                  <div
                    key={txn._id}
                    className={`p-3 hover:bg-gray-50/70 transition-colors border-l-4 ${isCredit ? "border-l-green-400" : "border-l-red-400"}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCredit ? "bg-green-100" : "bg-red-100"}`}>
                        {isCredit
                          ? <FaArrowUp className="text-green-600 text-xs" />
                          : <FaArrowDown className="text-red-600 text-xs" />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1 mb-0.5">
                          <Badge colorScheme={txnTypeBadgeColor(txn.type)} size="xs">{txn.type}</Badge>
                          <Badge colorScheme={txnStatusBadgeColor(txn.status)} size="xs">{txn.status}</Badge>
                        </div>
                        <p className="font-semibold text-sm text-gray-900 truncate">{getUserDisplayName(txn.user)}</p>
                        {getUserIdentifier(txn.user) && (
                          <p className="text-xs text-blue-600 font-mono truncate">{getUserIdentifier(txn.user)}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{txn.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(txn.createdAt)}</p>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <p className={`font-bold text-base leading-tight ${isCredit ? "text-green-600" : "text-red-600"}`}>
                          {isCredit ? "+" : "−"}{fmt(txn.amount)}
                        </p>
                        <button
                          onClick={() => { setSelectedTransaction(txn); setDetailModalOpen(true); }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View details"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Balance timeline */}
                    <div className="mt-2 ml-12 flex items-center gap-1.5 text-xs flex-wrap">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 uppercase tracking-wide text-[9px] leading-none mb-0.5">Before</span>
                        <span className="font-mono font-medium text-gray-600 bg-gray-100 rounded px-1.5 py-0.5 whitespace-nowrap text-[10px]">
                          {fmt(balanceBefore)}
                        </span>
                      </div>
                      <span className={`font-semibold whitespace-nowrap text-[10px] ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "＋" : "－"}{fmt(txn.amount)} →
                      </span>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 uppercase tracking-wide text-[9px] leading-none mb-0.5">After</span>
                        <span className="font-mono font-semibold text-gray-800 bg-white border border-gray-200 rounded px-1.5 py-0.5 whitespace-nowrap text-[10px] shadow-sm">
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
                      <TableRow key={txn._id} className={`hover:bg-gray-50/70 transition-colors border-l-2 ${isCredit ? "border-l-green-400" : "border-l-red-400"}`}>
                        <TableCell className="whitespace-nowrap text-xs text-gray-500">
                          {formatDate(txn.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${isCredit ? "bg-green-500" : "bg-red-500"}`}>
                              {getUserDisplayName(txn.user).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-gray-900 truncate max-w-[140px]">{getUserDisplayName(txn.user)}</div>
                              <div className="text-xs text-gray-400 font-mono truncate">{getUserIdentifier(txn.user)}</div>
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
                          <span className={`font-bold text-sm ${isCredit ? "text-green-600" : "text-red-600"}`}>
                            {isCredit ? "+" : "−"}{fmt(txn.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs flex-wrap">
                            <span className="font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">{fmt(balanceBefore)}</span>
                            <span className={`font-semibold text-[10px] ${isCredit ? "text-green-600" : "text-red-600"}`}>→</span>
                            <span className="font-mono font-semibold text-gray-800 bg-white border border-gray-200 px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm">{fmt(txn.balanceAfter)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                          {txn.description}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-gray-500">
                          {txn.approvedBy ? getUserDisplayName(txn.approvedBy) : "—"}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => { setSelectedTransaction(txn); setDetailModalOpen(true); }}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
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
          <div className="border-t px-4 py-3">
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
              <div className={`rounded-xl p-4 flex items-center gap-4 ${isCredit ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 ${isCredit ? "bg-green-500" : "bg-red-500"}`}>
                  {isCredit ? <FaArrowUp className="text-lg" /> : <FaArrowDown className="text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{getUserDisplayName(selectedTransaction.user)}</p>
                  <p className="text-xs text-gray-500 font-mono">{getUserIdentifier(selectedTransaction.user)}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge colorScheme={txnTypeBadgeColor(selectedTransaction.type)} size="xs">{selectedTransaction.type}</Badge>
                    <Badge colorScheme={txnStatusBadgeColor(selectedTransaction.status)} size="xs">{selectedTransaction.status}</Badge>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-xl leading-tight ${isCredit ? "text-green-600" : "text-red-600"}`}>
                    {isCredit ? "+" : "−"}{fmt(selectedTransaction.amount)}
                  </p>
                </div>
              </div>

              {/* Balance timeline */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Balance Change</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Before</span>
                    <span className="font-mono font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm">{fmt(balanceBefore)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-transparent mb-1">_</span>
                    <span className={`font-semibold text-sm ${isCredit ? "text-green-600" : "text-red-600"}`}>
                      {isCredit ? "＋" : "－"}{fmt(selectedTransaction.amount)} →
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">After</span>
                    <span className="font-mono font-bold text-gray-900 bg-white border-2 border-gray-300 rounded-lg px-3 py-1.5 text-sm shadow-sm">{fmt(selectedTransaction.balanceAfter)}</span>
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Date</p>
                  <p className="font-medium text-gray-900 text-xs">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-0.5">Reference</p>
                  <p className="font-mono text-[11px] text-gray-900 break-all">{selectedTransaction.reference || selectedTransaction._id}</p>
                </div>
                {selectedTransaction.approvedBy && (
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Processed By</p>
                    <p className="font-medium text-gray-900">{getUserDisplayName(selectedTransaction.approvedBy)}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 font-medium">Description</p>
                <p className="text-sm text-gray-700 break-words">{selectedTransaction.description || "No description provided"}</p>
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
