// src/components/products/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { 
  FaPlus, 
  FaFilter, 
  FaSearch, 
  FaEdit, 
  FaFileImport, 
  FaTrash
} from 'react-icons/fa';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductModal } from './ProductModal';
import { useProduct } from '../../contexts/ProductContext';
import type { Product } from '../../types/products';
import { BulkImportModal } from './BulkImportModal';

export const ProductList: React.FC = () => {
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    fetchProducts,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    setFilters
  } = useProduct();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
    fetchProducts({ ...filters, search: searchTerm });
  };
  
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Update pagination with new sort options
    fetchProducts(
      filters, 
      { sortBy: field, sortOrder: newDirection }
    );
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      await bulkDeleteProducts(selectedProducts);
      setSelectedProducts([]);
      setBulkMode(false);
    }
  };

  const selectProduct = (productId: string) => {
    setSelectedProducts(prev => [...prev, productId]);
  };

  const deselectProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id!));
    }
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setShowModal(true);
  };

  const onEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowModal(true);
  };

  const onViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowModal(true);
  };

  const onDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const onToggleProductStatus = async (id: string, currentStatus: boolean) => {
    await updateProduct(id, { isActive: !currentStatus });
  };

  const onPageChange = (page: number) => {
    fetchProducts(filters, { page });
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">
            Manage your product catalog and inventory
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileImport size={16} />
            <span className="hidden sm:inline">Bulk Import</span>
          </button>
          
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              bulkMode 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaEdit size={16} />
            <span className="hidden sm:inline">{bulkMode ? 'Exit Bulk' : 'Bulk Edit'}</span>
          </button>
        
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select All ({selectedProducts.length} selected)
                </span>
              </label>
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  <FaTrash size={12} />
                  Delete Selected ({selectedProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaFilter size={16} />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <ProductFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            fetchProducts(newFilters);
          }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {pagination.total}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Products</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => 
              p.variants.some(v => v.availableInventory <= v.lowStockThreshold)
            ).length}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`loading-${index}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first product or importing in bulk.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus size={16} />
              Add Product
            </button>
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaFileImport size={16} />
              Bulk Import
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onToggleStatus={onToggleProductStatus}
              onView={onViewProduct}
              selected={selectedProducts.includes(product._id!)}
              onSelect={(selected: boolean) => {
                if (selected) {
                  selectProduct(product._id!);
                } else {
                  deselectProduct(product._id!);
                }
              }}
              showBulkActions={bulkMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.pages }, (_, index) => {
            const page = index + 1;
            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 border rounded-lg ${
                  pagination.page === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          mode={modalMode}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchProducts(filters);
          }}
        />
      )}

      {showBulkImportModal && (
        <BulkImportModal
          isOpen={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          onSuccess={() => {
            setShowBulkImportModal(false);
            fetchProducts(filters);
          }}
        />
      )}
    </div>
  );
};
