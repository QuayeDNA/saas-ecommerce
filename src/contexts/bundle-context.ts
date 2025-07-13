// src/contexts/bundle-context.ts
import { createContext } from 'react';
import type { 
  Bundle,
  BundleFilters,
  BundleAnalytics
} from '../types/package';

// Bundle context type
export interface BundleContextType {
  bundles: Bundle[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: BundleFilters;
  analytics: BundleAnalytics | null;
  
  // Actions
  fetchBundles: (filters?: BundleFilters, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  createBundle: (bundleData: any) => Promise<void>;
  updateBundle: (id: string, updateData: any) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
  getBundle: (id: string) => Promise<Bundle>;
  getBundlesByProvider: (providerId: string, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  getBundlesByPackage: (packageId: string, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  setFilters: (filters: BundleFilters) => void;
  clearError: () => void;
}

// Create context with default values
export const BundleContext = createContext<BundleContextType>({
  bundles: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0, limit: 20, hasNext: false, hasPrev: false },
  filters: {},
  analytics: null,
  fetchBundles: async () => {},
  createBundle: async () => {},
  updateBundle: async () => {},
  deleteBundle: async () => {},
  getBundle: async () => ({} as Bundle),
  getBundlesByProvider: async () => {},
  getBundlesByPackage: async () => {},
  fetchAnalytics: async () => {},
  setFilters: () => {},
  clearError: () => {},
}); 