// src/contexts/package-context.ts
import { createContext } from 'react';
import type { 
  Package, 
  Bundle,
  PackageFilters, 
  BundleFilters,
  PackageAnalytics,
  BundleAnalytics
} from '../types/package';

// Package context type
export interface PackageContextType {
  packages: Package[];
  bundles: Bundle[] | undefined;
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
  packageFilters: PackageFilters;
  bundleFilters: BundleFilters;
  packageAnalytics: PackageAnalytics | null;
  bundleAnalytics: BundleAnalytics | null;
  
  // Package Actions
  fetchPackages: (filters?: PackageFilters, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  createPackage: (packageData: any) => Promise<void>;
  updatePackage: (id: string, updateData: any) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  restorePackage: (id: string) => Promise<void>;
  getPackage: (id: string) => Promise<Package>;
  
  // Bundle Actions
  fetchBundles: (filters?: BundleFilters, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  createBundle: (bundleData: any) => Promise<void>;
  updateBundle: (id: string, updateData: any) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
  getBundle: (id: string) => Promise<Bundle>;
  getBundlesByProvider: (providerId: string, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  getBundlesByPackage: (packageId: string, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  
  // Analytics
  fetchPackageAnalytics: (timeframe?: string) => Promise<void>;
  fetchBundleAnalytics: (timeframe?: string) => Promise<void>;
  
  // Filters
  setPackageFilters: (filters: PackageFilters) => void;
  setBundleFilters: (filters: BundleFilters) => void;
  clearError: () => void;
}

// Create context with default values
export const PackageContext = createContext<PackageContextType>({
  packages: [],
  bundles: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0, limit: 20, hasNext: false, hasPrev: false },
  packageFilters: {},
  bundleFilters: {},
  packageAnalytics: null,
  bundleAnalytics: null,
  fetchPackages: async () => {},
  createPackage: async () => {},
  updatePackage: async () => {},
  deletePackage: async () => {},
  restorePackage: async () => {},
  getPackage: async () => ({} as Package),
  fetchBundles: async () => {},
  createBundle: async () => {},
  updateBundle: async () => {},
  deleteBundle: async () => {},
  getBundle: async () => ({} as Bundle),
  getBundlesByProvider: async () => {},
  getBundlesByPackage: async () => {},
  fetchPackageAnalytics: async () => {},
  fetchBundleAnalytics: async () => {},
  setPackageFilters: () => {},
  setBundleFilters: () => {},
  clearError: () => {},
});
