import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { PackageContext, type PackageContextType } from './package-context';
import { packageService } from '../services/package.service';
import type { 
  PackageGroup, 
  PackageFilters, 
  LowStockAlert,
  PackageAnalytics
} from '../types/package';

interface PackageProviderProps {
  children: ReactNode;
}

export const PackageProvider: React.FC<PackageProviderProps> = ({ children }) => {
  const [packages, setPackages] = useState<PackageGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  });
  const [filters, setFilters] = useState<PackageFilters>({});
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [analytics, setAnalytics] = useState<PackageAnalytics | null>(null);
  
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
      
      // Update filters if new ones are provided
      if (Object.keys(newFilters).length > 0) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch packages';
      setError(message);
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPackage = useCallback(async (packageData: Partial<PackageGroup>) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.createPackage(packageData);
      await fetchPackages(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create package';
      setError(message);
      console.error("Failed to create package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchPackages]);

  const updatePackage = useCallback(async (id: string, updateData: Partial<PackageGroup>) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.updatePackage(id, updateData);
      await fetchPackages(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update package';
      setError(message);
      console.error("Failed to update package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchPackages]);

  const deletePackage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.deletePackage(id);
      await fetchPackages(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete package';
      setError(message);
      console.error("Failed to delete package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchPackages]);

  const restorePackage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await packageService.restorePackage(id);
      await fetchPackages(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore package';
      setError(message);
      console.error("Failed to restore package", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchPackages]);

  const fetchLowStockAlerts = useCallback(async () => {
    try {
      const alerts = await packageService.getLowStockAlerts();
      setLowStockAlerts(alerts);
    } catch (err: unknown) {
      console.error("Failed to fetch low stock alerts", err);
    }
  }, []);

  const fetchAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const data = await packageService.getAnalytics(timeframe);
      setAnalytics(data);
    } catch (err: unknown) {
      console.error("Failed to fetch analytics", err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<PackageContextType>(() => ({
    packages,
    loading,
    error,
    pagination,
    filters,
    lowStockAlerts,
    analytics,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    restorePackage,
    fetchLowStockAlerts,
    fetchAnalytics,
    setFilters,
    clearError,
  }), [
    packages,
    loading,
    error,
    pagination,
    filters,
    lowStockAlerts,
    analytics,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    restorePackage,
    fetchLowStockAlerts,
    fetchAnalytics,
    clearError,
  ]);

  return (
    <PackageContext.Provider value={value}>
      {children}
    </PackageContext.Provider>
  );
};