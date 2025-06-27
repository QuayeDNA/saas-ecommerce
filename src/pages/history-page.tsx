import React from 'react';

export const HistoryPage: React.FC = () => {
  // Sample transaction data
  const transactions = [
    { id: 1, network: 'MTN', phone: '233551234567', amount: 50, status: 'success', date: '2025-06-20' },
    { id: 2, network: 'Vodafone', phone: '233201234567', amount: 20, status: 'success', date: '2025-06-19' },
    { id: 3, network: 'AirtelTigo', phone: '233271234567', amount: 100, status: 'failed', date: '2025-06-19' },
    { id: 4, network: 'MTN', phone: '233557654321', amount: 75, status: 'success', date: '2025-06-18' },
    { id: 5, network: 'Vodafone', phone: '233209876543', amount: 30, status: 'success', date: '2025-06-17' },
    { id: 6, network: 'MTN', phone: '233552345678', amount: 25, status: 'failed', date: '2025-06-16' },
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="ml-4 text-sm text-gray-500">
          <span className="mx-1">Home</span> &gt;
          <span className="mx-1">Dashboard</span> &gt;
          <span className="mx-1">History</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">All Transactions</h2>
          
          {/* Filter controls */}
          <div className="flex space-x-4">
            <select className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Networks</option>
              <option value="mtn">MTN</option>
              <option value="vodafone">Vodafone</option>
              <option value="airteltigo">AirtelTigo</option>
            </select>
            
            <select className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        
        {/* Transactions table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.network}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">GHS {transaction.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
