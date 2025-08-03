// src/contexts/OrderContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type{
  Order,
  OrderFilters,
  OrderPagination,
  OrderAnalytics,
  CreateSingleOrderData,
  CreateBulkOrderData
} from '../types/order';
import { orderService } from '../services/order.service';
import { useToast } from '../design-system';

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
  analytics: OrderAnalytics | null;
  
  // Actions
  fetchOrders: (filters?: OrderFilters, pagination?: Partial<OrderPagination>) => Promise<void>;
  createSingleOrder: (orderData: CreateSingleOrderData) => Promise<void>;
  createBulkOrder: (orderData: CreateBulkOrderData) => Promise<void>;
  processOrderItem: (orderId: string, itemId: string) => Promise<void>;
  processBulkOrder: (orderId: string) => Promise<void>;
  bulkProcessOrders: (orderIds: string[], action: 'processing' | 'completed') => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string, notes?: string) => Promise<void>;
  processDraftOrders: () => Promise<{ processed: number; message: string; totalAmount: number }>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  getAnalytics: (timeframe?: string) => Promise<OrderAnalytics>;
  getAgentAnalytics: (timeframe?: string) => Promise<{
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    successRate: number;
    walletBalance: number;
    timeframe: string;
  }>;
  setFilters: (filters: OrderFilters) => void;
  clearError: () => void;
  isInitialized: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Helper to extract error message from axios or generic error
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { data?: { message?: string } }, message?: string };
    return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
  } else if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  });
  const [filters, setFilters] = useState<OrderFilters>({});
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  
  const { addToast } = useToast();

  // Initialize the provider
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const fetchOrders = useCallback(async (
    newFilters: OrderFilters = {},
    newPagination: Partial<OrderPagination> = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrders(newFilters, newPagination);
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to fetch orders');
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const createSingleOrder = useCallback(async (orderData: CreateSingleOrderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const order = await orderService.createSingleOrder(orderData);
      
      // Check if order was created as draft
      if (order.status === 'draft') {
        const message = `Order created as draft due to insufficient wallet balance. Please top up your wallet to process this order.`;
        setError(message);
        addToast(message, 'warning');
        await fetchOrders(filters);
        return; // Don't throw error, just return
      }
      
      addToast('Single order created successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to create order');
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchOrders, filters]);

  const createBulkOrder = useCallback(async (orderData: CreateBulkOrderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const summary = await orderService.createBulkOrder(orderData);
      addToast('Bulk order created successfully', 'success');
      await fetchOrders(filters);
      return summary;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to create bulk order');
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchOrders, filters]);

  const processOrderItem = useCallback(async (orderId: string, itemId: string) => {
    try {
      await orderService.processOrderItem(orderId, itemId);
      addToast('Order item processed successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to process order item');
      setError(message);
      
      // Check if it's a wallet balance error
      if (message.includes('Insufficient wallet balance')) {
        addToast(message, 'error');
        addToast('Please top up your wallet to continue processing orders', 'warning');
      } else {
        addToast(message, 'error');
      }
      throw new Error(message);
    }
  }, [addToast, fetchOrders, filters]);

  const processBulkOrder = useCallback(async (orderId: string) => {
    try {
      await orderService.processBulkOrder(orderId);
      addToast('Bulk order processing started', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to process bulk order');
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    }
  }, [addToast, fetchOrders, filters]);

  const bulkProcessOrders = useCallback(async (orderIds: string[], action: 'processing' | 'completed') => {
    try {
      await orderService.bulkProcessOrders(orderIds, action);
      addToast(`Bulk ${action} orders started`, 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, `Failed to bulk ${action} orders`);
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    }
  }, [addToast, fetchOrders, filters]);

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      await orderService.cancelOrder(orderId, reason);
      addToast('Order cancelled successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to cancel order');
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    }
  }, [addToast, fetchOrders, filters]);

  const updateOrderStatus = useCallback(async (orderId: string, status: string, notes?: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status, notes);
      addToast('Order status updated successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to update order status');
      setError(message);
      addToast(message, 'error');
      throw new Error(message);
    }
  }, [addToast, fetchOrders, filters]);

  const processDraftOrders = useCallback(async () => {
    try {
      const result = await orderService.processDraftOrders();
      // Removed toast notification - handled by component
      await fetchOrders(filters);
      return result;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to process draft orders');
      setError(message);
      // Removed toast notification - handled by component
      throw new Error(message);
    }
  }, [fetchOrders, filters]);

  const fetchAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const analyticsData = await orderService.getAnalytics(timeframe);
      setAnalytics(analyticsData);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to fetch analytics');
      setError(message);
      addToast(message, 'error');
    }
  }, [addToast]);

  const getAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const analytics = await orderService.getAnalytics(timeframe);
      return analytics;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch analytics');
        addToast('Failed to fetch analytics', 'error');
        throw err;
      } else {
        setError('Failed to fetch analytics');
        addToast('Failed to fetch analytics', 'error');
        throw err;
      }
    }
  }, [addToast]);

  const getAgentAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const analytics = await orderService.getAgentAnalytics(timeframe);
      return analytics;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch agent analytics');
        addToast('Failed to fetch agent analytics', 'error');
        throw err;
      } else {
        setError('Failed to fetch agent analytics');
        addToast('Failed to fetch agent analytics', 'error');
        throw err;
      }
    }
  }, [addToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = React.useMemo<OrderContextType>(() => ({
    orders,
    loading,
    error,
    pagination,
    filters,
    analytics,
    fetchOrders,
    createSingleOrder,
    // @ts-expect-error: createBulkOrder returns a value, but context type expects void. 
    // This is intentional to allow consumers to use the returned data.
    createBulkOrder,
    processOrderItem,
    processBulkOrder,
    bulkProcessOrders,
    cancelOrder,
    updateOrderStatus,
    processDraftOrders,
    fetchAnalytics,
    getAnalytics,
    getAgentAnalytics,
    setFilters,
    clearError,
    isInitialized,
  }), [
    orders,
    loading,
    error,
    pagination,
    filters,
    analytics,
    fetchOrders,
    createSingleOrder,
    createBulkOrder,
    processOrderItem,
    processBulkOrder,
    bulkProcessOrders,
    cancelOrder,
    updateOrderStatus,
    processDraftOrders,
    fetchAnalytics,
    getAnalytics,
    getAgentAnalytics,
    setFilters,
    clearError,
    isInitialized,
  ]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  if (!context.isInitialized) {
    // Return a fallback context while initializing
    return {
      orders: [],
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, pages: 0, limit: 20 },
      filters: {},
      analytics: null,
      fetchOrders: async () => {},
      createSingleOrder: async () => {},
      createBulkOrder: async () => {},
      processOrderItem: async () => {},
      processBulkOrder: async () => {},
      bulkProcessOrders: async () => {},
      cancelOrder: async () => {},
      updateOrderStatus: async () => {},
      processDraftOrders: async () => ({ processed: 0, message: '', totalAmount: 0 }),
      fetchAnalytics: async () => {},
      getAnalytics: async () => ({
        totalOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        completionRate: 0,
        averageOrderValue: 0,
        topProducts: []
      }),
      getAgentAnalytics: async () => ({
        totalOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        successRate: 0,
        walletBalance: 0,
        timeframe: '30d'
      }),
      setFilters: () => {},
      clearError: () => {},
      isInitialized: false
    };
  }
  return context;
};
