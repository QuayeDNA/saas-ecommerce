import React, { useEffect, useState } from "react";
import { userService, type User } from "../../services/user.service";
import { FaCheck, FaTimes, FaSearch, FaUser, FaStore, FaShieldAlt, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Button } from "../../design-system/components/button";
import { colors } from "../../design-system/tokens";

const userTypeOptions = [
  { value: '', label: 'All' },
  { value: 'agent', label: 'Agents' },
  { value: 'customer', label: 'Customers' },
  { value: 'super_admin', label: 'Super Admins' },
];
const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('');
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.fetchUsers({ userType, status });
      setUsers(data);
    } catch (e) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [userType, status]);

  const handleApprove = async (id: string) => {
    await userService.updateAgentStatus(id, 'active');
    fetchUsers();
  };
  const handleReject = async (id: string) => {
    await userService.updateAgentStatus(id, 'rejected');
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-6">
      <h1 className="text-xl font-bold mb-4" style={{ color: colors.brand.primary }}>User Management</h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex gap-2">
          <select className="border rounded px-2 py-1" value={userType} onChange={e => setUserType(e.target.value)}>
            {userTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <FaSearch className="text-gray-400" />
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow text-sm border border-gray-200">
          <thead>
            <tr style={{ background: colors.brand.background }}>
              <th className="p-2 text-left font-semibold" style={{ color: colors.brand.primary }}>Name</th>
              <th className="p-2 text-left font-semibold" style={{ color: colors.brand.primary }}>Email</th>
              <th className="p-2 text-left font-semibold" style={{ color: colors.brand.primary }}>Type</th>
              <th className="p-2 text-left font-semibold" style={{ color: colors.brand.primary }}>Status</th>
              <th className="p-2 text-left font-semibold" style={{ color: colors.brand.primary }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-4">No users found.</td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-2 flex items-center gap-2">
                  {user.userType === 'agent' ? <FaStore className="text-black" /> : user.userType === 'super_admin' ? <FaShieldAlt className="text-black" /> : <FaUser className="text-black" />}
                  <span className="font-medium text-black">{user.fullName}</span>
                </td>
                <td className="p-2 text-black">{user.email}</td>
                <td className="p-2 capitalize text-black">{user.userType.replace('_', ' ')}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                </td>
                <td className="p-2 flex gap-2 items-center">
                  {user.userType === 'agent' && user.status === 'pending' && (
                    <>
                      <Button size="xs" variant="success" onClick={() => handleApprove(user._id)} leftIcon={<FaCheck />}>Approve</Button>
                      <Button size="xs" variant="danger" onClick={() => handleReject(user._id)} leftIcon={<FaTimes />}>Reject</Button>
                    </>
                  )}
                  <Button size="xs" variant="outline" onClick={() => navigate(`/superadmin/users/${user._id}`)} rightIcon={<FaChevronRight />}>Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 