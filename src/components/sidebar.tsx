/**
 * Sidebar — Tailwind-first rewrite
 *
 * Design tokens (--sb-*) are defined once here and consumed by NavItem.
 * All text uses semantic CSS variables — never hardcoded rgba(255,255,255,x).
 * This means the sidebar stays correct if --bg-sidebar ever changes.
 *
 * Minimal <style> block covers only what Tailwind cannot:
 *   1. CSS custom property declarations
 *   2. The shimmer keyframe animation
 *   3. Custom scrollbar (vendor-prefixed, no Tailwind equivalent)
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { FaBox } from "react-icons/fa";
import { useAuth } from "../hooks/use-auth";
import { packageService } from "../services/package.service";
import { BryteLinksSvgIcon } from "./common/BryteLinksSvgLogo";
import { NavItem } from "./sidebar/nav-item";
import { getNavSections, isAgent } from "./sidebar/nav-config";
import type { NavItem as NavItemConfig } from "./sidebar/nav-config";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Path matching ──────────────────────────────────────────────────────── */

const prefixMatchPaths = new Set(["/superadmin/wallet"]);

const isExactMatch = (a: string, b: string) =>
  a.replace(/\/$/, "") === b.replace(/\/$/, "");

const useActivePath = (pathname: string) =>
  useCallback(
    (path: string) => {
      if (prefixMatchPaths.has(path)) {
        return isExactMatch(path, pathname) || pathname.startsWith(path + "/");
      }
      return isExactMatch(path, pathname);
    },
    [pathname],
  );

/* ─── Avatar initials ────────────────────────────────────────────────────── */

/** Extracts clean 1–2 char uppercase initials. Handles all edge cases. */
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

const NavSkeleton = () => (
  <div className="space-y-1 px-2" aria-hidden="true" aria-label="Loading navigation">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-10 rounded-md sb-shimmer"
        style={{ animationDelay: `${i * 90}ms` }}
      />
    ))}
  </div>
);

/* ─── Sidebar ────────────────────────────────────────────────────────────── */

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const isActivePath = useActivePath(location.pathname);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(["packages", "wallet"]),
  );
  const [packageNavItems, setPackageNavItems] = useState<NavItemConfig[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  /* Fetch packages (agents only) */
  useEffect(() => {
    if (!isAgent(authState.user?.userType)) {
      setPackagesLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setPackagesLoading(true);
        const response = await packageService.getPackages({ isActive: true });
        if (cancelled) return;
        setPackageNavItems(
          (response.packages ?? [])
            .filter((pkg) => !!pkg._id && pkg.provider !== "AFA")
            .map((pkg) => ({
              label: pkg.name,
              path: `/agent/dashboard/packages/${pkg._id}`,
              icon: <FaBox />,
            })),
        );
      } catch {
        if (!cancelled) setPackageNavItems([]);
      } finally {
        if (!cancelled) setPackagesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authState.user?.userType]);

  const navSections = useMemo(
    () => getNavSections(authState.user?.userType, packageNavItems, packagesLoading),
    [authState.user?.userType, packageNavItems, packagesLoading],
  );

  const toggleExpanded = useCallback((path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const hasActiveChild = useCallback(
    (item: NavItemConfig) =>
      item.children?.some((c) => isActivePath(c.path)) ?? false,
    [isActivePath],
  );

  const handleLogout = useCallback(() => {
    logout();
    onClose();
  }, [logout, onClose]);

  /* Derived values */
  const appName    = authState.user?.businessName || "SaaS Telecom";
  const initials   = getInitials(authState.user?.fullName ?? "");
  const userRole   = authState.user?.userType ?? "User";
  const agentCode  = isAgent(authState.user?.userType) ? (authState.user?.agentCode ?? null) : null;
  const isOnline   = authState.isAuthenticated;

  return (
    <>
      {/* ── CSS design tokens + minimal keyframes ─────────────────────────── */}
      <style>{`
        /*
         * --sb-* tokens are consumed by both Sidebar and NavItem.
         * ALL text references these — never raw rgba(255,255,255,x).
         * To support a light sidebar, override these tokens on [data-theme="light"] aside.
         */
        aside[data-sidebar] {
          --sb-text-primary:   rgba(255, 255, 255, 0.95);
          --sb-text-secondary: rgba(255, 255, 255, 0.55);
          --sb-text-muted:     rgba(255, 255, 255, 0.30);

          --sb-hover-bg:       rgba(255, 255, 255, 0.05);
          --sb-active-bg:      rgba(255, 255, 255, 0.10);
          --sb-accent:         var(--color-secondary-500, #60a5fa);

          --sb-divider:        rgba(255, 255, 255, 0.08);
          --sb-avatar-ring:    rgba(255, 255, 255, 0.12);

          --sb-shimmer-a:      rgba(255, 255, 255, 0.05);
          --sb-shimmer-b:      rgba(255, 255, 255, 0.11);
        }

        /* Shimmer keyframe — cannot be expressed in Tailwind */
        @keyframes sb-shimmer {
          0%, 100% { background-color: var(--sb-shimmer-a); }
          50%       { background-color: var(--sb-shimmer-b); }
        }
        .sb-shimmer {
          animation: sb-shimmer 1.5s ease-in-out infinite;
        }

        /* Thin, themed scrollbar for the nav region */
        .sb-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--sb-divider) transparent;
        }
        .sb-scrollbar::-webkit-scrollbar       { width: 3px; }
        .sb-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sb-scrollbar::-webkit-scrollbar-thumb {
          background: var(--sb-divider);
          border-radius: 9999px;
        }

        @media (prefers-reduced-motion: reduce) {
          .sb-shimmer { animation: none; }
        }
      `}</style>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ── Sidebar shell ─────────────────────────────────────────────────── */}
      <aside
        data-sidebar
        aria-label="Main navigation"
        className={[
          // Layout
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col",
          // Background (preserved from original)
          "[background:var(--bg-sidebar)]",
          // Slide transition
          "transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible, static
          "md:static md:h-screen md:translate-x-0 md:flex-shrink-0",
        ].join(" ")}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-4 py-[18px]"
          style={{ background: "var(--bg-sidebar-header, var(--bg-sidebar))", borderBottom: "1px solid var(--sb-divider)" }}
        >
          {/* Brand */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <BryteLinksSvgIcon className="h-9 w-9 flex-shrink-0" />
            <span className="truncate text-[15px] font-bold tracking-tight text-[var(--sb-text-primary)]">
              BryteLinks
            </span>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className={[
              "ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md md:hidden",
              "text-[var(--sb-text-secondary)] transition-colors duration-150",
              "hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-text-primary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)]",
            ].join(" ")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Navigation menu"
          className="sb-scrollbar flex flex-1 flex-col overflow-y-auto py-3"
        >
          {packagesLoading ? (
            <NavSkeleton />
          ) : (
            <div className="flex flex-col gap-4 px-2">
              {navSections.map((section) => (
                <div key={section.label}>
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--sb-text-muted)]">
                    {section.label}
                  </p>
                  <ul role="list" className="flex flex-col gap-0.5">
                    {section.items.map((item) => (
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
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer
          className="flex flex-shrink-0 flex-col gap-2.5 p-3"
          style={{ borderTop: "1px solid var(--sb-divider)" }}
        >
          {/* User card */}
          <div
            className="flex items-center gap-2.5 rounded-lg p-2"
            style={{ background: "var(--sb-hover-bg)" }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0" aria-hidden="true">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "text-[13px] font-bold tracking-wide text-[var(--sb-text-primary)]",
                ].join(" ")}
                style={{
                  background: "linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-700, #2563eb))",
                  boxShadow: "0 0 0 1px var(--sb-avatar-ring)",
                }}
              >
                {initials}
              </div>
              {/* Online status dot */}
              <span
                className={[
                  "absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full",
                  "border-2 transition-colors duration-300",
                  isOnline ? "bg-emerald-500" : "bg-[var(--sb-text-muted)]",
                ].join(" ")}
                style={{ borderColor: "var(--bg-sidebar)" }}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>

            {/* User info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-[var(--sb-text-primary)]">
                {authState.user?.fullName}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="truncate text-[11px] capitalize text-[var(--sb-text-secondary)]">
                  {userRole}
                </span>
                {agentCode && (
                  <span
                    className="flex-shrink-0 rounded px-1 py-px text-[10px] font-bold tracking-wider font-mono"
                    style={{
                      color: "var(--sb-accent)",
                      background: "rgba(96, 165, 250, 0.12)",
                    }}
                  >
                    {agentCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={[
              "flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md px-4 py-2",
              "text-[13px] font-semibold transition-colors duration-150",
              "text-red-300 border border-red-500/20 bg-red-500/10",
              "hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70",
            ].join(" ")}
          >
            <LogOut size={15} aria-hidden="true" />
            <span>Logout</span>
          </button>

          {/* App meta */}
          <div className="flex items-center justify-between px-1">
            <span className="max-w-[70%] truncate text-[11px] text-[var(--sb-text-muted)]">
              {appName}
            </span>
            <span
              className="flex-shrink-0 rounded-full border px-1.5 py-px text-[10px] font-mono font-semibold tracking-wide text-[var(--sb-text-muted)]"
              style={{ borderColor: "var(--sb-divider)", background: "var(--sb-hover-bg)" }}
            >
              v1.0.0
            </span>
          </div>
        </footer>
      </aside>
    </>
  );
};