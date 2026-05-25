// src/design-system/components/section.tsx
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: 'white' | 'gray' | 'blue' | 'gradient' | 'dark' |'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ 
    children, 
    background = 'white', 
    padding = 'lg',
    className = '',
    ...props 
  }, ref) => {
    const backgroundClasses = {
      white: 'bg-[var(--bg-surface)]',
      gray: 'bg-[var(--bg-surface-alt)]',
      blue: 'bg-[var(--bg-surface-alt)]',
      gradient: 'bg-[var(--bg-surface-alt)]',
      dark: 'bg-[var(--color-navy-dark)] text-[var(--text-inverse)]',
      none: 'bg-transparent',
    };

    const paddingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-20',
      xl: 'py-32',
    };

    return (
      <section
        ref={ref}
        className={`${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

// Section Header component for consistent section titles
interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, centered = true, className = '', ...props }, ref) => {
    const alignmentClasses = centered ? 'text-center' : 'text-left';

    return (
      <div
        ref={ref}
        className={`mb-16 ${alignmentClasses} ${className}`}
        {...props}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';
