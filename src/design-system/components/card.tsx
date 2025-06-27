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
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    };
    
    // Variant styles
    const variantClasses = {
      elevated: 'bg-white shadow-md rounded-lg border border-gray-100',
      outlined: 'bg-white border border-gray-200 rounded-lg',
      flat: 'bg-white rounded-lg',
      interactive: 'bg-white shadow-sm hover:shadow-md rounded-lg border border-gray-100 transition-shadow duration-200',
    };
    
    // Combine all classes
    const cardClasses = [
      variantClasses[variant],
      !withHeader && !withFooter ? sizeClasses[size] : '',
      'overflow-hidden',
      className,
    ].join(' ');

    // Header and footer styles
    const headerClasses = [
      'px-4 py-3 border-b border-gray-100 bg-gray-50 font-medium',
      size === 'sm' ? 'text-sm' : 'text-base',
    ].join(' ');
    
    const footerClasses = [
      'px-4 py-3 border-t border-gray-100 bg-gray-50',
      size === 'sm' ? 'text-sm' : 'text-base',
    ].join(' ');
    
    const bodyClasses = sizeClasses[size];

    // Return the card component
    return (
      <div ref={ref} className={cardClasses} {...props}>
        {withHeader && header && (
          <div className={headerClasses}>{header}</div>
        )}
        <div className={bodyClasses}>{children}</div>
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
        className={`px-4 py-3 border-b border-gray-100 bg-gray-50 font-medium ${className}`}
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
      <div ref={ref} className={`p-4 ${className}`} {...props}>
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
        className={`px-4 py-3 border-t border-gray-100 bg-gray-50 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
