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
    // First check wallet balance
    const walletInfo = await this.checkWalletBalance();
    const order = await this.getOrder(orderId);
    const item = order.items.find(item => item._id === itemId);
    
    if (item && walletInfo.balance < item.totalPrice) {
      throw new Error(`Insufficient wallet balance. Required: GH₵${item.totalPrice.toFixed(2)}, Available: GH₵${walletInfo.balance.toFixed(2)}`);
    }
    
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

  // Check wallet balance before processing
  async checkWalletBalance(): Promise<{ balance: number; sufficient: boolean; required?: number }> {
    const response = await apiClient.get('/api/wallet/info');
    return {
      balance: response.data.wallet.balance,
      sufficient: true // Will be updated based on order requirements
    };
  }

  // Get analytics
  async getAnalytics(timeframe = '30d'): Promise<OrderAnalytics> {
    const response = await apiClient.get('/api/orders/analytics/summary', { params: { timeframe } });
    return response.data.analytics;
  }

  // Get recent orders by user ID
  async getOrdersByUserId(userId: string, limit = 5): Promise<Order[]> {
    const response = await apiClient.get('/api/orders', { params: { createdBy: userId, limit, sort: '-createdAt' } });
    return response.data.orders || response.data.data || [];
  }
}

export const orderService = new OrderService();
