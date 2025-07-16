import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';
import { useOrder } from '../contexts/OrderContext';
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
  const networks: { name: string; code: string; color: string; bgColor: string }[] = [
    { name: 'MTN', code: 'MTN', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { name: 'TELECEL', code: 'TELECEL', color: 'bg-red-500', bgColor: 'bg-red-50' },
    { name: 'AT BIG TIME', code: 'AT-BIG-TIME', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { name: 'AT iShare Premium', code: 'AT-ISHARE-PREMIUM', color: 'bg-purple-600', bgColor: 'bg-purple-50' },
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
        console.error('Failed to load dashboard data:', error);
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
    return type === 'credit' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-5">
      {/* Welcome section - Only visible on mobile */}
      <section className="md:hidden">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-xl font-semibold">Welcome, {authState.user?.fullName.split(' ')[0]}</h1>
          <p className="text-gray-600 text-sm">Manage your telecom services and view your transaction history here.</p>
          <div className="mt-3 bg-green-50 p-3 rounded-md flex justify-between">
            <span className="text-sm text-gray-600">Wallet Balance</span>
            <span className="font-bold text-green-700">{formatAmount(walletBalance)}</span>
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {networks.map((network) => (
            <button
              key={network.code}
              onClick={() => handleQuickLinkClick(network.code)}
              className={`${network.bgColor} border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow transition-shadow flex items-center text-left`}
            >
              <div className={`${network.color} text-white p-3 rounded-full mr-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">{network.name}</div>
                <div className="text-xs text-gray-600">Order airtime or data</div>
              </div>
            </button>
          ))}
        </div>
      </section>
      
      {/* Stats */}
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Account Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Total Orders</div>
            <div className="text-xl sm:text-2xl font-bold">{orderStats.totalOrders}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Amount Spent</div>
            <div className="text-xl sm:text-2xl font-bold">{formatAmount(orderStats.totalRevenue)}</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Success Rate</div>
            <div className="text-xl sm:text-2xl font-bold">{orderStats.successRate}%</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Wallet Balance</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">{formatAmount(walletBalance)}</div>
          </div>
        </div>
      </section>
      
      {/* Transaction Chart - Placeholder */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Last 30 Days Transactions</h3>
          <Link to="/wallet" className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none">
            View Details
          </Link>
        </div>
        <div className="bg-gray-50 h-52 sm:h-64 flex items-center justify-center rounded">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-gray-400 mt-2">Transaction chart will be displayed here</p>
          </div>
        </div>
      </section>
      
      {/* Recent Transactions */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
          <Link to="./wallet" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any wallet transactions yet.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile view - card layout */}
            <div className="sm:hidden space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between">
                    <div className="font-medium capitalize">{transaction.type}</div>
                    <div className="text-right">
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${getTransactionStatusColor(transaction.type)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="text-gray-500">{transaction.description}</div>
                    <div className="font-semibold">{formatAmount(transaction.amount)}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(transaction.createdAt)}</div>
                </div>
              ))}
            </div>
            
            {/* Desktop view - table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{transaction.description}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium">{formatAmount(transaction.amount)}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionStatusColor(transaction.type)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Create Order Modal */}
      {/* Removed CreateOrderModal and related modal state */}
    </div>
  );
};
