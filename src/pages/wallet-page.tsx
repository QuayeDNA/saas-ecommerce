import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../hooks';
import { type WalletTransaction } from '../types/wallet';
import { FaWallet, FaPlus, FaArrowUp, FaArrowDown, FaSync, FaWifi } from 'react-icons/fa';
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
    connectionStatus,
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
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Get transaction type icon and color
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <FaArrowUp className="text-green-500" />;
      case 'debit':
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaWallet className="text-gray-500" />;
    }
  };

  // Get connection status indicator
  const getConnectionStatusIndicator = () => {
    const statusColors = {
      websocket: 'text-green-500',
      polling: 'text-yellow-500',
      disconnected: 'text-red-500'
    };

    const statusText = {
      websocket: 'Real-time (WebSocket)',
      polling: 'Polling (Fallback)',
      disconnected: 'Disconnected'
    };

    return (
      <div className="flex items-center gap-2 text-sm">
        <FaWifi className={statusColors[connectionStatus]} />
        <span className={statusColors[connectionStatus]}>
          {statusText[connectionStatus]}
        </span>
      </div>
    );
  };

  const handleTopUpRequest = async (amount: number, description: string) => {
    setIsSubmittingRequest(true);
    try {
      await requestTopUp(amount, description);
      setSuccessMessage('Top-up request submitted successfully!');
      setShowTopUpModal(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to submit top-up request:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
            <p className="text-gray-600">Manage your wallet balance and view transaction history</p>
          </div>
          <div className="flex items-center gap-4 flex-col">
            {getConnectionStatusIndicator()}
            <button
              onClick={() => refreshWallet()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSync className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert status="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert status="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Current Balance</h2>
          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaPlus />
            Request Top-up
          </button>
        </div>
        
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {formatCurrency(walletBalance)}
        </div>
        
        <p className="text-gray-600">
          Available for transactions and purchases
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        </div>
        
        <div className="p-6">
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <FaSync className="animate-spin text-blue-600 text-xl" />
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaWallet className="text-4xl mx-auto mb-4 text-gray-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: {formatCurrency(transaction.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top-up Request Modal */}
      <TopUpRequestModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSubmit={handleTopUpRequest}
        isSubmitting={isSubmittingRequest}
      />
    </div>
  );
};
