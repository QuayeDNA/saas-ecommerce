// src/design-system/components/feature.tsx
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface FeatureProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'centered' | 'horizontal';
  className?: string;
}

export const Feature = forwardRef<HTMLDivElement, FeatureProps>(
  ({ icon, title, description, variant = 'default', className = '', ...props }, ref) => {
    const variantClasses = {
      default: 'text-left',
      centered: 'text-center',
      horizontal: 'flex items-start space-x-4 text-left',
    };

    const iconClasses = variant === 'horizontal' 
      ? 'flex-shrink-0 w-8 h-8 text-blue-600' 
      : variant === 'centered'
      ? 'mx-auto w-12 h-12 text-blue-600 mb-4'
      : 'w-8 h-8 text-blue-600 mb-4';

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon && (
          <div className={iconClasses}>
            {icon}
          </div>
        )}
        
        <div className={variant === 'horizontal' ? 'flex-1' : ''}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    );
  }
);

Feature.displayName = 'Feature';

// Feature Grid component
interface FeatureGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FeatureGrid = forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ children, columns = 3, gap = 'lg', className = '', ...props }, ref) => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };

    return (
      <div
        ref={ref}
        className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FeatureGrid.displayName = 'FeatureGrid';
