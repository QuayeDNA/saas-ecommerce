/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/storefront/StorefrontAnalytics.tsx
import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaEye,
  FaShoppingCart,
  FaDollarSign,
  FaBox,
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
} from "react-icons/fa";
import { useStorefront } from "../../contexts/StorefrontContext";
import type { ExtendedStorefrontAnalytics } from "../../types/storefront";

interface StorefrontAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderStatus {
  _id: string;
  count: number;
  revenue?: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  status: string;
  customerInfo?: { name?: string };
  total: number;
  createdAt: string;
}

export const StorefrontAnalytics: React.FC<StorefrontAnalyticsProps> = ({
  isOpen,
  onClose,
}) => {
  const { analytics, fetchAnalytics } = useStorefront();
  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await fetchAnalytics(timeframe);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get trending icon
  const getTrendingIcon = (change: number) => {
    if (change > 0) {
      return <FaArrowUp className="text-green-500 text-xs" />;
    }
    if (change < 0) {
      return <FaArrowDown className="text-red-500 text-xs" />;
    }
    return null;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Helper function to get order status badge classes
  const getOrderStatusClasses = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "processing":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!isOpen) return null;

  const typedAnalytics = analytics as unknown as ExtendedStorefrontAnalytics;

  // Calculate derived metrics
  const getTotalRevenue = () => {
    if (!typedAnalytics?.orders?.byStatus) return 0;
    
    return typedAnalytics.orders.byStatus.reduce(
      (sum: number, status: any) => sum + (typeof status.revenue === "number" ? status.revenue : 0),
      0
    );
  };

  const getAverageOrderValue = () => {
    const total = typedAnalytics?.orders?.total ?? 0;
    if (total === 0) return 0;
    return getTotalRevenue() / total;
  };

  const getConversionRate = () => {
    const views = typedAnalytics?.storefront?.views ?? 0;
    const orders = typedAnalytics?.orders?.total ?? 0;
    if (views === 0) return 0;
    return (orders / views) * 100;
  };

  // Extract order status rendering logic
  const renderOrderStatusCard = (status: OrderStatus, index: number) => (
    <div
      key={index}
      className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg"
    >
      <div className="text-xl sm:text-2xl font-bold text-gray-900">
        {status.count}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 capitalize truncate">
        {status._id}
      </div>
      <div className="text-xs text-green-600 mt-1 truncate">
        {formatCurrency(status.revenue ?? 0)}
      </div>
    </div>
  );

  // Extract mobile order card rendering logic
  const renderMobileOrderCard = (order: RecentOrder) => (
    <div
      key={order._id}
      className="border border-gray-200 rounded-lg p-3"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-sm text-gray-900">
          {order.orderNumber}
        </span>
        <span className={getOrderStatusClasses(order.status)}>
          {order.status}
        </span>
      </div>
      <div className="space-y-1 text-xs text-gray-600">
        <div>
          Customer: {order.customerInfo?.name ?? "N/A"}
        </div>
        <div>
          Amount:{" "}
          <span className="font-medium text-gray-900">
            {formatCurrency(order.total)}
          </span>
        </div>
        <div>
          Date: {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  // Extract desktop order row rendering logic
  const renderDesktopOrderRow = (order: RecentOrder) => (
    <tr key={order._id}>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {order.orderNumber}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {order.customerInfo?.name ?? "N/A"}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(order.total)}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <span className={getOrderStatusClasses(order.status)}>
          {order.status}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );

  // Check if recent orders exist and have length
  const hasRecentOrders = typedAnalytics?.orders?.recent && 
                         typedAnalytics.orders.recent.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-4 sm:my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaChartLine className="text-purple-600 text-lg sm:text-xl" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Storefront Analytics
                </h2>
                <p className="text-sm text-gray-600">
                  Track your store performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
              >
                <FaFilter size={16} />
              </button>

              {/* Desktop Timeframe Selector */}
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="hidden sm:block px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 sm:hidden">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : typedAnalytics ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-blue-100 text-xs sm:text-sm">
                        Total Views
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {typedAnalytics.storefront?.views?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <FaEye className="text-xl sm:text-2xl lg:text-3xl text-blue-200 flex-shrink-0 ml-2" />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs sm:text-sm">
                    {getTrendingIcon(12)}
                    <span className="text-blue-100 truncate">
                      +12% from last period
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-green-100 text-xs sm:text-sm">
                        Total Orders
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {typedAnalytics.orders?.total?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <FaShoppingCart className="text-xl sm:text-2xl lg:text-3xl text-green-200 flex-shrink-0 ml-2" />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs sm:text-sm">
                    {getTrendingIcon(8)}
                    <span className="text-green-100 truncate">
                      +8% from last period
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-purple-100 text-xs sm:text-sm">
                        Revenue
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {formatCurrency(getTotalRevenue())}
                      </p>
                    </div>
                    <FaDollarSign className="text-xl sm:text-2xl lg:text-3xl text-purple-200 flex-shrink-0 ml-2" />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs sm:text-sm">
                    {getTrendingIcon(15)}
                    <span className="text-purple-100 truncate">
                      +15% from last period
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-orange-100 text-xs sm:text-sm">
                        Products
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                        {typedAnalytics.products?.total?.toLocaleString() ?? 0}
                      </p>
                    </div>
                    <FaBox className="text-xl sm:text-2xl lg:text-3xl text-orange-200 flex-shrink-0 ml-2" />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs sm:text-sm">
                    {getTrendingIcon(5)}
                    <span className="text-orange-100 truncate">
                      +5% from last period
                    </span>
                  </div>
                </div>
              </div>

              {/* Orders by Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                  Orders by Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {typedAnalytics.orders?.byStatus?.map((status: OrderStatus, index: number) =>
                    renderOrderStatusCard(status, index)
                  )}
                </div>
              </div>

              {/* Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                    Conversion Rate
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600">
                      {getConversionRate().toFixed(1)}%
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      {typedAnalytics.orders?.total ?? 0} orders from{" "}
                      {typedAnalytics.storefront?.views ?? 0} views
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                    Average Order Value
                  </h3>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">
                      {formatCurrency(getAverageOrderValue())}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      Per order average
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                  Recent Orders
                </h3>

                {hasRecentOrders ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-3">
                      {typedAnalytics.orders.recent.map((order: RecentOrder) =>
                        renderMobileOrderCard(order)
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {typedAnalytics.orders.recent.map((order: RecentOrder) =>
                            renderDesktopOrderRow(order)
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      No recent orders to display
                    </p>
                  </div>
                )}
              </div>

              {/* Last Visit */}
              {typedAnalytics.storefront?.lastVisit && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-600 flex-shrink-0" />
                    <span className="text-blue-800 font-medium text-sm">
                      Last visit:{" "}
                      {new Date(typedAnalytics.storefront.lastVisit).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <FaChartLine size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600">No analytics data available</p>
              <p className="text-sm text-gray-500 mt-1">
                Data will appear once your storefront receives visitors
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};