// src/contexts/OrderContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type {
  Order,
  OrderFilters,
  OrderPagination,
  OrderAnalytics,
  CreateSingleOrderData,
  CreateBulkOrderData,
} from "../types/order";
import { orderService } from "../services/order.service";
import { analyticsService } from "../services/analytics.service";
import { useAuth } from "../hooks/use-auth";
import { apiClient } from "../utils/api-client";

// Helper function to trigger daily spending refresh from backend
const triggerDailySpendingRefresh = (userId?: string) => {
  try {
    // Dispatch a custom event to notify the hook to refresh from backend
    window.dispatchEvent(
      new CustomEvent("dailySpendingUpdated", {
        detail: { userId },
      })
    );
  } catch (error) {
    console.error("Failed to trigger daily spending refresh:", error);
  }
};

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: OrderFilters;
  // Reported orders state
  reportedOrders: Order[];
  reportedLoading: boolean;
  reportedError: string | null;
  reportedPagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  analytics: OrderAnalytics | null;
  monthlyRevenue: {
    monthlyRevenue: number;
    orderCount: number;
    month: string;
  } | null;

  // Actions
  fetchOrders: (
    filters?: OrderFilters,
    pagination?: Partial<OrderPagination>
  ) => Promise<void>;
  fetchReportedOrders: (
    filters?: Omit<OrderFilters, "reported">,
    pagination?: Partial<OrderPagination>
  ) => Promise<void>;
  createSingleOrder: (
    orderData: CreateSingleOrderData & { forceOverride?: boolean }
  ) => Promise<void>;
  createBulkOrder: (
    orderData: CreateBulkOrderData & { forceOverride?: boolean }
  ) => Promise<void>;
  processOrderItem: (orderId: string, itemId: string) => Promise<void>;
  processBulkOrder: (orderId: string) => Promise<void>;
  bulkProcessOrders: (
    orderIds: string[],
    action: "processing" | "completed"
  ) => Promise<void>;
  bulkUpdateReceptionStatus: (
    orderIds: string[],
    receptionStatus: "not_received" | "received" | "checking" | "resolved"
  ) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: string,
    notes?: string
  ) => Promise<void>;
  updateReceptionStatus: (
    orderId: string,
    receptionStatus: string
  ) => Promise<void>;
  processDraftOrders: () => Promise<{
    processed: number;
    message: string;
    totalAmount: number;
  }>;
  processSingleDraftOrder: (orderId: string) => Promise<{
    processed: number;
    message: string;
    totalAmount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: any;
  }>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  getAnalytics: (timeframe?: string) => Promise<OrderAnalytics>;
  getAgentAnalytics: (timeframe?: string) => Promise<{
    orders: {
      total: number;
      completed: number;
      pending: number;
      processing: number;
      confirmed: number;
      failed: number;
      cancelled: number;
      partiallyCompleted: number;
      successRate: number;
      todayCounts: {
        total: number;
        completed: number;
        pending: number;
        processing: number;
        confirmed: number;
        failed: number;
        cancelled: number;
        partiallyCompleted: number;
      };
    };
    revenue: {
      total: number;
      today: number;
      thisMonth: number;
      orderCount: number;
      averageOrderValue: number;
    };
    commissions: {
      totalCommission: number;
      paidCommission: number;
      pendingCommission: number;
      commissionCount: number;
    };
    wallet: {
      balance: number;
    };
    charts: {
      labels: string[];
      orders: number[];
      revenue: number[];
      completedOrders: number[];
    };
    timeframe: string;
    generatedAt: string;
  }>;
  fetchMonthlyRevenue: () => Promise<void>;
  setFilters: (filters: OrderFilters) => void;
  clearError: () => void;
  isInitialized: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helper to extract error message from axios or generic error
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosError = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
  } else if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 50,
  });
  const [filters, setFilters] = useState<OrderFilters>({});
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{
    monthlyRevenue: number;
    orderCount: number;
    month: string;
  } | null>(null);

  // Reported orders state
  const [reportedOrders, setReportedOrders] = useState<Order[]>([]);
  const [reportedLoading, setReportedLoading] = useState(false);
  const [reportedError, setReportedError] = useState<string | null>(null);
  const [reportedPagination, setReportedPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 50,
  });

  const { authState } = useAuth();

  // Initialize the provider
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const fetchOrders = useCallback(
    async (
      newFilters: OrderFilters = {},
      newPagination: Partial<OrderPagination> = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await orderService.getOrders(
          newFilters,
          newPagination
        );
        setOrders(response.orders);
        setPagination(response.pagination);
      } catch (err: unknown) {
        const message = extractErrorMessage(err, "Failed to fetch orders");
        setError(message);
        // Toast notification removed - handled by component
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchReportedOrders = useCallback(
    async (
      newFilters: Omit<OrderFilters, "reported"> = {},
      newPagination: Partial<OrderPagination> = {}
    ) => {
      setReportedLoading(true);
      setReportedError(null);

      try {
        const response = await orderService.getReportedOrders(
          newFilters,
          newPagination
        );
        setReportedOrders(response.orders);
        setReportedPagination(response.pagination);
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to fetch reported orders"
        );
        setReportedError(message);
        // Toast notification removed - handled by component
      } finally {
        setReportedLoading(false);
      }
    },
    []
  );

  const createSingleOrder = useCallback(
    async (orderData: CreateSingleOrderData & { forceOverride?: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        const order = await orderService.createSingleOrder(orderData);

        // Check if order was created as draft
        if (order.status === "draft") {
          const message = `Order created as draft due to insufficient wallet balance. Please top up your wallet to process this order.`;
          setError(message);
          // Toast notification removed - handled by component
          await fetchOrders(filters);
          return; // Don't throw error, just return
        }

        // Update daily spending if order was successfully created with valid total
        if (order.total && order.total > 0) {
          const userId = authState.user?.id || authState.user?._id;
          triggerDailySpendingRefresh(userId);
        }

        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        // Check if this is a duplicate order error
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          err.code === "DUPLICATE_ORDER_DETECTED"
        ) {
          // Re-throw with duplicate info for UI handling
          throw err;
        }

        const message = extractErrorMessage(err, "Failed to create order");
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders, filters, authState.user]
  );

  const createBulkOrder = useCallback(
    async (orderData: CreateBulkOrderData & { forceOverride?: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        const summary = await orderService.createBulkOrder(orderData);

        // Fetch the actual order to get the total amount for daily spending
        if (summary.orderId) {
          try {
            const orderDetails = await orderService.getOrder(summary.orderId);
            if (orderDetails.total && orderDetails.status !== "draft") {
              const userId = authState.user?.id || authState.user?._id;
              triggerDailySpendingRefresh(userId);
            }
          } catch {
            // Silently handle error - order was created successfully even if we can't update daily spending
          }
        }

        // Toast notification removed - handled by component
        await fetchOrders(filters);
        return summary;
      } catch (err: unknown) {
        // Check if this is a duplicate order error
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          err.code === "DUPLICATE_ORDER_DETECTED"
        ) {
          // Re-throw with duplicate info for UI handling
          throw err;
        }

        const message = extractErrorMessage(err, "Failed to create bulk order");
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders, filters, authState.user]
  );

  const processOrderItem = useCallback(
    async (orderId: string, itemId: string) => {
      try {
        await orderService.processOrderItem(orderId, itemId);
        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to process order item"
        );
        setError(message);

        // Check if it's a wallet balance error
        if (message.includes("Insufficient wallet balance")) {
          // Toast notifications removed - handled by component
        } else {
          // Toast notification removed - handled by component
        }
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const processBulkOrder = useCallback(
    async (orderId: string) => {
      try {
        await orderService.processBulkOrder(orderId);
        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to process bulk order"
        );
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const bulkProcessOrders = useCallback(
    async (orderIds: string[], action: "processing" | "completed") => {
      try {
        await orderService.bulkProcessOrders(orderIds, action);
        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          `Failed to bulk ${action} orders`
        );
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const bulkUpdateReceptionStatus = useCallback(
    async (
      orderIds: string[],
      receptionStatus: "not_received" | "received" | "checking" | "resolved"
    ) => {
      try {
        await orderService.bulkUpdateReceptionStatus(orderIds, receptionStatus);
        // Toast notification removed - handled by component
        await fetchReportedOrders();
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          `Failed to bulk update reception status`
        );
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      }
    },
    [fetchReportedOrders]
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      try {
        await orderService.cancelOrder(orderId, reason);
        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        const message = extractErrorMessage(err, "Failed to cancel order");
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string, notes?: string) => {
      try {
        await orderService.updateOrderStatus(orderId, status, notes);
        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to update order status"
        );
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const updateReceptionStatus = useCallback(
    async (orderId: string, receptionStatus: string) => {
      try {
        await apiClient.patch(`/api/orders/${orderId}/reception-status`, {
          receptionStatus,
        });

        // Toast notification removed - handled by component
        await fetchOrders(filters);
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to update reception status"
        );
        setError(message);
        // Toast notification removed - handled by component
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const processDraftOrders = useCallback(async () => {
    try {
      const result = await orderService.processDraftOrders();
      // Removed toast notification - handled by component
      await fetchOrders(filters);
      return result;
    } catch (err: unknown) {
      const message = extractErrorMessage(
        err,
        "Failed to process draft orders"
      );
      setError(message);
      // Removed toast notification - handled by component
      throw new Error(message);
    }
  }, [fetchOrders, filters]);

  const processSingleDraftOrder = useCallback(
    async (orderId: string) => {
      try {
        const result = await orderService.processSingleDraftOrder(orderId);
        // Removed toast notification - handled by component
        await fetchOrders(filters);
        return result;
      } catch (err: unknown) {
        const message = extractErrorMessage(
          err,
          "Failed to process draft order"
        );
        setError(message);
        // Removed toast notification - handled by component
        throw new Error(message);
      }
    },
    [fetchOrders, filters]
  );

  const fetchAnalytics = useCallback(async (timeframe = "30d") => {
    try {
      const analyticsData = await orderService.getAnalytics(timeframe);
      setAnalytics(analyticsData);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "Failed to fetch analytics");
      setError(message);
      // Toast notification removed - handled by component
    }
  }, []);

  const getAnalytics = useCallback(async (timeframe = "30d") => {
    try {
      const analytics = await orderService.getAnalytics(timeframe);
      return analytics;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch analytics");
        // Toast notification removed - handled by component
        throw err;
      } else {
        setError("Failed to fetch analytics");
        // Toast notification removed - handled by component
        throw err;
      }
    }
  }, []);

  const getAgentAnalytics = useCallback(async (timeframe = "30d") => {
    try {
      const analytics = await analyticsService.getAgentAnalytics(timeframe);
      return analytics;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch agent analytics");
        // Toast notification removed - handled by component
        throw err;
      } else {
        setError("Failed to fetch agent analytics");
        // Toast notification removed - handled by component
        throw err;
      }
    }
  }, []);

  const fetchMonthlyRevenue = useCallback(async () => {
    try {
      const data = await orderService.getMonthlyRevenue();
      setMonthlyRevenue(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch monthly revenue");
      } else {
        setError("Failed to fetch monthly revenue");
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = React.useMemo<OrderContextType>(
    () => ({
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
      analytics,
      monthlyRevenue,
      fetchOrders,
      fetchReportedOrders,
      createSingleOrder,
      // @ts-expect-error: createBulkOrder returns a value, but context type expects void.
      // This is intentional to allow consumers to use the returned data.
      createBulkOrder,
      processOrderItem,
      processBulkOrder,
      bulkProcessOrders,
      bulkUpdateReceptionStatus,
      cancelOrder,
      updateOrderStatus,
      updateReceptionStatus,
      processDraftOrders,
      processSingleDraftOrder,
      fetchAnalytics,
      getAnalytics,
      getAgentAnalytics,
      fetchMonthlyRevenue,
      setFilters,
      clearError,
      isInitialized,
    }),
    [
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
      analytics,
      monthlyRevenue,
      fetchOrders,
      fetchReportedOrders,
      createSingleOrder,
      createBulkOrder,
      processOrderItem,
      processBulkOrder,
      bulkProcessOrders,
      bulkUpdateReceptionStatus,
      cancelOrder,
      updateOrderStatus,
      updateReceptionStatus,
      processDraftOrders,
      processSingleDraftOrder,
      fetchAnalytics,
      getAnalytics,
      getAgentAnalytics,
      fetchMonthlyRevenue,
      setFilters,
      clearError,
      isInitialized,
    ]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  if (!context.isInitialized) {
    // Return a fallback context while initializing
    return {
      orders: [],
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, pages: 0, limit: 20 },
      filters: {},
      // Reported orders
      reportedOrders: [],
      reportedLoading: false,
      reportedError: null,
      reportedPagination: { total: 0, page: 1, pages: 0, limit: 20 },
      analytics: null,
      monthlyRevenue: null,
      fetchOrders: async () => {},
      fetchReportedOrders: async () => {},
      createSingleOrder: async () => {},
      createBulkOrder: async () => {},
      processOrderItem: async () => {},
      processBulkOrder: async () => {},
      bulkProcessOrders: async () => {},
      bulkUpdateReceptionStatus: async () => {},
      cancelOrder: async () => {},
      updateOrderStatus: async () => {},
      updateReceptionStatus: async () => {},
      processDraftOrders: async () => ({
        processed: 0,
        message: "",
        totalAmount: 0,
      }),
      processSingleDraftOrder: async () => ({
        processed: 0,
        message: "",
        totalAmount: 0,
        order: null,
      }),
      fetchAnalytics: async () => {},
      getAnalytics: async () => ({
        totalOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        bulkOrders: 0,
        completionRate: 0,
        timeframe: "30d",
      }),
      getAgentAnalytics: async () => ({
        users: { referredUsers: 0, totalReferredUsers: 0, activeReferredUsers: 0, conversionRate: 0 },
        orders: {
          total: 0, completed: 0, pending: 0, processing: 0, confirmed: 0,
          failed: 0, cancelled: 0, partiallyCompleted: 0, successRate: 0,
          todayCounts: { total: 0, completed: 0, pending: 0, processing: 0, confirmed: 0, failed: 0, cancelled: 0, partiallyCompleted: 0 },
        },
        revenue: { total: 0, today: 0, thisMonth: 0, orderCount: 0, averageOrderValue: 0 },
        commissions: { totalCommission: 0, paidCommission: 0, pendingCommission: 0, commissionCount: 0 },
        wallet: { balance: 0, totalCredits: 0, totalDebits: 0, transactionCount: 0, subscriptionStatus: "inactive", recentTransactions: [] },
        charts: { labels: [], orders: [], revenue: [], completedOrders: [] },
        timeframe: "30d",
        generatedAt: new Date().toISOString(),
      }),
      fetchMonthlyRevenue: async () => {},
      setFilters: () => {},
      clearError: () => {},
      isInitialized: false,
    };
  }
  return context;
};
