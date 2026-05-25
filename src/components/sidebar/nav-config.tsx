import type { ReactNode } from "react";
import { Home, Plus, Loader2 } from "lucide-react";
import {
  FaBox,
  FaMobile,
  FaUsers,
  FaUsersCog,
  FaWallet,
  FaUser,
  FaCog,
  FaTachometerAlt,
  FaBuilding,
  FaClipboardList,
  FaMoneyBillWave,
  FaCreditCard,
  FaHistory,
  FaBullhorn,
  FaStore,
  FaShareAlt,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  children?: NavItem[];
}

const agentNavItems = (packages: NavItem[] = []): NavItem[] => [
  { label: "Dashboard", path: "/agent/dashboard", icon: <Home className="w-5 h-5" /> },
  { label: "Packages", path: "/agent/dashboard/packages", icon: <FaBox />, children: packages },
  { label: "Orders", path: "/agent/dashboard/orders", icon: <FaMobile /> },
  { label: "Wallet", path: "/agent/dashboard/wallet", icon: <FaWallet /> },
  { label: "Commission", path: "/agent/dashboard/commissions", icon: <FaMoneyCheckAlt /> },
  { label: "My Storefront", path: "/agent/dashboard/storefront", icon: <FaStore /> },
  { label: "AFA Registration", path: "/agent/dashboard/afa-registration", icon: <Plus className="w-5 h-5" /> },
  { label: "Profile", path: "/agent/dashboard/profile", icon: <FaUser /> },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <Home className="w-5 h-5" /> },
  { label: "User Management", path: "/admin/dashboard/users", icon: <FaUsersCog /> },
  { label: "Packages", path: "/admin/dashboard/packages", icon: <FaBox /> },
  { label: "Wallet", path: "/admin/dashboard/wallet", icon: <FaWallet /> },
  { label: "Profile", path: "/admin/dashboard/profile", icon: <FaUser /> },
];

const superAdminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/superadmin", icon: <FaTachometerAlt /> },
  { label: "Analytics", path: "/superadmin/analytics", icon: <FaChartLine /> },
  { label: "Users", path: "/superadmin/users", icon: <FaUsers /> },
  { label: "Providers", path: "/superadmin/providers", icon: <FaBuilding /> },
  { label: "Packages", path: "/superadmin/packages", icon: <FaBox /> },
  { label: "Orders", path: "/superadmin/orders", icon: <FaClipboardList /> },
  { label: "Announcements", path: "/superadmin/announcements", icon: <FaBullhorn /> },
  { label: "Stores", path: "/superadmin/stores", icon: <FaStore /> },
  {
    label: "Wallet",
    path: "/superadmin/wallet",
    icon: <FaWallet />,
    children: [
      { label: "Top-ups", path: "/superadmin/wallet/top-ups", icon: <FaCreditCard /> },
      { label: "Payouts", path: "/superadmin/wallet/payouts", icon: <FaMoneyBillWave /> },
      { label: "Transaction History", path: "/superadmin/wallet/history", icon: <FaHistory /> },
    ],
  },
  { label: "Referrals", path: "/superadmin/referrals", icon: <FaShareAlt /> },
  { label: "Settings", path: "/superadmin/settings", icon: <FaCog /> },
];

const loadingItem: NavItem = {
  label: "Loading...",
  path: "",
  icon: <Loader2 className="w-4 h-4 animate-spin" />,
};

const agentTypes = new Set(["agent", "super_agent", "dealer", "super_dealer"]);

export function getNavItems(
  userType: string | undefined,
  packages: NavItem[],
  packagesLoading: boolean,
): NavItem[] {
  const resolvedPackages =
    packagesLoading && packages.length === 0
      ? [loadingItem]
      : packages;

  if (agentTypes.has(userType ?? "")) {
    return agentNavItems(resolvedPackages);
  }
  if (userType === "super_admin") {
    return superAdminNavItems;
  }
  return adminNavItems;
}

export function isAgent(userType: string | undefined): boolean {
  return agentTypes.has(userType ?? "");
}
