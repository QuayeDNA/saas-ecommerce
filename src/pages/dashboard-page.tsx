import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import type { Network } from '../types';

export const DashboardPage = () => {
  const { authState } = useAuth();
  
  // Sample transaction data
  const recentTransactions = [
    { id: 1, network: 'MTN', phone: '233551234567', amount: 50, status: 'success', date: '2025-06-20' },
    { id: 2, network: 'Vodafone', phone: '233201234567', amount: 20, status: 'success', date: '2025-06-19' },
    { id: 3, network: 'AirtelTigo', phone: '233271234567', amount: 100, status: 'failed', date: '2025-06-19' },
  ];
  
  // Network quick links
  const networks: { name: Network; color: string; bgColor: string }[] = [
    { name: 'MTN', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { name: 'Vodafone', color: 'bg-red-500', bgColor: 'bg-red-50' },
    { name: 'AirtelTigo', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  ];
  
  return (
    <div className="space-y-5">
      {/* Welcome section - Only visible on mobile */}
      <section className="md:hidden">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-xl font-semibold">Welcome, {authState.user?.fullName.split(' ')[0]}</h1>
          <p className="text-gray-600 text-sm">Manage your telecom services and view your transaction history here.</p>
          <div className="mt-3 bg-green-50 p-3 rounded-md flex justify-between">
            <span className="text-sm text-gray-600">Wallet Balance</span>
            <span className="font-bold text-green-700">GH¢{authState.user?.walletBalance.toFixed(2)}</span>
          </div>
        </div>
      </section>
      
      {/* Quick Links */}
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {networks.map((network) => (
            <Link
              key={network.name}
              to={`/dashboard/${network.name.toLowerCase()}`}
              className={`${network.bgColor} border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow transition-shadow flex items-center`}
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
            </Link>
          ))}
        </div>
      </section>
      
      {/* Stats */}
      <section>
        <h2 className="text-lg font-medium text-gray-800 mb-3">Account Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Total Orders</div>
            <div className="text-xl sm:text-2xl font-bold">23</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Amount Spent</div>
            <div className="text-xl sm:text-2xl font-bold">GH¢754.50</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Success Rate</div>
            <div className="text-xl sm:text-2xl font-bold">95%</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-gray-500 text-xs sm:text-sm">Wallet Balance</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">GH¢{authState.user?.walletBalance.toFixed(2)}</div>
          </div>
        </div>
      </section>
      
      {/* Transaction Chart - Placeholder */}
      <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Last 30 Days Transactions</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none">
            View Details
          </button>
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
          <Link to="/dashboard/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all
          </Link>
        </div>
        
        {/* Mobile view - card layout */}
        <div className="sm:hidden space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex justify-between">
                <div className="font-medium">{transaction.network}</div>
                <div className="text-right">
                  <span 
                    className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                      transaction.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <div className="text-gray-500">{transaction.phone}</div>
                <div className="font-semibold">GH¢{transaction.amount}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{transaction.date}</div>
            </div>
          ))}
        </div>
        
        {/* Desktop view - table layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Network
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
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
                <tr key={transaction.id}>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.network}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{transaction.phone}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium">GH¢{transaction.amount}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
