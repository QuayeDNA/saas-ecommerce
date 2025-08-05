import { forwardRef } from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../hooks/use-theme';
import { Loader2 } from 'lucide-react';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'accent' | 'danger' | 'success' | 'warning' | 'info';

// Button sizes
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button color schemes (beyond the variant)
type ButtonColorScheme = 'default' | 'success' | 'warning' | 'error' | 'info' | 'danger';

/**
 * Button component props
 * 
 * Usage with icons:
 * - Icon-only: <Button iconOnly leftIcon={<PlusIcon />} aria-label="Add item" />
 * - Left icon: <Button leftIcon={<UserIcon />}>Profile</Button>
 * - Right icon: <Button rightIcon={<ArrowRightIcon />}>Next</Button>
 * - Loading: <Button isLoading loadingText="Processing...">Submit</Button>
 * 
 * Both Lucide React icons and React Icons are supported:
 * - Lucide: import { Home } from 'lucide-react'
 * - React Icons: import { FaHome } from 'react-icons/fa'
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode; // Optional for icon-only buttons
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
  iconOnly?: boolean; // For buttons that only display an icon (should include aria-label)
  loadingText?: string; // Optional text to display while loading
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
      iconOnly = false,
      loadingText,
      ...props
    },
    ref
  ) => {    
    // Access theme
    const { primaryColor } = useTheme();
    
    // Size styles for regular buttons
    const sizeClasses = {
      xs: 'text-xs px-2 py-1 h-6',
      sm: 'text-sm px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-10',
      lg: 'text-base px-5 py-2.5 h-12',
      xl: 'text-lg px-6 py-3 h-14',
    };
    
    // Size styles for icon-only buttons (equal width and height)
    const iconOnlySizeClasses = {
      xs: 'p-1 min-h-6 h-6 w-6',
      sm: 'p-1.5 min-h-8 h-8 w-8',
      md: 'p-2 min-h-10 h-10 w-10',
      lg: 'p-2.5 min-h-12 h-12 w-12',
      xl: 'p-3 min-h-14 h-14 w-14',
    };

    // Helper function to get theme-based color classes
    const getThemeColorClasses = () => {
      // Map theme colors to tailwind classes with new primary color #142850
      switch (primaryColor) {
        case 'blue':
          return {
            solid: 'bg-[#142850] text-white hover:bg-[#1e3a5f] active:bg-[#0f1f3a] shadow-sm',
            outline: 'bg-transparent border border-[#142850] text-[#142850] hover:bg-[#f0f4f8] active:bg-[#d9e2ec]',
            ghost: 'bg-transparent text-[#142850] hover:bg-[#f0f4f8] active:bg-[#d9e2ec]',
            link: 'bg-transparent text-[#142850] hover:text-[#1e3a5f] hover:underline p-0 h-auto',
            focusRing: 'focus:ring-[#142850]'
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
            solid: 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] active:bg-[#0369a1] shadow-sm',
            outline: 'bg-transparent border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#f0f9ff] active:bg-[#e0f2fe]',
            ghost: 'bg-transparent text-[#0ea5e9] hover:bg-[#f0f9ff] active:bg-[#e0f2fe]',
            link: 'bg-transparent text-[#0ea5e9] hover:text-[#0284c7] hover:underline p-0 h-auto',
            focusRing: 'focus:ring-[#0ea5e9]'
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
          // Use the secondary blue color as accent
          return 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] active:bg-[#0369a1] shadow-sm';
          
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
      iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
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
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={`flex items-center ${children ? 'mr-2' : ''}`}>
                {leftIcon}
              </span>
            )}
            {children && (
              <span className={`flex items-center ${iconOnly ? 'sr-only' : ''}`}>
                {children}
              </span>
            )}
            {rightIcon && (
              <span className={`flex items-center ${children ? 'ml-2' : ''}`}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';