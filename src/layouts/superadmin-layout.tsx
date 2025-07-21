import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaUserShield, FaUsers, FaBuilding, FaClipboardList, FaWallet, FaCog, FaTachometerAlt } from "react-icons/fa";

const navLinks = [
  { to: "/superadmin", label: "Dashboard", icon: <FaTachometerAlt /> },
  { to: "/superadmin/users", label: "Users", icon: <FaUsers /> },
  { to: "/superadmin/providers", label: "Providers", icon: <FaBuilding /> },
  { to: "/superadmin/orders", label: "Orders", icon: <FaClipboardList /> },
  { to: "/superadmin/wallet", label: "Wallet", icon: <FaWallet /> },
  { to: "/superadmin/settings", label: "Settings", icon: <FaCog /> },
];

export default function SuperAdminLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <span className="text-xl font-bold text-blue-700 flex items-center gap-2">
            <FaUserShield className="text-2xl" /> Super Admin
          </span>
        </div>
        <nav className="flex-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 transition-colors font-medium ${location.pathname === link.to ? "bg-blue-100 text-blue-700" : ""}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow flex items-center px-6 justify-between">
          <span className="font-semibold text-lg text-gray-800">Super Admin Dashboard</span>
          {/* Add user avatar, logout, etc. here if needed */}
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 