// src/design-system/components/container.tsx
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centerContent?: boolean;
  className?: string;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    children, 
    size = 'xl', 
    padding = 'md', 
    centerContent = false,
    className = '', 
    ...props 
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    // Padding classes
    const paddingClasses = {
      none: '',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
    };

    const baseClasses = 'mx-auto w-full';
    const centerClasses = centerContent ? 'flex flex-col items-center' : '';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${paddingClasses[padding]} ${centerClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
