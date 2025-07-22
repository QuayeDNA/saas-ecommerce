import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService, type User } from "../../services/user.service";
import { Button } from "../../design-system/components/button";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import { orderService } from "../../services/order.service";

export default function SuperAdminUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      if (id) {
        const data = await userService.fetchUserById(id);
        setUser(data);
        // Fetch recent orders for this user
        const recentOrders = await orderService.getOrdersByUserId(id, 5);
        setOrders(recentOrders);
      }
    } catch {
      setError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const handleApprove = async () => {
    if (!user) return;
    setActionLoading(true);
    await userService.updateAgentStatus(user._id, "active");
    fetchUser();
    setActionLoading(false);
  };
  const handleReject = async () => {
    if (!user) return;
    setActionLoading(true);
    await userService.updateAgentStatus(user._id, "rejected");
    fetchUser();
    setActionLoading(false);
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error || !user) return <div className="p-4 text-center text-red-600">{error || "User not found"}</div>;

  return (
    <div className="max-w-xl mx-auto p-2 sm:p-6">
      <button className="mb-4 flex items-center text-blue-600 hover:underline" onClick={() => navigate(-1)}>
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-2">User Details</h1>
        <div className="mb-4 text-sm text-gray-500">ID: {user._id}</div>
        <div className="space-y-2 mb-4">
          <div><span className="font-semibold">Name:</span> {user.fullName}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Phone:</span> {user.phone}</div>
          <div><span className="font-semibold">User Type:</span> {user.userType}</div>
          <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></div>
          {user.createdAt && <div><span className="font-semibold">Registered:</span> {new Date(user.createdAt).toLocaleString()}</div>}
          {user.userType === 'agent' && (
            <>
              <div><span className="font-semibold">Business Name:</span> {user.businessName || '-'}</div>
              <div><span className="font-semibold">Business Category:</span> {user.businessCategory || '-'}</div>
            </>
          )}
        </div>
        {user.userType === 'agent' && user.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button variant="success" onClick={handleApprove} isLoading={actionLoading} leftIcon={<FaCheck />}>Approve</Button>
            <Button variant="danger" onClick={handleReject} isLoading={actionLoading} leftIcon={<FaTimes />}>Reject</Button>
          </div>
        )}
      </div>
      {/* Recent Orders */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="text-gray-500 text-sm">No recent orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b">
                    <td className="p-2 font-mono">{order.orderNumber || order._id}</td>
                    <td className="p-2 capitalize">{order.status}</td>
                    <td className="p-2">GH¢{order.totalPrice?.toFixed(2) ?? '-'}</td>
                    <td className="p-2">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 