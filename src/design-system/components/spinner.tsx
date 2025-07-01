// src/design-system/components/spinner.tsx
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

// Spinner sizes
type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Spinner colors
type SpinnerColor = 'primary' | 'white' | 'gray' | 'success' | 'warning' | 'error';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  thickness?: 'thin' | 'medium' | 'thick';
  className?: string;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', thickness = 'medium', className = '', ...props }, ref) => {
    // Size classes
    const sizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };

    // Color classes
    const colorClasses = {
      primary: 'border-blue-600',
      white: 'border-white',
      gray: 'border-gray-600',
      success: 'border-green-600',
      warning: 'border-yellow-500',
      error: 'border-red-600',
    };

    // Thickness classes
    const thicknessClasses = {
      thin: 'border-[1.5px]',
      medium: 'border-2',
      thick: 'border-[3px]',
    };

    const baseClasses = 'animate-spin rounded-full border-solid border-t-transparent';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${colorClasses[color]} ${thicknessClasses[thickness]} ${className}`}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
