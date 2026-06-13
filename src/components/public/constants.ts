import type { ThemeConfig } from "./types";

// =============================================================================
// Theme System — two fixed colors: brand blue or midnight black
// =============================================================================

const COLORS = {
  brand: "#2563EB",
  midnight: "#0B1120",
} as const;

/** Build a ThemeConfig from the agent's store color choice */
export function buildBrandTheme(color?: string): ThemeConfig {
  const isMidnight = color === COLORS.midnight;
  const primary = isMidnight ? COLORS.midnight : COLORS.brand;
  return {
    primary,
    secondary: primary,
    accent: primary,
    bg: "#FFFFFF",
    text: "#0B1120",
    gradient: isMidnight
      ? "linear-gradient(135deg, #001b44 0%, #003b8f 100%);"
      : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    cardBorder: `${primary}22`,
    heroBg: `${primary}0A`,
  };
}

/** Fallback when no brand color is set */
export const DEFAULT_THEME = buildBrandTheme();

// placeholders removed – popularity driven exclusively by backend now.

// =============================================================================
// Status config
// =============================================================================

export const ORDER_STATUS_CFG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  pending_payment: {
    label: "Awaiting Payment",
    bg: "#FEF3C7",
    color: "#92400E",
  },
  pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E" },
  confirmed: { label: "Confirmed", bg: "#CCFBF1", color: "#134E4A" },
  processing: { label: "Processing", bg: "#DBEAFE", color: "#1E3A8A" },
  completed: { label: "Delivered ✓", bg: "#DCFCE7", color: "#14532D" },
  partially_completed: { label: "Partial", bg: "#FEF9C3", color: "#713F12" },
  failed: { label: "Failed", bg: "#FEE2E2", color: "#7F1D1D" },
  cancelled: { label: "Cancelled", bg: "#F3F4F6", color: "#374151" },
};

export function getSystemFooterText(businessName: string): string {
  const FOOTER_TEXTS = [
    "Powered by your go-to data partner.",
    "Fast top-ups, trusted by many.",
    "Your connection, our priority.",
    "Serving data bundles with care.",
    "Bringing you fast, reliable bundles.",
    "Stay connected, stay productive.",
    "Data made simple and affordable.",
    "Quick bundle top-ups, anytime.",
    "Trusted data deals for every network.",
    "Your one-stop data shop.",
    "Powered by great service and fast bundles.",
    "Top-up in seconds, connect for hours.",
    "Hassle-free data purchases every time.",
    "Your data, your way.",
    "Built for speed, designed for you.",
    "Smart bundles, smarter savings.",
    "Connecting Ghana, one bundle at a time.",
    "Reliable data — delivered instantly.",
    "Fast, friendly, and always available.",
    "Your favourite source for mobile bundles.",
  ];
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = (hash * 31 + businessName.charCodeAt(i)) >>> 0;
  }
  return FOOTER_TEXTS[hash % FOOTER_TEXTS.length];
}

// Track order TTL
export const TRACK_TTL = 24 * 60 * 60 * 1000;
