import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';
import { useOrder } from '../contexts/OrderContext';
import { Card, CardHeader, CardBody, Badge, Spinner } from '../design-system';
import { FaPhone, FaChartLine, FaWallet } from 'react-icons/fa';
import type { WalletTransaction } from '../types/wallet';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const DashboardPage = () => {
  const { authState } = useAuth();
  const { walletBalance, getTransactionHistory } = useWallet();
  const { getAgentAnalytics } = useOrder();
  
  // State for modals and data
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Network quick links with updated provider codes
  const networks: { name: string; code: string; color: string; bgColor: string; icon: React.ReactNode }[] = [
    { 
      name: 'MTN', 
      code: 'MTN', 
      color: 'bg-yellow-500', 
      bgColor: 'bg-yellow-50',
      icon: <FaPhone className="w-5 h-5" />
    },
    { 
      name: 'TELECEL', 
      code: 'TELECEL', 
      color: 'bg-red-500', 
      bgColor: 'bg-red-50',
      icon: <FaPhone className="w-5 h-5" />
    },
    { 
      name: 'AT BIG TIME', 
      code: 'AT-BIG-TIME', 
      color: 'bg-blue-500', 
      bgColor: 'bg-blue-50',
      icon: <FaPhone className="w-5 h-5" />
    },
    { 
      name: 'AT iShare Premium', 
      code: 'AT-ISHARE-PREMIUM', 
      color: 'bg-purple-600', 
      bgColor: 'bg-purple-50',
      icon: <FaPhone className="w-5 h-5" />
    },
  ];

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
          console.log('Agent analytics:', analytics); // Debug log
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

  // Handle quick link click
  const handleQuickLinkClick = (providerCode: string) => {
    navigate(`./packages/${providerCode.toLowerCase()}`);
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

  // Prepare chart data from transactions
  const prepareChartData = (transactions: WalletTransaction[]) => {
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

  const chartData = prepareChartData(recentTransactions);

  const chartOptions = {
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
          {networks.map((network) => (
            <Card 
              key={network.code} 
              variant="interactive" 
              size="sm"
              className="cursor-pointer"
              onClick={() => handleQuickLinkClick(network.code)}
            >
              <CardBody className="text-center">
                <div className={`${network.color} text-white p-2 rounded-full mx-auto mb-2 w-10 h-10 flex items-center justify-center`}>
                  {network.icon}
                </div>
                <div className="font-semibold text-sm">{network.name}</div>
                <div className="text-xs text-gray-600 mt-1">Order airtime or data</div>
              </CardBody>
            </Card>
          ))}
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
      
      {/* Transaction Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Last 30 Days Transactions</h3>
            <Link to="/wallet" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
              <Line data={chartData} options={chartOptions} />
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
