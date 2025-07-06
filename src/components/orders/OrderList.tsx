// src/components/orders/OrderList.tsx
import React, { useEffect, useState } from 'react';
import { FaPlus, FaFilter, FaSearch, FaFileImport, FaTh, FaList, FaChartLine } from 'react-icons/fa';
import { OrderCard } from './OrderCard';
import { OrderTable } from './OrderTable';
import { OrderFilters } from './OrderFilters';
import { OrderModal } from './OrderModal';
import { CreateOrderModal } from './CreateOrderModal';
import { OrderAnalyticsPage } from './OrderAnalytics';
import { useOrder } from '../../contexts/OrderContext';
import type { Order } from '../../types/order';

export const OrderList: React.FC = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    processOrderItem,
    processBulkOrder,
    cancelOrder,
    setFilters
  } = useOrder();

  const [showFilters, setShowFilters] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<'single' | 'bulk'>('single');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
    fetchOrders({ ...filters, search: searchTerm });
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleProcess = async (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order?.orderType === 'bulk') {
      await processBulkOrder(orderId);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(orderId, 'Cancelled by agent');
    }
  };

  const handleProcessItem = async (orderId: string, itemId: string) => {
    await processOrderItem(orderId, itemId);
  };

  const handleCreateSingle = () => {
    setCreateModalType('single');
    setShowCreateModal(true);
  };

  const handleCreateBulk = () => {
    setCreateModalType('bulk');
    setShowCreateModal(true);
  };

  const handlePageChange = (page: number) => {
    fetchOrders(filters, { page });
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">
            Process and manage your mobile bundle orders
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCreateSingle}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={16} />
            <span className="hidden sm:inline">Single Order</span>
            <span className="sm:hidden">Single</span>
          </button>
          
          <button
            onClick={handleCreateBulk}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaFileImport size={16} />
            <span className="hidden sm:inline">Bulk Order</span>
            <span className="sm:hidden">Bulk</span>
          </button>
          
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAnalytics 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <FaChartLine size={16} />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>
        
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'cards' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Card View"
          >
            <FaTh size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Table View"
          >
            <FaList size={16} />
          </button>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaFilter size={16} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <OrderFilters
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            fetchOrders(newFilters);
          }}
        />
      )}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <OrderAnalyticsPage className="mb-6" />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {pagination.total}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {orders.filter(o => ['pending', 'processing'].includes(o.status)).length}
          </div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-xl sm:text-2xl font-bold text-orange-600">
            {orders.filter(o => o.orderType === 'bulk').length}
          </div>
          <div className="text-sm text-gray-600">Bulk Orders</div>
        </div>
      </div>

      {/* Order Grid */}
      {(() => {
        if (loading) {
          return viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={`loading-card-${index}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <OrderTable
              orders={[]}
              onView={handleView}
              onProcess={handleProcess}
              onCancel={handleCancel}
              onProcessItem={handleProcessItem}
              loading={true}
            />
          );
        } else if (orders.length === 0) {
          return (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first order.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleCreateSingle}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus size={16} />
                  Single Order
                </button>
                <button
                  onClick={handleCreateBulk}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaFileImport size={16} />
                  Bulk Order
                </button>
              </div>
            </div>
          );
        } else {
          return viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onView={handleView}
                  onProcess={handleProcess}
                  onCancel={handleCancel}
                  onProcessItem={handleProcessItem}
                />
              ))}
            </div>
          ) : (
            <OrderTable
              orders={orders}
              onView={handleView}
              onProcess={handleProcess}
              onCancel={handleCancel}
              onProcessItem={handleProcessItem}
              onRefresh={() => fetchOrders(filters)}
              loading={loading}
            />
          );
        }
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
          
          {[...Array(Math.min(pagination.pages, 5))].map((_, index) => {
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

      {/* Modals */}
      {showOrderModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onProcessItem={handleProcessItem}
        />
      )}

      {showCreateModal && (
        <CreateOrderModal
          type={createModalType}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchOrders(filters);
          }}
        />
      )}
    </div>
  );
};
