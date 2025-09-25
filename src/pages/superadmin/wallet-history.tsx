/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaFilter,
  FaDownload,
  FaHistory,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { Modal } from "../../design-system/components/modal";
import { Select } from "../../design-system/components/select";
import { colors } from "../../design-system/tokens";
import type { WalletTransaction } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";
import { Card, CardHeader } from "@/design-system";

interface AdminTransactionFilters {
  type: string;
  startDate: string;
  endDate: string;
  userId: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function WalletHistoryPage() {
  const [adminTransactions, setAdminTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [adminTransactionsLoading, setAdminTransactionsLoading] =
    useState(false);
  const [adminTransactionsPagination, setAdminTransactionsPagination] =
    useState<PaginationInfo>({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
  const [adminTransactionFilters, setAdminTransactionFilters] =
    useState<AdminTransactionFilters>({
      type: "",
      startDate: "",
      endDate: "",
      userId: "",
    });
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  const { addToast } = useToast();

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
    fetchAdminTransactions();
  }, [fetchAdminTransactions]);

  const handleFilterChange = (
    key: keyof AdminTransactionFilters,
    value: string
  ) => {
    setAdminTransactionFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setAdminTransactionFilters({
      type: "",
      startDate: "",
      endDate: "",
      userId: "",
    });
  };

  const handlePageChange = (page: number) => {
    fetchAdminTransactions(page);
  };

  const handleViewFullDescription = (transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setDescriptionModalOpen(true);
  };

  const handleCloseDescriptionModal = () => {
    setDescriptionModalOpen(false);
    setSelectedTransaction(null);
  };

  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toFixed(2)}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "credit":
        return "bg-green-100 text-green-800";
      case "debit":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserDisplayName = (user: any) => {
    if (typeof user === "string") return user;
    if (user && typeof user === "object") {
      return user.fullName || user.email || "Unknown User";
    }
    return "Unknown User";
  };

  const getUserIdentifier = (user: any) => {
    if (typeof user === "string") return user;
    if (user && typeof user === "object") {
      return user.agentCode || user._id || "No ID";
    }
    return "No ID";
  };

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
              Transaction History
            </h1>
            <p className="text-gray-600">
              View all wallet transactions performed by admins
            </p>
          </CardHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchAdminTransactions()}>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Select
              label="Transaction Type"
              value={adminTransactionFilters.type}
              onChange={(value) => handleFilterChange("type", value)}
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
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>
          <div>
            <Input
              label="End Date"
              type="date"
              value={adminTransactionFilters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
          <div>
            <Input
              label="User ID"
              value={adminTransactionFilters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              placeholder="Search by user ID"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={() => fetchAdminTransactions(1)}>
              <FaSearch className="mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              <FaFilter className="mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Admin Transactions
            </h3>
            <div className="text-sm text-gray-600">
              Showing {adminTransactions.length} of{" "}
              {adminTransactionsPagination.total} transactions
            </div>
          </div>
        </div>

        {adminTransactionsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading transactions...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
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
                        <div className="text-sm font-medium text-gray-900">
                          {getUserDisplayName(transaction.user)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getUserIdentifier(transaction.user)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={
                            transaction.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="flex items-center space-x-2">
                          <span className="truncate flex-1">
                            {transaction.description}
                          </span>
                          <button
                            onClick={() =>
                              handleViewFullDescription(transaction)
                            }
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View full description"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getUserDisplayName(transaction.approvedBy)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {adminTransactionsPagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {adminTransactionsPagination.page} of{" "}
                    {adminTransactionsPagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={adminTransactionsPagination.page === 1}
                      onClick={() =>
                        handlePageChange(adminTransactionsPagination.page - 1)
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
                        handlePageChange(adminTransactionsPagination.page + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!adminTransactionsLoading && adminTransactions.length === 0 && (
          <div className="text-center py-12">
            <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No transactions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No admin transactions match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Description Modal */}
      <div className="max-h-[90vh] overflow-hidden">
        <Modal
          isOpen={descriptionModalOpen}
          onClose={handleCloseDescriptionModal}
          title="Transaction Details"
        >
          {selectedTransaction && (
            <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
              {/* Transaction Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Transaction Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getTransactionTypeColor(
                        selectedTransaction.type
                      )}`}
                    >
                      {selectedTransaction.type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p
                      className={`font-medium ml-2 ${
                        selectedTransaction.type === "credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedTransaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Transaction ID:
                    </span>
                    <p className="text-gray-900 font-mono text-xs">
                      {selectedTransaction._id}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  User Information
                </h4>
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">
                      {getUserDisplayName(selectedTransaction.user)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Agent Code:
                    </span>
                    <p className="text-gray-900 font-mono text-xs">
                      {getUserIdentifier(selectedTransaction.user)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              {selectedTransaction.approvedBy && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Processed By
                  </h4>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Admin:</span>
                    <p className="text-gray-900">
                      {getUserDisplayName(selectedTransaction.approvedBy)}
                    </p>
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Full Description
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                  {selectedTransaction.description}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t sticky bottom-0 bg-white">
                <Button onClick={handleCloseDescriptionModal}>
                  <FaTimes className="mr-2" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
