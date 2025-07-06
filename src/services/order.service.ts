// src/services/order.service.ts
import axios from 'axios';
import type {
  Order,
  OrderResponse,
  OrderFilters,
  OrderPagination,
  OrderAnalytics,
  CreateSingleOrderData,
  CreateBulkOrderData
} from '../types/order';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050';

class OrderService {
  private readonly api = axios.create({
    baseURL: `${API_BASE_URL}/api/orders`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add auth token to requests
    // Add auth token to requests from cookies
    this.api.interceptors.request.use((config) => {
      // Helper to get cookie value by name
      function getCookie(name: string): string | null {
        const match = RegExp(new RegExp('(^| )' + name + '=([^;]+)')).exec(document.cookie);
        return match ? decodeURIComponent(match[2]) : null;
      }
      const token = getCookie('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });
  }

  // Create single order
  async createSingleOrder(orderData: CreateSingleOrderData): Promise<Order> {
    const response = await this.api.post('/single', orderData);
    return response.data.order;
  }

  // Create bulk order
  async createBulkOrder(orderData: CreateBulkOrderData): Promise<Order> {
    const response = await this.api.post('/bulk', orderData);
    return response.data.order;
  }

  // Get orders with filtering and pagination
  async getOrders(
    filters: OrderFilters = {},
    pagination: Partial<OrderPagination> = {}
  ): Promise<OrderResponse> {
    const params = { ...filters, ...pagination };
    const response = await this.api.get('/', { params });
    return response.data;
  }

  // Get single order
  async getOrder(id: string): Promise<Order> {
    const response = await this.api.get(`/${id}`);
    return response.data.order;
  }

  // Process single order item
  async processOrderItem(orderId: string, itemId: string): Promise<Order> {
    const response = await this.api.post(`/${orderId}/items/${itemId}/process`);
    return response.data.order;
  }

  // Process bulk order
  async processBulkOrder(orderId: string): Promise<void> {
    await this.api.post(`/${orderId}/process-bulk`);
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await this.api.post(`/${orderId}/cancel`, { reason });
    return response.data.order;
  }

  // Get analytics
  async getAnalytics(timeframe = '30d'): Promise<OrderAnalytics> {
    const response = await this.api.get('/analytics/summary', { params: { timeframe } });
    return response.data.analytics;
  }
}

export const orderService = new OrderService();
