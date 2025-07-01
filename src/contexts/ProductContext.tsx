// src/contexts/ProductContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { 
  Product, 
  ProductFilters, 
  ProductPagination, 
  LowStockAlert, 
  ProductAnalytics, 
  BulkImportResult,
  BulkProductData,
  BulkUpdateData,
  BulkValidationResult
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
  bulkCreateProducts: (data: BulkProductData) => Promise<BulkImportResult>;
  bulkUpdateProducts: (updates: BulkUpdateData[]) => Promise<void>;
  bulkDeleteProducts: (productIds: string[]) => Promise<void>;
  downloadBulkTemplate: () => Promise<void>;
  validateBulkImport: (data: BulkProductData) => Promise<BulkValidationResult>;
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

  const bulkCreateProducts = useCallback(
  async (data: BulkProductData): Promise<BulkImportResult> => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...data,
        products: data.products?.map(p => ({
          ...p,
          name: p.name ?? '',
          category: p.category ?? 'Uncategorized',
        })) as Product[] | undefined
      };
      const response = await productService.bulkCreateProducts(payload);
      addToast(
        `Bulk import completed: ${response.successful.length} successful, ${response.failed.length} failed`,
        'success'
      );
      await fetchProducts(filters);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk create products';
      setError(message);
      addToast('Failed to bulk create products', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  },
  [addToast, fetchProducts, filters]
);

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

  const bulkUpdateProducts = useCallback(async (updates: BulkUpdateData[]) => {
    setLoading(true);
    setError(null);

    try {
      // Map BulkUpdateData[] to Partial<Product>[]
      const productUpdates: Partial<Product>[] = updates.map(update => ({
        id: update.productId,
        ...update.updateData
      }));
      await productService.bulkUpdateProducts(productUpdates);
      addToast('Bulk update completed successfully', 'success');
      await fetchProducts(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk update products';
      setError(message);
      addToast('Failed to bulk update products', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchProducts, filters]);

  const bulkDeleteProducts = useCallback(async (productIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      await productService.bulkDeleteProducts(productIds);
      addToast('Bulk delete completed successfully', 'success');
      await fetchProducts(filters);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk delete products';
      setError(message);
      addToast('Failed to bulk delete products', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchProducts, filters]);

  const downloadBulkTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await productService.downloadBulkTemplate();
      addToast('Bulk template downloaded', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download bulk template';
      setError(message);
      addToast('Failed to download bulk template', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const validateBulkImport = useCallback(async (data: BulkProductData): Promise<BulkValidationResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await productService.validateBulkImport(data) as BulkValidationResult;
      addToast('Bulk import validated', 'success');
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to validate bulk import';
      setError(message);
      addToast('Failed to validate bulk import', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

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
    bulkCreateProducts,
    bulkUpdateProducts,
    bulkDeleteProducts,
    downloadBulkTemplate,
    validateBulkImport,
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
    bulkCreateProducts,
    bulkUpdateProducts,
    bulkDeleteProducts,
    downloadBulkTemplate,
    validateBulkImport,
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
