import { memo } from "react";
import type { ThemeConfig } from "./types";

// =============================================================================
// StoreHeader — 3 layouts: minimal, classic, modern (default)
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

export const StoreHeader = memo(
  ({ theme, storefront, branding, storeLayout }: StoreHeaderProps) => {
    // System-generated tagline when store has none
    const displayTagline =
      branding.tagline ||
      (() => {
        const name = storefront.businessName || "";
        let hash = 0;
        for (let i = 0; i < name.length; i++)
          hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
        const taglines = [
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
        return taglines[hash % taglines.length];
      })();

    // Default logo — app icon when none is set by the agent
    const logoSrc = branding.logoUrl || "/icons/store-icon.png";
    const displayDescription =
      storefront.description ||
      `Welcome to ${storefront.displayName}! We offer fast, affordable data bundles from all major networks in Ghana.`;
    if (storeLayout === "minimal") {
      return (
        <header
          className="pt-10 pb-6 px-4 text-center"
          style={{ backgroundColor: theme.heroBg }}
        >
          <img
            src={logoSrc}
            alt={storefront.displayName}
            className="h-14 w-14 rounded-2xl mx-auto mb-4 object-cover shadow"
            style={{ border: `2px solid ${theme.primary}40` }}
          />
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {storefront.displayName}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {displayTagline}
          </p>
        </header>
      );
    }

    if (storeLayout === "classic") {
      return (
        <header>
          {branding.bannerUrl && branding.showBanner !== false && (
            <div className="h-36 overflow-hidden">
              <img
                src={branding.bannerUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div
            className="px-4 py-5 border-b-4"
            style={{ backgroundColor: theme.bg, borderColor: theme.primary }}
          >
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <img
                src={logoSrc}
                alt={storefront.displayName}
                className="h-14 w-14 rounded-xl object-cover border-2 shadow-md shrink-0"
                style={{ borderColor: theme.primary }}
              />
              <div>
                <h1
                  className="text-2xl font-black"
                  style={{ color: theme.secondary }}
                >
                  {storefront.displayName}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: theme.secondary + "aa" }}
                >
                  {displayTagline}
                </p>
              </div>
            </div>
          </div>
        </header>
      );
    }

    // Modern (default) — bold gradient hero
    return (
      <header
        className="relative overflow-hidden"
        style={{ background: theme.gradient }}
      >
        {branding.bannerUrl && branding.showBanner !== false && (
          <img
            src={branding.bannerUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay"
          />
        )}
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative px-4 pt-10 pb-12 sm:pt-16 sm:pb-20 text-center">
          <img
            src={logoSrc}
            alt={storefront.displayName}
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-white/30 shadow-xl"
          />
          <h1
            className="text-3xl sm:text-5xl font-black tracking-tight leading-none"
            style={{ color: "var(--text-inverse)" }}
          >
            {storefront.displayName}
          </h1>
          <p className="mt-3 text-white/70 text-sm sm:text-base max-w-xs mx-auto">
            {displayTagline}
          </p>
          <p className="mt-1 text-white/50 text-xs max-w-sm mx-auto">
            {displayDescription}
          </p>
        </div>
      </header>
    );
  },
);
