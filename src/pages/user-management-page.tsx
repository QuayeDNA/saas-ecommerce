// src/pages/user-management-page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '../hooks';
import { Button, Card, CardBody, CardHeader, Input, Badge, Alert } from '../design-system';
import { FaSearch, FaEdit, FaTrash, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
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

  const handleSearch = () => {
    fetchUsers(1, searchTerm, filterUserType);
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm, filterUserType);
  };

  const handleStatusUpdate = async (userId: string, updates: { isVerified?: boolean; subscriptionStatus?: string }) => {
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

  // Helper functions for styling
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

  const canManageUsers = authState.user?.userType === 'super_admin' || authState.user?.userType === 'agent';

  if (!canManageUsers) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert color="red" className="mb-4">
          You don't have permission to access user management.
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor user accounts
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert color="green" className="mb-4">
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert color="red" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {authState.user?.userType === 'agent' ? (
            <>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers ?? 0}</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.verifiedCustomers ?? 0}</div>
                  <div className="text-sm text-gray-600">Verified</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.unverifiedCustomers ?? 0}</div>
                  <div className="text-sm text-gray-600">Unverified</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{stats.recentCustomers ?? 0}</div>
                  <div className="text-sm text-gray-600">Recent (7 days)</div>
                </CardBody>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUsers ?? 0}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.totalAgents ?? 0}</div>
                  <div className="text-sm text-gray-600">Total Agents</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.activeAgents ?? 0}</div>
                  <div className="text-sm text-gray-600">Active Agents</div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.inactiveAgents ?? 0}</div>
                  <div className="text-sm text-gray-600">Inactive Agents</div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Search & Filter</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                leftIcon={<FaSearch className="text-gray-400" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor='user-type' className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User Type
              </label>
              <select
                value={filterUserType}
                onChange={(e) => setFilterUserType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                {authState.user?.userType === 'super_admin' && (
                  <option value="super_admin">Super Admin</option>
                )}
              </select>
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <FaSearch className="mr-2" />
              Search
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Users ({pagination.total})</h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Subscription</th>
                      <th className="text-left p-3">Created</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id ?? user._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge color={getUserTypeColor(user.userType)}>
                            {user.userType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge color={getStatusColor(user.isVerified)}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {user.userType === 'agent' && user.subscriptionStatus && (
                            <Badge color={getSubscriptionColor(user.subscriptionStatus)}>
                              {user.subscriptionStatus}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowModal(true);
                              }}
                            >
                              <FaEye className="w-4 h-4" />
                            </Button>
                            {authState.user?.userType === 'super_admin' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(user.id ?? user._id ?? '', { isVerified: !user.isVerified })}
                                >
                                  <FaEdit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  color="red"
                                  onClick={() => handleDeleteUser(user.id ?? user._id ?? '')}
                                >
                                  <FaTrash className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === pagination.page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">User Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor='fullName' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <label htmlFor='email' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label htmlFor='phone' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label htmlFor='userType' className="block text-sm font-medium text-gray-700 dark:text-gray-300">User Type</label>
                    <Badge color={getUserTypeColor(selectedUser.userType)} className="mt-1">
                      {selectedUser.userType}
                    </Badge>
                  </div>
                  <div>
                    <label htmlFor='verificationStatus' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status</label>
                    <Badge color={getStatusColor(selectedUser.isVerified)} className="mt-1">
                      {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div>
                    <label htmlFor='walletBalance' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Balance</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">GH¢{selectedUser.walletBalance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {/* Agent-specific fields */}
                {selectedUser.userType === 'agent' && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium mb-3">Agent Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor='businessName' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.businessName ?? 'N/A'}</p>
                      </div>
                      <div>
                        <label htmlFor='businessCategory' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Category</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.businessCategory ?? 'N/A'}</p>
                      </div>
                      <div>
                        <label htmlFor='subscriptionPlan' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Plan</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.subscriptionPlan ?? 'N/A'}</p>
                      </div>
                      <div>
                        <label htmlFor='subscriptionStatus' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Status</label>
                        {selectedUser.subscriptionStatus && (
                          <Badge color={getSubscriptionColor(selectedUser.subscriptionStatus)} className="mt-1">
                            {selectedUser.subscriptionStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* AFA Registration */}
                {selectedUser.afaRegistration && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium mb-3">AFA Registration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor='afaId' className="block text-sm font-medium text-gray-700 dark:text-gray-300">AFA ID</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.afaRegistration.afaId}</p>
                      </div>
                      <div>
                        <label htmlFor='registrationType' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Type</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.afaRegistration.registrationType}</p>
                      </div>
                      <div>
                        <label htmlFor='registrationFee' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">GH¢{selectedUser.afaRegistration.registrationFee?.toFixed(2)}</p>
                      </div>
                      <div>
                        <label htmlFor='status' className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <Badge color={selectedUser.afaRegistration.status === 'completed' ? 'green' : 'yellow'} className="mt-1">
                          {selectedUser.afaRegistration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {authState.user?.userType === 'super_admin' && (
                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium mb-3">Admin Actions</h4>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        color={selectedUser.isVerified ? 'red' : 'green'}
                        onClick={() => handleStatusUpdate(selectedUser.id || selectedUser._id || '', { isVerified: !selectedUser.isVerified })}
                      >
                        {selectedUser.isVerified ? <FaTimes className="mr-1" /> : <FaCheck className="mr-1" />}
                        {selectedUser.isVerified ? 'Unverify' : 'Verify'} User
                      </Button>
                      {selectedUser.userType === 'agent' && (
                        <Button
                          size="sm"
                          color={selectedUser.subscriptionStatus === 'active' ? 'yellow' : 'green'}
                          onClick={() => handleStatusUpdate(
                            selectedUser.id || selectedUser._id || '', 
                            { subscriptionStatus: selectedUser.subscriptionStatus === 'active' ? 'inactive' : 'active' }
                          )}
                        >
                          {selectedUser.subscriptionStatus === 'active' ? 'Deactivate' : 'Activate'} Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
