import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { PackageContext, type PackageContextType } from './package-context';
import { packageService } from '../services/package.service';
import { bundleService } from '../services/bundle.service';
import type { 
  Package, 
  Bundle,
  PackageFilters, 
  BundleFilters,
  PackageAnalytics,
  BundleAnalytics
} from '../types/package';

interface PackageProviderProps {
  children: ReactNode;
}

export const PackageProvider: React.FC<PackageProviderProps> = ({ children }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false
  });
  const [packageFilters, setPackageFilters] = useState<PackageFilters>({});
  const [bundleFilters, setBundleFilters] = useState<BundleFilters>({});
  const [packageAnalytics, setPackageAnalytics] = useState<PackageAnalytics | null>(null);
  const [bundleAnalytics, setBundleAnalytics] = useState<BundleAnalytics | null>(null);
  
  // Package operations
  const fetchPackages = useCallback(async (
    newFilters: PackageFilters = {},
    newPagination: Partial<{ page: number; limit: number }> = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await packageService.getPackages(newFilters, newPagination);
      setPackages(response.packages);
      setPagination(response.pagination);
      
      if (Object.keys(newFilters).length > 0) {
        setPackageFilters(prev => ({ ...prev, ...newFilters }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch packages';
      setError(message);
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPackage = useCallback(async (packageData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.createPackage(packageData);
      await fetchPackages(packageFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create package';
      setError(message);
      console.error("Failed to create package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [packageFilters, fetchPackages]);

  const updatePackage = useCallback(async (id: string, updateData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.updatePackage(id, updateData);
      await fetchPackages(packageFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update package';
      setError(message);
      console.error("Failed to update package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [packageFilters, fetchPackages]);

  const deletePackage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.deletePackage(id);
      await fetchPackages(packageFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete package';
      setError(message);
      console.error("Failed to delete package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [packageFilters, fetchPackages]);

  const restorePackage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.restorePackage(id);
      await fetchPackages(packageFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore package';
      setError(message);
      console.error("Failed to restore package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [packageFilters, fetchPackages]);

  const getPackage = useCallback(async (id: string): Promise<Package> => {
    try {
      return await packageService.getPackage(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get package';
      setError(message);
      console.error("Failed to get package", err);
      throw err;
    }
  }, []);

  // Bundle operations
  const fetchBundles = useCallback(async (
    newFilters: BundleFilters = {},
    newPagination: Partial<{ page: number; limit: number }> = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bundleService.getBundles(newFilters, newPagination);
      setBundles(response.bundles);
      setPagination(response.pagination);
      
      if (Object.keys(newFilters).length > 0) {
        setBundleFilters(prev => ({ ...prev, ...newFilters }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bundles';
      setError(message);
      console.error("Failed to fetch bundles", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBundle = useCallback(async (bundleData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await bundleService.createBundle(bundleData);
      await fetchBundles(bundleFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create bundle';
      setError(message);
      console.error("Failed to create bundle", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bundleFilters, fetchBundles]);

  const updateBundle = useCallback(async (id: string, updateData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await bundleService.updateBundle(id, updateData);
      await fetchBundles(bundleFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update bundle';
      setError(message);
      console.error("Failed to update bundle", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bundleFilters, fetchBundles]);

  const deleteBundle = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await bundleService.deleteBundle(id);
      await fetchBundles(bundleFilters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete bundle';
      setError(message);
      console.error("Failed to delete bundle", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bundleFilters, fetchBundles]);

  const getBundle = useCallback(async (id: string): Promise<Bundle> => {
    try {
      return await bundleService.getBundle(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get bundle';
      setError(message);
      console.error("Failed to get bundle", err);
      throw err;
    }
  }, []);

  const getBundlesByProvider = useCallback(async (providerId: string, pagination?: Partial<{ page: number; limit: number }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bundleService.getBundlesByProvider(providerId, pagination);
      setBundles(response.bundles);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bundles by provider';
      setError(message);
      console.error("Failed to fetch bundles by provider", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBundlesByPackage = useCallback(async (packageId: string, pagination?: Partial<{ page: number; limit: number }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bundleService.getBundlesByPackage(packageId, pagination);
      setBundles(response.bundles);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bundles by package';
      setError(message);
      console.error("Failed to fetch bundles by package", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics
  const fetchPackageAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const data = await packageService.getAnalytics(timeframe);
      setPackageAnalytics(data);
    } catch (err: unknown) {
      console.error("Failed to fetch package analytics", err);
    }
  }, []);

  const fetchBundleAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const data = await bundleService.getBundleAnalytics(timeframe);
      setBundleAnalytics(data);
    } catch (err: unknown) {
      console.error("Failed to fetch bundle analytics", err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<PackageContextType>(() => ({
    packages,
    bundles,
    loading,
    error,
    pagination,
    packageFilters,
    bundleFilters,
    packageAnalytics,
    bundleAnalytics,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    restorePackage,
    getPackage,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    getBundle,
    getBundlesByProvider,
    getBundlesByPackage,
    fetchPackageAnalytics,
    fetchBundleAnalytics,
    setPackageFilters,
    setBundleFilters,
    clearError,
  }), [
    packages,
    bundles,
    loading,
    error,
    pagination,
    packageFilters,
    bundleFilters,
    packageAnalytics,
    bundleAnalytics,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    restorePackage,
    getPackage,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    getBundle,
    getBundlesByProvider,
    getBundlesByPackage,
    fetchPackageAnalytics,
    fetchBundleAnalytics,
    clearError,
  ]);

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
};