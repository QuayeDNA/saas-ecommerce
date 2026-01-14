import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaCoins,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaClock,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { Alert, Button, Pagination } from "../../design-system";
import { SearchAndFilter } from "../../components/common/SearchAndFilter";
import {
  commissionService,
  type CommissionRecord,
  type CurrentMonthStatistics,
  type CommissionSettings,
} from "../../services/commission.service";
import { websocketService } from "../../services/websocket.service";

export default function SuperAdminCommissions() {
  // State
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [currentMonthStats, setCurrentMonthStats] =
    useState<CurrentMonthStatistics | null>(null);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agentSearch, setAgentSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("current"); // "current" or "finalized"

  // Debounce timer ref
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input (wait 500ms after user stops typing)
  useEffect(() => {
    // Clear previous timer
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }

    // Set new timer
    searchDebounceTimer.current = setTimeout(() => {
      setDebouncedSearch(agentSearch);
    }, 500); // 500ms delay

    // Cleanup on unmount or when agentSearch changes
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [agentSearch]);

  // Server-side Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{
    type: "single" | "multiple";
    id?: string;
  }>({
    type: "multiple",
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [commissionSettings, setCommissionSettings] =
    useState<CommissionSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    agentCommission: 0,
    superAgentCommission: 0,
    dealerCommission: 0,
    superDealerCommission: 0,
    defaultCommissionRate: 0,
  });

  // Fetch data with server-side pagination and filters
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build filters object
      const filters: Record<string, string> = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (periodFilter !== "all") filters.period = periodFilter;
      if (monthFilter !== "all") filters.month = monthFilter;
      if (recordTypeFilter !== "all")
        filters.isFinal = recordTypeFilter === "finalized" ? "true" : "false";
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      // Fetch commissions with pagination
      const commissionsResponse = await commissionService.getAllCommissions(
        filters,
        currentPage,
        itemsPerPage
      );

      // Fetch current month stats (only for current month records)
      const statsData =
        recordTypeFilter === "current"
          ? await commissionService.getCurrentMonthStatistics()
          : null;

      setCommissions(commissionsResponse.data);
      setTotalPages(commissionsResponse.pagination.pages);
      setTotalItems(commissionsResponse.pagination.total);
      setCurrentMonthStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [
    statusFilter,
    periodFilter,
    monthFilter,
    recordTypeFilter,
    debouncedSearch,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 when filters change (including debounced search)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    periodFilter,
    monthFilter,
    recordTypeFilter,
    debouncedSearch,
  ]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    const handleCommissionUpdate = () => {
      // Refresh data when commission is updated
      fetchData();
    };

    const handleCommissionFinalized = (data: unknown) => {
      // Refresh data when commission is finalized
      fetchData();
      // Show notification if month data is available
      const monthData = data as { month?: string };
      if (monthData.month) {
        setSuccess(`Commission finalized for ${monthData.month}`);
        setTimeout(() => setSuccess(null), 5000);
      }
    };

    // Add WebSocket listeners
    websocketService.on("commission_updated", handleCommissionUpdate);
    websocketService.on("commission_finalized", handleCommissionFinalized);

    // Cleanup listeners on unmount
    return () => {
      websocketService.off("commission_updated", handleCommissionUpdate);
      websocketService.off("commission_finalized", handleCommissionFinalized);
    };
  }, [fetchData]);

  // Load commission settings
  const loadCommissionSettings = async () => {
    try {
      const settings = await commissionService.getCommissionSettings();
      setCommissionSettings(settings);
      setSettingsForm({
        agentCommission: settings.agentCommission,
        superAgentCommission: settings.superAgentCommission,
        dealerCommission: settings.dealerCommission,
        superDealerCommission: settings.superDealerCommission,
        defaultCommissionRate: settings.defaultCommissionRate,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load commission settings"
      );
    }
  };

  // All commissions from server - no client-side filtering needed
  const displayedCommissions = commissions;

  // Generate month filter options (last 12 months)
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      months.push({ value, label });
    }

    return months;
  };

  const monthOptions = generateMonthOptions();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedCommissions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCommissions.length === displayedCommissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(displayedCommissions.map((c) => c._id));
    }
  };

  // Pay commission(s)
  const handlePay = async (id?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (id) {
        await commissionService.payCommission(id);
        setSuccess("Commission paid successfully!");
      } else if (selectedCommissions.length > 0) {
        await commissionService.payMultipleCommissions({
          commissionIds: selectedCommissions,
        });
        setSuccess(`${selectedCommissions.length} commission(s) paid!`);
        setSelectedCommissions([]);
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pay");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  // Reject commission(s)
  const handleReject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (rejectTarget.type === "single" && rejectTarget.id) {
        await commissionService.rejectCommission(rejectTarget.id, {
          rejectionReason,
        });
        setSuccess("Commission rejected!");
      } else if (selectedCommissions.length > 0) {
        await commissionService.rejectMultipleCommissions({
          commissionIds: selectedCommissions,
          rejectionReason,
        });
        setSuccess(`${selectedCommissions.length} commission(s) rejected!`);
        setSelectedCommissions([]);
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
      setRejectionReason("");
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  // Update commission settings
  const handleUpdateSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate rates are between 0 and 100
      const rates = Object.entries(settingsForm);
      for (const [key, value] of rates) {
        if (value < 0 || value > 100) {
          setError(
            `${key.replace(/([A-Z])/g, " $1").trim()} must be between 0 and 100`
          );
          setIsLoading(false);
          return;
        }
      }

      await commissionService.updateCommissionSettings(settingsForm);
      setSuccess("Commission settings updated successfully!");
      setShowSettingsModal(false);
      await loadCommissionSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update settings"
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Commission Management
        </h1>
        <p className="text-gray-600">Manage agent commissions and payments</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert status="error" title="Error" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert status="success" title="Success" className="mb-4">
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      {currentMonthStats && recordTypeFilter === "current" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <FaCoins className="text-green-600 text-base sm:text-lg md:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Current Month Earnings
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-green-600 truncate">
                  {formatCurrency(currentMonthStats.currentMonth.totalEarned)}
                </p>
                <p className="text-xs text-gray-500">Accumulating</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <FaCheckCircle className="text-blue-600 text-base sm:text-lg md:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Paid This Month
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-blue-600 truncate">
                  {formatCurrency(currentMonthStats.currentMonth.totalPaid)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                <FaClock className="text-yellow-600 text-base sm:text-lg md:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Pending Payment ({currentMonthStats.currentMonth.pendingCount}
                  )
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-yellow-600 truncate">
                  {formatCurrency(currentMonthStats.currentMonth.totalPending)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <FaUsers className="text-purple-600 text-base sm:text-lg md:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Active Agents
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-purple-600 truncate">
                  {currentMonthStats.currentMonth.agentCount}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finalized Records Info */}
      {recordTypeFilter === "finalized" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-800">
              Finalized Records
            </h3>
          </div>
          <p className="text-sm text-blue-700">
            Showing commissions from previous months that have been finalized.
            These records are ready for payment processing.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* Record Type Filter */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-300">
            <label className="text-sm text-gray-700 font-medium">View:</label>
            <select
              value={recordTypeFilter}
              onChange={(e) => setRecordTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current">Current Month (Accumulating)</option>
              <option value="finalized">Finalized Records</option>
            </select>
          </div>

          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-300">
            <input
              type="checkbox"
              id="select-all"
              checked={
                displayedCommissions.length > 0 &&
                selectedCommissions.length === displayedCommissions.length
              }
              onChange={toggleSelectAll}
              disabled={displayedCommissions.length === 0}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="select-all"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              Select All on Page ({displayedCommissions.length})
            </label>
          </div>

          <Button
            onClick={() => {
              loadCommissionSettings();
              setShowSettingsModal(true);
            }}
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-sm sm:text-base px-3 sm:px-4"
          >
            <FaCog className="text-sm sm:text-base" />
            <span className="hidden sm:inline">Commission Rates</span>
            <span className="sm:hidden">Rates</span>
          </Button>

          <Button
            onClick={fetchData}
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-sm sm:text-base px-3 sm:px-4"
          >
            <FaSync
              className={`text-sm sm:text-base ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {selectedCommissions.length > 0 &&
            recordTypeFilter === "finalized" && (
              <>
                <Button
                  onClick={() => handlePay()}
                  disabled={isLoading}
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-sm sm:text-base px-3 sm:px-4"
                >
                  <FaCheckCircle className="text-sm sm:text-base" />
                  Pay ({selectedCommissions.length})
                </Button>

                <Button
                  onClick={() => {
                    setRejectTarget({ type: "multiple" });
                    setShowRejectModal(true);
                  }}
                  disabled={isLoading}
                  size="sm"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-sm sm:text-base px-3 sm:px-4"
                >
                  <FaTimesCircle className="text-sm sm:text-base" />
                  Reject ({selectedCommissions.length})
                </Button>
              </>
            )}
        </div>
      </div>

      {/* Filters */}
      <SearchAndFilter
        searchTerm={agentSearch}
        onSearchChange={setAgentSearch}
        searchPlaceholder="Search by agent name, email, business, or code..."
        filters={{
          status: {
            value: statusFilter,
            options: [
              { value: "pending", label: "Pending" },
              { value: "paid", label: "Paid" },
              { value: "rejected", label: "Rejected" },
              { value: "cancelled", label: "Cancelled" },
            ],
            label: "Status",
            placeholder: "All Statuses",
          },
          period: {
            value: periodFilter,
            options: [
              { value: "monthly", label: "Monthly" },
              { value: "weekly", label: "Weekly" },
              { value: "daily", label: "Daily" },
            ],
            label: "Period",
            placeholder: "All Periods",
          },
          month: {
            value: monthFilter,
            options: monthOptions,
            label: "Month",
            placeholder: "All Months",
          },
        }}
        onFilterChange={(filterKey, value) => {
          if (filterKey === "status") setStatusFilter(value);
          if (filterKey === "period") setPeriodFilter(value);
          if (filterKey === "month") setMonthFilter(value);
        }}
        onSearch={(e) => {
          e.preventDefault();
          fetchData();
        }}
        onClearFilters={() => {
          setAgentSearch("");
          setStatusFilter("all");
          setPeriodFilter("all");
          setMonthFilter("all");
        }}
        isLoading={isLoading}
        className="mb-6"
      />

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {displayedCommissions.length} of {totalItems} commissions
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      displayedCommissions.length > 0 &&
                      selectedCommissions.length === displayedCommissions.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orders / Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rate / Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status {recordTypeFilter === "finalized" && "/ Finalized"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FaSync className="animate-spin inline-block text-blue-600 text-2xl mb-2" />
                    <p className="text-gray-600">Loading...</p>
                  </td>
                </tr>
              ) : displayedCommissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <FaCoins className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No commissions found</p>
                  </td>
                </tr>
              ) : (
                displayedCommissions.map((commission) => (
                  <tr key={commission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.includes(commission._id)}
                        onChange={() => toggleSelection(commission._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {commission.agentId.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {commission.agentId.email}
                        </p>
                        {commission.agentId.businessName && (
                          <p className="text-xs text-gray-400">
                            {commission.agentId.businessName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {commission.period}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(commission.periodStart)} -{" "}
                          {formatDate(commission.periodEnd)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {commission.totalOrders} orders
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(commission.totalRevenue)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(commission.amount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {commission.formattedRate} rate
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          commission.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : commission.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : commission.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {commission.status}
                      </span>
                      {recordTypeFilter === "finalized" &&
                        commission.finalizedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Finalized:{" "}
                            {new Date(
                              commission.finalizedAt
                            ).toLocaleDateString("en-GB")}
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {recordTypeFilter === "finalized" &&
                          commission.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handlePay(commission._id)}
                                disabled={isLoading}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Pay
                              </Button>
                              <Button
                                onClick={() => {
                                  setRejectTarget({
                                    type: "single",
                                    id: commission._id,
                                  });
                                  setShowRejectModal(true);
                                }}
                                disabled={isLoading}
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        {recordTypeFilter === "current" && (
                          <span className="text-xs text-gray-500 italic">
                            Accumulating...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>

      {/* Card View - Mobile */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaSync className="animate-spin inline-block text-blue-600 text-2xl mb-2" />
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : displayedCommissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaCoins className="text-4xl mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No commissions found</p>
          </div>
        ) : (
          displayedCommissions.map((commission) => (
            <div
              key={commission._id}
              className="bg-white rounded-lg shadow p-4 space-y-3"
            >
              {/* Header with checkbox and status */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedCommissions.includes(commission._id)}
                    onChange={() => toggleSelection(commission._id)}
                    className="rounded border-gray-300 mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {commission.agentId.fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {commission.agentId.email}
                    </p>
                    {commission.agentId.businessName && (
                      <p className="text-xs text-gray-400 truncate">
                        {commission.agentId.businessName}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    commission.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : commission.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : commission.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {commission.status}
                </span>
                {recordTypeFilter === "finalized" && commission.finalizedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Finalized:{" "}
                    {new Date(commission.finalizedAt).toLocaleDateString(
                      "en-GB"
                    )}
                  </div>
                )}
              </div>

              {/* Commission Details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Period</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {commission.period}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(commission.periodStart)} -{" "}
                    {formatDate(commission.periodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Commission</p>
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(commission.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {commission.formattedRate} rate
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Orders</p>
                  <p className="text-sm font-medium text-gray-900">
                    {commission.totalOrders} orders
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Revenue</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(commission.totalRevenue)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {recordTypeFilter === "finalized" &&
                commission.status === "pending" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => handlePay(commission._id)}
                      disabled={isLoading}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-2"
                    >
                      <FaCheckCircle className="mr-1" />
                      Pay
                    </Button>
                    <Button
                      onClick={() => {
                        setRejectTarget({
                          type: "single",
                          id: commission._id,
                        });
                        setShowRejectModal(true);
                      }}
                      disabled={isLoading}
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-2"
                    >
                      <FaTimesCircle className="mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              {recordTypeFilter === "current" && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 italic text-center">
                    Commission accumulating in real-time
                  </p>
                </div>
              )}
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Reject Commission{rejectTarget.type === "multiple" ? "s" : ""}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {rejectTarget.type === "single"
                ? "Provide a reason for rejecting this commission:"
                : `Provide a reason for rejecting ${selectedCommissions.length} commission(s):`}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCog className="text-purple-600" />
              Commission Rate Settings
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Set commission rates for all business user types. Rates are
              expressed as percentages (0-100).
            </p>

            <div className="space-y-4 mb-6">
              {/* Agent Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settingsForm.agentCommission}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      agentCommission: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 5.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Commission rate for regular agents
                </p>
              </div>

              {/* Super Agent Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Super Agent Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settingsForm.superAgentCommission}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      superAgentCommission: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 7.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Commission rate for super agents
                </p>
              </div>

              {/* Dealer Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dealer Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settingsForm.dealerCommission}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      dealerCommission: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 10.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Commission rate for dealers
                </p>
              </div>

              {/* Super Dealer Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Super Dealer Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settingsForm.superDealerCommission}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      superDealerCommission: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 12.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Commission rate for super dealers
                </p>
              </div>

              {/* Default Commission Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settingsForm.defaultCommissionRate}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      defaultCommissionRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 3.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fallback commission rate for users without a specific rate
                </p>
              </div>
            </div>

            {/* Current Settings Display */}
            {commissionSettings && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Current Settings
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Agent</p>
                    <p className="font-semibold text-gray-900">
                      {commissionSettings.agentCommission}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Super Agent</p>
                    <p className="font-semibold text-gray-900">
                      {commissionSettings.superAgentCommission}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dealer</p>
                    <p className="font-semibold text-gray-900">
                      {commissionSettings.dealerCommission}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Super Dealer</p>
                    <p className="font-semibold text-gray-900">
                      {commissionSettings.superDealerCommission}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Default</p>
                    <p className="font-semibold text-gray-900">
                      {commissionSettings.defaultCommissionRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowSettingsModal(false);
                  if (commissionSettings) {
                    setSettingsForm({
                      agentCommission: commissionSettings.agentCommission,
                      superAgentCommission:
                        commissionSettings.superAgentCommission,
                      dealerCommission: commissionSettings.dealerCommission,
                      superDealerCommission:
                        commissionSettings.superDealerCommission,
                      defaultCommissionRate:
                        commissionSettings.defaultCommissionRate,
                    });
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSettings}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Updating..." : "Update Settings"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
