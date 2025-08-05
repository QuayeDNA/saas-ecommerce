import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';
import { useOrder } from '../contexts/OrderContext';
import { useProvider } from '../hooks/use-provider';
import { Card, CardHeader, CardBody, Badge, Spinner } from '../design-system';
import { FaPhone, FaChartLine, FaWallet, FaShoppingCart } from 'react-icons/fa';
import type { WalletTransaction } from '../types/wallet';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components including Filler and Bar plugins
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement);

// Define the 4 specific packages that should be displayed
const quickActionPackages = [
  {
    name: 'MTN',
    code: 'MTN',
    providerCode: 'MTN',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    name: 'TELECEL',
    code: 'TELECEL',
    providerCode: 'TELECEL',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
  },
  {
    name: 'AT BIG TIME',
    code: 'AT-BIG-TIME',
    providerCode: 'AT',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'AT iShare Premium',
    code: 'AT-ISHARE-PREMIUM',
    providerCode: 'AT',
    color: 'bg-purple-600',
    bgColor: 'bg-purple-50',
  }
];

export const DashboardPage = () => {
  const { authState } = useAuth();
  const { walletBalance, getTransactionHistory } = useWallet();
  const { getAgentAnalytics } = useOrder();
  const { providers, loading: providersLoading } = useProvider();
  
  // State for modals and data
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const navigate = useNavigate();

  // Handle quick link click
  const handleQuickLinkClick = (packageCode: string) => {
    navigate(`./packages/${packageCode.toLowerCase()}`);
  };

  // Get provider logo by provider code
  const getProviderLogo = (providerCode: string) => {
    const provider = providers.find(p => p.code === providerCode);
    return provider?.logo;
  };

  // Get package with provider logo
  const getPackagesWithLogos = () => {
    return quickActionPackages.map(packageItem => {
      const providerLogo = getProviderLogo(packageItem.providerCode);
      return {
        ...packageItem,
        logo: providerLogo
      };
    });
  };

  // Format transaction amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Get transaction status color
  const getTransactionStatusColor = (type: string) => {
    return type === 'credit' ? 'success' : 'error';
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load recent transactions (last 5)
        const transactionData = await getTransactionHistory(1, 5);
        if (transactionData) {
          setRecentTransactions(transactionData.transactions);
        }
        
        // Load agent analytics
        try {
          const analytics = await getAgentAnalytics('30d');
          if (analytics) {
            setOrderStats({
              totalOrders: analytics.totalOrders || 0,
              completedOrders: analytics.completedOrders || 0,
              totalRevenue: analytics.totalRevenue || 0,
              successRate: analytics.successRate || 0
            });
          }
        } catch (analyticsError) {
          console.error('Analytics error:', analyticsError);
          // Set default values if analytics fails
          setOrderStats({
            totalOrders: 0,
            completedOrders: 0,
            totalRevenue: 0,
            successRate: 0
          });
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        // Failed to load dashboard data
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getTransactionHistory, getAgentAnalytics]);

  // Prepare transaction chart data - Daily transaction amounts
  const prepareTransactionChartData = (transactions: WalletTransaction[]) => {
    if (transactions.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{
          label: 'Transaction Amount',
          data: [0],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      };
    }

    // Group transactions by date and sum amounts
    const groupedData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    return {
      labels,
      datasets: [{
        label: 'Transaction Amount (GH₵)',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };
  };

  // Prepare order analytics chart data - Order completion trends
  const prepareOrderAnalyticsChartData = () => {
    const labels = ['Total Orders', 'Completed', 'Pending'];
    const data = [orderStats.totalOrders, orderStats.completedOrders, orderStats.totalOrders - orderStats.completedOrders];
    
    return {
      labels,
      datasets: [{
        label: 'Orders',
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue for total
          'rgba(34, 197, 94, 0.8)',    // Green for completed
          'rgba(251, 191, 36, 0.8)'    // Yellow for pending
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)'
        ],
        borderWidth: 1
      }]
    };
  };

  const transactionChartData = prepareTransactionChartData(recentTransactions);
  const orderAnalyticsChartData = prepareOrderAnalyticsChartData();

  const transactionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `Amount: GH₵${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return `₵${value}`;
          }
        }
      }
    }
  };

  const orderAnalyticsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y} orders`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome section - Mobile-first design */}
      <Card className="md:hidden dashboard-welcome">
        <CardBody className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {authState.user?.fullName.split(' ')[0]}
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Manage your telecom services and view your transaction history here.
          </p>
          <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center wallet-balance">
            <span className="text-sm text-gray-600">Wallet Balance</span>
            <span className="font-bold text-green-700">{formatAmount(walletBalance)}</span>
          </div>
        </CardBody>
      </Card>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="text-lg font-medium text-gray-800 mb-3 px-2 sm:px-0">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <Spinner />
              <p className="text-gray-500 text-sm mt-2">Loading providers...</p>
            </div>
          ) : providersLoading ? (
            <div className="col-span-full text-center py-8">
              <Spinner />
              <p className="text-sm text-gray-500 mt-2">Loading provider data...</p>
            </div>
          ) : getPackagesWithLogos().length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <h3 className="text-sm font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-sm text-gray-500">
                Please add providers in the settings to see quick links.
              </p>
            </div>
          ) : (
            getPackagesWithLogos().map((packageItem) => (
              <Card 
                key={packageItem.code} 
                variant="interactive" 
                size="sm"
                className="cursor-pointer"
                onClick={() => handleQuickLinkClick(packageItem.code)}
              >
                <CardBody className="text-center">
                  <div className={`${packageItem.color} text-white rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center overflow-hidden`}>
                    {packageItem.logo?.url && !failedLogos.has(packageItem.code) ? (
                      <img 
                        src={packageItem.logo.url} 
                        alt={packageItem.logo.alt || packageItem.name}
                        className="w-12 h-12 object-cover rounded-full"
                        onError={() => {
                          setFailedLogos(prev => new Set(prev).add(packageItem.code));
                        }}
                      />
                    ) : (
                      <FaPhone className="w-6 h-6" />
                    )}
                  </div>
                  <div className="font-semibold text-sm">{packageItem.name}</div>
                  <div className="text-xs text-gray-600 mt-1">Order data</div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="account-overview">
        <h2 className="text-lg font-medium text-gray-800 mb-3 px-2 sm:px-0">Account Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card size="sm">
            <CardBody className="text-center">
              <div className="text-gray-500 text-xs mb-1">Total Orders</div>
              <div className="text-xl font-bold">{orderStats.totalOrders}</div>
            </CardBody>
          </Card>
          <Card size="sm">
            <CardBody className="text-center">
              <div className="text-gray-500 text-xs mb-1">Amount Spent</div>
              <div className="text-xl font-bold">{formatAmount(orderStats.totalRevenue)}</div>
            </CardBody>
          </Card>
          <Card size="sm">
            <CardBody className="text-center">
              <div className="text-gray-500 text-xs mb-1">Success Rate</div>
              <div className="text-xl font-bold">{orderStats.successRate}%</div>
            </CardBody>
          </Card>
          <Card size="sm">
            <CardBody className="text-center">
              <div className="text-gray-500 text-xs mb-1">Wallet Balance</div>
              <div className="text-xl font-bold text-green-700">{formatAmount(walletBalance)}</div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Order Analytics (Last 30 Days)</h3>
            <Link to="./orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Orders
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-40 sm:h-48">
              <Spinner />
            </div>
          ) : orderStats.totalOrders === 0 ? (
            <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
              <div className="text-center">
                <FaShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No order data available</p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <Bar data={orderAnalyticsChartData} options={orderAnalyticsChartOptions} />
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Transaction Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Transaction Trends</h3>
            <Link to="./wallet" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-40 sm:h-48">
              <Spinner />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
              <div className="text-center">
                <FaChartLine className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No transaction data available</p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <Line data={transactionChartData} options={transactionChartOptions} />
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Recent Transactions */}
      <Card className="recent-transactions">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
            <Link to="./wallet" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaWallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No transactions</h3>
              <p className="text-sm text-gray-500">
                You don't have any wallet transactions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize text-sm">{transaction.type}</span>
                      <Badge 
                        variant="subtle" 
                        colorScheme={getTransactionStatusColor(transaction.type)}
                        size="xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{transaction.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(transaction.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatAmount(transaction.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
