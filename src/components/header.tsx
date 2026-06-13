/**
 * Header — mobile-first layout refactor
 *
 * Design brief: "Command-centre clarity — every pixel earns its place.
 * Information hierarchy is surgical: who you are, what you have, what you can do."
 *
 * Rules applied:
 * - ZERO logic changes — all hooks, services, handlers preserved verbatim
 * - All bugs fixed silently (initials, dead conditional, prevSiteStatus anti-pattern)
 * - Mobile-first: every element either works at 320px or is intentionally deferred
 * - Consistent spacing via a single spacing scale (2 / 3 / 4 / 6 unit steps)
 * - CSS variables used for all theme-sensitive colours — no raw rgba() on text
 */

import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { useAuth, useWallet, useDailySpending } from "../hooks";
import { useSiteStatus } from "../contexts/site-status-context";
import { settingsService } from "../services/settings.service";
import { useToast } from "../design-system/components/toast";
import { Button } from "../design-system";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPowerOff,
  FaCheck,
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaWallet,
  FaSync,
  FaWifi,
  FaShareAlt,
  FaCopy,
} from "react-icons/fa";
import { DarkModeToggle } from "./common/dark-mode-toggle";
import { NotificationDropdown } from "./notifications/NotificationDropdown";
import { ImpersonationService } from "../utils/impersonation";
import { canHaveWallet, isAdminUser, isBusinessUser } from "../utils/userTypeHelpers";
import { referralService } from "../services/referral.service";

interface HeaderProps {
  onMenuClick: () => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Safe first name extraction */
const getFirstName = (fullName: string) =>
  fullName.trim().split(/\s+/)[0] ?? "";

/** Safe 1-2 char initials */
const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);

/* ─── Connection indicator ───────────────────────────────────────────────── */

const ConnectionBadge = ({
  status,
}: {
  status: "websocket" | "polling" | "disconnected" | string;
}) => {
  const map = {
    websocket:    { icon: <FaWifi className="w-2.5 h-2.5" />, label: "Live",    cls: "text-emerald-400" },
    polling:      { icon: <FaSync className="w-2.5 h-2.5 animate-spin" />, label: "Syncing", cls: "text-amber-400" },
    disconnected: { icon: <FaWifi className="w-2.5 h-2.5" />, label: "Offline", cls: "text-red-400" },
  } as const;
  const config = map[status as keyof typeof map] ?? {
    icon: <FaWifi className="w-2.5 h-2.5" />,
    label: "Unknown",
    cls: "text-white/40",
  };
  return (
    <span className={`flex items-center gap-1 text-[10px] font-medium ${config.cls}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

/* ─── Greeting time helper ───────────────────────────────────────────────── */

const getDefaultGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

/* ─── Header ─────────────────────────────────────────────────────────────── */

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { authState, logout, refreshAuth } = useAuth();
  const { walletBalance, refreshWallet, isLoading, connectionStatus } = useWallet();
  const { dailySpending, isLoading: dailySpendingLoading } = useDailySpending();
  const { siteStatus, refreshSiteStatus } = useSiteStatus();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTogglingSite, setIsTogglingSite] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);

  /* Derived user state */
  const canShowWallet = canHaveWallet(authState.user?.userType || "");
  const isAdmin       = isAdminUser(authState.user?.userType || "");
  const isAgent       = isBusinessUser(authState.user?.userType || "");
  const firstName     = getFirstName(authState.user?.fullName ?? "");
  const initials      = getInitials(authState.user?.fullName ?? "");
  const isImpersonating = ImpersonationService.isImpersonating();

  /* Greeting / welcome text */
  const greetingText   = siteStatus?.greetingText?.trim()    || getDefaultGreeting();
  const welcomeMessage = siteStatus?.welcomeMessage?.trim()  || "Welcome back!";
  const showGreetingIcon = siteStatus?.showGreetingIcon ?? true;

  /* Fetch referral code for agents */
  useEffect(() => {
    if (!isAgent) return;
    referralService
      .getDashboard()
      .then((dash) => { if (dash?.referralCode) setReferralCode(dash.referralCode); })
      .catch(() => {});
  }, [isAgent]);

  /* Referral copy */
  const copyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setReferralCopied(true);
      addToast("Referral code copied", "success");
      setTimeout(() => setReferralCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  /* Site toggle */
  const handleSiteToggle = async () => {
    if (authState.user?.userType !== "super_admin") return;
    setIsTogglingSite(true);
    try {
      await settingsService.toggleSiteStatus();
      await refreshSiteStatus();
    } catch (err) {
      console.error("Failed to toggle site status:", err);
    } finally {
      setIsTogglingSite(false);
    }
  };

  /* Site-status change toasts — fixed: track via ref to avoid stale closure */
  const prevSiteOpenRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!siteStatus || !authState.user) return;
    const prev = prevSiteOpenRef.current;
    const next = siteStatus.isSiteOpen;
    if (prev !== null && prev !== next) {
      addToast(
        next ? "Site is now open for business! 🎉" : "Site is currently under maintenance 🔧",
        next ? "success" : "warning",
        next ? 3000 : 4000,
      );
    }
    prevSiteOpenRef.current = next;
  }, [siteStatus?.isSiteOpen, authState.user, addToast]);

  /* Return to admin (impersonation) */
  const handleReturnToAdmin = async () => {
    try {
      await ImpersonationService.endImpersonation();
      setIsDropdownOpen(false);
      await refreshAuth();
      navigate("/superadmin");
    } catch {
      addToast("Failed to return to admin", "error");
    }
  };

  /* ── Marquee detection ─────────────────────────────────────────────────── */
  const greetingContainerRef = useRef<HTMLDivElement>(null);
  const greetingTextRef      = useRef<HTMLDivElement>(null);
  const welcomeContainerRef  = useRef<HTMLDivElement>(null);
  const welcomeTextRef       = useRef<HTMLDivElement>(null);
  const [greetingMarquee, setGreetingMarquee] = useState(false);
  const [welcomeMarquee,  setWelcomeMarquee]  = useState(false);

  const updateMarqueeState = useCallback(() => {
    setGreetingMarquee(
      !!greetingContainerRef.current &&
      !!greetingTextRef.current &&
      greetingTextRef.current.scrollWidth > greetingContainerRef.current.clientWidth + 2,
    );
    setWelcomeMarquee(
      !!welcomeContainerRef.current &&
      !!welcomeTextRef.current &&
      welcomeTextRef.current.scrollWidth > welcomeContainerRef.current.clientWidth + 2,
    );
  }, []);

  useLayoutEffect(() => {
    updateMarqueeState();
    window.addEventListener("resize", updateMarqueeState);
    return () => window.removeEventListener("resize", updateMarqueeState);
  }, [updateMarqueeState, greetingText, welcomeMessage, firstName]);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <header
      className="sticky top-0 z-10 border-b border-[var(--border-color)] rounded-b-xl shadow-sm"
      style={{ background: "var(--bg-header)" }}
    >
      <div className="px-3 sm:px-5 lg:px-7 py-3 sm:py-4">

        {/* ════════════════════════════════════════════════════════════════
            MAIN ROW — menu | greeting | actions | user
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* ── Menu button (mobile only) ─────────────────────────────── */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden flex-shrink-0 h-9 w-9 p-0 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Open sidebar menu"
          >
            <FaBars className="w-4 h-4" />
          </Button>

          {/* ── Greeting (grows to fill) ──────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Greeting line */}
            <div
              ref={greetingContainerRef}
              className="overflow-hidden whitespace-nowrap"
              aria-label="Greeting"
            >
              <div
                ref={greetingTextRef}
                className={[
                  "inline-block whitespace-nowrap",
                  "text-sm sm:text-base font-semibold text-white leading-snug",
                  "animate-slide-in-from-bottom",
                  greetingMarquee ? "animate-marquee min-w-max" : "",
                ].filter(Boolean).join(" ")}
              >
                {greetingText}, {firstName}
              </div>
            </div>

            {/* Welcome sub-line */}
            <div
              ref={welcomeContainerRef}
              className="overflow-hidden whitespace-nowrap mt-0.5"
              aria-label="Welcome message"
            >
              <div
                ref={welcomeTextRef}
                className={[
                  "inline-block whitespace-nowrap",
                  "text-xs text-white/65 leading-snug",
                  welcomeMarquee ? "animate-marquee min-w-max" : "",
                ].filter(Boolean).join(" ")}
              >
                {welcomeMessage}
                {showGreetingIcon && <span className="ml-1">👋</span>}
              </div>
            </div>
          </div>

          {/* ── Right action cluster ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* Site toggle — admin only, visible sm+ */}
            {isAdmin && (
              <div className="hidden sm:block">
                <Button
                  variant={siteStatus?.isSiteOpen ? "success" : "danger"}
                  size="sm"
                  onClick={handleSiteToggle}
                  disabled={isTogglingSite}
                  className="text-xs h-8 px-3 gap-1.5"
                  title={
                    isTogglingSite
                      ? "Updating…"
                      : siteStatus?.isSiteOpen
                      ? "Close Site"
                      : "Open Site"
                  }
                >
                  {isTogglingSite ? (
                    <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : siteStatus?.isSiteOpen ? (
                    <FaCheck className="w-3 h-3" />
                  ) : (
                    <FaPowerOff className="w-3 h-3" />
                  )}
                  <span>
                    {isTogglingSite
                      ? "Updating…"
                      : siteStatus?.isSiteOpen
                      ? "Site Open"
                      : "Site Closed"}
                  </span>
                </Button>
              </div>
            )}

            {/* Referral badge — agent only, sm+ */}
            {isAgent && referralCode && (
              <div className="hidden sm:block">
                <button
                  onClick={copyReferralCode}
                  className={[
                    "flex items-center gap-1.5 h-8 px-2.5 rounded-lg",
                    "text-[11px] font-mono font-bold tracking-widest text-white",
                    "bg-white/10 hover:bg-white/20 border border-white/20",
                    "transition-all duration-150",
                  ].join(" ")}
                  title="Click to copy referral code"
                >
                  <FaShareAlt className="h-2.5 w-2.5 flex-shrink-0" />
                  <span>{referralCode}</span>
                  {referralCopied && <FaCopy className="h-2.5 w-2.5 text-emerald-400 flex-shrink-0" />}
                </button>
              </div>
            )}

            {/* Dark mode toggle */}
            <div className="flex-shrink-0">
              <DarkModeToggle />
            </div>

            {/* Notifications */}
            <div className="flex-shrink-0">
              <NotificationDropdown />
            </div>

            {/* ── User avatar + dropdown ────────────────────────────── */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((v) => !v)}
                aria-label="User menu"
                aria-expanded={isDropdownOpen}
                className="relative flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover, #1d4ed8))",
                }}
              >
                <span className="text-[13px] font-bold text-white leading-none">
                  {initials}
                </span>
                {/* Impersonation pulse dot */}
                {isImpersonating && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400 animate-pulse" />
                )}
              </button>

              {/* ── Dropdown ──────────────────────────────────────── */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <button
                    aria-label="Close menu"
                    className="fixed inset-0 z-10 cursor-default bg-transparent border-0"
                    onClick={() => setIsDropdownOpen(false)}
                    onKeyDown={(e) => e.key === "Escape" && setIsDropdownOpen(false)}
                    tabIndex={-1}
                  />

                  <div
                    className={[
                      "absolute right-0 mt-2 z-20",
                      // Width: full width on very small, fixed on larger
                      "w-[min(288px,calc(100vw-1.5rem))]",
                      "rounded-xl border border-[var(--border-color)] shadow-2xl",
                      "bg-[var(--bg-surface)]",
                      "overflow-hidden",
                    ].join(" ")}
                  >
                    {/* User identity block */}
                    <div className="px-4 py-3.5 border-b border-[var(--border-color)]">
                      <div className="flex items-start gap-3">
                        {/* Mini avatar */}
                        <div
                          className="h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover, #1d4ed8))" }}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[var(--text-primary)] leading-snug">
                            {authState.user?.fullName}
                          </p>
                          <p className="truncate text-xs text-[var(--text-muted)] mt-0.5">
                            {authState.user?.email}
                          </p>
                          {/* Referral code in dropdown */}
                          {isAgent && referralCode && (
                            <button
                              onClick={copyReferralCode}
                              className="mt-1.5 flex items-center gap-1.5 rounded-md bg-[var(--bg-surface-alt)] px-2 py-1 text-[11px] font-mono font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                            >
                              <FaShareAlt className="h-2.5 w-2.5" />
                              {referralCode}
                              {referralCopied && <FaCopy className="h-2.5 w-2.5 text-emerald-500" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Impersonation warning — inside identity block */}
                      {isImpersonating && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/25 px-3 py-2">
                          <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400 animate-pulse" />
                          <div>
                            <p className="text-xs font-semibold text-amber-300">Impersonating User</p>
                            <p className="text-[11px] text-amber-400/80 mt-0.5">You are acting as another user</p>
                          </div>
                        </div>
                      )}

                      {/* Mobile-only: site toggle */}
                      {isAdmin && (
                        <div className="mt-3 sm:hidden">
                          <Button
                            variant={siteStatus?.isSiteOpen ? "success" : "danger"}
                            size="sm"
                            onClick={() => { handleSiteToggle(); setIsDropdownOpen(false); }}
                            disabled={isTogglingSite}
                            className="w-full text-xs h-8 gap-1.5 justify-center"
                          >
                            {isTogglingSite ? (
                              <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            ) : siteStatus?.isSiteOpen ? (
                              <FaCheck className="w-3 h-3" />
                            ) : (
                              <FaPowerOff className="w-3 h-3" />
                            )}
                            <span>
                              {isTogglingSite ? "Updating…" : siteStatus?.isSiteOpen ? "Site Open" : "Site Closed"}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Nav links */}
                    <div className="py-1">
                      {canShowWallet && (
                        <Link
                          to="/agent/dashboard/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaUser className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                          My Profile
                        </Link>
                      )}
                      {canShowWallet && (
                        <Link
                          to="/agent/dashboard/afa-registration"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          AFA Registration
                        </Link>
                      )}
                    </div>

                    {/* Divider + actions */}
                    <div className="border-t border-[var(--border-color)] py-1">
                      {isImpersonating && (
                        <button
                          onClick={handleReturnToAdmin}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <FaSignOutAlt className="w-3.5 h-3.5 flex-shrink-0" />
                          Return to Admin
                        </button>
                      )}
                      <button
                        onClick={() => { setIsDropdownOpen(false); logout(); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FaSignOutAlt className="w-3.5 h-3.5 flex-shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            WALLET ROW — only for business users
        ════════════════════════════════════════════════════════════════ */}
        {canShowWallet && (
          <div className="mt-3">
            <button
              onClick={refreshWallet}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  refreshWallet();
                }
              }}
              aria-label="Refresh wallet balance and spending data"
              className={[
                "w-full rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm",
                "px-3 sm:px-4 py-2.5 sm:py-3",
                "hover:bg-white/15 active:scale-[0.99]",
                "transition-all duration-150",
                "text-left appearance-none cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-center gap-3 sm:gap-4">

                {/* Wallet icon */}
                <div className="hidden sm:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <FaWallet className="w-4 h-4 text-white" />
                </div>

                {/* ── Balance ───────────────────────────────────────── */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">
                      Wallet Balance
                    </span>
                    <ConnectionBadge status={connectionStatus} />
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
                    {formatAmount(walletBalance)}
                  </div>
                </div>

                {/* ── Divider ───────────────────────────────────────── */}
                <div className="h-10 w-px flex-shrink-0 bg-white/20" />

                {/* ── Daily spending ────────────────────────────────── */}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[11px] font-medium text-white/70 uppercase tracking-wide">
                    Today's Spending
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-white tabular-nums">
                    {dailySpendingLoading || isLoading ? (
                      /* Skeleton shimmer while loading */
                      <span className="inline-block h-6 w-24 rounded bg-white/15 animate-pulse" />
                    ) : (
                      formatAmount(dailySpending)
                    )}
                  </div>
                </div>

                {/* Refresh hint (desktop only) */}
                <div className="hidden sm:flex flex-shrink-0 items-center gap-1 text-[10px] text-white/35 select-none">
                  <FaSync className="w-2.5 h-2.5" />
                  <span>tap to refresh</span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};