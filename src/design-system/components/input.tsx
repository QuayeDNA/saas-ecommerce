import { forwardRef, useState } from 'react';
import type { ReactNode, InputHTMLAttributes } from 'react';
import { useTheme } from '../../hooks/use-theme';

// Input sizes
type InputSize = 'xs' | 'sm' | 'md' | 'lg';

// Input variants
type InputVariant = 'outline' | 'filled' | 'flushed';

// Input color schemes - use 'default' to use theme primary color
type InputColorScheme = 'default' | 'success' | 'error' | 'warning' | 'info' | 'gray';

// Input props interface
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  variant?: InputVariant;
  colorScheme?: InputColorScheme;
  isInvalid?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  className?: string;
  useThemeColor?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      variant = 'outline',
      colorScheme = 'default',
      isInvalid = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorText,
      fullWidth = false,
      className = '',
      required = false,
      useThemeColor = true,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    // Get the primary color from the theme context
    const { primaryColor } = useTheme();
    
    // Focus state for enhanced focus styles
    const [isFocused, setIsFocused] = useState(false);

    // Size classes for different elements
    const sizeClasses = {
      input: {
        xs: 'text-xs h-7 px-2',
        sm: 'text-sm h-8 px-3',
        md: 'text-sm h-10 px-4',
        lg: 'text-base h-12 px-4',
      },
      label: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      },
      helperText: {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
      },
      iconSize: {
        xs: 'w-3.5 h-3.5',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-5 h-5',
      },
      iconPadding: {
        xs: leftIcon ? 'pl-7' : 'pl-2',
        sm: leftIcon ? 'pl-9' : 'pl-3',
        md: leftIcon ? 'pl-11' : 'pl-4',
        lg: leftIcon ? 'pl-12' : 'pl-4',
      },
      rightIconPadding: {
        xs: rightIcon ? 'pr-7' : 'pr-2',
        sm: rightIcon ? 'pr-9' : 'pr-3',
        md: rightIcon ? 'pr-11' : 'pr-4',
        lg: rightIcon ? 'pr-12' : 'pr-4',
      },
    };

    // Variant specific styles
    const variantClasses = {
      outline: 'border border-gray-300 bg-white rounded-lg',
      filled: 'border border-transparent bg-gray-100 rounded-lg',
      flushed: 'border-b-2 border-gray-300 rounded-none px-0',
    };

    // Get theme color classes based on the current primary color from the theme
    const getThemeColorClasses = () => {
      switch (primaryColor) {
        case 'blue':
          return {
            border: 'border-blue-500',
            ring: 'ring ring-blue-200',
            focus: 'focus:border-blue-500 focus:ring-blue-100',
          };
        case 'purple':
          return {
            border: 'border-purple-500',
            ring: 'ring ring-purple-200',
            focus: 'focus:border-purple-500 focus:ring-purple-100',
          };
        case 'green':
          return {
            border: 'border-green-500',
            ring: 'ring ring-green-200',
            focus: 'focus:border-green-500 focus:ring-green-100',
          };
        case 'orange':
          return {
            border: 'border-orange-500',
            ring: 'ring ring-orange-200',
            focus: 'focus:border-orange-500 focus:ring-orange-100',
          };
        case 'red':
          return {
            border: 'border-red-500',
            ring: 'ring ring-red-200',
            focus: 'focus:border-red-500 focus:ring-red-100',
          };
        default:
          return getSemanticColorClasses('info');
      }
    };

    const getSemanticColorClasses = (scheme: InputColorScheme): { border: string; ring: string; focus: string } => {
      switch (scheme) {
        case 'success':
          return {
            border: 'border-green-500',
            ring: 'ring ring-green-200',
            focus: 'focus:border-green-500 focus:ring-green-100',
          };
        case 'error':
          return {
            border: 'border-red-500',
            ring: 'ring ring-red-200',
            focus: 'focus:border-red-500 focus:ring-red-100',
          };
        case 'warning':
          return {
            border: 'border-yellow-500',
            ring: 'ring ring-yellow-200',
            focus: 'focus:border-yellow-500 focus:ring-yellow-100',
          };
        case 'info':
          return {
            border: 'border-blue-500',
            ring: 'ring ring-blue-200',
            focus: 'focus:border-blue-500 focus:ring-blue-100',
          };
        case 'gray':
          return {
            border: 'border-gray-500',
            ring: 'ring ring-gray-200',
            focus: 'focus:border-gray-500 focus:ring-gray-100',
          };
        case 'default':
        default:
          return getThemeColorClasses();
      }
    };

    // Get the appropriate color classes based on whether using theme color, invalid state, etc.
    const getColorClasses = () => {
      // Always use error colors for invalid state
      if (isInvalid) {
        return {
          border: 'border-red-500',
          ring: 'ring ring-red-200',
          focus: 'focus:border-red-500 focus:ring-red-100',
        };
      }

      // If using default colorScheme and theme colors are enabled, use theme's primary color
      if (colorScheme === 'default' && useThemeColor) {
        return getThemeColorClasses();
      }

      // Otherwise, use the specified semantic color
      return getSemanticColorClasses(colorScheme);
    };

    // Focus classes
    const getFocusClasses = () => {
      const colors = getColorClasses();
      return `focus:outline-none ${colors.focus}`;
    };

    // Combine all classes for the input
    const inputClasses = [
      'form-input w-full',
      sizeClasses.input[size],
      sizeClasses.iconPadding[size],
      sizeClasses.rightIconPadding[size],
      variantClasses[variant],
      getFocusClasses(),
      'transition duration-200',
    ];
    
    // Add focused state classes
    if (isFocused) {
      const colors = getColorClasses();
      inputClasses.push(`${colors.border} ${colors.ring}`);
    }
    
    // Add invalid state classes
    if (isInvalid) {
      inputClasses.push('border-red-500 text-red-900 placeholder-red-300');
    }
    
    // Add disabled state classes
    if (isDisabled) {
      inputClasses.push('bg-gray-100 text-gray-400 cursor-not-allowed');
    }
    
    // Add custom classes
    if (className) {
      inputClasses.push(className);
    }

    // Generate a unique ID if not provided
    const uniqueId = id ?? `input-${Math.random().toString(36).slice(2, 11)}`;

    // Helper function to determine helper/error text display
    const renderHelperText = () => {
      if (isInvalid && errorText) {
        return <p className="text-red-600">{errorText}</p>;
      }
      
      if (helperText) {
        return <p className="text-gray-500">{helperText}</p>;
      }
      
      return null;
    };

    return (
      <div className={`flex flex-col ${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={uniqueId}
            className={`block ${sizeClasses.label[size]} font-medium text-gray-700 mb-1`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input container for positioning icons */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={`text-gray-400 ${sizeClasses.iconSize[size]}`}>
                {leftIcon}
              </div>
            </div>
          )}
          
          {/* Input element */}
          <input
            ref={ref}
            id={uniqueId}
            type={type}
            disabled={isDisabled}
            className={inputClasses.join(' ')}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) {
                props.onFocus(e);
              }
            }}
            onBlur={(e) => {
              setIsFocused(false);
              if (props.onBlur) {
                props.onBlur(e);
              }
            }}
            {...props}
          />
          
          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className={`text-gray-400 ${sizeClasses.iconSize[size]}`}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {/* Helper text or Error text */}
        {(helperText || (isInvalid && errorText)) && (
          <div className={`mt-1 ${sizeClasses.helperText[size]}`}>
            {renderHelperText()}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';