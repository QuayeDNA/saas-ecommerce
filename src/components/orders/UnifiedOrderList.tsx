// src/components/orders/UnifiedOrderList.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrder } from "../../hooks/use-order";
import { useAuth } from "../../hooks/use-auth";
import { providerService } from "../../services/provider.service";
import { useAgentAnalytics, useSuperAdminAnalytics, useInvalidateAnalytics } from "../../hooks/use-analytics";
import { websocketService } from "../../services/websocket.service";
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
import { isOrderLocked } from "../../utils/order-lock";

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
    "cards",
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

  // Analytics via React Query — only fetch the hook matching the user's role
  const { data: agentAnalytics, isLoading: agentAnalyticsLoading, error: agentAnalyticsError } = useAgentAnalytics("30d", !!isAgent);
  const { data: adminAnalytics, isLoading: adminAnalyticsLoading, error: adminAnalyticsError } = useSuperAdminAnalytics("30d", !!isAdmin);
  const { invalidateAll } = useInvalidateAnalytics();

  const analyticsLoading = isAdmin ? adminAnalyticsLoading : isAgent ? agentAnalyticsLoading : false;
  const analyticsError = isAdmin ? (adminAnalyticsError?.message ?? null) : isAgent ? (agentAnalyticsError?.message ?? null) : null;

  // Provider data
  const [providers, setProviders] = useState<Provider[]>([]);

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

  // Derive analytics data from React Query based on role
  const analyticsData = useMemo(() => {
    if (isAdmin && adminAnalytics) {
      return {
        totalOrders: adminAnalytics.orders.total || 0,
        todayOrders: adminAnalytics.orders.today?.total || 0,
        thisMonthOrders: adminAnalytics.orders.thisMonth?.total || 0,
        totalRevenue: adminAnalytics.revenue.total || 0,
        todayRevenue: adminAnalytics.revenue.today || 0,
        monthlyRevenue: adminAnalytics.revenue.thisMonth || 0,
        todayCompletedOrders: adminAnalytics.orders.today?.completed || 0,
        todayProcessingOrders: adminAnalytics.orders.today?.processing || 0,
        todayPendingOrders: adminAnalytics.orders.today?.pending || 0,
        todayCancelledOrders: adminAnalytics.orders.today?.cancelled || 0,
        statusCounts: {
          processing: adminAnalytics.orders.processing || 0,
          pending: adminAnalytics.orders.pending || 0,
          confirmed: adminAnalytics.orders.confirmed || 0,
          cancelled: adminAnalytics.orders.cancelled || 0,
          partiallyCompleted: adminAnalytics.orders.partiallyCompleted || 0,
        },
        receptionCounts: {
          received: adminAnalytics.orders.completed || 0,
          not_received: adminAnalytics.orders.failed || 0,
          checking: adminAnalytics.orders.processing || 0,
          resolved: adminAnalytics.orders.completed || 0,
        },
      };
    }
    if (isAgent && agentAnalytics) {
      return {
        orders: {
          total: agentAnalytics.orders.total || 0,
          completed: agentAnalytics.orders.completed || 0,
          processing: agentAnalytics.orders.processing || 0,
          pending: agentAnalytics.orders.pending || 0,
          confirmed: agentAnalytics.orders.confirmed || 0,
          cancelled: agentAnalytics.orders.cancelled || 0,
          partiallyCompleted: agentAnalytics.orders.partiallyCompleted || 0,
          today: {
            completed: agentAnalytics.orders.todayCounts?.completed || 0,
            processing: agentAnalytics.orders.todayCounts?.processing || 0,
            pending: agentAnalytics.orders.todayCounts?.pending || 0,
            confirmed: agentAnalytics.orders.todayCounts?.confirmed || 0,
            cancelled: agentAnalytics.orders.todayCounts?.cancelled || 0,
            partiallyCompleted:
              agentAnalytics.orders.todayCounts?.partiallyCompleted || 0,
          },
        },
        revenue: {
          total: agentAnalytics.revenue.total || 0,
          thisMonth: agentAnalytics.revenue.thisMonth || 0,
          today: agentAnalytics.revenue.today || 0,
        },
      };
    }
    return null;
  }, [isAdmin, adminAnalytics, isAgent, agentAnalytics]);

  useEffect(() => {
    fetchOrders();
    // Fetch providers for filter
    if (isAdmin) {
      fetchProviders();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOrders, isAdmin, fetchProviders]);

  // WebSocket real-time updates with intelligent debouncing
  useEffect(() => {
    if (!authState.user?._id) return;

    // Connect to WebSocket
    websocketService.connect(authState.user._id);

    // Batch tracking for toast notifications
    let orderCreatedCount = 0;
    let orderStatusUpdatedCount = 0;
    let toastTimerId: NodeJS.Timeout | null = null;

    // Debounced toast notification (batches events within 2 seconds)
    const showBatchedToast = () => {
      if (orderCreatedCount > 0) {
        const message =
          orderCreatedCount === 1
            ? "New order received!"
            : `${orderCreatedCount} new orders received!`;
        addToast(message, "success");
        orderCreatedCount = 0;
      }

      if (orderStatusUpdatedCount > 0) {
        const message =
          orderStatusUpdatedCount === 1
            ? "Order status updated"
            : `${orderStatusUpdatedCount} orders updated`;
        addToast(message, "info");
        orderStatusUpdatedCount = 0;
      }

      toastTimerId = null;
    };

    // Handle new order creation (for admins)
    const handleOrderCreated = (data: unknown) => {
      console.log("📦 New order created:", data);
      orderCreatedCount++;

      // Cancel existing timer and set new one
      if (toastTimerId) {
        clearTimeout(toastTimerId);
      }
      toastTimerId = setTimeout(showBatchedToast, 2000);

      fetchOrders(); // Refresh orders list
      invalidateAll();
    };

    // Handle order status update (for agents and admins)
    const handleOrderStatusUpdated = (data: unknown) => {
      console.log("🔄 Order status updated:", data);

      // Attempt to use detailed payload if available
      if (
        typeof data === "object" &&
        data !== null &&
        "count" in data &&
        typeof (data as any).count === "number"
      ) {
        const eventData = data as {
          count: number;
          status: string;
          orderIds?: string[];
        };

        orderStatusUpdatedCount += eventData.count;

        const base =
          eventData.count === 1 ? "1 order" : `${eventData.count} orders`;
        const state = eventData.status ? ` to ${eventData.status}` : "";
        addToast(`${base} updated${state}.`, "info");
      } else {
        orderStatusUpdatedCount++;

        // Cancel existing timer and set new one
        if (toastTimerId) {
          clearTimeout(toastTimerId);
        }
        toastTimerId = setTimeout(showBatchedToast, 2000);
      }

      fetchOrders(); // Refresh orders list
      invalidateAll();
    };

    // Register listeners
    if (isAdmin) {
      websocketService.on("order_created", handleOrderCreated);
    }
    websocketService.on("order_status_updated", handleOrderStatusUpdated);

    return () => {
      // Clean up timer
      if (toastTimerId) {
        clearTimeout(toastTimerId);
        // Show any pending batched toasts
        showBatchedToast();
      }

      // Clean up listeners
      if (isAdmin) {
        websocketService.off("order_created", handleOrderCreated);
      }
      websocketService.off("order_status_updated", handleOrderStatusUpdated);
    };
  }, [authState.user, isAdmin, isAgent, fetchOrders, invalidateAll, addToast]);

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
    } catch {
      addToast("Failed to update order status", "error");
    }
  };

  const handleReceptionStatusUpdate = async (
    orderId: string,
    receptionStatus: string,
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
          | "resolved",
      );
      addToast(
        `Successfully updated reception status for ${selectedOrders.length} order(s)`,
        "success",
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

    // Filter out locked orders from bulk actions
    const actionableOrderIds = selectedOrders.filter((id) => {
      const order = currentOrders.find((o) => o._id === id);
      return order && !isOrderLocked(order);
    });

    if (actionableOrderIds.length === 0) {
      addToast(
        "All selected orders are locked (24h+ in terminal status)",
        "warning",
      );
      setShowBulkConfirmDialog(false);
      setPendingBulkAction(null);
      return;
    }

    const skippedCount = selectedOrders.length - actionableOrderIds.length;
    if (skippedCount > 0) {
      addToast(`${skippedCount} locked order(s) were skipped`, "info");
    }

    try {
      if (pendingBulkAction === "cancel") {
        for (const orderId of actionableOrderIds) {
          await cancelOrder(orderId, "Bulk cancelled by admin");
        }
        addToast(
          `Successfully cancelled ${actionableOrderIds.length} orders`,
          "success",
        );
      } else {
        const bulkAction =
          pendingBulkAction === "process" ? "processing" : "completed";
        await bulkProcessOrders(actionableOrderIds, bulkAction);
        addToast(
          `Successfully ${bulkAction} ${actionableOrderIds.length} orders`,
          "success",
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
        statuses.includes(order.status),
      );
      setSelectedOrders(ordersToSelect.map((o: Order) => o._id || ""));
    },
    [currentOrders],
  );

  const handleSelectByReceptionStatus = useCallback(
    (receptionStatuses: string[]) => {
      const ordersToSelect = currentOrders.filter(
        (order: Order) =>
          order.reported &&
          order.receptionStatus &&
          receptionStatuses.includes(order.receptionStatus),
      );
      setSelectedOrders(ordersToSelect.map((o: Order) => o._id || ""));
    },
    [currentOrders],
  );

  const handleDeselectAll = useCallback(() => {
    setSelectedOrders([]);
  }, []);

  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
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

  // Define search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search by order number, customer, or phone...",
    enableAutoSearch: true,
    debounceDelay: 500,
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
          { value: "storefront", label: "Storefront" },
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
          <div className="bg-[var(--error-lighter)] border border-[var(--error)]/20 rounded-lg">
            <p className="text-[var(--error)]">
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
              <h1 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">
                {isAdmin
                  ? "Order Management"
                  : isAgent
                    ? "Agent Orders"
                    : "My Orders"}
              </h1>
              <p className="text-[var(--text-secondary)]">
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
      {/* Draft Orders Notification - Only show for agents when there are draft orders */}
      {(isAgent || !isAdmin) && hasDraftOrders && (
        <Card className="border-[var(--warning)] bg-[var(--warning-lighter)]">
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-[var(--warning)] text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[var(--warning)] mb-1">
                    Draft Orders Need Attention
                  </h3>
                  <p className="text-[var(--warning)] text-sm">
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
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--text-secondary)] flex-shrink-0">
                View Mode:
              </span>
              <div className="flex bg-[var(--bg-surface-alt)] rounded-lg p-1">
                {(["cards", "table"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === mode
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => setViewMode("excel")}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === "excel"
                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Excel
                  </button>
                )}
              </div>
            </div>

            {/* Smart Select */}
            {viewMode === "cards" && isAdmin && orders.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={
                    <FaCheckSquare
                      style={{ color: "var(--color-primary-hover)" }}
                    />
                  }
                  onClick={handleSelectAll}
                >
                  Smart Select
                </Button>
                {selectedOrders.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      <FaTimes className="mr-1 text-[var(--text-muted)]" />
                      Deselect All
                    </Button>
                    <span className="text-sm text-[var(--text-muted)] flex-shrink-0">
                      {selectedOrders.length} selected
                    </span>
                  </>
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
              <div className="rounded-lg p-4 border border-[var(--color-secondary)]/20 bg-[var(--color-accent-soft)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
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
            <div className="bg-[var(--bg-surface-alt)] border border-[var(--border-color-strong)] rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm text-[var(--text-primary)] font-medium">
                  {selectedOrders.length} order(s) selected for reception status
                  update
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkReceptionStatus("received")}
                    className="flex-1 sm:flex-none border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success-lighter)]"
                  >
                    <FaCheck className="mr-1" />
                    <span className="hidden sm:inline">Mark Received</span>
                    <span className="sm:hidden">Received</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkReceptionStatus("checking")}
                    className="flex-1 sm:flex-none border-[var(--warning)]/30 text-[var(--warning)] hover:bg-[var(--warning-lighter)]"
                  >
                    <FaClock className="mr-1" />
                    <span className="hidden sm:inline">Mark Checking</span>
                    <span className="sm:hidden">Checking</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkReceptionStatus("resolved")}
                    className="flex-1 sm:flex-none border-[var(--color-secondary)]/30 text-[var(--color-secondary)] hover:bg-[var(--color-accent-soft)]"
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
            <div className="flex border-b border-[var(--border-color)]">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveTab("reported")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "reported"
                    ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]"
                }`}
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
              <span className="ml-3 text-[var(--text-muted)]">
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
              <div className="w-16 h-16 bg-[var(--bg-surface-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartBar className="h-8 w-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                {activeTab === "reported"
                  ? "No reported orders found"
                  : "No orders found"}
              </h3>
              <p className="text-[var(--text-muted)]">
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
        <div>
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
            onRefresh={() =>
              activeTab === "reported"
                ? fetchReportedOrders()
                : fetchOrders(filters)
            }
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Confirm Bulk Action
          </h2>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {pendingBulkAction === "cancel" && (
                <FaTimes className="text-[var(--error)] text-xl" />
              )}
              {pendingBulkAction === "process" && (
                <FaSync
                  style={{ color: "var(--color-primary)" }}
                  className="text-xl"
                />
              )}
              {pendingBulkAction === "complete" && (
                <FaCheck className="text-[var(--success)] text-xl" />
              )}
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">
                  {pendingBulkAction === "cancel" && "Cancel Orders"}
                  {pendingBulkAction === "process" && "Process Orders"}
                  {pendingBulkAction === "complete" && "Complete Orders"}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
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
            <div className="bg-[var(--bg-surface-alt)] rounded-lg p-3">
                <h4 className="font-medium text-sm text-[var(--text-primary)] mb-2">
                  Selected Orders:
                </h4>
              <div className="space-y-1">
                {currentOrders
                  .filter((order: Order) =>
                    selectedOrders.includes(order._id || ""),
                  )
                  .slice(0, 3)
                  .map((order: Order) => (
                    <div
                      key={order._id}
                      className="text-sm text-[var(--text-muted)]"
                    >
                      {order.orderNumber} - {order.status}
                    </div>
                  ))}
                {selectedOrders.length > 3 && (
                  <div
                    className="text-sm text-[var(--text-muted)]"
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
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Confirm Reception Status Update
          </h2>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {pendingReceptionStatus === "received" && (
                <FaCheck className="text-[var(--success)] text-xl" />
              )}
              {pendingReceptionStatus === "checking" && (
                <FaClock className="text-[var(--warning)] text-xl" />
              )}
              {pendingReceptionStatus === "resolved" && (
                <FaCheck
                  style={{ color: "var(--color-primary)" }}
                  className="text-xl"
                />
              )}
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">
                  Update Reception Status to{" "}
                  {pendingReceptionStatus &&
                    pendingReceptionStatus.charAt(0).toUpperCase() +
                      pendingReceptionStatus.slice(1).replace("_", " ")}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Are you sure you want to update the reception status for{" "}
                  {selectedOrders.length} selected order(s) to "
                  {pendingReceptionStatus?.replace("_", " ")}"?
                </p>
              </div>
            </div>

            {/* Show selected orders info */}
            <div className="bg-[var(--bg-surface-alt)] rounded-lg p-3">
              <h4 className="font-medium text-sm text-[var(--text-primary)] mb-2">
                Selected Orders:
              </h4>
              <div className="space-y-1">
                {currentOrders
                  .filter((order: Order) =>
                    selectedOrders.includes(order._id || ""),
                  )
                  .slice(0, 3)
                  .map((order: Order) => (
                    <div
                      key={order._id}
                      className="text-sm text-[var(--text-muted)]"
                    >
                      {order.orderNumber} - Current:{" "}
                      {order.receptionStatus || "N/A"}
                    </div>
                  ))}
                {selectedOrders.length > 3 && (
                  <div
                    className="text-sm text-[var(--text-muted)]"
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
