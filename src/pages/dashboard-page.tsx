import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';
import { useOrder } from '../contexts/OrderContext';
import { Card, CardHeader, CardBody, Badge, Spinner } from '../design-system';
import { FaPhone, FaChartLine, FaWallet } from 'react-icons/fa';
import type { WalletTransaction } from '../types/wallet';

export const DashboardPage = () => {
  const { authState } = useAuth();
  const { walletBalance, getTransactionHistory } = useWallet();
  const { getAnalytics } = useOrder();
  
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
        
        // Load order analytics
        const analytics = await getAnalytics('30d');
        if (analytics) {
          setOrderStats({
            totalOrders: analytics.totalOrders,
            completedOrders: analytics.completedOrders,
            totalRevenue: analytics.totalRevenue,
            successRate: analytics.completionRate
          });
        }
      } catch (error) {
        // Failed to load dashboard data
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getTransactionHistory, getAnalytics]);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome section - Mobile-first design */}
      <Card className="md:hidden">
        <CardBody className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {authState.user?.fullName.split(' ')[0]}
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            Manage your telecom services and view your transaction history here.
          </p>
          <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
            <span className="text-sm text-gray-600">Wallet Balance</span>
            <span className="font-bold text-green-700">{formatAmount(walletBalance)}</span>
          </div>
        </CardBody>
      </Card>
      
      {/* Quick Actions */}
      <div>
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
      <div>
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
      
      {/* Transaction Chart - Placeholder */}
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
          <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
            <div className="text-center">
              <FaChartLine className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">Transaction chart will be displayed here</p>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Recent Transactions */}
      <Card>
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
