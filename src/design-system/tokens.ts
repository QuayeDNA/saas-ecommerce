/**
 * Design Tokens for the SaaS Telecom application
 * These tokens define the core design values for the application
 * They will eventually be overridable by user preferences
 */

// Base color palette - updated with new primary color #142850
export const colors = {
  brand: {
    primary: '#142850', // New primary color - deep navy blue
    primaryLight: '#1e3a5f', // Lighter variant for hover states
    primaryDark: '#0f1f3a', // Darker variant for active states
    background: '#ffffff', // White
    accent: '#f8fafc', // Very light gray for subtle backgrounds
    secondary: '#f1f5f9', // Light gray for backgrounds
    text: '#1e293b', // Dark text for good contrast
    textLight: '#64748b', // Light text for secondary content
    white: '#ffffff',
  },
  
  // Primary color palette based on #142850
  primary: {
    50: '#f0f4f8', // Very light blue-gray
    100: '#d9e2ec', // Light blue-gray
    200: '#bcccdc', // Medium light blue-gray
    300: '#9fb3c8', // Medium blue-gray
    400: '#829ab1', // Medium dark blue-gray
    500: '#142850', // Main primary color
    600: '#0f1f3a', // Darker variant
    700: '#0a1628', // Even darker
    800: '#061016', // Very dark
    900: '#030a0c', // Darkest
    950: '#020608', // Almost black
  },
  
  // Secondary colors - complementary to primary
  secondary: {
    50: '#f0f9ff', // Very light blue
    100: '#e0f2fe', // Light blue
    200: '#bae6fd', // Medium light blue
    300: '#7dd3fc', // Medium blue
    400: '#38bdf8', // Medium dark blue
    500: '#0ea5e9', // Main secondary
    600: '#0284c7', // Darker secondary
    700: '#0369a1', // Even darker
    800: '#075985', // Very dark
    900: '#0c4a6e', // Darkest
    950: '#082f49', // Almost black
  },
  
  // Accent colors - teal/green for success states
  accent: {
    50: '#f0fdfa', // Very light teal
    100: '#ccfbf1', // Light teal
    200: '#99f6e4', // Medium light teal
    300: '#5eead4', // Medium teal
    400: '#2dd4bf', // Medium dark teal
    500: '#14b8a6', // Main accent
    600: '#0d9488', // Darker accent
    700: '#0f766e', // Even darker
    800: '#115e59', // Very dark
    900: '#134e4a', // Darkest
    950: '#042f2e', // Almost black
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
  
  // Neutrals - updated for better contrast with primary
  gray: {
    50: '#f8fafc', // Very light gray
    100: '#f1f5f9', // Light gray
    200: '#e2e8f0', // Medium light gray
    300: '#cbd5e1', // Medium gray
    400: '#94a3b8', // Medium dark gray
    500: '#64748b', // Main gray
    600: '#475569', // Darker gray
    700: '#334155', // Even darker
    800: '#1e293b', // Very dark
    900: '#0f172a', // Darkest
    950: '#020617', // Almost black
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
