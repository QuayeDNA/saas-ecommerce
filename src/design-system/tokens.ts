/**
 * Design Tokens for the SaaS Telecom application
 * These tokens define the core design values for the application
 * They will eventually be overridable by user preferences
 */

// Base color palette - default theme
export const colors = {
  brand: {
    primary: '#000000', // Black
    background: '#ffffff', // White
    accent: '#222222', // Dark gray for contrast
    secondary: '#f5f5f5', // Light gray for subtle backgrounds
    text: '#000000', // Black text
    white: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    50: 'var(--color-secondary-50, #f0f9ff)',
    100: 'var(--color-secondary-100, #e0f2fe)',
    200: 'var(--color-secondary-200, #bae6fd)',
    300: 'var(--color-secondary-300, #7dd3fc)',
    400: 'var(--color-secondary-400, #38bdf8)',
    500: 'var(--color-secondary-500, #0ea5e9)', // Default secondary
    600: 'var(--color-secondary-600, #0284c7)',
    700: 'var(--color-secondary-700, #0369a1)',
    800: 'var(--color-secondary-800, #075985)',
    900: 'var(--color-secondary-900, #0c4a6e)',
    950: 'var(--color-secondary-950, #082f49)',
  },
  
  // Accent colors
  accent: {
    50: 'var(--color-accent-50, #f0fdfa)',
    100: 'var(--color-accent-100, #ccfbf1)',
    200: 'var(--color-accent-200, #99f6e4)',
    300: 'var(--color-accent-300, #5eead4)',
    400: 'var(--color-accent-400, #2dd4bf)',
    500: 'var(--color-accent-500, #14b8a6)', // Default accent
    600: 'var(--color-accent-600, #0d9488)',
    700: 'var(--color-accent-700, #0f766e)',
    800: 'var(--color-accent-800, #115e59)',
    900: 'var(--color-accent-900, #134e4a)',
    950: 'var(--color-accent-950, #042f2e)',
  },
  
  // Network-specific colors (fixed for brand recognition)
  network: {
    mtn: {
      bg: '#FEF9C3', // Light yellow background
      text: '#854D0E', // Dark yellow text
      border: '#FCD34D', // Yellow border
      icon: '#F59E0B', // Yellow icon
    },
    vodafone: {
      bg: '#FEE2E2', // Light red background
      text: '#991B1B', // Dark red text
      border: '#FCA5A5', // Red border
      icon: '#EF4444', // Red icon
    },
    airtelTigo: {
      bg: '#DBEAFE', // Light blue background
      text: '#1E40AF', // Dark blue text
      border: '#93C5FD', // Blue border
      icon: '#3B82F6', // Blue icon
    },
  },
  
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // System colors (fixed)
  system: {
    success: '#10b981', // Green 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500
  },
};

// Spacing system
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
};

// Font sizes
export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
};

// Font weights
export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Line heights
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Border radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

// Box shadows
export const boxShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Transitions
export const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Z-index
export const zIndices = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
};
