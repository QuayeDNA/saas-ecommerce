// src/contexts/OrderContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
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
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  getAnalytics: (timeframe?: string) => Promise<OrderAnalytics>;
  setFilters: (filters: OrderFilters) => void;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  });
  const [filters, setFilters] = useState<OrderFilters>({});
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  
  const { addToast } = useToast();

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
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch orders');
        addToast('Failed to fetch orders', 'error');
      } else {
        setError('Failed to fetch orders');
        addToast('Failed to fetch orders', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const createSingleOrder = useCallback(async (orderData: CreateSingleOrderData) => {
    setLoading(true);
    setError(null);
    
    try {
      await orderService.createSingleOrder(orderData);
      addToast('Single order created successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create order');
        addToast('Failed to create order', 'error');
        throw err;
      } else {
        setError('Failed to create order');
        addToast('Failed to create order', 'error');
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchOrders, filters]);

  const createBulkOrder = useCallback(async (orderData: CreateBulkOrderData) => {
    setLoading(true);
    setError(null);
    
    try {
      await orderService.createBulkOrder(orderData);
      addToast('Bulk order created successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create bulk order');
        addToast('Failed to create bulk order', 'error');
        throw err;
      } else {
        setError('Failed to create bulk order');
        addToast('Failed to create bulk order', 'error');
        throw err;
      }
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
      if (err instanceof Error) {
        setError(err.message || 'Failed to process order item');
        addToast('Failed to process order item', 'error');
        throw err;
      } else {
        setError('Failed to process order item');
        addToast('Failed to process order item', 'error');
        throw err;
      }
    }
  }, [addToast, fetchOrders, filters]);

  const processBulkOrder = useCallback(async (orderId: string) => {
    try {
      await orderService.processBulkOrder(orderId);
      addToast('Bulk order processing started', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to process bulk order');
        addToast('Failed to process bulk order', 'error');
        throw err;
      } else {
        setError('Failed to process bulk order');
        addToast('Failed to process bulk order', 'error');
        throw err;
      }
    }
  }, [addToast, fetchOrders, filters]);

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      await orderService.cancelOrder(orderId, reason);
      addToast('Order cancelled successfully', 'success');
      await fetchOrders(filters);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to cancel order');
        addToast('Failed to cancel order', 'error');
        throw err;
      } else {
        setError('Failed to cancel order');
        addToast('Failed to cancel order', 'error');
        throw err;
      }
    }
  }, [addToast, fetchOrders, filters]);

  const fetchAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const analyticsData = await orderService.getAnalytics(timeframe);
      setAnalytics(analyticsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch analytics');
      } else {
        setError('Failed to fetch analytics');
      }
    }
  }, []);

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
    createBulkOrder,
    processOrderItem,
    processBulkOrder,
    cancelOrder,
    fetchAnalytics,
    getAnalytics,
    setFilters,
    clearError,
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
    cancelOrder,
    fetchAnalytics,
    getAnalytics,
    setFilters,
    clearError,
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
  return context;
};
