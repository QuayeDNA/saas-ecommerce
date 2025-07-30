// src/pages/user-management-page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '../hooks';
import { Button, Card, CardBody, CardHeader, Badge, Alert } from '../design-system';
import { SearchAndFilter } from '../components/common';
import { FaSearch, FaTrash, FaEye, FaTimes, FaUsers, FaClock, FaRocket } from 'react-icons/fa';
import type { User } from '../types';
import type { UsersResponse, UserStats } from '../services/user.service';

export const UserManagementPage: React.FC = () => {
  const { getUsers, getUserStats, updateUserStatus, deleteUser, isLoading } = useUser();
  const { authState } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter options for the reusable component
  const filterOptions = {
    userType: {
      value: filterUserType,
      options: [
        { value: '', label: 'All User Types' },
        { value: 'agent', label: 'Agents' },
        { value: 'customer', label: 'Customers' },
        { value: 'super_admin', label: 'Super Admins' }
      ],
      label: 'User Type',
      placeholder: 'All User Types'
    }
  };

  // Check if user is agent (show coming soon) or admin (show full functionality)
  const isAgent = authState.user?.userType === 'agent';

  const fetchUsers = useCallback(
    async (page = 1, search = searchTerm, userType = filterUserType) => {
      try {
        setError(null);
        const response: UsersResponse = await getUsers({
          page,
          limit: pagination.limit,
          search: search || undefined,
          userType: userType || undefined
        });
        
        setUsers(response.users);
        setPagination(response.pagination);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch users');
        } else {
          setError('Failed to fetch users');
        }
      }
    },
    [getUsers, pagination.limit, searchTerm, filterUserType]
  );

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (err: unknown) {
      console.error('Failed to fetch stats:', err);
    }
  }, [getUserStats]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm, filterUserType);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'userType') {
      setFilterUserType(value);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterUserType('');
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm, filterUserType);
  };

  const handleStatusUpdate = async (userId: string, updates: { isVerified?: boolean; subscriptionStatus?: 'active' | 'inactive' | 'suspended'; userType?: 'customer' | 'agent' | 'super_admin' }) => {
    try {
      await updateUserStatus(userId, updates);
      setSuccessMessage('User status updated successfully');
      fetchUsers(pagination.page, searchTerm, filterUserType);
      setShowModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update user status');
      } else {
        setError('Failed to update user status');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setSuccessMessage('User deleted successfully');
        fetchUsers(pagination.page, searchTerm, filterUserType);
        setShowModal(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to delete user');
        } else {
          setError('Failed to delete user');
        }
      }
    }
  };

  const getUserTypeColor = (userType: string): "blue" | "green" | "yellow" | "red" | "gray" => {
    switch (userType) {
      case 'agent': return 'blue';
      case 'customer': return 'green';
      case 'super_admin': return 'red';
      default: return 'gray';
    }
  };

  const getStatusColor = (isVerified: boolean): "green" | "red" => {
    return isVerified ? 'green' : 'red';
  };

  const getSubscriptionColor = (status: string): "green" | "yellow" | "red" | "gray" => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'yellow';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };

  // If agent, show coming soon page
  if (isAgent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Customers</h1>
                <p className="text-gray-600 mt-2">Manage your customer relationships</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <Card className="shadow-lg">
            <CardBody className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaRocket className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
                <p className="text-gray-600 mb-6">
                  We're working hard to bring you a comprehensive customer management system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FaUsers className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Customer Profiles</h3>
                  <p className="text-sm text-gray-600">Detailed customer information and history</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FaSearch className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Advanced Search</h3>
                  <p className="text-sm text-gray-600">Find customers quickly with smart filters</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FaClock className="text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Activity Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor customer interactions and orders</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">What's Coming:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Customer registration and onboarding</li>
                  <li>• Order history and transaction tracking</li>
                  <li>• Customer communication tools</li>
                  <li>• Analytics and reporting</li>
                  <li>• Bulk operations and management</li>
                </ul>
              </div>

              <div className="mt-6">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = '/agent/dashboard'}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Full functionality for admins
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage all users in the system</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Agents</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeAgents || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Verified Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.verifiedCustomers || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Unverified Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.unverifiedCustomers || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search users..."
          filters={filterOptions}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />

        {/* Alerts */}
        {error && (
          <Alert status="error" className="mb-6">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert status="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getUserTypeColor(user.userType)}>
                          {user.userType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getStatusColor(user.isVerified)}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getSubscriptionColor(user.subscriptionStatus || 'inactive')}>
                          {user.subscriptionStatus || 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                          >
                            <FaEye className="mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                    <Badge color={getUserTypeColor(selectedUser.userType)} className="mt-1">
                      {selectedUser.userType}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                    <Badge color={getStatusColor(selectedUser.isVerified)} className="mt-1">
                      {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
                    <Badge color={getSubscriptionColor(selectedUser.subscriptionStatus || 'inactive')} className="mt-1">
                      {selectedUser.subscriptionStatus || 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {selectedUser.businessName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.businessName}</p>
                  </div>
                )}

                {selectedUser.afaRegistration && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium mb-3">AFA Registration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">AFA ID</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.afaRegistration.afaId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Registration Type</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.afaRegistration.registrationType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900">GH¢{selectedUser.afaRegistration.registrationFee?.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <Badge color={selectedUser.afaRegistration.status === 'completed' ? 'green' : 'yellow'} className="mt-1">
                          {selectedUser.afaRegistration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium mb-3">Actions</h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedUser._id) {
                          handleStatusUpdate(selectedUser._id, { isVerified: !selectedUser.isVerified });
                        }
                      }}
                    >
                      {selectedUser.isVerified ? 'Unverify' : 'Verify'} User
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (selectedUser._id) {
                          handleStatusUpdate(selectedUser._id, { 
                            subscriptionStatus: selectedUser.subscriptionStatus === 'active' ? 'inactive' : 'active' 
                          });
                        }
                      }}
                    >
                      {selectedUser.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'} Subscription
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      color="red"
                      onClick={() => {
                        if (selectedUser._id) {
                          handleDeleteUser(selectedUser._id);
                        }
                      }}
                    >
                      <FaTrash className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
