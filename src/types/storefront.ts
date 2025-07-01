// src/types/storefront.types.ts
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  telegram?: string;
  website?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  socialLinks?: SocialLinks;
}

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface StorefrontTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  layout: 'grid' | 'list' | 'card';
  headerStyle: 'minimal' | 'classic' | 'modern';
}

export interface StorefrontFeatures {
  showPrices: boolean;
  allowOrders: boolean;
  showInventory: boolean;
  requireCustomerInfo: boolean;
  enableWhatsAppOrders: boolean;
  enableSearch: boolean;
  enableCategories: boolean;
}

export interface StorefrontAnalytics {
  totalViews: number;
  totalOrders: number;
  lastVisit?: Date;
}

export interface AnalyticsOrderStatus {
  _id: string;
  count: number;
  revenue?: number;
}

export interface AnalyticsOrder {
  total: number;
  byStatus: AnalyticsOrderStatus[];
  recent: AnalyticsRecentOrder[];
}

export interface AnalyticsRecentOrder {
  _id: string;
  orderNumber: string;
  customerInfo?: {
    name?: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

export interface AnalyticsProducts {
  total: number;
}

export interface AnalyticsStorefront {
  views: number;
  lastVisit?: string;
}

export interface ExtendedStorefrontAnalytics {
  storefront: AnalyticsStorefront;
  orders: AnalyticsOrder;
  products: AnalyticsProducts;
}

export interface CustomPage {
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
}

export interface Announcement {
  text?: string;
  isActive: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Storefront {
  _id?: string;
  name: string;
  description?: string;
  slug: string;
  tenantId: string;
  isActive: boolean;
  isPublic: boolean;
  logo?: string;
  banner?: string;
  favicon?: string;
  theme: StorefrontTheme;
  contactInfo: ContactInfo;
  seo: SEOConfig;
  currency: string;
  timezone: string;
  language: string;
  features: StorefrontFeatures;
  analytics: StorefrontAnalytics;
  customPages: CustomPage[];
  announcement: Announcement;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorefrontOrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  customerPhone?: string;
  bundleSize?: {
    value: number;
    unit: 'MB' | 'GB';
  };
}

export interface StorefrontOrder {
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: StorefrontOrderItem[];
}

export interface StorefrontProductFilters {
  category?: string;
  provider?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}
