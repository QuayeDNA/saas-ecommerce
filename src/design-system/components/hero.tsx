// src/design-system/components/hero.tsx
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface HeroProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: 'gradient' | 'solid' | 'image';
  backgroundImage?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  className?: string;
}

export const Hero = forwardRef<HTMLElement, HeroProps>(
  ({ 
    children, 
    background = 'gradient', 
    backgroundImage,
    size = 'lg',
    centered = true,
    className = '',
    ...props 
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'py-8 sm:py-10',
      md: 'py-10 sm:py-12',
      lg: 'py-12 sm:py-16',
      xl: 'py-16 sm:py-20',
    };

    // Background classes
    const backgroundClasses = {
      gradient: 'bg-gradient-to-br from-blue-50 via-white to-indigo-100',
      solid: 'bg-gray-50',
      image: backgroundImage ? `bg-cover bg-center bg-no-repeat` : 'bg-gray-100',
    };

    const baseClasses = 'relative overflow-hidden';
    const containerClasses = centered ? 'text-center' : '';

    const style = background === 'image' && backgroundImage 
      ? { backgroundImage: `url(${backgroundImage})` }
      : undefined;

    return (
      <section
        ref={ref}
        className={`${baseClasses} ${backgroundClasses[background]} ${sizeClasses[size]} ${className}`}
        style={style}
        {...props}
      >
        {/* Background overlay for image background */}
        {background === 'image' && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50" />
        )}
        
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClasses}`}>
          {children}
        </div>
      </section>
    );
  }
);

Hero.displayName = 'Hero';

// Hero Title component
interface HeroTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const HeroTitle = forwardRef<HTMLHeadingElement, HeroTitleProps>(
  ({ children, as: Component = 'h1', size = 'lg', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-2xl sm:text-3xl md:text-4xl',
      md: 'text-3xl sm:text-4xl md:text-5xl',
      lg: 'text-4xl sm:text-5xl md:text-6xl',
      xl: 'text-5xl sm:text-6xl md:text-7xl',
    };

    return (
      <Component
        ref={ref}
        className={`font-bold text-gray-900 leading-tight ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

HeroTitle.displayName = 'HeroTitle';

// Hero Subtitle component
interface HeroSubtitleProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HeroSubtitle = forwardRef<HTMLParagraphElement, HeroSubtitleProps>(
  ({ children, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-base sm:text-lg',
      md: 'text-lg sm:text-xl',
      lg: 'text-xl sm:text-2xl',
    };

    return (
      <p
        ref={ref}
        className={`text-gray-600 leading-relaxed ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

HeroSubtitle.displayName = 'HeroSubtitle';
