import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { BundleContext, type BundleContextType } from './bundle-context';
import { bundleService } from '../services/bundle.service';
import type { 
  Bundle,
  BundleFilters,
  BundleAnalytics
} from '../types/package';

interface BundleProviderProps {
  children: ReactNode;
}

export const BundleProvider: React.FC<BundleProviderProps> = ({ children }) => {
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
  const [filters, setFilters] = useState<BundleFilters>({});
  const [analytics, setAnalytics] = useState<BundleAnalytics | null>(null);
  
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
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bundles';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBundle = useCallback(async (bundleData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await bundleService.createBundle(bundleData);
      await fetchBundles(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create bundle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchBundles]);

  const updateBundle = useCallback(async (id: string, updateData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      await bundleService.updateBundle(id, updateData);
      await fetchBundles(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update bundle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchBundles]);

  const deleteBundle = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await bundleService.deleteBundle(id);
      await fetchBundles(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete bundle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchBundles]);

  const getBundle = useCallback(async (id: string): Promise<Bundle> => {
    try {
      return await bundleService.getBundle(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get bundle';
      setError(message);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const data = await bundleService.getBundleAnalytics(timeframe);
      setAnalytics(data);
    } catch (err: unknown) {
      // Silently fail analytics requests
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<BundleContextType>(() => ({
    bundles,
    loading,
    error,
    pagination,
    filters,
    analytics,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    getBundle,
    getBundlesByProvider,
    getBundlesByPackage,
    fetchAnalytics,
    setFilters,
    clearError,
  }), [
    bundles,
    loading,
    error,
    pagination,
    filters,
    analytics,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    getBundle,
    getBundlesByProvider,
    getBundlesByPackage,
    fetchAnalytics,
    clearError,
  ]);

  return (
    <BundleContext.Provider value={value}>
      {children}
    </BundleContext.Provider>
  );
}; 