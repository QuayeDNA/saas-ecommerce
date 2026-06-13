import { memo } from "react";
import type { ThemeConfig } from "./types";

// =============================================================================
// StoreHeader — Minimal · Classic · Modern
// All colour decisions flow from `theme.primary` — no scattered hardcoded hex.
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

// ─── Tagline pool ─────────────────────────────────────────────────────────────
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

// ─── Shared logo component ────────────────────────────────────────────────────
function StoreLogo({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "h-12 w-12" : size === "lg" ? "h-24 w-24" : "h-16 w-16";
  return (
    <img
      src={src}
      alt={alt}
      className={`${dim} rounded-2xl object-cover shrink-0`}
      style={{ border: "2px solid rgba(255,255,255,0.2)" }}
    />
  );
}

// =============================================================================
// Minimal — Logo + name on one line, tagline below, stark white background.
// Feels like a premium app header rather than a promotional banner.
// =============================================================================
function MinimalLayout({
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
      className="px-4 py-8 sm:py-10"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Logo + name row */}
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <img
              src={logoSrc}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {displayName}
            </h1>
            {tagline && (
              <p
                className="text-sm mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {tagline}
              </p>
            )}
          </div>
        </div>

        {/* Accent rule */}
        <div
          className="mt-6 h-px"
          style={{
            background: `linear-gradient(to right, ${theme.primary}40, transparent)`,
          }}
        />
      </div>
    </header>
  );
}

// =============================================================================
// Classic — Full-bleed banner hero with a solid info strip below.
// Banner is optional; falls back to a gradient built from theme.primary.
// =============================================================================
function ClassicLayout({
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
  const hasBanner = !!(bannerUrl && showBanner !== false);

  return (
    <header>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: hasBanner ? 260 : 200,
          background: hasBanner ? undefined : theme.gradient,
        }}
      >
        {hasBanner && (
          <>
            <img
              src={bannerUrl!}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Scrim — brand-tinted, heavier at bottom so text is always legible */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${theme.primary}cc 0%, ${theme.primary}55 45%, transparent 75%)`,
              }}
            />
          </>
        )}

        {/* Logo — top-left */}
        <div className="absolute top-5 left-5 sm:top-6 sm:left-8 z-10">
          <StoreLogo src={logoSrc} alt={displayName} size="sm" />
        </div>

        {/* Store name — bottom-left */}
        <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-8 right-6 z-10">
          <h1
            className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.35)" }}
          >
            {displayName}
          </h1>
        </div>
      </div>

      {/* Info strip */}
      <div
        className="px-4 sm:px-8 py-4"
        style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          {/* Accent bar */}
          <div
            className="w-1 rounded-full shrink-0 mt-0.5 self-stretch min-h-[2rem]"
            style={{ backgroundColor: theme.primary }}
          />
          <div>
            <p
              className="text-sm sm:text-base font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {tagline}
            </p>
            {description && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// Modern — Gradient hero, centered logo + name, animated live badge.
// Uses `theme.gradient` so colour is always on-brand.
// =============================================================================
function ModernLayout({
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
      className="relative overflow-hidden flex items-center animate-gradient"
      style={{
        minHeight: 340,
        backgroundImage: theme.gradient,
        backgroundSize: "200% 200%",
      }}
    >
      {/* Optional banner photo at low opacity for texture */}
      {bannerUrl && showBanner !== false && (
        <img
          src={bannerUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
        />
      )}

      {/* Content */}
      <div className="relative w-full px-4 py-14 sm:py-16">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl blur-2xl"
              style={{ backgroundColor: "#ffffff", opacity: 0.15 }}
            />
            <StoreLogo src={logoSrc} alt={displayName} size="lg" />
          </div>

          {/* Name */}
          <h1
            className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.25)" }}
          >
            {displayName}
          </h1>

          {/* Tagline */}
          {tagline && (
            <p className="text-white/70 text-sm sm:text-base max-w-md">
              {tagline}
            </p>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ backgroundColor: "#4ade80" }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: "#22c55e" }}
              />
            </span>
            <span className="text-white/50 text-[10px] tracking-widest uppercase font-medium">
              Open for orders
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// Main export
// =============================================================================
export const StoreHeader = memo(
  ({ theme, storefront, branding, storeLayout }: StoreHeaderProps) => {
    const displayName = storefront.displayName || storefront.businessName || "";
    const tagline =
      branding.tagline || pickTagline(storefront.businessName || displayName);
    const logoSrc = branding.logoUrl || "/icons/store-icon.png";

    if (storeLayout === "minimal") {
      return (
        <MinimalLayout
          theme={theme}
          logoSrc={logoSrc}
          displayName={displayName}
          tagline={tagline}
        />
      );
    }

    if (storeLayout === "classic") {
      return (
        <ClassicLayout
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

    // Modern (default)
    return (
      <ModernLayout
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