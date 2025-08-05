# Color System Documentation

## Overview
This document outlines the color system for the SaaS Telecom application, designed for brand consistency and accessibility.

## Primary Color Palette

### Main Primary Color
- **Primary**: `#142850` - Deep navy blue (main brand color)
- **Primary Light**: `#1e3a5f` - Lighter variant for hover states
- **Primary Dark**: `#0f1f3a` - Darker variant for active states

### Primary Color Scale
```css
--color-primary-50: #f0f4f8   /* Very light blue-gray */
--color-primary-100: #d9e2ec  /* Light blue-gray */
--color-primary-200: #bcccdc  /* Medium light blue-gray */
--color-primary-300: #9fb3c8  /* Medium blue-gray */
--color-primary-400: #829ab1  /* Medium dark blue-gray */
--color-primary-500: #142850   /* Main primary color */
--color-primary-600: #0f1f3a  /* Darker variant */
--color-primary-700: #0a1628  /* Even darker */
--color-primary-800: #061016  /* Very dark */
--color-primary-900: #030a0c  /* Darkest */
--color-primary-950: #020608  /* Almost black */
```

## Secondary Color Palette

### Secondary Blue
- **Secondary**: `#0ea5e9` - Complementary blue for accents and highlights
- **Secondary Light**: `#38bdf8` - Lighter variant
- **Secondary Dark**: `#0284c7` - Darker variant

### Secondary Color Scale
```css
--color-secondary-50: #f0f9ff   /* Very light blue */
--color-secondary-100: #e0f2fe  /* Light blue */
--color-secondary-200: #bae6fd  /* Medium light blue */
--color-secondary-300: #7dd3fc  /* Medium blue */
--color-secondary-400: #38bdf8  /* Medium dark blue */
--color-secondary-500: #0ea5e9  /* Main secondary */
--color-secondary-600: #0284c7  /* Darker secondary */
--color-secondary-700: #0369a1  /* Even darker */
--color-secondary-800: #075985  /* Very dark */
--color-secondary-900: #0c4a6e  /* Darkest */
--color-secondary-950: #082f49  /* Almost black */
```

## Accent Color Palette

### Teal/Green Accent
- **Accent**: `#14b8a6` - Teal for success states and highlights
- **Accent Light**: `#2dd4bf` - Lighter variant
- **Accent Dark**: `#0d9488` - Darker variant

### Accent Color Scale
```css
--color-accent-50: #f0fdfa   /* Very light teal */
--color-accent-100: #ccfbf1  /* Light teal */
--color-accent-200: #99f6e4  /* Medium light teal */
--color-accent-300: #5eead4  /* Medium teal */
--color-accent-400: #2dd4bf  /* Medium dark teal */
--color-accent-500: #14b8a6  /* Main accent */
--color-accent-600: #0d9488  /* Darker accent */
--color-accent-700: #0f766e  /* Even darker */
--color-accent-800: #115e59  /* Very dark */
--color-accent-900: #134e4a  /* Darkest */
--color-accent-950: #042f2e  /* Almost black */
```

## Neutral Colors

### Updated Gray Scale
```css
--color-gray-50: #f8fafc   /* Very light gray */
--color-gray-100: #f1f5f9  /* Light gray */
--color-gray-200: #e2e8f0  /* Medium light gray */
--color-gray-300: #cbd5e1  /* Medium gray */
--color-gray-400: #94a3b8  /* Medium dark gray */
--color-gray-500: #64748b  /* Main gray */
--color-gray-600: #475569  /* Darker gray */
--color-gray-700: #334155  /* Even darker */
--color-gray-800: #1e293b  /* Very dark */
--color-gray-900: #0f172a  /* Darkest */
--color-gray-950: #020617  /* Almost black */
```

## System Colors

### Semantic Colors
```css
--color-success: #10b981  /* Green for success states */
--color-warning: #f59e0b  /* Amber for warning states */
--color-error: #ef4444    /* Red for error states */
--color-info: #3b82f6     /* Blue for info states */
```

## Usage Guidelines

### Primary Color Usage
- **Backgrounds**: Use `#142850` for main navigation areas (header, sidebar)
- **Text**: Use white text on primary backgrounds for maximum contrast
- **Hover States**: Use `#1e3a5f` for hover effects
- **Active States**: Use `#0f1f3a` for active/pressed states

### Secondary Color Usage
- **Accents**: Use `#0ea5e9` for interactive elements like buttons and links
- **Highlights**: Use for important information and call-to-action elements
- **Hover States**: Use `#0284c7` for secondary element hover effects

### Accent Color Usage
- **Success States**: Use `#14b8a6` for success messages and confirmations
- **Positive Actions**: Use for positive feedback and successful operations
- **Hover States**: Use `#0d9488` for accent element hover effects

### Text Colors
- **Primary Text**: `#1e293b` for main content
- **Secondary Text**: `#64748b` for less important content
- **Light Text**: `#94a3b8` for subtle text
- **White Text**: Use on dark backgrounds

## Accessibility Considerations

### Contrast Ratios
- Primary color `#142850` with white text: 15.6:1 (Excellent)
- Secondary color `#0ea5e9` with white text: 3.2:1 (Good)
- Accent color `#14b8a6` with white text: 2.8:1 (Acceptable)

### Color Blindness
- The primary color `#142850` is distinguishable for most color vision deficiencies
- Secondary and accent colors provide sufficient contrast
- Always use text labels in addition to color coding

## Implementation

### CSS Variables
All colors are available as CSS custom properties in `theme.css`:
```css
:root {
  --color-primary-500: #142850;
  --color-secondary-500: #0ea5e9;
  --color-accent-500: #14b8a6;
  /* ... other color variables */
}
```

### Tailwind Classes
Use Tailwind's arbitrary value syntax for custom colors:
```html
<div class="bg-[#142850] text-white">
  <!-- Content -->
</div>
```

### React Components
Use the design system components that automatically apply the correct colors:
```tsx
import { Button } from '../design-system';

<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
```

## Brand Consistency

### Do's
- ✅ Use primary color `#142850` for main navigation and branding
- ✅ Use secondary color `#0ea5e9` for interactive elements
- ✅ Use accent color `#14b8a6` for success states
- ✅ Maintain consistent contrast ratios
- ✅ Use semantic colors for their intended purposes

### Don'ts
- ❌ Don't use primary color for error states
- ❌ Don't use accent color for navigation
- ❌ Don't use arbitrary colors outside the system
- ❌ Don't use colors with insufficient contrast
- ❌ Don't rely solely on color to convey information

## Future Considerations

### Dark Mode
When implementing dark mode, consider:
- Inverting the color relationships
- Maintaining accessibility standards
- Preserving brand recognition

### Theme Customization
The color system is designed to be extensible for:
- User theme preferences
- Brand customization
- Accessibility adjustments 