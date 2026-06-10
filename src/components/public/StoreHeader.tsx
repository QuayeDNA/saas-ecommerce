import { memo } from "react";
import type { ThemeConfig } from "./types";

// =============================================================================
// StoreHeader — 3 layouts: Signal (minimal), Canvas (classic), Pulse (modern)
// =============================================================================

interface StoreHeaderProps {
  theme: ThemeConfig;
  storefront: {
    displayName?: string;
    businessName?: string;
    description?: string;
  };
  branding: {
    logoUrl?: string;
    bannerUrl?: string;
    showBanner?: boolean;
    tagline?: string;
  };
  storeLayout?: string;
}

// ─── Reusable tagline pool ───────────────────────────────────────────────────
const TAGLINES = [
  "Fast data, great prices — always.",
  "Your trusted data partner in Ghana.",
  "Affordable bundles, delivered instantly.",
  "Stay connected without breaking the bank.",
  "Top-up in seconds. Browse all day.",
  "Ghana's most reliable data deals.",
  "Smart data for smart people.",
  "Always online, always affordable.",
  "Power up your connection today.",
  "Bundle up and save more.",
  "Reliable data at unbeatable prices.",
  "Your go-to stop for data bundles.",
  "Connecting Ghana, one bundle at a time.",
  "Fastest top-ups, happiest customers.",
  "Data deals that make sense.",
  "Browse more, pay less.",
  "Your network. Your savings. Our service.",
  "Quality bundles from a trusted source.",
  "Instant top-up, zero hassle.",
  "Because staying connected matters.",
];

function pickTagline(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TAGLINES[hash % TAGLINES.length];
}

// =============================================================================
// Signal — Dark, architectural, typography-forward
// =============================================================================

function SignalLayout({
  theme,
  logoSrc,
  displayName,
  tagline,
}: {
  theme: ThemeConfig;
  logoSrc: string;
  displayName: string;
  tagline: string;
}) {
  return (
    <header
      className="relative overflow-hidden py-20 sm:py-28 px-4"
      style={{ backgroundColor: "#0B1120" }}
    >
      {/* Grid dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Brand accent vertical line — off-center, visible on sm+ */}
      <div
        className="absolute left-[12%] sm:left-[20%] top-0 bottom-0 w-px hidden sm:block pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent 10%, ${theme.primary} 30%, ${theme.primary} 70%, transparent 90%)`,
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Logo with ambient glow */}
        <div className="relative inline-flex mb-8">
          <div
            className="absolute inset-0 rounded-2xl blur-2xl"
            style={{ backgroundColor: theme.primary, opacity: 0.3 }}
          />
          <img
            src={logoSrc}
            alt={displayName}
            className="relative h-20 w-20 rounded-2xl object-cover animate-float"
          />
        </div>

        {/* Thin brand accent rule */}
        <div
          className="w-10 h-[2px] mx-auto mb-6 rounded-full"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Display name — huge, light */}
        <h1
          className="text-5xl sm:text-7xl font-light tracking-wide text-white leading-none break-words animate-fade-slide-up"
          style={{ fontFamily: "'Satoshi', var(--font-family, sans-serif)" }}
        >
          {displayName}
        </h1>

        {/* Tagline */}
        {tagline && (
          <p
            className="mt-5 text-sm sm:text-base text-white max-w-lg mx-auto animate-fade-slide-up"
            style={{ fontFamily: "'Satoshi', var(--font-family, sans-serif)" }}
          >
            {tagline}
          </p>
        )}
      </div>
    </header>
  );
}

// =============================================================================
// Canvas — Editorial magazine, full-bleed hero + overlapping logo
// =============================================================================

function CanvasLayout({
  theme,
  logoSrc,
  displayName,
  tagline,
  bannerUrl,
  showBanner,
  description,
}: {
  theme: ThemeConfig;
  logoSrc: string;
  displayName: string;
  tagline: string;
  bannerUrl?: string;
  showBanner?: boolean;
  description?: string;
}) {
  const hasBanner = bannerUrl && showBanner !== false;
  return (
    <header>
      {/* Hero Section */}
      <div
        className={`relative ${hasBanner ? "h-[50vh] min-h-[380px]" : "min-h-[300px] sm:min-h-[360px]"} overflow-hidden`}
        style={!hasBanner ? { background: theme.gradient } : undefined}
      >
        {hasBanner && (
          <>
            <img
              src={bannerUrl!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
            />
            {/* Multilayer gradient overlay — dark at bottom, transparent at top */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${theme.primary}ee 0%, ${theme.primary}88 30%, transparent 60%)`,
              }}
            />
          </>
        )}

        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-8 right-8 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-12 right-12 w-24 h-24 rounded-full bg-white/[0.04] pointer-events-none" />

        {/* Logo — top-left masthead position */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-10">
          <img
            src={logoSrc}
            alt={displayName}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-white/30 shadow-2xl"
          />
        </div>

        {/* Business name — bottom-left, always white */}
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-10 right-6 z-10 animate-fade-slide-up">
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none"
            style={{
              color: "#FFFFFF",
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
              fontFamily: "'Cabinet Grotesk', var(--font-family, sans-serif)",
            }}
          >
            {displayName}
          </h1>
        </div>
      </div>

      {/* Info strip below hero */}
      <div
        className="pt-6 pb-5 px-4 sm:px-6"
        style={{ backgroundColor: "var(--bg-muted)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Tagline with editorial left accent bar */}
            <div className="flex items-start gap-3 max-w-xl">
              <div
                className="w-1 h-10 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: theme.primary }}
              />
              <div>
                <p
                  className="text-base sm:text-lg italic"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {tagline}
                </p>
                {description && (
                  <p
                    className="text-xs sm:text-sm mt-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// Pulse — Animated gradient hero with geometric shapes & glow
// =============================================================================

function PulseLayout({
  theme,
  logoSrc,
  displayName,
  tagline,
  bannerUrl,
  showBanner,
}: {
  theme: ThemeConfig;
  logoSrc: string;
  displayName: string;
  tagline: string;
  bannerUrl?: string;
  showBanner?: boolean;
}) {
  return (
    <header
      className="relative overflow-hidden min-h-[420px] sm:min-h-[520px] flex items-center animate-gradient"
      style={{
        backgroundImage: theme.gradient,
      }}
    >
      {/* Banner overlay */}
      {bannerUrl && showBanner !== false && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay animate-ken-burns"
        />
      )}

      {/* Floating geometric shapes */}
      <div
        className="absolute top-1/4 right-[15%] w-64 h-64 rounded-full bg-white/[0.04] animate-drift pointer-events-none hidden sm:block"
        style={{ animationDuration: "22s" }}
      />
      <div
        className="absolute bottom-1/4 left-[10%] w-48 h-48 border border-white/10 rotate-45 animate-drift pointer-events-none"
        style={{ animationDuration: "26s", animationDelay: "-6s" }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-white/[0.02] animate-drift pointer-events-none hidden md:block"
        style={{ animationDuration: "18s", animationDelay: "-12s" }}
      />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo with glow */}
          <div
            className="relative inline-flex mb-6 animate-fade-slide-up"
            style={{ animationDelay: "0s" }}
          >
            <div
              className="absolute inset-0 rounded-2xl blur-3xl"
              style={{ backgroundColor: theme.primary, opacity: 0.4 }}
            />
            <img
              src={logoSrc}
              alt={displayName}
              className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border-2 border-white/20 shadow-2xl animate-float"
            />
          </div>

          {/* Display name — gradient text */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none animate-fade-slide-up"
            style={{
              fontFamily: "'Cabinet Grotesk', var(--font-family, sans-serif)",
              background:
                "linear-gradient(135deg, white 30%, rgba(255,255,255,0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {displayName}
          </h1>

          {/* Tagline */}
          <p
            className="mt-5 text-white/70 text-sm sm:text-base max-w-lg mx-auto animate-fade-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {tagline}
          </p>

          {/* Live indicator */}
          <div
            className="mt-8 flex items-center justify-center gap-2 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#22c55e" }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: "#22c55e" }}
              />
            </span>
            <span className="text-white/50 text-[10px] tracking-[0.15em] uppercase font-medium">
              Open for orders
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// Main
// =============================================================================

export const StoreHeader = memo(
  ({ theme, storefront, branding, storeLayout }: StoreHeaderProps) => {
    const displayName = storefront.displayName || storefront.businessName || "";
    const tagline =
      branding.tagline ||
      pickTagline(storefront.businessName || displayName || "");
    const logoSrc = branding.logoUrl || "/icons/store-icon.png";

    if (storeLayout === "minimal") {
      return (
        <SignalLayout
          theme={theme}
          logoSrc={logoSrc}
          displayName={displayName}
          tagline={tagline}
        />
      );
    }

    if (storeLayout === "classic") {
      return (
        <CanvasLayout
          theme={theme}
          logoSrc={logoSrc}
          displayName={displayName}
          tagline={tagline}
          bannerUrl={branding.bannerUrl}
          showBanner={branding.showBanner}
          description={storefront.description}
        />
      );
    }

    // Pulse (default)
    return (
      <PulseLayout
        theme={theme}
        logoSrc={logoSrc}
        displayName={displayName}
        tagline={tagline}
        bannerUrl={branding.bannerUrl}
        showBanner={branding.showBanner}
      />
    );
  },
);
