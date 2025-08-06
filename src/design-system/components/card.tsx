import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

// Card variants
type CardVariant = 'elevated' | 'outlined' | 'flat' | 'interactive';

// Card sizes
type CardSize = 'sm' | 'md' | 'lg';

// Card props interface
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  withHeader?: boolean;
  withFooter?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean; // New prop to disable default padding
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'elevated',
      size = 'md',
      className = '',
      withHeader = false,
      withFooter = false,
      header,
      footer,
      noPadding = false,
      ...props
    },
    ref
  ) => {
    // Size styles with responsive padding
    const sizeClasses = {
      sm: 'p-2 sm:p-3',
      md: 'p-3 sm:p-4',
      lg: 'p-4 sm:p-5',
    };
    
    // Variant styles
    const variantClasses = {
      elevated: 'shadow-md rounded-lg border border-gray-100',
      outlined: 'border border-gray-200 rounded-lg',
      flat: 'rounded-lg',
      interactive: 'shadow-sm hover:shadow-md rounded-lg border border-gray-100 transition-shadow duration-200',
    };
    
    // Check if a custom background is provided
    const hasCustomBackground = className.includes('bg-');
    
    // Check if custom padding is provided (p-* classes)
    const hasCustomPadding = className.includes('p-');
    
    // Combine all classes
    const cardClasses = [
      // Only add default background if no custom background is provided
      !hasCustomBackground ? 'bg-white' : '',
      variantClasses[variant],
      // Only add default padding if explicitly not disabled and no custom padding is provided
      !noPadding && !hasCustomPadding ? sizeClasses[size] : '',
      'overflow-hidden',
      className,
    ].filter(Boolean).join(' ');

    // Header and footer styles without padding (handled by parent)
    const headerClasses = [
      'border-b border-gray-100 bg-gray-50 font-medium',
      size === 'sm' ? 'text-sm' : 'text-base',
    ].join(' ');
    
    const footerClasses = [
      'border-t border-gray-100 bg-gray-50',
      size === 'sm' ? 'text-sm' : 'text-base',
    ].join(' ');

    // Return the card component
    return (
      <div ref={ref} className={cardClasses} {...props}>
        {withHeader && header && (
          <div className={headerClasses}>{header}</div>
        )}
        <div>{children}</div>
        {withFooter && footer && (
          <div className={footerClasses}>{footer}</div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`border-b border-gray-100 font-medium ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body Component
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`pt-2 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`border-t border-gray-100 bg-gray-50 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
