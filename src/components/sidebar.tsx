import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { FaBox } from "react-icons/fa";
import { useAuth } from "../hooks/use-auth";
import { packageService } from "../services/package.service";
import { BryteLinksSvgIcon } from "./common/BryteLinksSvgLogo";
import { NavItem } from "./sidebar/nav-item";
import { getNavItems, isAgent } from "./sidebar/nav-config";
import type { NavItem as NavItemConfig } from "./sidebar/nav-config";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const prefixMatchPaths = new Set(["/superadmin/wallet"]);
const isExactMatch = (a: string, b: string) =>
  a.replace(/\/$/, "") === b.replace(/\/$/, "");

const useActivePath = (locationPathname: string) => {
  return useCallback(
    (path: string) => {
      if (prefixMatchPaths.has(path)) {
        return (
          isExactMatch(path, locationPathname) ||
          locationPathname.startsWith(path + "/")
        );
      }
      return isExactMatch(path, locationPathname);
    },
    [locationPathname],
  );
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const isActivePath = useActivePath(location.pathname);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(["packages", "wallet"]),
  );

  const [packageNavItems, setPackageNavItems] = useState<NavItemConfig[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    const agent = isAgent(authState.user?.userType);
    if (!agent) {
      setPackagesLoading(false);
      return;
    }

    let cancelled = false;
    const fetch = async () => {
      try {
        setPackagesLoading(true);
        const response = await packageService.getPackages({ isActive: true });
        if (cancelled) return;
        const items: NavItemConfig[] = (response.packages || [])
          .filter((pkg) => !!pkg._id && pkg.provider !== "AFA")
          .map((pkg) => ({
            label: pkg.name,
            path: `/agent/dashboard/packages/${pkg._id}`,
            icon: <FaBox />,
          }));
        setPackageNavItems(items);
      } catch {
        if (!cancelled) setPackageNavItems([]);
      } finally {
        if (!cancelled) setPackagesLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [authState.user?.userType]);

  const navItems = useMemo(
    () => getNavItems(authState.user?.userType, packageNavItems, packagesLoading),
    [authState.user?.userType, packageNavItems, packagesLoading],
  );

  const toggleExpanded = useCallback((path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const hasActiveChild = useCallback(
    (item: NavItemConfig) =>
      item.children?.some((child) => isActivePath(child.path)) ?? false,
    [isActivePath],
  );

  const getAppName = useCallback(() => {
    return authState.user?.businessName || "SaaS Telecom";
  }, [authState.user?.businessName]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 text-white transform transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static md:h-screen md:flex-shrink-0`}
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Logo and close button */}
      <div
        className="flex items-center justify-between px-4 py-5 shadow-md"
        style={{ background: "var(--bg-sidebar-header)" }}
      >
        <div className="flex items-center min-w-0 flex-1">
          <BryteLinksSvgIcon className="w-10 h-10 mr-1 flex-shrink-0" />
          <div className="text-lg sm:text-xl font-bold truncate text-white">
            BryteLinks
          </div>
        </div>
        <button
          aria-label="Close sidebar"
          className="text-white/60 hover:text-white md:hidden focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-md p-1 flex-shrink-0"
          style={{
            "--tw-ring-color": "var(--color-secondary-500)",
          } as React.CSSProperties}
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-6 py-2 mb-1">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Menu
          </p>
        </div>
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              level={0}
              isActive={isActivePath(item.path)}
              isExpanded={expandedItems.has(item.path)}
              hasActiveChild={hasActiveChild(item)}
              checkActive={isActivePath}
              onToggle={toggleExpanded}
              onClose={onClose}
            />
          ))}
        </ul>
      </nav>

      {/* User info section */}
      <div className="mt-auto">
        <div
          className="p-4 border-t"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0 relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md"
                style={{
                  background:
                    "linear-gradient(to bottom right, var(--color-secondary-500), var(--color-secondary-600))",
                }}
              >
                {authState.user?.fullName.charAt(0)}
                {authState.user?.fullName.split(" ")[1]?.charAt(0) ?? ""}
              </div>
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="text-sm font-medium truncate text-white">
                {authState.user?.fullName}
              </div>
              <div className="flex items-center">
                <span
                  className={`w-2 h-2 ${
                    authState.isAuthenticated ? "bg-success" : "bg-white/40"
                  } rounded-full mr-1 flex-shrink-0`}
                />
                <p className="text-xs text-white/60 truncate capitalize">
                  {authState.user?.userType ?? "User"}
                </p>
                {isAgent(authState.user?.userType) &&
                  authState.user?.agentCode && (
                    <div className="ml-2 text-md font-mono font-bold text-white tracking-wide">
                      {authState.user?.agentCode}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-error hover:bg-error/90 rounded-md transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-error focus:ring-opacity-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        <div
          className="p-3 border-t text-center"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="text-xs text-white/40 truncate">{getAppName()}</div>
          <div className="text-xs text-white/60 font-semibold">v1.0.0</div>
        </div>
      </div>
    </aside>
  );
};
