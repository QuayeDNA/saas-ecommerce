// src/components/orders/UnifiedOrderList.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useOrder } from "../../hooks/use-order";
import { useAuth } from "../../hooks/use-auth";
import { providerService } from "../../services/provider.service";
import { analyticsService } from "../../services/analytics.service";
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
} from "../../design-system";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaChartBar,
  FaDownload,
  FaSync,
} from "react-icons/fa";
import type { Order, OrderFilters } from "../../types/order";
import type { Provider } from "../../types/package";
import { UnifiedOrderCard } from "./UnifiedOrderCard";
import { UnifiedOrderTable } from "./UnifiedOrderTable";
import { UnifiedOrderExcel } from "./UnifiedOrderExcel";
import { OrderAnalytics } from "./OrderAnalytics";
import { SearchAndFilter } from "../common/SearchAndFilter";

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
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    setFilters,
    bulkProcessOrders,
  } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
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

  // Analytics state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Provider data
  const [providers, setProviders] = useState<Provider[]>([]);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

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
          monthlyRevenue: analytics.revenue.thisMonth || 0,
          todayCompletedOrders: analytics.orders.today?.completed || 0,
          todayProcessingOrders: analytics.orders.today?.processing || 0,
          todayPendingOrders: analytics.orders.today?.pending || 0,
          todayCancelledOrders: analytics.orders.today?.cancelled || 0,
          commission: {
            totalPaid: analytics.commissions?.totalPaid || 0,
            pendingAmount: analytics.commissions?.pendingAmount || 0,
            pendingCount: analytics.commissions?.pendingCount || 0
          },
          statusCounts: {
            processing: analytics.orders.processing || 0,
            pending: analytics.orders.pending || 0,
            cancelled: analytics.orders.cancelled || 0
          }
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
              cancelled: analytics.orders.todayCounts?.cancelled || 0
            }
          },
          revenue: {
            total: analytics.revenue.total || 0,
            today: analytics.revenue.today || 0
          }
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
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    statusFilter,
    orderTypeFilter,
    paymentStatusFilter,
    providerFilter,
    dateRange,
    setFilters,
    fetchOrders,
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
    setProviderFilter("");
    setDateRange({ startDate: "", endDate: "" });
    setFilters({});
    fetchOrders();
  }, [setFilters, fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch {
      // Failed to update order status
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(orderId, "Cancelled by user");
      } catch {
        // Failed to cancel order
      }
    }
  };

  const handleBulkAction = (action: "cancel" | "process" | "complete") => {
    if (selectedOrders.length === 0) return;

    setPendingBulkAction(action);
    setShowBulkConfirmDialog(true);
  };

  const confirmBulkAction = async () => {
    if (!pendingBulkAction || selectedOrders.length === 0) return;

    try {
      if (pendingBulkAction === "cancel") {
        for (const orderId of selectedOrders) {
          await cancelOrder(orderId, "Bulk cancelled by admin");
        }
      } else {
        const bulkAction =
          pendingBulkAction === "process" ? "processing" : "completed";
        await bulkProcessOrders(selectedOrders, bulkAction);
      }
      setSelectedOrders([]);
    } catch {
      // Failed to perform bulk action
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
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o: Order) => o._id || ""));
    }
  }, [selectedOrders.length, orders]);

  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  // Define search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search by order number, customer, or phone...",
    filters: {
      status: {
        value: statusFilter,
        options: [
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
    isLoading: loading,
  };

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
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
              <p className="text-gray-600">
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
              {(isAdmin || isAgent) && (
                <Button variant="outline">
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              )}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === orders.length &&
                      orders.length > 0
                    }
                    onChange={() => {}} // Handled by button click
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    readOnly
                  />
                  <span className="text-xs sm:text-sm">
                    {selectedOrders.length === orders.length
                      ? "Deselect All"
                      : "Select All"}
                  </span>
                </Button>
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
      {selectedOrders.length > 0 && (isAdmin || isAgent) && (
        <Card>
          <CardBody>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm text-blue-800 font-medium">
                  {selectedOrders.length} order(s) selected for bulk processing
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
                    <span className="hidden sm:inline">Mark as Completed</span>
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

      {/* Orders Display */}
      {loading ? (
        <Card>
          <CardBody>
            <div className="flex justify-center items-center p-8">
              <Spinner />
              <span className="ml-3 text-gray-600">Loading orders...</span>
            </div>
          </CardBody>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChartBar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {isAdmin
                  ? "No orders match your current filters."
                  : "You haven't placed any orders yet."}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <UnifiedOrderCard
              key={order._id}
              order={order}
              isAdmin={isAdmin}
              currentUserId={authState.user?._id}
              onUpdateStatus={handleStatusUpdate}
              onCancel={handleCancelOrder}
              onSelect={handleSelectOrder}
              isSelected={selectedOrders.includes(order._id || "")}
            />
          ))}
        </div>
      ) : viewMode === "table" ? (
        <div className="hidden lg:block">
          <UnifiedOrderTable
            orders={orders}
            isAdmin={isAdmin}
            currentUserId={authState.user?._id}
            onUpdateStatus={handleStatusUpdate}
            onCancel={handleCancelOrder}
            onSelect={handleSelectOrder}
            selectedOrders={selectedOrders}
            onSelectAll={handleSelectAll}
            loading={loading}
          />
        </div>
      ) : (
        <UnifiedOrderExcel orders={orders} loading={loading} />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardBody>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => fetchOrders(filters, { page })}
              onItemsPerPageChange={(limit) =>
                fetchOrders(filters, { page: 1, limit })
              }
              showInfo={true}
              showPerPageSelector={true}
              perPageOptions={[20, 30, 50, 100]}
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
                <FaSync className="text-blue-500 text-xl" />
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
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Selected Orders:
              </h4>
              <div className="space-y-1">
                {orders
                  .filter((order) => selectedOrders.includes(order._id || ""))
                  .slice(0, 3)
                  .map((order) => (
                    <div key={order._id} className="text-sm text-gray-600">
                      {order.orderNumber} - {order.status}
                    </div>
                  ))}
                {selectedOrders.length > 3 && (
                  <div className="text-sm text-gray-500">
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

    </div>
  );
};
