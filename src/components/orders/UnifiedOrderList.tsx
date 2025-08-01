// src/components/orders/UnifiedOrderList.tsx
import React, { useState, useEffect } from 'react';
import { useOrder } from '../../hooks/use-order';
import { Button, Input } from '../../design-system';
import { FaSearch, FaFilter, FaCheck, FaTimes, FaClock, FaMoneyBillWave, FaChartBar, FaDownload, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import type { Order, OrderFilters } from '../../types/order';
import { UnifiedOrderCard } from './UnifiedOrderCard';
import { UnifiedOrderTable } from './UnifiedOrderTable';
import { DraftOrdersHandler } from './DraftOrdersHandler';

interface UnifiedOrderListProps {
  isAdmin: boolean;
  isAgent?: boolean;
  userType?: string;
}

export const UnifiedOrderList: React.FC<UnifiedOrderListProps> = ({
  isAdmin,
  isAgent,
  userType,
}) => {
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    updateOrderStatus,
    cancelOrder,
    setFilters,
    bulkProcessOrders
  } = useOrder();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showDraftHandler, setShowDraftHandler] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o: Order) => o.status === 'pending').length,
    confirmed: orders.filter((o: Order) => o.status === 'confirmed').length,
    processing: orders.filter((o: Order) => o.status === 'processing').length,
    completed: orders.filter((o: Order) => o.status === 'completed').length,
    cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
    failed: orders.filter((o: Order) => o.status === 'failed').length,
    draft: orders.filter((o: Order) => o.status === 'draft').length,
    single: orders.filter((o: Order) => o.orderType === 'single').length,
    bulk: orders.filter((o: Order) => o.orderType === 'bulk').length,
    totalRevenue: orders.reduce((sum: number, order: Order) => sum + order.total, 0),
    paid: orders.filter((o: Order) => o.paymentStatus === 'paid').length,
    pendingPayment: orders.filter((o: Order) => o.paymentStatus === 'pending').length,
    failedPayment: orders.filter((o: Order) => o.paymentStatus === 'failed').length,
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters: OrderFilters = {
      search: searchTerm,
      status: statusFilter || undefined,
      orderType: orderTypeFilter || undefined,
      paymentStatus: paymentStatusFilter || undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setOrderTypeFilter('');
    setPaymentStatusFilter('');
    setDateRange({ startDate: '', endDate: '' });
    setFilters({});
    fetchOrders();
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      // Failed to update order status
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(orderId, 'Cancelled by user');
          } catch (error) {
      // Failed to cancel order
    }
    }
  };

  const handleBulkAction = async (action: 'cancel' | 'process' | 'complete') => {
    if (selectedOrders.length === 0) return;

    const confirmMessage = {
      cancel: 'Are you sure you want to cancel the selected orders?',
      process: 'Are you sure you want to process the selected orders?',
      complete: 'Are you sure you want to mark the selected orders as completed?'
    };

    if (window.confirm(confirmMessage[action])) {
      try {
        if (action === 'cancel') {
          for (const orderId of selectedOrders) {
            await cancelOrder(orderId, 'Bulk cancelled by admin');
          }
        } else {
          const bulkAction = action === 'process' ? 'processing' : 'completed';
          await bulkProcessOrders(selectedOrders, bulkAction);
        }
        setSelectedOrders([]);
          } catch (error) {
      // Failed to perform bulk action
    }
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o: Order) => o._id || ''));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              {isAdmin ? 'Order Management' : isAgent ? 'Agent Orders' : 'My Orders'}
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Monitor and manage all platform orders' : isAgent ? 'Manage your assigned orders' : 'Track your order history and status'}
              {userType && (
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {userType}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchOrders()}>
              <FaSync className="mr-2" />
              Refresh
            </Button>
            {(isAdmin || isAgent) && (
              <Button variant="outline">
                <FaDownload className="mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartBar className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaMoneyBillWave className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Draft Orders Alert - Only for Agents */}
      {isAgent && stats.draft > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 mb-2">
                Draft Orders Require Attention
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                You have {stats.draft} order(s) that were created as drafts due to insufficient wallet balance. 
                These orders need to be processed once you top up your wallet.
              </p>
              <Button
                onClick={() => setShowDraftHandler(true)}
                variant="primary"
                size="sm"
              >
                <FaExclamationTriangle className="mr-2" />
                Manage Draft Orders
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                label="Search orders"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number, customer, or phone..."
                leftIcon={<FaSearch className="text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type
              </label>
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="bulk">Bulk</option>
                <option value="regular">Regular</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-end gap-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                <FaSearch className="mr-2" />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Search</span>
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">
                <FaFilter className="mr-2" />
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">View Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions - Admin and Agent */}
      {selectedOrders.length > 0 && (isAdmin || isAgent) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-blue-800 font-medium">
              {selectedOrders.length} order(s) selected for bulk processing
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('process')}
                className="flex-1 sm:flex-none"
              >
                <FaClock className="mr-1" />
                <span className="hidden sm:inline">Start Processing</span>
                <span className="sm:hidden">Process</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('complete')}
                className="flex-1 sm:flex-none"
              >
                <FaCheck className="mr-1" />
                <span className="hidden sm:inline">Mark as Completed</span>
                <span className="sm:hidden">Complete</span>
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleBulkAction('cancel')}
                className="flex-1 sm:flex-none"
              >
                <FaTimes className="mr-1" />
                <span className="hidden sm:inline">Cancel Orders</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Display */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChartBar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {isAdmin ? 'No orders match your current filters.' : 'You haven\'t placed any orders yet.'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <UnifiedOrderCard
              key={order._id}
              order={order}
              isAdmin={isAdmin}
              onView={(order) => window.open(`/orders/${order._id}`, '_blank')}
              onUpdateStatus={handleStatusUpdate}
              onCancel={handleCancelOrder}
              onSelect={handleSelectOrder}
              isSelected={selectedOrders.includes(order._id || '')}
            />
          ))}
        </div>
      ) : (
        <UnifiedOrderTable
          orders={orders}
          isAdmin={isAdmin}
          onView={(order) => window.open(`/orders/${order._id}`, '_blank')}
          onUpdateStatus={handleStatusUpdate}
          onCancel={handleCancelOrder}
          onSelect={handleSelectOrder}
          selectedOrders={selectedOrders}
          onSelectAll={handleSelectAll}
          loading={loading}
        />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={page === pagination.page ? "primary" : "outline"}
                  onClick={() => fetchOrders(filters, { page })}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Draft Orders Handler Modal */}
      <DraftOrdersHandler
        isOpen={showDraftHandler}
        onClose={() => setShowDraftHandler(false)}
      />
    </div>
  );
}; 