// src/contexts/package-context.ts
import { createContext } from 'react';
import type { 
  PackageGroup, 
  PackageFilters, 
  LowStockAlert,
  PackageAnalytics
} from '../types/package';

// Package context type
export interface PackageContextType {
  packages: PackageGroup[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: PackageFilters;
  lowStockAlerts: LowStockAlert[];
  analytics: PackageAnalytics | null;
  
  // Actions
  fetchPackages: (filters?: PackageFilters, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  createPackage: (packageData: Partial<PackageGroup>) => Promise<void>;
  updatePackage: (id: string, updateData: Partial<PackageGroup>) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  restorePackage: (id: string) => Promise<void>;
  fetchLowStockAlerts: () => Promise<void>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  setFilters: (filters: PackageFilters) => void;
  clearError: () => void;
}

// Create context with default values
export const PackageContext = createContext<PackageContextType>({
  packages: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0, limit: 20 },
  filters: {},
  lowStockAlerts: [],
  analytics: null,
  fetchPackages: async () => {},
  createPackage: async () => {},
  updatePackage: async () => {},
  deletePackage: async () => {},
  restorePackage: async () => {},
  fetchLowStockAlerts: async () => {},
  fetchAnalytics: async () => {},
  setFilters: () => {},
  clearError: () => {},
});
