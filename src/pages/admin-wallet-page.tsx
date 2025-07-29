// src/pages/admin-wallet-page.tsx
import { useState, useEffect } from 'react';
import { useWallet } from '../hooks';
import { Button, Input, Alert } from '../design-system';
import { SearchAndFilter } from '../components/common';
import { FaSearch, FaEye, FaCheck, FaTimes, FaClock, FaMoneyBillWave, FaChartBar, FaDownload, FaRefresh, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import type { WalletTransaction, WalletAnalytics } from '../types/wallet';

export const AdminWalletPage = () => {
  const {
    isLoading,
    error,
    getPendingRequests,
    processTopUpRequest,
    getWalletAnalytics,
    adminTopUpWallet
  } = useWallet();
  
  const [pendingRequests, setPendingRequests] = useState<WalletTransaction[]>([]);
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topUpUserId, setTopUpUserId] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpDescription, setTopUpDescription] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WalletTransaction | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filteredRequests logic
  };

  const handleClearFilters = () => {
    setSearchTerm('');
  };
  
  // Load pending requests
  useEffect(() => {
    const loadPendingRequests = async () => {
      const result = await getPendingRequests(currentPage);
      if (result) {
        setPendingRequests(result.transactions);
        setTotalPages(result.pagination.pages);
      }
    };
    
    loadPendingRequests();
    
    // Also load wallet analytics
    const loadAnalytics = async () => {
      const data = await getWalletAnalytics();
      if (data) {
        setAnalytics(data);
      }
    };
    
    loadAnalytics();
  }, [currentPage, getPendingRequests, getWalletAnalytics]);

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };
  
  // Handle direct top-up
  const handleDirectTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topUpUserId || !topUpAmount) return;
    
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const result = await adminTopUpWallet(topUpUserId, amount, topUpDescription || 'Manual top-up by admin');
    if (result) {
      setSuccessMessage('Wallet topped up successfully.');
      setTopUpUserId('');
      setTopUpAmount('');
      setTopUpDescription('');
      setShowTopUpModal(false);
      
      // Reload pending requests after top-up
      const updatedRequests = await getPendingRequests(currentPage);
      if (updatedRequests) {
        setPendingRequests(updatedRequests.transactions);
      }
      
      // Reload analytics
      const updatedAnalytics = await getWalletAnalytics();
      if (updatedAnalytics) {
        setAnalytics(updatedAnalytics);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };
  
  // Handle processing a request
  const handleProcessRequest = async (approve: boolean) => {
    if (!selectedRequest) return;
    
    const result = await processTopUpRequest(selectedRequest._id, approve);
    if (result) {
      setSuccessMessage(`Request ${approve ? 'approved' : 'rejected'} successfully.`);
      setShowProcessModal(false);
      setSelectedRequest(null);
      
      // Reload pending requests after processing
      const updatedRequests = await getPendingRequests(currentPage);
      if (updatedRequests) {
        setPendingRequests(updatedRequests.transactions);
      }
      
      // Reload analytics
      const updatedAnalytics = await getWalletAnalytics();
      if (updatedAnalytics) {
        setAnalytics(updatedAnalytics);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  // Filter requests based on search term
  const filteredRequests = pendingRequests.filter(request => {
    if (!searchTerm) return true;
    const userInfo = typeof request.user === 'string' ? request.user : request.user.fullName;
    return userInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage wallet top-up requests and direct top-ups</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              const loadData = async () => {
                const updatedRequests = await getPendingRequests(currentPage);
                if (updatedRequests) {
                  setPendingRequests(updatedRequests.transactions);
                }
                const updatedAnalytics = await getWalletAnalytics();
                if (updatedAnalytics) {
                  setAnalytics(updatedAnalytics);
                }
              };
              loadData();
            }}
          >
            <FaRefresh className="mr-2" />
            Refresh
          </Button>
          <Button 
          onClick={() => setShowTopUpModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
        >
            Direct Top-Up
          </Button>
        </div>
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
      
      {/* Wallet Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.users.total}</p>
            <div className="mt-1 text-xs text-gray-600 flex justify-between">
              <span>With balance: {analytics.users.withBalance}</span>
              <span>Without balance: {analytics.users.withoutBalance}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Balance</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(analytics.balance.total)}</p>
            <div className="mt-1 text-xs text-gray-600 flex justify-between">
              <span>Average: {formatCurrency(analytics.balance.average)}</span>
              <span>Highest: {formatCurrency(analytics.balance.highest)}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Credits</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{formatCurrency(analytics.transactions.credits.total)}</p>
            <div className="mt-1 text-xs text-gray-600 flex justify-between">
              <span>Count: {analytics.transactions.credits.count}</span>
              <span>Pending: {analytics.transactions.pendingRequests}</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Debits</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(analytics.transactions.debits.total)}</p>
            <div className="mt-1 text-xs text-gray-600">
              <span>Count: {analytics.transactions.debits.count}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Search */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by user name or description..."
        filters={{}}
        onFilterChange={() => {}}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        showSearchButton={false}
        isLoading={isLoading}
      />
      
      {/* Pending Requests */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Top-Up Requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            Review and process wallet top-up requests from agents.
          </p>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}
        
        {!isLoading && filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMoneyBillWave className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No requests match your search criteria.' : 'There are no pending wallet top-up requests at the moment.'}
            </p>
          </div>
        )}
        
        {!isLoading && filteredRequests.length > 0 && (
          <>
            {/* Mobile view */}
            <div className="sm:hidden">
              <div className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <div key={request._id} className="px-4 py-4">
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {typeof request.user === 'string' ? request.user : request.user.fullName}
                        </span>
                        <span className="text-sm text-gray-500 truncate">
                          {request.description}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-green-600">
                          +{formatCurrency(request.amount)}
                        </span>
                        <div className="mt-2 flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowProcessModal(true);
                            }}
                          >
                            Process
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop view */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <FaUser className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {typeof request.user === 'string' ? request.user : request.user.fullName}
                          </div>
                          {typeof request.user !== 'string' && (
                                <div className="text-sm text-gray-500">
                              {request.user.email}
                            </div>
                          )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                          {request.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          +{formatCurrency(request.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowProcessModal(true);
                            }}
                          >
                            Process
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
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
                          <Button
                            key={pageNumber}
                            size="sm"
                            variant={pageNumber === currentPage ? "primary" : "outline"}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Direct Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleDirectTopUp}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaMoneyBillWave className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Direct Wallet Top-Up
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                            User ID
                          </label>
                          <Input
                            type="text"
                            id="userId"
                            name="userId"
                            placeholder="Enter user ID"
                            value={topUpUserId}
                            onChange={(e) => setTopUpUserId(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Amount (GH₵)
                          </label>
                          <Input
                            type="number"
                            id="amount"
                            name="amount"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Description for this top-up"
                            value={topUpDescription}
                            onChange={(e) => setTopUpDescription(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? 'Processing...' : 'Top Up Wallet'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTopUpModal(false)}
                    className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Process Request Modal */}
      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Process Top-Up Request
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to process this top-up request?
                      </p>
                      
                      <dl className="mt-4 divide-y divide-gray-200">
                        <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">User</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {typeof selectedRequest.user === 'string' ? selectedRequest.user : selectedRequest.user.fullName}
                          </dd>
                        </div>
                        <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Amount</dt>
                          <dd className="mt-1 text-sm text-green-600 font-semibold sm:mt-0 sm:col-span-2">
                            {formatCurrency(selectedRequest.amount)}
                          </dd>
                        </div>
                        <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {selectedRequest.description}
                          </dd>
                        </div>
                        <div className="py-2 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">Requested At</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatDate(selectedRequest.createdAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={() => handleProcessRequest(true)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleProcessRequest(false)}
                  disabled={isLoading}
                  variant="danger"
                  className="mr-3"
                >
                  {isLoading ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
