import React from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaBuilding, FaClipboardList, FaWallet, FaCog } from "react-icons/fa";

const quickLinks = [
  { to: "/superadmin/users", label: "Manage Users", icon: <FaUsers className="text-blue-600 text-2xl" /> },
  { to: "/superadmin/providers", label: "Manage Providers", icon: <FaBuilding className="text-green-600 text-2xl" /> },
  { to: "/superadmin/orders", label: "View Orders", icon: <FaClipboardList className="text-yellow-600 text-2xl" /> },
  { to: "/superadmin/wallet", label: "Wallet & Transactions", icon: <FaWallet className="text-purple-600 text-2xl" /> },
  { to: "/superadmin/settings", label: "Settings", icon: <FaCog className="text-gray-600 text-2xl" /> },
];

export default function SuperAdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, Super Admin!</h1>
      <p className="mb-8 text-gray-600">Access all platform controls and analytics from this dashboard.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-4 p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-100 hover:border-blue-300"
          >
            {link.icon}
            <span className="font-medium text-lg">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 