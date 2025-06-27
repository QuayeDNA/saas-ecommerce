import { forwardRef } from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../hooks/use-theme';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'accent';

// Button sizes
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button color schemes (beyond the variant)
type ButtonColorScheme = 'default' | 'success' | 'warning' | 'error' | 'info';

// Button props interface
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorScheme?: ButtonColorScheme;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  rounded?: boolean; // For fully rounded buttons
  useThemeColor?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      colorScheme = 'default',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled = false,
      type = 'button',
      rounded = false,
      useThemeColor = true,
      ...props
    },
    ref
  ) => {    
    // Access theme
    const { primaryColor } = useTheme();
    
    // Size styles
    const sizeClasses = {
      xs: 'text-xs px-2 py-1 h-6',
      sm: 'text-sm px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-10',
      lg: 'text-base px-5 py-2.5 h-12',
      xl: 'text-lg px-6 py-3 h-14',
    };

    // Helper function to get theme-based color classes
    const getThemeColorClasses = () => {
      // Map theme colors to tailwind classes
      switch (primaryColor) {
        case 'blue':
          return {
            solid: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
            outline: 'bg-transparent border border-blue-500 text-blue-700 hover:bg-blue-50 active:bg-blue-100',
            ghost: 'bg-transparent text-blue-700 hover:bg-blue-50 active:bg-blue-100',
            link: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-blue-500'
          };
        case 'purple':
          return {
            solid: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-sm',
            outline: 'bg-transparent border border-purple-500 text-purple-700 hover:bg-purple-50 active:bg-purple-100',
            ghost: 'bg-transparent text-purple-700 hover:bg-purple-50 active:bg-purple-100',
            link: 'bg-transparent text-purple-600 hover:text-purple-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-purple-500'
          };
        case 'green':
          return {
            solid: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
            outline: 'bg-transparent border border-green-500 text-green-700 hover:bg-green-50 active:bg-green-100',
            ghost: 'bg-transparent text-green-700 hover:bg-green-50 active:bg-green-100',
            link: 'bg-transparent text-green-600 hover:text-green-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-green-500'
          };
        case 'orange':
          return {
            solid: 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 shadow-sm',
            outline: 'bg-transparent border border-orange-500 text-orange-700 hover:bg-orange-50 active:bg-orange-100',
            ghost: 'bg-transparent text-orange-700 hover:bg-orange-50 active:bg-orange-100',
            link: 'bg-transparent text-orange-600 hover:text-orange-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-orange-500'
          };
        case 'red':
          return {
            solid: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
            outline: 'bg-transparent border border-red-500 text-red-700 hover:bg-red-50 active:bg-red-100',
            ghost: 'bg-transparent text-red-700 hover:bg-red-50 active:bg-red-100',
            link: 'bg-transparent text-red-600 hover:text-red-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-red-500'
          };
        default:
          return getSemanticColorClasses('info');
      }
    };
    
    // Helper functions for semantic color classes
    const getSemanticColorClasses = (scheme: ButtonColorScheme): {
      solid: string;
      outline: string;
      ghost: string;
      link: string;
      focusRing: string;
    } => {
      switch (scheme) {
        case 'success':
          return {
            solid: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm',
            outline: 'bg-transparent border border-green-500 text-green-700 hover:bg-green-50 active:bg-green-100',
            ghost: 'bg-transparent text-green-700 hover:bg-green-50 active:bg-green-100',
            link: 'bg-transparent text-green-600 hover:text-green-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-green-500'
          };
        case 'warning':
          return {
            solid: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 shadow-sm',
            outline: 'bg-transparent border border-yellow-500 text-yellow-700 hover:bg-yellow-50 active:bg-yellow-100',
            ghost: 'bg-transparent text-yellow-700 hover:bg-yellow-50 active:bg-yellow-100',
            link: 'bg-transparent text-yellow-600 hover:text-yellow-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-yellow-500'
          };
        case 'error':
          return {
            solid: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
            outline: 'bg-transparent border border-red-500 text-red-700 hover:bg-red-50 active:bg-red-100',
            ghost: 'bg-transparent text-red-700 hover:bg-red-50 active:bg-red-100',
            link: 'bg-transparent text-red-600 hover:text-red-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-red-500'
          };
        case 'info':
          return {
            solid: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
            outline: 'bg-transparent border border-blue-500 text-blue-700 hover:bg-blue-50 active:bg-blue-100',
            ghost: 'bg-transparent text-blue-700 hover:bg-blue-50 active:bg-blue-100',
            link: 'bg-transparent text-blue-600 hover:text-blue-700 hover:underline p-0 h-auto',
            focusRing: 'focus:ring-blue-500'
          };
        case 'default':
        default:
          return getThemeColorClasses();
      }
    };
    
    // Get appropriate color classes
    const getColorClasses = () => {
      // If using default colorScheme and theme colors are enabled, use theme's primary color
      if (colorScheme === 'default' && useThemeColor) {
        return getThemeColorClasses();
      }
      
      // Otherwise use semantic colors
      return getSemanticColorClasses(colorScheme);
    };
    
    // Get base variant styles based on color scheme
    const getVariantClasses = () => {
      // Get color palette based on colorScheme
      const colors = getColorClasses();
      
      // Return classes based on variant
      switch (variant) {
        case 'primary':
          return colors.solid;
          
        case 'secondary':
          return 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-sm';
          
        case 'accent':
          // Use a contrasting color to the primary theme color
          // This could be improved to have more intelligent contrast selection
          return 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 shadow-sm';
          
        case 'outline':
          return colors.outline;
          
        case 'ghost':
          return colors.ghost;
          
        case 'link':
          return colors.link;
          
        default:
          return colors.solid;
      }
    };
    
    // Focus ring color based on variant and color scheme
    const getFocusRingClass = () => {
      if (variant === 'link') return 'focus:outline-none';
      
      const colors = getColorClasses();
      return `focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.focusRing}`;
    };
    
    // Combine all classes
    const buttonClasses = [
      'inline-flex items-center justify-center',
      rounded ? 'rounded-full' : 'rounded-md',
      getFocusRingClass(),
      'transition-all duration-200',
      sizeClasses[size],
      getVariantClasses(),
      fullWidth ? 'w-full' : '',
      (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '',
      className,
    ].join(' ');

    // Return the button component
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';