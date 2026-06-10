import type { ReactNode } from "react";
import { Home, Plus } from "lucide-react";
import {
  FaBox,
  FaUsers,
  FaUsersCog,
  FaWallet,
  FaUser,
  FaCog,
  FaTachometerAlt,
  FaClipboardList,
  FaMoneyBillWave,
  FaCreditCard,
  FaHistory,
  FaBullhorn,
  FaStore,
  FaShareAlt,
  FaMoneyCheckAlt,
  FaCode,
} from "react-icons/fa";
import { isBusinessUser } from "../../utils/userTypeHelpers";
import { FaChartLine } from "react-icons/fa6";

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/* ─── Agent nav ──────────────────────────────────────────────────────────── */

const agentSections = (packages: NavItem[] = []): NavSection[] => [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/agent/dashboard", icon: <Home className="w-4 h-4" /> },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Packages",
        path: "/agent/dashboard/packages",
        icon: <FaBox />,
        children: packages.length > 0 ? packages : undefined,
      },
      { label: "Orders", path: "/agent/dashboard/orders", icon: <FaClipboardList /> },
      { label: "My Storefront", path: "/agent/dashboard/storefront", icon: <FaStore /> },
      { label: "API Marketplace", path: "/agent/dashboard/api-marketplace", icon: <FaCode /> },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Wallet", path: "/agent/dashboard/wallet", icon: <FaWallet /> },
      { label: "Commission", path: "/agent/dashboard/commissions", icon: <FaMoneyCheckAlt /> },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "AFA Registration", path: "/agent/dashboard/afa-registration", icon: <Plus className="w-4 h-4" /> },
      { label: "Profile", path: "/agent/dashboard/profile", icon: <FaUser /> },
    ],
  },
];

/* ─── Admin nav ──────────────────────────────────────────────────────────── */

const adminSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <Home className="w-4 h-4" /> },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Packages", path: "/admin/dashboard/packages", icon: <FaBox /> },
      { label: "API Marketplace", path: "/admin/dashboard/api-marketplace", icon: <FaCode /> },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Wallet", path: "/admin/dashboard/wallet", icon: <FaWallet /> },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "User Management", path: "/admin/dashboard/users", icon: <FaUsersCog /> },
      { label: "Profile", path: "/admin/dashboard/profile", icon: <FaUser /> },
    ],
  },
];

/* ─── Super admin nav ────────────────────────────────────────────────────── */

const superAdminSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/superadmin", icon: <FaTachometerAlt /> },
      { label: "Analytics", path: "/superadmin/analytics", icon: <FaChartLine /> },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Users", path: "/superadmin/users", icon: <FaUsers /> },
      { label: "Packages", path: "/superadmin/packages", icon: <FaBox /> },
      { label: "Orders", path: "/superadmin/orders", icon: <FaClipboardList /> },
      { label: "Announcements", path: "/superadmin/announcements", icon: <FaBullhorn /> },
      { label: "Stores", path: "/superadmin/stores", icon: <FaStore /> },
      { label: "Referrals", path: "/superadmin/referrals", icon: <FaShareAlt /> },
    ],
  },
  {
    label: "Finance",
    items: [
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
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", path: "/superadmin/settings", icon: <FaCog /> },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

export function isAgent(userType: string | undefined): boolean {
  return isBusinessUser(userType ?? "");
}

export function getNavSections(
  userType: string | undefined,
  packages: NavItem[],
  packagesLoading: boolean,
): NavSection[] {
  if (isAgent(userType)) {
    return agentSections(packagesLoading ? [] : packages);
  }
  if (userType === "super_admin") return superAdminSections;
  return adminSections;
}
