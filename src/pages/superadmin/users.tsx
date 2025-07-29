import { useEffect, useState } from "react";
import { userService, type User } from "../../services/user.service";
import { SearchAndFilter } from "../../components/common";
import { 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaUser, 
  FaStore, 
  FaShieldAlt, 
  FaFilter,
  FaEye,
  FaUserCheck,
  FaDownload,
  FaRedo,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaBuilding
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { colors } from "../../design-system/tokens";

const userTypeOptions = [
  { value: '', label: 'All Users', icon: FaUser },
  { value: 'agent', label: 'Agents', icon: FaStore },
  { value: 'super_admin', label: 'Super Admins', icon: FaShieldAlt },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending Approval', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'active', label: 'Active', color: 'text-green-600 bg-green-100' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600 bg-red-100' },
];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('');
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter options for the reusable component
  const filterOptions = {
    userType: {
      value: userType,
      options: userTypeOptions,
      label: 'User Type',
      placeholder: 'All Users'
    },
    status: {
      value: status,
      options: statusOptions,
      label: 'Status',
      placeholder: 'All Status'
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.fetchUsers({ 
        userType, 
        status,
        search: search.trim() || undefined
      });
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userType, status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setUserType('');
    setStatus('pending');
    fetchUsers();
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'userType') {
      setUserType(value);
    } else if (filterKey === 'status') {
      setStatus(value);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingUser(id);
    try {
      await userService.updateAgentStatus(id, 'active');
      await fetchUsers();
    } catch (err) {
      setError('Failed to approve user');
      console.error('Error approving user:', err);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingUser(id);
    try {
      await userService.updateAgentStatus(id, 'rejected');
      await fetchUsers();
    } catch (err) {
      setError('Failed to reject user');
      console.error('Error rejecting user:', err);
    } finally {
      setProcessingUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'agent': return <FaStore className="text-blue-600" />;
      case 'super_admin': return <FaShieldAlt className="text-purple-600" />;
      default: return <FaUser className="text-gray-600" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'agent': return 'Agent';
      case 'super_admin': return 'Super Admin';
      default: return 'User';
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Calculate statistics
  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    agents: users.filter(u => u.userType === 'agent').length,
    superAdmins: users.filter(u => u.userType === 'super_admin').length,
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.brand.primary }}>
              User Management
            </h1>
            <p className="text-gray-600">Manage agent registrations and user accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
              <FaRedo className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUser className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaUserCheck className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agents</p>
              <p className="text-2xl font-bold text-blue-600">{stats.agents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaStore className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or phone..."
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        isLoading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <FaUser className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map(user => (
              <div key={user._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getUserTypeIcon(user.userType)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.fullName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaEnvelope className="w-3 h-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaPhone className="w-3 h-3" />
                            {user.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'pending' ? 'Pending Approval' : user.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getUserTypeLabel(user.userType)}
                      </span>
                      {user.businessName && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FaBuilding className="w-3 h-3 mr-1" />
                          {user.businessName}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FaCalendar className="w-3 h-3 mr-1" />
                        {formatDate(user.createdAt || '')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {user.userType === 'agent' && user.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(user._id)}
                          disabled={processingUser === user._id}
                          className="w-full sm:w-auto"
                        >
                          {processingUser === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FaCheck className="mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(user._id)}
                          disabled={processingUser === user._id}
                          className="w-full sm:w-auto"
                        >
                          {processingUser === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FaTimes className="mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/superadmin/users/${user._id}`)}
                      className="w-full sm:w-auto"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 