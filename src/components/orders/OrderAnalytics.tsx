// src/components/orders/OrderAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaClock, 
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaDownload,
  FaCalendarAlt
} from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';
import type { OrderAnalytics } from '../../types/order';

interface OrderAnalyticsProps {
  className?: string;
}

export const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({ className = '' }) => {
  const { getAnalytics } = useOrder();
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAnalytics(timeframe);
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [getAnalytics, timeframe]);

  const timeframes = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FaChartLine className="text-4xl mx-auto mb-4" />
          <p>Unable to load analytics</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      icon: FaChartBar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'Completed',
      value: analytics.completedOrders,
      icon: FaCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%'
    },
    {
      title: 'Pending',
      value: analytics.pendingOrders,
      icon: FaClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-5%'
    },
    {
      title: 'Revenue',
      value: `GH₵${analytics.totalRevenue.toFixed(2)}`,
      icon: FaChartLine,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaChartLine className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Analytics</h2>
              <p className="text-sm text-gray-600">Performance overview and insights</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeframe === tf.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {/* Export analytics */}}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaDownload size={14} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`text-lg ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Completion Rate */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaChartPie className="text-blue-600" />
              <h3 className="font-medium text-gray-900">Completion Rate</h3>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Success Rate</span>
                <span>{analytics.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.completionRate}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {analytics.completedOrders} of {analytics.totalOrders} orders completed successfully
            </div>
          </div>

          {/* Order Types */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaChartBar className="text-green-600" />
              <h3 className="font-medium text-gray-900">Order Types</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bulk Orders</span>
                <span className="text-sm font-medium text-gray-900">{analytics.bulkOrders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Single Orders</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalOrders - analytics.bulkOrders}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bulk Percentage</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalOrders > 0 ? Math.round((analytics.bulkOrders / analytics.totalOrders) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaCalendarAlt className="text-purple-600" />
              <h3 className="font-medium text-gray-900">Recent Activity</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Orders completed today</span>
                <span className="font-medium text-gray-900">12</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Orders pending</span>
                <span className="font-medium text-gray-900">{analytics.pendingOrders}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Processing</span>
                <span className="font-medium text-gray-900">5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-blue-600" />
            <h3 className="font-medium text-gray-900">Order Performance</h3>
          </div>
          
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FaChartLine className="text-3xl mx-auto mb-2" />
              <p className="text-sm">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
