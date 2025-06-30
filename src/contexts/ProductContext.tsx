// src/contexts/ProductContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { 
  Product, 
  ProductFilters, 
  ProductPagination, 
  LowStockAlert, 
  ProductAnalytics 
} from '../types/products';
import { productService } from '../services/product.service';
import { useToast } from '../design-system/components/toast';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: ProductFilters;
  lowStockAlerts: LowStockAlert[];
  analytics: ProductAnalytics | null;
  
  // Actions
  fetchProducts: (filters?: ProductFilters, pagination?: Partial<ProductPagination>) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, updateData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  fetchLowStockAlerts: () => Promise<void>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  clearError: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  });
  const [filters, setFilters] = useState<ProductFilters>({});
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  
  const { addToast } = useToast();

  const fetchProducts = useCallback(async (
    newFilters: ProductFilters = {},
    newPagination: Partial<ProductPagination> = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productService.getProducts(newFilters, newPagination);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      addToast('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const createProduct = useCallback(async (productData: Partial<Product>) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.createProduct(productData);
      addToast('Product created successfully', 'success');
      await fetchProducts(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      addToast('Failed to create product', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchProducts, filters]);

  const updateProduct = useCallback(async (id: string, updateData: Partial<Product>) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.updateProduct(id, updateData);
      addToast('Product updated successfully', 'success');
      await fetchProducts(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      addToast('Failed to update product', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchProducts, filters]);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.deleteProduct(id);
      addToast('Product deleted successfully', 'success');
      await fetchProducts(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
      addToast('Failed to delete product', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchProducts, filters]);
  const restoreProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await productService.restoreProduct(id);
      addToast('Product restored successfully', 'success');
      await fetchProducts(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restore product';
      setError(message);
      addToast('Failed to restore product', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchProducts, filters]);
  const fetchLowStockAlerts = useCallback(async () => {
    try {
      const alerts = await productService.getLowStockAlerts();
      setLowStockAlerts(alerts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch low stock alerts';
      setError(message);
    }
  }, []);
  const fetchAnalytics = useCallback(async (timeframe = '30d') => {
    try {
      const analyticsData = await productService.getAnalytics(timeframe);
      setAnalytics(analyticsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = React.useMemo<ProductContextType>(() => ({
    products,
    loading,
    error,
    pagination,
    filters,
    lowStockAlerts,
    analytics,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    fetchLowStockAlerts,
    fetchAnalytics,
    setFilters,
    clearError,
  }), [
    products,
    loading,
    error,
    pagination,
    filters,
    lowStockAlerts,
    analytics,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    fetchLowStockAlerts,
    fetchAnalytics,
    setFilters,
    clearError,
  ]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};
