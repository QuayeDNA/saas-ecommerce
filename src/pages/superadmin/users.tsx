import { useEffect, useState, useCallback } from "react";
import { userService, type User } from "../../services/user.service";
import { SearchAndFilter } from "../../components/common";
import {
  FaCheck,
  FaTimes,
  FaUser,
  FaStore,
  FaShieldAlt,
  FaEye,
  FaDownload,
  FaRedo,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaBuilding,
  FaIdCard,
  FaUserTie,
  FaUserShield,
  FaCrown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "../../design-system/components/button";
import { colors } from "../../design-system/tokens";

const userTypeOptions = [
  { value: "", label: "All Users", icon: FaUser },
  { value: "agent", label: "Agents", icon: FaStore },
  { value: "super_agent", label: "Super Agents", icon: FaStore },
  { value: "dealer", label: "Dealers", icon: FaStore },
  { value: "super_dealer", label: "Super Dealers", icon: FaStore },
  { value: "super_admin", label: "Super Admins", icon: FaShieldAlt },
];

const statusOptions = [
  { value: "", label: "All Status" },
  {
    value: "pending",
    label: "Pending Approval",
    color: "text-yellow-600 bg-yellow-100",
  },
  { value: "active", label: "Active", color: "text-green-600 bg-green-100" },
  { value: "rejected", label: "Rejected", color: "text-red-600 bg-red-100" },
];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("");
  const [status, setStatus] = useState(""); // Changed from 'pending' to '' to show all users
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [statusCarouselIndex, setStatusCarouselIndex] = useState(0);
  const navigate = useNavigate();

  // Filter options for the reusable component
  const filterOptions = {
    userType: {
      value: userType,
      options: userTypeOptions,
      label: "User Type",
      placeholder: "All Users",
    },
    status: {
      value: status,
      options: statusOptions,
      label: "Status",
      placeholder: "All Status",
    },
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.fetchUsers({
        userType,
        status: status || undefined, // Only send if status is not empty
        search: search.trim() || undefined,
      });
      setUsers(data);
    } catch {
      setError("Failed to fetch users");
      // Error fetching users
    } finally {
      setLoading(false);
    }
  }, [userType, status, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Add debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchUsers();
    }, 500); // 500ms delay for debounced search

    return () => clearTimeout(delayedSearch);
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now automatic via useEffect, no need to call fetchUsers manually
  };

  const handleClearFilters = () => {
    setSearch("");
    setUserType("");
    setStatus(""); // Clear status filter
    // fetchUsers will be called automatically by useEffect when state changes
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === "userType") {
      setUserType(value);
    } else if (filterKey === "status") {
      setStatus(value);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingUser(id);
    try {
      await userService.updateAgentStatus(id, "active");
      await fetchUsers();
    } catch {
      setError("Failed to approve user");
      // Error approving user
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingUser(id);
    try {
      await userService.updateAgentStatus(id, "rejected");
      await fetchUsers();
    } catch {
      setError("Failed to reject user");
      // Error rejecting user
    } finally {
      setProcessingUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "active":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "agent":
        return <FaStore className="text-blue-600" />;
      case "super_agent":
        return <FaStore className="text-indigo-600" />;
      case "dealer":
        return <FaStore className="text-green-600" />;
      case "super_dealer":
        return <FaStore className="text-emerald-600" />;
      case "super_admin":
        return <FaShieldAlt className="text-purple-600" />;
      default:
        return <FaUser className="text-gray-600" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "agent":
        return "Agent";
      case "super_agent":
        return "Super Agent";
      case "dealer":
        return "Dealer";
      case "super_dealer":
        return "Super Dealer";
      case "super_admin":
        return "Super Admin";
      default:
        return "User";
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  // Status carousel data
  const statusCarousel = [
    {
      key: "pending",
      label: "Pending",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      key: "active",
      label: "Active",
      color: "text-green-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  // User type cards data
  const userTypeCards = [
    {
      key: "agents",
      label: "Agents",
      icon: (
        <FaStore
          className="text-lg sm:text-xl"
          style={{ color: "var(--color-primary-600)" }}
        />
      ),
      bgColor: "bg-primary-100",
      textColor: "text-primary-600",
    },
    {
      key: "super_agents",
      label: "Super Agents",
      icon: (
        <FaUserShield
          className="text-lg sm:text-xl"
          style={{ color: "var(--color-primary-600)" }}
        />
      ),
      bgColor: "bg-primary-100",
      textColor: "text-primary-600",
    },
    {
      key: "dealers",
      label: "Dealers",
      icon: (
        <FaUserTie
          className="text-lg sm:text-xl"
          style={{ color: "var(--color-primary-600)" }}
        />
      ),
      bgColor: "bg-primary-100",
      textColor: "text-primary-600",
    },
    {
      key: "super_dealers",
      label: "Super Dealers",
      icon: (
        <FaUserTie
          className="text-lg sm:text-xl"
          style={{ color: "var(--color-primary-600)" }}
        />
      ),
      bgColor: "bg-primary-100",
      textColor: "text-primary-600",
    },
    {
      key: "super_admins",
      label: "Super Admins",
      icon: (
        <FaCrown
          className="text-lg sm:text-xl"
          style={{ color: "var(--color-primary-600)" }}
        />
      ),
      bgColor: "bg-primary-100",
      textColor: "text-primary-600",
    },
  ];

  // Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusCarouselIndex(
        (prevIndex) => (prevIndex + 1) % statusCarousel.length
      );
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [statusCarousel.length]);

  // Calculate statistics
  const stats = {
    total: users.length,
    pending: users.filter((u) => u.status === "pending").length,
    active: users.filter((u) => u.status === "active").length,
    rejected: users.filter((u) => u.status === "rejected").length,
    agents: users.filter((u) => u.userType === "agent").length,
    super_agents: users.filter((u) => u.userType === "super_agent").length,
    dealers: users.filter((u) => u.userType === "dealer").length,
    super_dealers: users.filter((u) => u.userType === "super_dealer").length,
    super_admins: users.filter((u) => u.userType === "super_admin").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold mb-2"
              style={{ color: colors.brand.primary }}
            >
              User Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage agent registrations and user accounts
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={fetchUsers}
              disabled={loading}
              size="sm"
            >
              <FaRedo className="mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="space-y-4">
        {/* Total Users with Status Carousel - Full Width */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Users
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
              {/* Status Carousel */}
              <div className="mt-2">
                <p
                  className={`text-xs sm:text-sm font-medium ${statusCarousel[statusCarouselIndex].color}`}
                >
                  {statusCarousel[statusCarouselIndex].label}:{" "}
                  {
                    stats[
                      statusCarousel[statusCarouselIndex]
                        .key as keyof typeof stats
                    ]
                  }
                </p>
                <div className="flex justify-center mt-2 space-x-1">
                  {statusCarousel.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setStatusCarouselIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === statusCarouselIndex
                          ? "bg-gray-600"
                          : "bg-gray-300"
                      }`}
                      aria-label={`Show ${statusCarousel[index].label} count`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <FaUser className="text-blue-600 text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        {/* User Type Cards - 2x2 Grid on Small Screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {userTypeCards.map((userType) => (
            <div
              key={userType.key}
              className="bg-white rounded-lg shadow p-3 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {userType.label}
                  </p>
                  <p
                    className={`text-lg sm:text-2xl font-bold ${userType.textColor}`}
                  >
                    {stats[userType.key as keyof typeof stats]}
                  </p>
                </div>
                {/* Hide icons on small screens, show on sm and up */}
                <div
                  className={`hidden sm:flex p-2 sm:p-3 ${userType.bgColor} rounded-full ml-2 flex-shrink-0`}
                >
                  <div className="text-lg sm:text-xl">{userType.icon}</div>
                </div>
              </div>
            </div>
          ))}
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
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-600">
                Loading users...
              </span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <FaUser className="mx-auto text-gray-400 text-3xl sm:text-4xl mb-4" />
            <p className="text-sm sm:text-base text-gray-500">
              No users found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      {getUserTypeIcon(user.userType)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {user.fullName}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1 truncate">
                            <FaEnvelope className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <FaPhone className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.phone}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <FaIdCard className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.agentCode}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status === "pending"
                          ? "Pending Approval"
                          : user.status}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800">
                        {getUserTypeLabel(user.userType)}
                      </span>
                      {user.businessName && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-800">
                          <FaBuilding className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.businessName}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-800">
                        <FaCalendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        {formatDate(user.createdAt || "")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    {user.userType === "agent" && user.status === "pending" && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(user._id)}
                          disabled={processingUser === user._id}
                          className="w-full sm:w-auto"
                        >
                          {processingUser === user._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FaCheck className="mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Approve</span>
                              <span className="sm:hidden">✓</span>
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
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <FaTimes className="mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Reject</span>
                              <span className="sm:hidden">✕</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/superadmin/users/${user._id}`)}
                      className="w-full sm:w-auto"
                    >
                      <FaEye className="mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
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
