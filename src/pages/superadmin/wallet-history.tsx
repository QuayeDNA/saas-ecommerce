import { useState, useEffect, useCallback } from "react";
import { FaHistory, FaEye, FaTimes, FaSync } from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";
import {
  Button,
  Badge,
  Card,
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

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Admin wallet credits and debits.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchTransactions(pagination.page)}>
          <FaSync className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search, type filter, date range */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        searchPlaceholder="Search by user ID or name..."
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

      {/* Results summary */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {pagination.total > 0
            ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} transactions`
            : "No transactions found"}
        </p>
      )}

      {/* Transactions table */}
      <Card noPadding>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size="lg" color="primary" />
            <p className="text-sm text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
            <FaHistory className="text-4xl" />
            <p className="font-medium text-gray-600">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell className="hidden sm:table-cell">Type</TableHeaderCell>
                  <TableHeaderCell className="hidden md:table-cell">Status</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell className="hidden lg:table-cell">Description</TableHeaderCell>
                  <TableHeaderCell className="hidden xl:table-cell">Admin</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn._id}>
                    <TableCell className="whitespace-nowrap text-xs text-gray-500">
                      {formatDate(txn.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm text-gray-900">{getUserDisplayName(txn.user)}</div>
                      <div className="text-xs text-gray-400">{getUserIdentifier(txn.user)}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge colorScheme={txnTypeBadgeColor(txn.type)}>
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge colorScheme={txnStatusBadgeColor(txn.status)}>
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-semibold text-sm">
                      <span className={txn.type === "credit" ? "text-green-600" : "text-red-600"}>
                        {txn.type === "credit" ? "+" : "-"}GH&#8373;{txn.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-600 max-w-[200px] truncate">
                      {txn.description}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-xs text-gray-500">
                      {getUserDisplayName(txn.approvedBy)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => { setSelectedTransaction(txn); setDetailModalOpen(true); }}
                        className="p-1.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
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
                void fetchTransactions(p);
              }}
              onItemsPerPageChange={(n) => {
                setPagination((prev) => ({ ...prev, limit: n, page: 1 }));
              }}
            />
          </div>
        )}
      </Card>

      {/* Transaction detail modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedTransaction(null); }}
        title="Transaction Details"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            {/* Summary row */}
            <div className={`rounded-lg p-3 flex items-center gap-3 ${selectedTransaction.type === "credit" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{getUserDisplayName(selectedTransaction.user)}</p>
                <p className="text-xs text-gray-500">{getUserIdentifier(selectedTransaction.user)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-base ${selectedTransaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {selectedTransaction.type === "credit" ? "+" : "-"}GH&#8373;{selectedTransaction.amount.toFixed(2)}
                </p>
                <div className="flex gap-1 justify-end mt-1">
                  <Badge colorScheme={txnTypeBadgeColor(selectedTransaction.type)} size="xs">{selectedTransaction.type}</Badge>
                  <Badge colorScheme={txnStatusBadgeColor(selectedTransaction.status)} size="xs">{selectedTransaction.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedTransaction.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Transaction ID</p>
                <p className="font-mono text-xs text-gray-900 break-all">{selectedTransaction._id}</p>
              </div>
              {selectedTransaction.approvedBy && (
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Processed By</p>
                  <p className="font-medium text-gray-900">{getUserDisplayName(selectedTransaction.approvedBy)}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{selectedTransaction.description || "No description"}</p>
            </div>

            <div className="flex justify-end pt-1">
              <Button onClick={() => { setDetailModalOpen(false); setSelectedTransaction(null); }}>
                <FaTimes className="mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

