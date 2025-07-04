// src/contexts/provider-provider.tsx
import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ProviderContext, type ProviderContextType } from './provider-context';
import { providerService } from '../services/provider.service';
import type { Provider, ProviderFilters } from '../types/package';

interface ProviderProviderProps {
  children: ReactNode;
}

export const ProviderProvider: React.FC<ProviderProviderProps> = ({ children }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  });
  const [filters, setFilters] = useState<ProviderFilters>({});
  
  const fetchProviders = useCallback(async (
    newFilters: ProviderFilters = {},
    newPagination: Partial<{ page: number; limit: number }> = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await providerService.getProviders(newFilters, newPagination);
      setProviders(response.providers);
      setPagination(response.pagination);
      
      // Update filters if new ones are provided
      if (Object.keys(newFilters).length > 0) {
        setFilters(prev => ({ ...prev, ...newFilters }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch providers';
      setError(message);
      console.error("Failed to fetch providers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProvider = useCallback(async (providerData: Partial<Provider>) => {
    setLoading(true);
    setError(null);
    
    try {
      await providerService.createProvider(providerData);
      await fetchProviders(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create provider';
      setError(message);
      console.error("Failed to create provider", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchProviders]);

  const updateProvider = useCallback(async (id: string, updateData: Partial<Provider>) => {
    setLoading(true);
    setError(null);
    
    try {
      await providerService.updateProvider(id, updateData);
      await fetchProviders(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update provider';
      setError(message);
      console.error("Failed to update provider", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchProviders]);

  const deleteProvider = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await providerService.deleteProvider(id);
      await fetchProviders(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete provider';
      setError(message);
      console.error("Failed to delete provider", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchProviders]);

  const restoreProvider = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await providerService.restoreProvider(id);
      await fetchProviders(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore provider';
      setError(message);
      console.error("Failed to restore provider", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchProviders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<ProviderContextType>(() => ({
    providers,
    loading,
    error,
    pagination,
    filters,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    restoreProvider,
    setFilters,
    clearError,
  }), [
    providers,
    loading,
    error,
    pagination,
    filters,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    restoreProvider,
    clearError,
  ]);

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};
