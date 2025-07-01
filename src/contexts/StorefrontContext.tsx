// src/contexts/StorefrontContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Storefront, StorefrontAnalytics } from '../types/storefront';
import { storefrontService } from '../services/storefront.service';
import { useToast } from '../design-system';

interface StorefrontContextType {
  storefront: Storefront | null;
  loading: boolean;
  error: string | null;
  analytics: StorefrontAnalytics | null;
  
  // Actions
  fetchStorefront: () => Promise<void>;
  createStorefront: (data: Partial<Storefront>) => Promise<void>;
  updateStorefront: (data: Partial<Storefront>) => Promise<void>;
  toggleStatus: () => Promise<void>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  checkSlugAvailability: (slug: string) => Promise<boolean>;
  clearError: () => void;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

export const StorefrontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<StorefrontAnalytics | null>(null);
  
  const { addToast } = useToast();

  const fetchStorefront = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await storefrontService.getMyStorefront();
      setStorefront(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to fetch storefront');
      } else {
        setError('Failed to fetch storefront');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createStorefront = useCallback(async (data: Partial<Storefront>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newStorefront = await storefrontService.createStorefront(data);
      setStorefront(newStorefront);
      addToast('Storefront created successfully!', 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to create storefront');
      } else {
        setError('Failed to create storefront');
      }
      addToast('Failed to create storefront', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const updateStorefront = useCallback(async (data: Partial<Storefront>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStorefront = await storefrontService.updateStorefront(data);
      setStorefront(updatedStorefront);
      addToast('Storefront updated successfully!', 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to update storefront');
      } else {
        setError('Failed to update storefront');
      }
      addToast('Failed to update storefront', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const toggleStatus = useCallback(async () => {
    try {
      const updatedStorefront = await storefrontService.toggleStorefrontStatus();
      setStorefront(updatedStorefront);
      addToast(
        `Storefront ${updatedStorefront.isActive ? 'activated' : 'deactivated'} successfully!`,
        'success'
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to toggle storefront status');
      } else {
        setError('Failed to toggle storefront status');
      }
      addToast('Failed to toggle storefront status', 'error');
    }
  }, [addToast]);

  const fetchAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const data = await storefrontService.getStorefrontAnalytics(timeframe);
      setAnalytics(data as unknown as StorefrontAnalytics);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to fetch analytics');
      } else {
        setError('Failed to fetch analytics');
      }
    }
  }, []);

  const checkSlugAvailability = useCallback(async (slug: string): Promise<boolean> => {
    try {
      return await storefrontService.checkSlugAvailability(slug);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to check slug availability');
      } else {
        setError('Failed to check slug availability');
      }
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = React.useMemo<StorefrontContextType>(() => ({
    storefront,
    loading,
    error,
    analytics,
    fetchStorefront,
    createStorefront,
    updateStorefront,
    toggleStatus,
    fetchAnalytics,
    checkSlugAvailability,
    clearError,
  }), [
    storefront,
    loading,
    error,
    analytics,
    fetchStorefront,
    createStorefront,
    updateStorefront,
    toggleStatus,
    fetchAnalytics,
    checkSlugAvailability,
    clearError,
  ]);

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (context === undefined) {
    throw new Error('useStorefront must be used within a StorefrontProvider');
  }
  return context;
};
