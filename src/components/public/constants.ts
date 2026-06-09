import type { ThemeConfig } from "./types";

// =============================================================================
// Constants & Theme System
// =============================================================================

export const THEMES: Record<string, ThemeConfig> = {
  blue: {
    primary: "#2563EB",
    secondary: "#1E40AF",
    accent: "#60A5FA",
    bg: "#EFF6FF",
    text: "#1E3A5F",
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #1e3a8a 100%)",
    cardBorder: "#BFDBFE",
    heroBg: "#EFF6FF",
  },
  green: {
    primary: "#16A34A",
    secondary: "#15803D",
    accent: "#4ADE80",
    bg: "#F0FDF4",
    text: "#14532D",
    gradient: "linear-gradient(135deg, #15803D 0%, #166534 50%, #14532d 100%)",
    cardBorder: "#BBF7D0",
    heroBg: "#F0FDF4",
  },
  purple: {
    primary: "#7C3AED",
    secondary: "#6D28D9",
    accent: "#A78BFA",
    bg: "#FAF5FF",
    text: "#3B0764",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #5B21B6 50%, #4c1d95 100%)",
    cardBorder: "#DDD6FE",
    heroBg: "#FAF5FF",
  },
  orange: {
    primary: "#EA580C",
    secondary: "#C2410C",
    accent: "#FB923C",
    bg: "#FFF7ED",
    text: "#7C2D12",
    gradient: "linear-gradient(135deg, #C2410C 0%, #B45309 50%, #92400e 100%)",
    cardBorder: "#FED7AA",
    heroBg: "#FFF7ED",
  },
  red: {
    primary: "#DC2626",
    secondary: "#B91C1C",
    accent: "#F87171",
    bg: "#FEF2F2",
    text: "#7F1D1D",
    gradient: "linear-gradient(135deg, #B91C1C 0%, #991B1B 50%, #7f1d1d 100%)",
    cardBorder: "#FECACA",
    heroBg: "#FEF2F2",
  },
  teal: {
    primary: "#0D9488",
    secondary: "#0F766E",
    accent: "#2DD4BF",
    bg: "#F0FDFA",
    text: "#134E4A",
    gradient: "linear-gradient(135deg, #0F766E 0%, #115E59 50%, #134e4a 100%)",
    cardBorder: "#99F6E4",
    heroBg: "#F0FDFA",
  },
  indigo: {
    primary: "#4F46E5",
    secondary: "#4338CA",
    accent: "#818CF8",
    bg: "#EEF2FF",
    text: "#312E81",
    gradient: "linear-gradient(135deg, #4338CA 0%, #3730A3 50%, #312e81 100%)",
    cardBorder: "#C7D2FE",
    heroBg: "#EEF2FF",
  },
  rose: {
    primary: "#E11D48",
    secondary: "#BE123C",
    accent: "#FB7185",
    bg: "#FFF1F2",
    text: "#881337",
    gradient: "linear-gradient(135deg, #BE123C 0%, #9F1239 50%, #881337 100%)",
    cardBorder: "#FECDD3",
    heroBg: "#FFF1F2",
  },
};

export const DEFAULT_THEME = THEMES.blue;

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
