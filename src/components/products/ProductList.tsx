// src/components/products/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { FaPlus, FaFilter, FaSearch } from 'react-icons/fa';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductModal } from './ProductModal';
import { useProduct } from '../../contexts/ProductContext';
import type { Product } from '../../types/products';

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
    setFilters
  } = useProduct();

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
    fetchProducts({ ...filters, search: searchTerm });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await updateProduct(id, { isActive: !currentStatus });
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handlePageChange = (page: number) => {
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
        
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={16} />
          Add Product
        </button>
      </div>

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
      {(() => {
        let content;
        if (loading) {
          content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          );
        } else if (products.length === 0) {
          content = (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first product.</p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus size={16} />
                Add Product
              </button>
            </div>
          );
        } else {
          content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onView={handleView}
                />
              ))}
            </div>
          );
        }
        return content;
      })()}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
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
    </div>
  );
};
