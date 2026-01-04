// src/components/orders/UnifiedOrderList.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrder } from "../../hooks/use-order";
import { useAuth } from "../../hooks/use-auth";
import { providerService } from "../../services/provider.service";
import { analyticsService } from "../../services/analytics.service";
import { apiClient } from "../../utils/api-client";
import { apiClient } from "../../utils/api-client";
import {
  Button,
  Card,
  CardBody,
  Pagination,
  Badge,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  useToast,
} from "../../design-system";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaChartBar,
  FaSync,
  FaExclamationTriangle,
  FaCheckSquare,
  FaTrash,
} from "react-icons/fa";
import type { Order, OrderFilters } from "../../types/order";
import type { Provider } from "../../types/package";
import { UnifiedOrderCard } from "./UnifiedOrderCard";
import { UnifiedOrderTable } from "./UnifiedOrderTable";
import { UnifiedOrderExcel } from "./UnifiedOrderExcel";
import { OrderAnalytics } from "./OrderAnalytics";
import { SearchAndFilter } from "../common/SearchAndFilter";
import { DraftOrdersHandler } from "./DraftOrdersHandler";
import { SmartSelectDialog } from "./SmartSelectDialog";

interface UnifiedOrderListProps {
  isAdmin: boolean;
  isAgent?: boolean;
  userType?: string;
}

export const UnifiedOrderList: React.FC<UnifiedOrderListProps> = ({
  isAdmin,
  isAgent,
  userType,
}) => {
  const { authState } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    // Reported orders
    reportedOrders,
    reportedLoading,
    reportedError,
    reportedPagination,
    fetchOrders,
    fetchReportedOrders,
    updateOrderStatus,
    updateReceptionStatus,
    cancelOrder,
    setFilters,
    bulkProcessOrders,
    bulkUpdateReceptionStatus,
  } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [receptionStatusFilter, setReceptionStatusFilter] =
    useState<string>("");
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table" | "excel">(
    "cards"
  );
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<
    "cancel" | "process" | "complete" | null
  >(null);
  const [showReceptionStatusDialog, setShowReceptionStatusDialog] =
    useState(false);
  const [pendingReceptionStatus, setPendingReceptionStatus] = useState<
    string | null
  >(null);

  // Tab state for filtering orders
  const [activeTab, setActiveTab] = useState<"all" | "reported">("all");

  // Draft orders handler state
  const [showDraftHandler, setShowDraftHandler] = useState(false);

  // Smart select dialog state
  const [showSmartSelectDialog, setShowSmartSelectDialog] = useState(false);

  // Analytics state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Provider data
  const [providers, setProviders] = useState<Provider[]>([]);

  // Test user cleanup state
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const TEST_USER_ID = "689bae9e81b90ad7c5ad66d4";
  const isTestUser =
    authState.user?._id === TEST_USER_ID || authState.user?.id === TEST_USER_ID;

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Handle search parameter from URL (e.g., when navigating from user details)
  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
      // Clear the search param from URL after setting it
      setSearchParams({}, { replace: true });
      addToast(`Searching for order: ${searchFromUrl}`, "info");
    }
  }, [searchParams, setSearchParams, addToast]);

  // Helper variables to use the correct data based on active tab
  const currentOrders = activeTab === "reported" ? reportedOrders : orders;
  const currentLoading = activeTab === "reported" ? reportedLoading : loading;
  const currentError = activeTab === "reported" ? reportedError : error;
  const currentPagination =
    activeTab === "reported" ? reportedPagination : pagination;

  // Fetch providers for super admin filter
  const fetchProviders = useCallback(async () => {
    try {
      const response = await providerService.getProviders({ isActive: true });
      setProviders(response.providers);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    }
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!isAdmin && !isAgent) return;

    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      if (isAdmin) {
        // For super admin, use the dedicated analytics service
        const analytics = await analyticsService.getSuperAdminAnalytics("30d");

        const transformedData = {
          totalOrders: analytics.orders.total || 0,
          todayOrders: analytics.orders.today?.total || 0,
          thisMonthOrders: analytics.orders.thisMonth?.total || 0,
          totalRevenue: analytics.revenue.total || 0,
          todayRevenue: analytics.revenue.today || 0,
          monthlyRevenue: analytics.revenue.thisMonth || 0,
          todayCompletedOrders: analytics.orders.today?.completed || 0,
          todayProcessingOrders: analytics.orders.today?.processing || 0,
          todayPendingOrders: analytics.orders.today?.pending || 0,
          todayCancelledOrders: analytics.orders.today?.cancelled || 0,
          commission: {
            totalPaid: analytics.commissions?.totalPaid || 0,
            pendingAmount: analytics.commissions?.pendingAmount || 0,
            pendingCount: analytics.commissions?.pendingCount || 0,
          },
          statusCounts: {
            processing: analytics.orders.processing || 0,
            pending: analytics.orders.pending || 0,
            cancelled: analytics.orders.cancelled || 0,
          },
          receptionCounts: {
            received: analytics.orders.completed || 0,
            not_received: analytics.orders.failed || 0,
            checking: analytics.orders.processing || 0,
            resolved: analytics.orders.completed || 0,
          },
        };

        setAnalyticsData(transformedData);
      } else if (isAgent) {
        // For agents, use the agent analytics service
        const analytics = await analyticsService.getAgentAnalytics("30d");

        // Transform to match our component's expected structure
        const transformedData = {
          orders: {
            total: analytics.orders.total || 0,
            completed: analytics.orders.completed || 0,
            processing: analytics.orders.processing || 0,
            pending: analytics.orders.pending || 0,
            cancelled: analytics.orders.cancelled || 0,
            today: {
              completed: analytics.orders.todayCounts?.completed || 0,
              processing: analytics.orders.todayCounts?.processing || 0,
              pending: analytics.orders.todayCounts?.pending || 0,
              cancelled: analytics.orders.todayCounts?.cancelled || 0,
            },
          },
          revenue: {
            total: analytics.revenue.total || 0,
            thisMonth: analytics.revenue.thisMonth || 0,
            today: analytics.revenue.today || 0,
          },
        };

        setAnalyticsData(transformedData);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalyticsError("Failed to load analytics data");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [isAdmin, isAgent]);

  useEffect(() => {
    fetchOrders();
    // Fetch providers for filter
    if (isAdmin) {
      fetchProviders();
    }
    // Fetch analytics for admin and agents
    if (isAdmin || isAgent) {
      fetchAnalytics();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOrders, isAdmin, fetchProviders, isAgent, fetchAnalytics]);

  // Auto-search effect for instant filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "reported") {
        // For reported orders, use the reported orders endpoint
        const newFilters = {
          search: searchTerm,
          status: statusFilter || undefined,
          orderType: orderTypeFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
          receptionStatus: receptionStatusFilter || undefined,
          provider: providerFilter || undefined,
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
        };
        fetchReportedOrders(newFilters);
      } else {
        // For all orders, use the regular orders endpoint
        const newFilters: OrderFilters = {
          search: searchTerm,
          status: statusFilter || undefined,
          orderType: orderTypeFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
          provider: providerFilter || undefined,
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined,
        };
        setFilters(newFilters);
        fetchOrders(newFilters);
      }
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    statusFilter,
    orderTypeFilter,
    paymentStatusFilter,
    receptionStatusFilter,
    providerFilter,
    dateRange,
    activeTab, // Add activeTab to dependencies
    setFilters,
    fetchOrders,
    fetchReportedOrders,
  ]);
  // Auto-switch to cards view on mobile/tablet screens
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      if (!isDesktop && viewMode === "table") {
        setViewMode("cards");
      }
    };

    // Check on initial load
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Instant search is handled by useEffect, this just prevents form submission
  };

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setOrderTypeFilter("");
    setPaymentStatusFilter("");
    setReceptionStatusFilter("");
    setProviderFilter("");
    setDateRange({ startDate: "", endDate: "" });
    setFilters({});
    fetchOrders();
  }, [setFilters, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast("Order status updated successfully", "success");
    } catch {
      addToast("Failed to update order status", "error");
    }
  };

  const handleReceptionStatusUpdate = async (
    orderId: string,
    receptionStatus: string
  ) => {
    try {
      await updateReceptionStatus(orderId, receptionStatus);
      addToast("Reception status updated successfully", "success");
    } catch {
      addToast("Failed to update reception status", "error");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(orderId, "Cancelled by user");
        addToast("Order cancelled successfully", "success");
      } catch {
        addToast("Failed to cancel order", "error");
      }
    }
  };

  const handleBulkAction = (action: "cancel" | "process" | "complete") => {
    if (selectedOrders.length === 0) return;

    setPendingBulkAction(action);
    setShowBulkConfirmDialog(true);
  };

  const handleBulkReceptionStatus = (receptionStatus: string) => {
    if (selectedOrders.length === 0) return;

    setPendingReceptionStatus(receptionStatus);
    setShowReceptionStatusDialog(true);
  };

  const confirmBulkReceptionStatus = async () => {
    if (!pendingReceptionStatus || selectedOrders.length === 0) return;

    try {
      await bulkUpdateReceptionStatus(
        selectedOrders,
        pendingReceptionStatus as
          | "not_received"
          | "received"
          | "checking"
          | "resolved"
      );
      addToast(
        `Successfully updated reception status for ${selectedOrders.length} order(s)`,
        "success"
      );
      setSelectedOrders([]);
    } catch {
      addToast("Failed to update reception status", "error");
    } finally {
      setShowReceptionStatusDialog(false);
      setPendingReceptionStatus(null);
    }
  };

  const cancelReceptionStatusUpdate = () => {
    setShowReceptionStatusDialog(false);
    setPendingReceptionStatus(null);
  };

  const confirmBulkAction = async () => {
    if (!pendingBulkAction || selectedOrders.length === 0) return;

    try {
      if (pendingBulkAction === "cancel") {
        for (const orderId of selectedOrders) {
          await cancelOrder(orderId, "Bulk cancelled by admin");
        }
        addToast(
          `Successfully cancelled ${selectedOrders.length} orders`,
          "success"
        );
      } else {
        const bulkAction =
          pendingBulkAction === "process" ? "processing" : "completed";
        await bulkProcessOrders(selectedOrders, bulkAction);
        addToast(
          `Successfully ${bulkAction} ${selectedOrders.length} orders`,
          "success"
        );
      }
      setSelectedOrders([]);
    } catch {
      addToast(`Failed to perform bulk ${pendingBulkAction} action`, "error");
    } finally {
      setShowBulkConfirmDialog(false);
      setPendingBulkAction(null);
    }
  };

  const cancelBulkAction = () => {
    setShowBulkConfirmDialog(false);
    setPendingBulkAction(null);
  };

  const handleSelectAll = useCallback(() => {
    // Open smart select dialog instead of selecting all
    setShowSmartSelectDialog(true);
  }, []);

  const handleSelectByStatus = useCallback(
    (statuses: string[]) => {
      const ordersToSelect = currentOrders.filter((order: Order) =>
        statuses.includes(order.status)
      );
      setSelectedOrders(ordersToSelect.map((o: Order) => o._id || ""));
    },
    [currentOrders]
  );

  const handleSelectByReceptionStatus = useCallback(
    (receptionStatuses: string[]) => {
      const ordersToSelect = currentOrders.filter(
        (order: Order) =>
          order.reported &&
          order.receptionStatus &&
          receptionStatuses.includes(order.receptionStatus)
      );
      setSelectedOrders(ordersToSelect.map((o: Order) => o._id || ""));
    },
    [currentOrders]
  );

  const handleDeselectAll = useCallback(() => {
    setSelectedOrders([]);
  }, []);

  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  // Calculate draft orders
  const draftOrders = orders.filter((order) => order.status === "draft");
  const hasDraftOrders = draftOrders.length > 0;

  // Handle draft orders notification
  const handleOpenDraftHandler = () => {
    setShowDraftHandler(true);
  };

  const handleCloseDraftHandler = () => {
    setShowDraftHandler(false);
    // Refresh orders after handling drafts
    fetchOrders();
  };

  // Handle test user data cleanup
  const handleCleanupTestData = async () => {
    if (
      !window.confirm(
        "⚠️ This will permanently delete all your test orders, transactions, and commissions. Are you sure?"
      )
    ) {
      return;
    }

    setIsCleaningUp(true);
    try {
      const response = await apiClient.post("/api/settings/cleanup/test-user");
      const data = response.data;

      addToast(
        `✅ Cleanup successful! Deleted: ${data.deleted.orders} orders, ${data.deleted.transactions} transactions, ${data.deleted.commissions} commissions`,
        "success",
        5000
      );

      // Refresh orders and analytics
      fetchOrders();
      if (isAdmin || isAgent) {
        fetchAnalytics();
      }
    } catch (error) {
      console.error("Failed to cleanup test data:", error);
      addToast("Failed to cleanup test data. Please try again.", "error");
    } finally {
      setIsCleaningUp(false);
    }
  };

  // Define search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search by order number, customer, or phone...",
    filters: {
      status: {
        value: statusFilter,
        options: [
          { value: "draft", label: "Draft" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "processing", label: "Processing" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
          { value: "failed", label: "Failed" },
        ],
        label: "Status",
        placeholder: "All Status",
      },
      orderType: {
        value: orderTypeFilter,
        options: [
          { value: "single", label: "Single" },
          { value: "bulk", label: "Bulk" },
          { value: "regular", label: "Regular" },
        ],
        label: "Order Type",
        placeholder: "All Types",
      },
      ...(activeTab === "reported"
        ? {
            receptionStatus: {
              value: receptionStatusFilter,
              options: [
                { value: "not_received", label: "Not Received" },
                { value: "received", label: "Received" },
                { value: "checking", label: "Checking" },
                { value: "resolved", label: "Resolved" },
              ],
              label: "Reception Status",
              placeholder: "All Reception Status",
            },
          }
        : {}),
      ...(isAdmin
        ? {
            provider: {
              value: providerFilter,
              options: [
                // Include AFA as a static option since it appears in orders but isn't a traditional provider
                { value: "AFA", label: "AFA" },
                // Include all network providers from the provider service
                ...providers.map((provider) => ({
                  value: provider.code,
                  label: provider.name,
                })),
              ],
              label: "Network Provider",
              placeholder: "All Providers",
            },
          }
        : {}),
    },
    onFilterChange: (filterKey: string, value: string) => {
      if (filterKey === "status") {
        setStatusFilter(value);
      } else if (filterKey === "orderType") {
        setOrderTypeFilter(value);
      } else if (filterKey === "receptionStatus") {
        setReceptionStatusFilter(value);
      } else if (filterKey === "provider") {
        setProviderFilter(value);
      }
    },
    dateRange,
    onDateRangeChange: (startDate: string, endDate: string) => {
      setDateRange({ startDate, endDate });
    },
    showDateRange: true,
    onSearch: handleSearch,
    onClearFilters: handleClearFilters,
    isLoading: currentLoading,
  };

  if (currentError) {
    return (
      <Card>
        <CardBody>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              Error:{" "}
              {activeTab === "reported"
                ? "Failed to load reported orders"
                : "Failed to load orders"}{" "}
              - {currentError}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">
                {isAdmin
                  ? "Order Management"
                  : isAgent
                  ? "Agent Orders"
                  : "My Orders"}
              </h1>
              <p style={{ color: "var(--color-accent-orange, #6b7280)" }}>
                {isAdmin
                  ? "Monitor and manage all platform orders"
                  : isAgent
                  ? "Manage your assigned orders"
                  : "Track your order history and status"}
                {userType && (
                  <Badge
                    variant="subtle"
                    colorScheme="default"
                    className="ml-2"
                  >
                    {userType}
                  </Badge>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchOrders()}>
                <FaSync className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Analytics Section - Only show for admin and agents */}
      {(isAdmin || isAgent) && (
        <OrderAnalytics
          analyticsData={analyticsData}
          loading={analyticsLoading}
          error={analyticsError}
          isAdmin={isAdmin}
          isAgent={isAgent}
        />
      )}
      {/* Test User Cleanup Button - Only show for test user */}
      {isTestUser && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaTrash className="text-yellow-600" size={18} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    🧪 Test Account - Data Cleanup
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Clear all test orders, transactions, and commissions with
                    one click
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCleanupTestData}
                disabled={isCleaningUp}
                leftIcon={
                  isCleaningUp ? (
                    <FaSync className="animate-spin" />
                  ) : (
                    <FaTrash />
                  )
                }
              >
                {isCleaningUp ? "Cleaning..." : "Clear Test Data"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Draft Orders Notification - Only show for agents when there are draft orders */}
      {(isAgent || !isAdmin) && hasDraftOrders && (
        <Card className="border-yellow-400 bg-yellow-50">
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    Draft Orders Need Attention
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    You have {draftOrders.length} draft order
                    {draftOrders.length !== 1 ? "s" : ""} waiting to be
                    processed. These orders require sufficient wallet balance to
                    complete.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleOpenDraftHandler}
                  variant="primary"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <FaExclamationTriangle className="mr-2" />
                  Review Drafts ({draftOrders.length})
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Search and Filters */}
      <SearchAndFilter {...searchAndFilterConfig} />
      {/* View Mode Toggle */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* View Mode Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                View Mode:
              </span>
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === "cards"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Cards
                </button>
                {/* Table view only visible on desktop (lg and above) */}
                <button
                  onClick={() => setViewMode("table")}
                  className={`hidden lg:block px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Table
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setViewMode("excel")}
                    className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      viewMode === "excel"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Excel
                  </button>
                )}
              </div>
            </div>

            {/* Select All Button - Only show in cards view and for admin */}
            {viewMode === "cards" && isAdmin && orders.length > 0 && (
              <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
                <div className="flex gap-2 flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <FaCheckSquare
                      style={{ color: "var(--color-primary-600)" }}
                    />
                    <span className="text-xs sm:text-sm">Smart Select</span>
                  </Button>
                  {selectedOrders.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
                    >
                      <FaTimes className="text-gray-600" />
                      <span className="text-xs sm:text-sm">Deselect All</span>
                    </Button>
                  )}
                </div>
                {selectedOrders.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                    {selectedOrders.length} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
      {/* Bulk Actions - Admin and Agent */}
      {selectedOrders.length > 0 &&
        (isAdmin || isAgent) &&
        activeTab !== "reported" && (
          <Card>
            <CardBody>
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: "var(--color-primary-100)",
                  borderColor: "var(--color-primary-300)",
                  borderWidth: "1px",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-primary-800)" }}
                  >
                    {selectedOrders.length} order(s) selected for bulk
                    processing
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("process")}
                      className="flex-1 sm:flex-none"
                    >
                      <FaClock className="mr-1" />
                      <span className="hidden sm:inline">Start Processing</span>
                      <span className="sm:hidden">Process</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction("complete")}
                      className="flex-1 sm:flex-none"
                    >
                      <FaCheck className="mr-1" />
                      <span className="hidden sm:inline">
                        Mark as Completed
                      </span>
                      <span className="sm:hidden">Complete</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleBulkAction("cancel")}
                      className="flex-1 sm:flex-none"
                    >
                      <FaTimes className="mr-1" />
                      <span className="hidden sm:inline">Cancel Orders</span>
                      <span className="sm:hidden">Cancel</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      {/* Bulk Reception Status Actions - Super Admin on Reported Tab */}
      {selectedOrders.length > 0 && isAdmin && activeTab === "reported" && (
        <Card>
          <CardBody>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm text-purple-800 font-medium">
                  {selectedOrders.length} order(s) selected for reception status
                  update
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkReceptionStatus("received")}
                    className="flex-1 sm:flex-none border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <FaCheck className="mr-1" />
                    <span className="hidden sm:inline">Mark Received</span>
                    <span className="sm:hidden">Received</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkReceptionStatus("checking")}
                    className="flex-1 sm:flex-none border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <FaClock className="mr-1" />
                    <span className="hidden sm:inline">Mark Checking</span>
                    <span className="sm:hidden">Checking</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkReceptionStatus("resolved")}
                    className="flex-1 sm:flex-none"
                    style={{
                      borderColor: "var(--color-primary-300)",
                      color: "var(--color-primary-700)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-primary-50)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <FaCheck className="mr-1" />
                    <span className="hidden sm:inline">Mark Resolved</span>
                    <span className="sm:hidden">Resolved</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Order Tabs - Show for both agents and super admins */}
      {(isAdmin || isAgent) && (
        <Card>
          <CardBody>
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={
                  activeTab === "all"
                    ? {
                        borderColor: "var(--color-primary-500)",
                        color: "var(--color-primary-600)",
                      }
                    : {}
                }
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveTab("reported")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reported"
                    ? "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={
                  activeTab === "reported"
                    ? {
                        borderColor: "var(--color-primary-500)",
                        color: "var(--color-primary-600)",
                      }
                    : {}
                }
              >
                Reported Orders
              </button>
            </div>
          </CardBody>
        </Card>
      )}
      {/* Orders Display */}
      {currentLoading ? (
        <Card>
          <CardBody>
            <div className="flex justify-center items-center p-8">
              <Spinner />
              <span className="ml-3 text-gray-600">
                {activeTab === "reported"
                  ? "Loading reported orders..."
                  : "Loading orders..."}
              </span>
            </div>
          </CardBody>
        </Card>
      ) : currentOrders.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartBar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "reported"
                  ? "No reported orders found"
                  : "No orders found"}
              </h3>
              <p className="text-gray-600">
                {activeTab === "reported"
                  ? isAdmin
                    ? "No orders have been reported yet."
                    : "You haven't reported any orders yet."
                  : isAdmin
                  ? "No orders match your current filters."
                  : "You haven't placed any orders yet."}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentOrders.map((order: Order) => (
            <UnifiedOrderCard
              key={order._id}
              order={order}
              isAdmin={isAdmin}
              currentUserId={authState.user?._id}
              onUpdateStatus={handleStatusUpdate}
              onCancel={handleCancelOrder}
              onSelect={handleSelectOrder}
              isSelected={selectedOrders.includes(order._id || "")}
              onRefresh={() =>
                activeTab === "reported"
                  ? fetchReportedOrders()
                  : fetchOrders(filters)
              }
              onUpdateReceptionStatus={handleReceptionStatusUpdate}
            />
          ))}
        </div>
      ) : viewMode === "table" ? (
        <div className="hidden lg:block">
          <UnifiedOrderTable
            orders={currentOrders}
            isAdmin={isAdmin}
            currentUserId={authState.user?._id}
            onUpdateStatus={handleStatusUpdate}
            onUpdateReceptionStatus={handleReceptionStatusUpdate}
            onCancel={handleCancelOrder}
            onSelect={handleSelectOrder}
            selectedOrders={selectedOrders}
            onSelectAll={handleSelectAll}
            loading={currentLoading}
          />
        </div>
      ) : (
        <UnifiedOrderExcel orders={currentOrders} loading={currentLoading} />
      )}{" "}
      {/* Pagination */}
      {currentPagination.pages > 1 && (
        <Card>
          <CardBody>
            <Pagination
              currentPage={currentPagination.page}
              totalPages={currentPagination.pages}
              totalItems={currentPagination.total}
              itemsPerPage={currentPagination.limit}
              onPageChange={(page) => {
                if (activeTab === "reported") {
                  fetchReportedOrders({}, { page });
                } else {
                  fetchOrders(filters, { page });
                }
              }}
              onItemsPerPageChange={(limit) => {
                if (activeTab === "reported") {
                  fetchReportedOrders({}, { page: 1, limit });
                } else {
                  fetchOrders(filters, { page: 1, limit });
                }
              }}
              showInfo={true}
              showPerPageSelector={true}
              perPageOptions={[20, 50, 100, 200, 300, 500]}
              size="sm"
            />
          </CardBody>
        </Card>
      )}
      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        isOpen={showBulkConfirmDialog}
        onClose={cancelBulkAction}
        size="md"
      >
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Confirm Bulk Action
          </h2>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {pendingBulkAction === "cancel" && (
                <FaTimes className="text-red-500 text-xl" />
              )}
              {pendingBulkAction === "process" && (
                <FaSync
                  style={{ color: "var(--color-primary-500)" }}
                  className="text-xl"
                />
              )}
              {pendingBulkAction === "complete" && (
                <FaCheck className="text-green-500 text-xl" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  {pendingBulkAction === "cancel" && "Cancel Orders"}
                  {pendingBulkAction === "process" && "Process Orders"}
                  {pendingBulkAction === "complete" && "Complete Orders"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingBulkAction === "cancel" &&
                    `Are you sure you want to cancel ${selectedOrders.length} selected order(s)?`}
                  {pendingBulkAction === "process" &&
                    `Are you sure you want to process ${selectedOrders.length} selected order(s)? This will update their status to processing.`}
                  {pendingBulkAction === "complete" &&
                    `Are you sure you want to mark ${selectedOrders.length} selected order(s) as completed?`}
                </p>
              </div>
            </div>

            {/* Show selected orders info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4
                style={{ color: "var(--color-accent-orange, #374151)" }}
                className="font-medium text-sm mb-2"
              >
                Selected Orders:
              </h4>
              <div className="space-y-1">
                {currentOrders
                  .filter((order: Order) =>
                    selectedOrders.includes(order._id || "")
                  )
                  .slice(0, 3)
                  .map((order: Order) => (
                    <div
                      style={{ color: "var(--color-accent-orange, #6b7280)" }}
                      key={order._id}
                      className="text-sm"
                    >
                      {order.orderNumber} - {order.status}
                    </div>
                  ))}
                {selectedOrders.length > 3 && (
                  <div
                    style={{ color: "var(--color-accent-orange, #9ca3af)" }}
                    className="text-sm"
                  >
                    ...and {selectedOrders.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={cancelBulkAction}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              className="flex-1"
              variant={pendingBulkAction === "cancel" ? "danger" : "primary"}
            >
              {pendingBulkAction === "cancel" && "Cancel Orders"}
              {pendingBulkAction === "process" && "Process Orders"}
              {pendingBulkAction === "complete" && "Complete Orders"}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
      {/* Reception Status Update Confirmation Dialog */}
      <Dialog
        isOpen={showReceptionStatusDialog}
        onClose={cancelReceptionStatusUpdate}
        size="md"
      >
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Confirm Reception Status Update
          </h2>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {pendingReceptionStatus === "received" && (
                <FaCheck className="text-green-500 text-xl" />
              )}
              {pendingReceptionStatus === "checking" && (
                <FaClock className="text-yellow-500 text-xl" />
              )}
              {pendingReceptionStatus === "resolved" && (
                <FaCheck
                  style={{ color: "var(--color-primary-500)" }}
                  className="text-xl"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  Update Reception Status to{" "}
                  {pendingReceptionStatus &&
                    pendingReceptionStatus.charAt(0).toUpperCase() +
                      pendingReceptionStatus.slice(1).replace("_", " ")}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to update the reception status for{" "}
                  {selectedOrders.length} selected order(s) to "
                  {pendingReceptionStatus?.replace("_", " ")}"?
                </p>
              </div>
            </div>

            {/* Show selected orders info */}
            <div className="bg-purple-50 rounded-lg p-3">
              <h4 className="font-medium text-sm text-purple-700 mb-2">
                Selected Orders:
              </h4>
              <div className="space-y-1">
                {currentOrders
                  .filter((order: Order) =>
                    selectedOrders.includes(order._id || "")
                  )
                  .slice(0, 3)
                  .map((order: Order) => (
                    <div
                      style={{ color: "var(--color-accent-orange, #6b7280)" }}
                      key={order._id}
                      className="text-sm"
                    >
                      {order.orderNumber} - Current:{" "}
                      {order.receptionStatus || "N/A"}
                    </div>
                  ))}
                {selectedOrders.length > 3 && (
                  <div
                    style={{ color: "var(--color-accent-orange, #9ca3af)" }}
                    className="text-sm"
                  >
                    ...and {selectedOrders.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={cancelReceptionStatusUpdate}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkReceptionStatus}
              className="flex-1"
              variant="primary"
            >
              Update Status
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
      {/* Draft Orders Handler Modal */}
      <DraftOrdersHandler
        isOpen={showDraftHandler}
        onClose={handleCloseDraftHandler}
      />
      {/* Smart Select Dialog */}
      <SmartSelectDialog
        isOpen={showSmartSelectDialog}
        onClose={() => setShowSmartSelectDialog(false)}
        orders={currentOrders}
        onSelectByStatus={handleSelectByStatus}
        onSelectByReceptionStatus={handleSelectByReceptionStatus}
        onSwitchToExcel={() => setViewMode("excel")}
        currentViewMode={viewMode}
      />
    </div>
  );
};
