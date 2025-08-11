// src/types/order.types.ts

// Duplicate order detection types
export interface DuplicateOrder {
  orderNumber: string;
  orderId: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
}

export interface DuplicateItem {
  customerPhone: string;
  dataVolume: string;
  lastOrderNumber: string;
  lastOrderTime: string;
  minutesAgo: number;
  rawItem: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  canProceed: boolean;
  message: string;
  duplicateOrders?: DuplicateOrder[];
  duplicateItems?: DuplicateItem[];
  safeItems?: string[];
  details?: {
    customerPhone?: string;
    bundleName?: string;
    lastOrderTime?: string;
    lastOrderNumber?: string;
    minutesAgo?: number;
    totalSimilarOrders?: number;
    totalItems?: number;
    duplicateCount?: number;
    safeCount?: number;
    timeWindow?: number;
  };
}

export interface DuplicateOrderError extends Error {
  code: 'DUPLICATE_ORDER_DETECTED';
  duplicateInfo: DuplicateCheckResult;
}

export interface OrderItem {
  _id?: string;
  packageGroup: string;
  packageItem: string;
  packageDetails: {
    name: string;
    code: string;
    price: number;
    dataVolume?: number;
    validity?: number;
    provider?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customerPhone: string;
  bundleSize?: {
    value: number;
    unit: 'MB' | 'GB';
  };
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processingError?: string;
  processedAt?: Date;
  processedBy?: string;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  orderType: 'single' | 'bulk' | 'regular';
  customer?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'failed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'wallet';
  paymentReference?: string;
  bulkData?: {
    rawInput: string;
    totalItems: number;
    successfulItems: number;
    failedItems: number;
  };
  processingNotes?: string;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  tenantId: string;
  createdBy: string;
  processedBy?: string;
  notes?: string;
  tags?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderFilters {
  status?: string;
  orderType?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface OrderResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  bulkOrders: number;
  completionRate: number;
  timeframe: string;
}

export interface CreateSingleOrderData {
  packageGroupId: string;
  packageItemId: string;
  customerPhone: string;
  bundleSize?: {
    value: number;
    unit: 'MB' | 'GB';
  };
  quantity?: number;
}

export interface CreateBulkOrderData {
  items: string[];
}
