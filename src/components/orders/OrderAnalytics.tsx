// src/components/orders/OrderAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaCheckCircle, 
  FaClock,
  FaDollarSign,
  FaFileImport
} from 'react-icons/fa';
import { useOrder } from '../../contexts/OrderContext';

export const OrderAnalytics: React.FC = () => {
  const { analytics, fetchAnalytics } = useOrder();
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [fetchAnalytics, timeframe]);

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      icon: FaShoppingCart,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Completed Orders',
      value: analytics.completedOrders,
      icon: FaCheckCircle,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Pending Orders',
      value: analytics.pendingOrders,
      icon: FaClock,
      color: 'yellow',
      change: '-5%'
    },
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: FaDollarSign,
      color: 'purple',
      change: '+15%'
    },
    {
      title: 'Bulk Orders',
      value: analytics.bulkOrders,
      icon: FaFileImport,
      color: 'indigo',
      change: '+20%'
    },
    {
      title: 'Completion Rate',
      value: `${analytics.completionRate}%`,
      icon: FaChartLine,
      color: 'pink',
      change: '+3%'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50',
      pink: 'bg-pink-500 text-pink-600 bg-pink-50'
    };
    return colors[color as keyof typeof colors].split(' ');
  };

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Order Analytics</h2>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const [textColor, lightBg] = getColorClasses(stat.color);
          const Icon = stat.icon;
          
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stat.change} from last period
                  </p>
                </div>
                
                <div className={`p-3 rounded-full ${lightBg}`}>
                  <Icon className={`text-xl ${textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <FaShoppingCart className="mx-auto text-2xl text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">New Single Order</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
            <FaFileImport className="mx-auto text-2xl text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">New Bulk Order</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center">
            <FaClock className="mx-auto text-2xl text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Pending Orders</span>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center">
            <FaChartLine className="mx-auto text-2xl text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};
