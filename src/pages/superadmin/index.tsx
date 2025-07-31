import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaBuilding, FaClipboardList, FaWallet, FaCog, FaChartLine, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { userService, type DashboardStats, type ChartData } from "../../services/user.service";
import { colors } from "../../design-system/tokens";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const quickLinks = [
  { to: "/superadmin/users", label: "Manage Users", icon: <FaUsers className="text-blue-600 text-2xl" /> },
  { to: "/superadmin/providers", label: "Manage Providers", icon: <FaBuilding className="text-green-600 text-2xl" /> },
  { to: "/superadmin/orders", label: "View Orders", icon: <FaClipboardList className="text-yellow-600 text-2xl" /> },
  { to: "/superadmin/wallet", label: "Wallet & Transactions", icon: <FaWallet className="text-purple-600 text-2xl" /> },
  { to: "/superadmin/settings", label: "Settings", icon: <FaCog className="text-gray-600 text-2xl" /> },
];

// Skeleton loading components
const MetricCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
    <div className="h-80 bg-gray-200 rounded"></div>
  </div>
);

const StatsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stats first (faster to load)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const statsData = await userService.fetchDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError('Failed to load dashboard stats');
        // Stats error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Load charts after stats (heavier data)
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoadingCharts(true);
        const chartDataResponse = await userService.fetchChartData();
        setChartData(chartDataResponse);
      } catch (err) {
        // Chart data error
        // Don't set error for charts as they're not critical
      } finally {
        setLoadingCharts(false);
      }
    };

    // Small delay to prioritize stats loading
    const timer = setTimeout(fetchCharts, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
      case 'verified':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
      case 'verified':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'failed':
      case 'rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const createLineChartData = (labels: string[], userData: number[], orderData: number[], revenueData: number[]) => ({
    labels,
    datasets: [
      {
        label: 'User Registrations',
        data: userData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: orderData,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Revenue (GHS)',
        data: revenueData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  });

  const createPieChartData = (labels: string[], data: number[], colors: string[]) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  });

  if (error && !stats) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: colors.brand.primary }}>
          Welcome, Super Admin!
        </h1>
        <p className="text-gray-600">Platform overview and analytics dashboard</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : stats ? (
          <>
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.total.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{stats.users.newThisWeek} this week
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaUsers className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.total)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    +{formatCurrency(stats.revenue.thisWeek)} this week
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaMoneyBillWave className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.orders.total.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.orders.successRate}% success rate
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaClipboardList className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.activeAgents}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {stats.rates.agentActivation}% activation rate
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaCheckCircle className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Quick Actions - Moved here for better UX */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {link.icon}
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      {loadingCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : chartData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart - Activity Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Activity Over Time (Last 30 Days)
            </h3>
            <div className="h-80">
              <Line 
                options={lineChartOptions} 
                data={createLineChartData(
                  chartData.labels,
                  chartData.userRegistrations,
                  chartData.orders,
                  chartData.revenue
                )} 
              />
            </div>
          </div>

          {/* Pie Charts Row */}
          <div className="space-y-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
              <div className="h-64">
                <Pie 
                  data={createPieChartData(
                    ['Completed', 'Pending', 'Failed'],
                    [chartData.orderStatus.completed, chartData.orderStatus.pending, chartData.orderStatus.failed],
                    ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)']
                  )}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Detailed Statistics */}
      {loadingStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              User Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Agents</span>
                <span className="font-medium">{stats.users.agents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Customers</span>
                <span className="font-medium">{stats.users.customers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified Users</span>
                <span className="font-medium">{stats.users.verified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Agents</span>
                <span className="font-medium text-yellow-600">{stats.users.pendingAgents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verification Rate</span>
                <span className="font-medium text-green-600">{stats.rates.userVerification}%</span>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaClipboardList className="text-yellow-600" />
              Order Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Orders</span>
                <span className="font-medium text-green-600">{stats.orders.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="font-medium text-yellow-600">{stats.orders.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed Orders</span>
                <span className="font-medium text-red-600">{stats.orders.failed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-medium">{stats.orders.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">{stats.orders.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Revenue & Provider Stats */}
      {loadingStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              Revenue Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-medium text-green-600">{formatCurrency(stats.revenue.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-medium">{formatCurrency(stats.revenue.thisWeek)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-medium">{formatCurrency(stats.revenue.thisMonth)}</span>
              </div>
            </div>
          </div>

          {/* Provider Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              Provider Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Providers</span>
                <span className="font-medium">{stats.providers.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Providers</span>
                <span className="font-medium text-green-600">{stats.providers.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="font-medium">{stats.providers.newThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Activity */}
      {loadingStats ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-2 bg-gray-50 rounded animate-pulse">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : stats ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-purple-600" />
            Recent Activity
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Recent Users</h4>
              <div className="space-y-2">
                {stats.recentActivity.users.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBgColor(user.status)} ${getStatusColor(user.status)}`}>
                      {user.userType}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Recent Orders</h4>
              <div className="space-y-2">
                {stats.recentActivity.orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBgColor(order.status)} ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {stats.recentActivity.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(transaction.amount)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBgColor(transaction.type)} ${getStatusColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
} 