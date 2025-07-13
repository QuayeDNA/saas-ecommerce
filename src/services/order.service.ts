// src/services/order.service.ts
import { apiClient } from '../utils/api-client';
import type {
  Order,
  OrderResponse,
  OrderFilters,
  OrderPagination,
  OrderAnalytics,
  CreateSingleOrderData,
  CreateBulkOrderData
} from '../types/order';

class OrderService {
  // Create single order
  async createSingleOrder(orderData: CreateSingleOrderData): Promise<Order> {
    const response = await apiClient.post('/api/orders/single', orderData);
    return response.data.order;
  }

  // Create bulk order
  async createBulkOrder(orderData: CreateBulkOrderData): Promise<{
    orderId: string;
    orderNumber: string;
    totalItems: number;
    items: Array<{ customerPhone: string; bundleSize?: { value: number; unit: string }; status: string }>;
  }> {
    const response = await apiClient.post('/api/orders/bulk', orderData);
    return {
      orderId: response.data.orderId,
      orderNumber: response.data.orderNumber,
      totalItems: response.data.totalItems,
      items: response.data.items
    };
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

  // Get analytics
  async getAnalytics(timeframe = '30d'): Promise<OrderAnalytics> {
    const response = await apiClient.get('/api/orders/analytics/summary', { params: { timeframe } });
    return response.data.analytics;
  }
}

export const orderService = new OrderService();
