import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService, type User } from "../../services/user.service";
import { Button } from "../../design-system/components/button";
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaUserShield, 
  FaUserCheck, 
  FaUserTimes, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaCalendar, 
  FaWallet, 
  FaShoppingCart,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaIdCard
} from "react-icons/fa";
import { orderService } from "../../services/order.service";
import { Input } from "../../design-system/components/input";
import type { Order } from "../../types/order";
import { Modal } from "../../design-system/components/modal";
import { useToast } from "../../design-system/components/toast";
import { Card, CardHeader, CardBody } from "../../design-system/components/card";

export default function SuperAdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<User & { subscriptionPlan?: string; subscriptionStatus?: string }>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [impersonateLoading, setImpersonateLoading] = useState(false);

  const startEdit = () => {
    if (!user) return;
    setEditData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      businessName: user.businessName,
      businessCategory: user.businessCategory,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
    });
    setEditMode(true);
    setEditError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    if (!user) return;
    setEditLoading(true);
    setEditError(null);
    try {
      await userService.updateUser(user._id, editData);
      setEditMode(false);
      fetchUser();
      addToast("User updated successfully", "success");
    } catch (e) {
      if (e instanceof Error) {
        setEditError(e.message || "Failed to update user");
      } else {
        setEditError("Failed to update user");
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateUser(user._id, { isActive: false });
      fetchUser();
      addToast("User deactivated successfully", "success");
    } catch (error) {
      addToast("Failed to deactivate user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateUser(user._id, { isActive: true });
      fetchUser();
      addToast("User reactivated successfully", "success");
    } catch (error) {
      addToast("Failed to reactivate user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      if (id) {
        const data = await userService.fetchUserById(id);
        setUser(data);
        // Fetch recent orders for this user
        await fetchUserOrders(id);
      }
    } catch {
      setError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    setOrdersLoading(true);
    try {
      const recentOrders = await orderService.getOrdersByUserId(userId, 10);
      setOrders(recentOrders);
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      // Don't show error toast for orders, just log it
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const handleApprove = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateAgentStatus(user._id, "active");
      fetchUser();
      addToast("Agent approved successfully", "success");
    } catch (error) {
      addToast("Failed to approve agent", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await userService.updateAgentStatus(user._id, "rejected");
      fetchUser();
      addToast("Agent rejected successfully", "success");
    } catch (error) {
      addToast("Failed to reject agent", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    setResetLoading(true);
    setResetError(null);
    try {
      await userService.resetUserPassword(user._id, resetPassword);
      setShowResetModal(false);
      setResetPassword("");
      addToast("Password reset successfully", "success");
    } catch (e) {
      if (e instanceof Error) {
        setResetError(e.message || "Failed to reset password");
      } else {
        setResetError("Failed to reset password");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUser(user._id);
      addToast("User deleted successfully", "success");
      navigate(-1);
    } catch (e) {
      if (e instanceof Error) {
        addToast(e.message || "Failed to delete user", "error");
      } else {
        addToast("Failed to delete user", "error");
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleImpersonate = async () => {
    if (!user) return;
    setImpersonateLoading(true);
    try {
      // Store the current admin token before impersonating
      const adminToken = localStorage.getItem("token");
      if (adminToken) {
        localStorage.setItem("adminToken", adminToken);
      }
      
      const { token, user: impersonatedUser } = await userService.impersonateUser(user._id);
      
      // Store impersonation data in localStorage
      localStorage.setItem("impersonation", "true");
      localStorage.setItem("token", token);
      
      // Store user data in cookies (like auth service does)
      const Cookies = (await import('js-cookie')).default;
      Cookies.set('authToken', token, { 
        secure: import.meta.env.PROD, 
        sameSite: 'strict', 
        path: '/',
        expires: 7 
      });
      Cookies.set('user', JSON.stringify(impersonatedUser), { 
        secure: import.meta.env.PROD, 
        sameSite: 'strict', 
        path: '/',
        expires: 7 
      });
      
      // Show success message
      addToast(`Now impersonating ${impersonatedUser.fullName}`, "success");
      
      // Redirect based on user type
      if (impersonatedUser.userType === 'agent') {
        window.location.href = '/agent/dashboard';
      } else if (impersonatedUser.userType === 'customer') {
        window.location.href = '/customer/dashboard';
      } else {
        // Fallback to home page
        window.location.href = '/';
      }
    } catch (e) {
      if (e instanceof Error) {
        addToast(e.message || "Failed to impersonate user", "error");
      } else {
        addToast("Failed to impersonate user", "error");
      }
    } finally {
      setImpersonateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'agent': return <FaUserShield className="text-blue-600" />;
      case 'customer': return <FaUser className="text-green-600" />;
      case 'super_admin': return <FaUserCheck className="text-purple-600" />;
      default: return <FaUser className="text-gray-600" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'agent': return 'Agent';
      case 'customer': return 'Customer';
      case 'super_admin': return 'Super Admin';
      default: return userType;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600 text-lg">{error || "User not found"}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-gray-600">Manage user account and permissions</p>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {getUserTypeIcon(user.userType)}
                    <span>{getUserTypeLabel(user.userType)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEdit}
                  disabled={editMode}
                >
                  <FaEdit className="mr-2" />
                  Edit
                </Button>
                {user.userType !== 'super_admin' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleImpersonate}
                    isLoading={impersonateLoading}
                  >
                    <FaUserShield className="mr-2" />
                    Impersonate
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaIdCard className="mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaEnvelope className="text-gray-400 w-4 h-4" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-gray-400 w-4 h-4" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-gray-400 w-4 h-4" />
                    <div>
                      <p className="text-sm text-gray-500">Registered</p>
                      <p className="text-gray-900">{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaWallet className="text-gray-400 w-4 h-4" />
                    <div>
                      <p className="text-sm text-gray-500">Wallet Balance</p>
                      <p className="text-gray-900">{formatCurrency(user.walletBalance || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information (for agents) */}
              {user.userType === 'agent' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaBuilding className="mr-2 text-green-600" />
                    Business Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaBuilding className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-gray-500">Business Name</p>
                        <p className="text-gray-900">{user.businessName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaUserShield className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-gray-500">Business Category</p>
                        <p className="text-gray-900 capitalize">{user.businessCategory || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCheckCircle className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-gray-500">Subscription Plan</p>
                        <p className="text-gray-900 capitalize">{user.subscriptionPlan || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-gray-400 w-4 h-4" />
                      <div>
                        <p className="text-sm text-gray-500">Subscription Status</p>
                        <p className="text-gray-900 capitalize">{user.subscriptionStatus || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {user.userType === 'agent' && user.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      onClick={handleApprove}
                      isLoading={actionLoading}
                    >
                      <FaUserCheck className="mr-2" />
                      Approve Agent
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleReject}
                      isLoading={actionLoading}
                    >
                      <FaUserTimes className="mr-2" />
                      Reject Agent
                    </Button>
                  </>
                )}
                {user.isActive ? (
                  <Button
                    variant="danger"
                    onClick={handleDeactivate}
                    isLoading={actionLoading}
                  >
                    <FaUserTimes className="mr-2" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleReactivate}
                    isLoading={actionLoading}
                  >
                    <FaUserCheck className="mr-2" />
                    Reactivate
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowResetModal(true)}
                >
                  <FaEdit className="mr-2" />
                  Reset Password
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  isLoading={deleteLoading}
                >
                  <FaTrash className="mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Edit Form */}
        {editMode && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Edit User Information</h3>
            </CardHeader>
            <CardBody>
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{editError}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="fullName"
                  value={editData.fullName || ''}
                  onChange={handleEditChange}
                />
                <Input
                  label="Email"
                  name="email"
                  value={editData.email || ''}
                  onChange={handleEditChange}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={editData.phone || ''}
                  onChange={handleEditChange}
                />
                {user.userType === 'agent' && (
                  <>
                    <Input
                      label="Business Name"
                      name="businessName"
                      value={editData.businessName || ''}
                      onChange={handleEditChange}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Category
                      </label>
                      <select
                        name="businessCategory"
                        value={editData.businessCategory || ''}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="food">Food</option>
                        <option value="services">Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription Plan
                      </label>
                      <select
                        name="subscriptionPlan"
                        value={editData.subscriptionPlan || ''}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Plan</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription Status
                      </label>
                      <select
                        name="subscriptionStatus"
                        value={editData.subscriptionStatus || ''}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  onClick={saveEdit}
                  isLoading={editLoading}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaShoppingCart className="mr-2 text-blue-600" />
                Recent Orders
              </h3>
              <div className="text-sm text-gray-500">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-500">No orders found for this user.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber || order._id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.total || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => window.open(`/superadmin/orders/${order._id}`, '_blank')}
                          >
                            <FaEye className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Modals */}
        {showResetModal && (
          <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password">
            <div className="space-y-4">
              <p className="text-gray-600">Enter a new password for this user.</p>
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                minLength={6}
                required
              />
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{resetError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleResetPassword}
                  isLoading={resetLoading}
                >
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResetModal(false)}
                  disabled={resetLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {showDeleteConfirm && (
          <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete User">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-3" />
                  <div>
                    <h4 className="text-red-800 font-semibold">Warning</h4>
                    <p className="text-red-700 text-sm mt-1">
                      Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={handleDeleteUser}
                  isLoading={deleteLoading}
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
} 