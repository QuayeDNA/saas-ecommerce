import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaClock, FaMoneyBillWave, FaDownload, FaUserPlus, FaUsers, FaWallet } from "react-icons/fa";
import { useWallet } from "../../hooks/use-wallet";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { colors } from "../../design-system/tokens";
import type { WalletTransaction, WalletAnalytics } from "../../types/wallet";
import { walletService } from "../../services/wallet-service";
import { apiClient } from "../../utils/api-client";

interface User {
  _id: string;
  fullName: string;
  email: string;
  userType: string;
  walletBalance: number;
  status: string;
}

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onTopUp: (userId: string, amount: number, description: string) => Promise<void>;
}

function TopUpModal({ isOpen, onClose, user, onTopUp }: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      await onTopUp(user._id, parseFloat(amount), description || `Top-up by super admin`);
      setAmount('');
      setDescription('');
      onClose();
    } catch (error) {
      // Top-up failed
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Top Up Wallet</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600">User: {user.fullName}</p>
          <p className="text-sm text-gray-600">Email: {user.email}</p>
          <p className="text-sm text-gray-600">Current Balance: GH₵{user.walletBalance.toFixed(2)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (GH₵)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for top-up"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !amount || parseFloat(amount) <= 0}>
              {loading ? 'Processing...' : 'Top Up'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SuperAdminWalletPage() {
  const { refreshWallet } = useWallet();
  
  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for analytics
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // State for modals
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // State for pending requests
  const [pendingRequests, setPendingRequests] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
    fetchPendingRequests();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/users/with-wallet', {
        params: {
          userType: 'agent',
          includeWallet: 'true'
        }
      });
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
      // Error fetching users
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await walletService.getWalletAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      // Error fetching analytics
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await walletService.getPendingRequests();
      setPendingRequests(response.transactions);
    } catch (err) {
      // Error fetching pending requests
    }
  };

  const handleTopUp = async (userId: string, amount: number, description: string) => {
    try {
      await walletService.adminTopUpWallet(userId, amount, description);
      await fetchUsers();
      await fetchAnalytics();
      await refreshWallet();
    } catch (err) {
      throw new Error('Failed to top up wallet');
    }
  };

  const handleProcessRequest = async (transactionId: string, approve: boolean) => {
    try {
      await walletService.processTopUpRequest(transactionId, approve);
      await fetchPendingRequests();
      await fetchAnalytics();
    } catch (err) {
      // Error processing request
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setUserTypeFilter('');
    setStatusFilter('');
  };

  const openTopUpModal = (user: User) => {
    setSelectedUser(user);
    setShowTopUpModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };



  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.brand.primary }}>
              Wallet Management
            </h1>
            <p className="text-gray-600">Manage agent wallets and transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchUsers()}>
              <FaDownload className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.users.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.balance.total)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.transactions.pendingRequests}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Balance</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(analytics.balance.average)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaWallet className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Top-Up Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {typeof request.user === 'string' ? request.user : request.user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleProcessRequest(request._id, true)}
                        >
                          <FaCheck className="w-3 h-3" />
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => handleProcessRequest(request._id, false)}
                        >
                          <FaTimes className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                label="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                leftIcon={<FaSearch className="text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="agent">Agent</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={loading}>
                <FaSearch className="mr-2" />
                Search
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilters}>
                <FaFilter className="mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(user.walletBalance)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openTopUpModal(user)}
                        >
                          <FaUserPlus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => window.open(`/superadmin/users/${user._id}`, '_blank')}
                        >
                          <FaEye className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        user={selectedUser}
        onTopUp={handleTopUp}
      />
    </div>
  );
} 