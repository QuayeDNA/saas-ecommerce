import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../hooks';
import { type WalletTransaction } from '../types/wallet';
import { FaWallet, FaPlus, FaArrowUp, FaArrowDown, FaSync } from 'react-icons/fa';
import { Alert } from '../design-system';
import { TopUpRequestModal } from '../components/wallet/TopUpRequestModal';

export const WalletPage = () => {
  const {
    walletBalance,
    refreshWallet,
    isLoading,
    error,
    getTransactionHistory,
    requestTopUp,
  } = useWallet();
  
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Load transactions function
  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const result = await getTransactionHistory(currentPage);
      if (result) {
        setTransactions(result.transactions);
        setTotalPages(result.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [currentPage, getTransactionHistory]);

  // Fetch transaction history on page load and when page changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Listen for wallet balance changes and refresh transactions
  useEffect(() => {
    // Refresh transactions when wallet balance changes (indicating a transaction occurred)
    loadTransactions();
  }, [walletBalance, loadTransactions]);

  // Format date for display
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle top-up request submission
  const handleTopUpRequest = async (amount: number, description: string) => {
    setIsSubmittingRequest(true);
    try {
      await requestTopUp(amount, description);
      setSuccessMessage('Top-up request submitted successfully! An admin will review your request.');
      
      // Refresh transactions to show the new request
      await loadTransactions();
    } catch (err) {
      console.error('Failed to submit top-up request:', err);
      setSuccessMessage('Failed to submit top-up request. Please try again.');
    } finally {
      setIsSubmittingRequest(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': 
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'rejected': 
        return 'bg-red-100 text-red-800 border border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get transaction type icon and color
  const getTransactionTypeInfo = (type: string) => {
    if (type === 'credit') {
      return {
        icon: <FaArrowUp className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: <FaArrowDown className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your wallet balance and view transaction history</p>
        </div>
        <button 
          onClick={() => setShowTopUpModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          Request Top-Up
        </button>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <Alert status="success" className="mb-6">
          {successMessage}
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert status="error" className="mb-6">
          {error}
        </Alert>
      )}
      
      {/* Wallet balance card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaWallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Current Wallet Balance</h2>
            <div className="mt-1 flex items-baseline">
                <p className="text-3xl font-bold text-green-600">GH₵{walletBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <button 
              onClick={() => refreshWallet()} 
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              ) : (
                <FaSync className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Transactions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          <p className="mt-1 text-sm text-gray-500">
            View your wallet transaction history and details.
          </p>
        </div>
        
        {isLoadingTransactions && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}
        
        {!isLoadingTransactions && transactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWallet className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions</h3>
            <p className="text-sm text-gray-500">
              You don't have any wallet transactions yet.
            </p>
          </div>
        )}
        
        {!isLoadingTransactions && transactions.length > 0 && (
          <>
            {/* Mobile view - Enhanced */}
            <div className="sm:hidden">
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const typeInfo = getTransactionTypeInfo(transaction.type);
                  return (
                    <div key={transaction._id} className="px-4 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${typeInfo.bgColor} ${typeInfo.borderColor}`}>
                              {typeInfo.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                      </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-sm font-bold ${typeInfo.color}`}>
                          {transaction.type === 'credit' ? '+' : '-'}GH₵{transaction.amount.toFixed(2)}
                        </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeClass(transaction.status)}`}>
                          {transaction.status}
                        </span>
                          <span className="text-xs text-gray-500">
                            Balance: GH₵{transaction.balanceAfter.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Desktop view - Enhanced */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance After
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => {
                      const typeInfo = getTransactionTypeInfo(transaction.type);
                      return (
                        <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={transaction.description}>
                          {transaction.description}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.borderColor} ${typeInfo.color}`}>
                              {typeInfo.icon}
                            {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                            <span className={typeInfo.color}>
                            {transaction.type === 'credit' ? '+' : '-'}GH₵{transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          GH₵{transaction.balanceAfter.toFixed(2)}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        // Show pages around the current page
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              currentPage === pageNumber 
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Top-Up Request Modal */}
      <TopUpRequestModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSubmit={handleTopUpRequest}
        isSubmitting={isSubmittingRequest}
      />
    </div>
  );
};
