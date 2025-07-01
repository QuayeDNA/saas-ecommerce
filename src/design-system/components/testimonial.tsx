// src/design-system/components/testimonial.tsx
import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

interface TestimonialProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: ReactNode;
  rating?: number;
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export const Testimonial = forwardRef<HTMLDivElement, TestimonialProps>(
  ({
    content,
    author,
    role,
    company,
    avatar,
    rating = 5,
    variant = 'card',
    className = '',
    ...props
  }, ref) => {
    const variantClasses = {
      default: 'p-6',
      card: 'bg-white p-6 rounded-lg shadow-sm border border-gray-100',
      minimal: 'p-4',
    };

    const renderStars = () => {
      return (
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`text-lg ${
                i < rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      );
    };

    const renderQuote = () => {
      if (variant === 'minimal') return null;
      return <FaQuoteLeft className="text-blue-600 text-2xl mx-auto mb-4" />;
    };

    const renderAuthor = () => {
      const displayRole = role && company ? `${role}, ${company}` : role || company;
      
      return (
        <div className="flex items-center justify-center mt-6">
          {avatar && (
            <div className="mr-3">
              {avatar}
            </div>
          )}
          <div className={variant === 'minimal' ? 'text-left' : 'text-center'}>
            <div className="font-semibold text-gray-900">{author}</div>
            {displayRole && (
              <div className="text-gray-500 text-sm">{displayRole}</div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${variant === 'card' ? 'text-center' : ''} ${className}`}
        {...props}
      >
        {variant !== 'minimal' && renderStars()}
        {renderQuote()}
        <p className="text-gray-600 mb-6 leading-relaxed">
          "{content}"
        </p>
        {renderAuthor()}
      </div>
    );
  }
);

Testimonial.displayName = 'Testimonial';

// Avatar component for testimonials
interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
