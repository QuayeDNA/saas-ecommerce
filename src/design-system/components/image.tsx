// src/design-system/components/image.tsx
import { forwardRef, useState } from 'react';
import type { ImgHTMLAttributes, ReactNode } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: ReactNode;
  className?: string;
  containerClassName?: string;
  rounded?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  overlay?: ReactNode;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({
    src,
    alt,
    fallback,
    className = '',
    containerClassName = '',
    rounded = false,
    shadow = 'none',
    overlay,
    aspectRatio,
    objectFit = 'cover',
    ...props
  }, ref) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    const aspectRatioClasses = {
      '1:1': 'aspect-square',
      '4:3': 'aspect-[4/3]',
      '16:9': 'aspect-video',
      '21:9': 'aspect-[21/9]',
    };

    const objectFitClasses = {
      contain: 'object-contain',
      cover: 'object-cover',
      fill: 'object-fill',
      none: 'object-none',
      'scale-down': 'object-scale-down',
    };

    const imageClasses = [
      'w-full h-full',
      objectFitClasses[objectFit],
      rounded ? 'rounded-lg' : '',
      shadowClasses[shadow],
      'transition-all duration-300',
      className,
    ].filter(Boolean).join(' ');

    const containerClasses = [
      'relative overflow-hidden',
      aspectRatio ? aspectRatioClasses[aspectRatio] : '',
      rounded ? 'rounded-lg' : '',
      containerClassName,
    ].filter(Boolean).join(' ');

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    if (hasError && fallback) {
      return <div className={containerClasses}>{fallback}</div>;
    }

    return (
      <div className={containerClasses}>
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Image */}
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        
        {/* Overlay */}
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            {overlay}
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

// Hero Image component for larger images with specific styling
interface HeroImageProps extends Omit<ImageProps, 'aspectRatio'> {
  variant?: 'default' | 'floating' | 'perspective';
}

export const HeroImage = forwardRef<HTMLImageElement, HeroImageProps>(
  ({ variant = 'default', className = '', containerClassName = '', ...props }, ref) => {
    const variantClasses = {
      default: '',
      floating: 'transform hover:scale-105 transition-transform duration-500',
      perspective: 'transform perspective-1000 rotate-y-12',
    };

    const containerVariantClasses = {
      default: '',
      floating: 'hover:shadow-2xl transition-shadow duration-500',
      perspective: 'perspective-1000',
    };

    return (
      <Image
        ref={ref}
        className={`${variantClasses[variant]} ${className}`}
        containerClassName={`${containerVariantClasses[variant]} ${containerClassName}`}
        aspectRatio="16:9"
        rounded
        shadow="lg"
        {...props}
      />
    );
  }
);

HeroImage.displayName = 'HeroImage';
