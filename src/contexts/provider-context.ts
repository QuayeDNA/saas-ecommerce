// src/contexts/provider-context.ts
import { createContext } from 'react';
import type { Provider, ProviderFilters } from '../types/package';

// Provider context type
export interface ProviderContextType {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: ProviderFilters;
  
  // Actions
  fetchProviders: (filters?: ProviderFilters, pagination?: Partial<{ page: number; limit: number }>) => Promise<void>;
  createProvider: (providerData: Partial<Provider>) => Promise<void>;
  updateProvider: (id: string, updateData: Partial<Provider>) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  restoreProvider: (id: string) => Promise<void>;
  setFilters: (filters: ProviderFilters) => void;
  clearError: () => void;
}

// Create context with default values
export const ProviderContext = createContext<ProviderContextType>({
  providers: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 0, limit: 20 },
  filters: {},
  fetchProviders: async () => {},
  createProvider: async () => {},
  updateProvider: async () => {},
  deleteProvider: async () => {},
  restoreProvider: async () => {},
  setFilters: () => {},
  clearError: () => {},
});
