// src/services/order.service.ts
import axios from 'axios';
import { apiClient } from '../utils/api-client';
import type {
  Order,
  OrderResponse,
  OrderFilters,
  OrderPagination,
  OrderAnalytics,
  CreateSingleOrderData,
  CreateBulkOrderData,
  DuplicateCheckResult
} from '../types/order';

interface DuplicateError extends Error {
  code: 'DUPLICATE_ORDER_DETECTED';
  duplicateInfo: DuplicateCheckResult;
}

class OrderService {
  // Create single order
  async createSingleOrder(orderData: CreateSingleOrderData): Promise<Order> {
    try {
      const response = await apiClient.post('/api/orders/single', orderData);
      return response.data.order;
    } catch (error: unknown) {
      // Check if this is a duplicate order error from the backend
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const responseData = error.response.data;
        if (responseData?.code === 'DUPLICATE_ORDER_DETECTED') {
          // Create a custom error with the proper structure
          const duplicateError = new Error(responseData.message);
          (duplicateError as DuplicateError).code = 'DUPLICATE_ORDER_DETECTED';
          (duplicateError as DuplicateError).duplicateInfo = responseData.duplicateInfo;
          throw duplicateError;
        }
      }
      
      // Re-throw the original error if it's not a duplicate error
      throw error;
    }
  }

  // Create bulk order
  async createBulkOrder(orderData: CreateBulkOrderData): Promise<{
    orderId: string;
    orderNumber: string;
    totalItems: number;
    items: Array<{ customerPhone: string; bundleSize?: { value: number; unit: string }; status: string }>;
  }> {
    try {
      const response = await apiClient.post('/api/orders/bulk', orderData);
      return {
        orderId: response.data.orderId,
        orderNumber: response.data.orderNumber,
        totalItems: response.data.totalItems,
        items: response.data.items
      };
    } catch (error: unknown) {
      // Check if this is a duplicate order error from the backend
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const responseData = error.response.data;
        if (responseData?.code === 'DUPLICATE_ORDER_DETECTED') {
          // Create a custom error with the proper structure
          const duplicateError = new Error(responseData.message);
          (duplicateError as DuplicateError).code = 'DUPLICATE_ORDER_DETECTED';
          (duplicateError as DuplicateError).duplicateInfo = responseData.duplicateInfo;
          throw duplicateError;
        }
      }
      
      // Re-throw the original error if it's not a duplicate error
      throw error;
    }
  }

  // Get orders with filtering and pagination
  async getOrders(
    filters: OrderFilters = {},
    pagination: Partial<OrderPagination> = {}
  ): Promise<OrderResponse> {
    const params = { ...filters, ...pagination };
    const response = await apiClient.get('/api/orders', { params });
    return response.data;
  }

  // Get single order
  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data.order;
  }

  // Process single order item
  async processOrderItem(orderId: string, itemId: string): Promise<Order> {
    const response = await apiClient.post(`/api/orders/${orderId}/items/${itemId}/process`);
    return response.data.order;
  }

  // Process bulk order
  async processBulkOrder(orderId: string): Promise<void> {
    await apiClient.post(`/api/orders/${orderId}/process-bulk`);
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiClient.post(`/api/orders/${orderId}/cancel`, { reason });
    return response.data.order;
  }

  // Update order status manually
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<Order> {
    const response = await apiClient.patch(`/api/orders/${orderId}/status`, { status, notes });
    return response.data.order;
  }

  // Bulk process multiple orders
  async bulkProcessOrders(orderIds: string[], action: 'processing' | 'completed'): Promise<{
    successful: Array<{ orderId: string; orderNumber: string; newStatus: string }>;
    failed: Array<{ orderId: string; reason: string }>;
    total: number;
  }> {
    const response = await apiClient.post('/api/orders/bulk-process', { orderIds, action });
    return response.data.results;
  }

  // Check wallet balance before processing
  async checkWalletBalance(): Promise<{ balance: number; sufficient: boolean; required?: number }> {
    const response = await apiClient.get('/api/wallet/info');
    return {
      balance: response.data.wallet.balance,
      sufficient: true // Will be updated based on order requirements
    };
  }

  // Process draft orders when wallet is topped up
  async processDraftOrders(): Promise<{
    processed: number;
    message: string;
    totalAmount: number;
  }> {
    const response = await apiClient.post('/api/orders/process-drafts');
    return response.data;
  }

  // Get analytics
  async getAnalytics(timeframe = '30d'): Promise<OrderAnalytics> {
    const response = await apiClient.get('/api/orders/analytics/summary', { params: { timeframe } });
    return response.data.analytics;
  }

  // Get agent analytics for dashboard
  async getAgentAnalytics(timeframe = '30d'): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    successRate: number;
    walletBalance: number;
    timeframe: string;
  }> {
    const response = await apiClient.get('/api/orders/analytics/agent', { params: { timeframe } });
    return response.data.analytics;
  }

  // Get monthly revenue for current user
  async getMonthlyRevenue(): Promise<{
    monthlyRevenue: number;
    orderCount: number;
    month: string;
  }> {
    const response = await apiClient.get('/api/orders/analytics/monthly-revenue');
    return response.data.data;
  }

  // Get daily spending for current user
  async getDailySpending(): Promise<{
    dailySpending: number;
    orderCount: number;
    date: string;
  }> {
    const response = await apiClient.get('/api/orders/analytics/daily-spending');
    return response.data.data;
  }

  // Get recent orders by user ID
  async getOrdersByUserId(userId: string, limit = 5): Promise<Order[]> {
    const response = await apiClient.get('/api/orders', { params: { createdBy: userId, limit, sort: '-createdAt' } });
    return response.data.orders || response.data.data || [];
  }
}

export const orderService = new OrderService();
