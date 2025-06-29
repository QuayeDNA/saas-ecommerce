import { forwardRef, useState, useRef, useEffect, type ReactNode, type HTMLAttributes, type FormHTMLAttributes } from 'react';
import { useTheme } from '../../hooks/use-theme';

// ============================================================================
// DROPDOWN COMPONENT
// ============================================================================

// Dropdown option type
interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

// Dropdown sizes
type DropdownSize = 'xs' | 'sm' | 'md' | 'lg';

// Dropdown color schemes
type DropdownColorScheme = 'default' | 'success' | 'error' | 'warning' | 'info' | 'gray';

// Dropdown props interface
interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: DropdownOption[];
  value?: string | number;
  placeholder?: string;
  size?: DropdownSize;
  colorScheme?: DropdownColorScheme;
  isDisabled?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  className?: string;
  useThemeColor?: boolean;
  onChange?: (value: string | number) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value,
      placeholder = 'Select an option...',
      size = 'md',
      colorScheme = 'default',
      isDisabled = false,
      isInvalid = false,
      fullWidth = false,
      className = '',
      useThemeColor = true,
      onChange,
      label,
      helperText,
      errorText,
      required = false,
      ...props
    },
    ref
  ) => {
    const { primaryColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Size classes
    const sizeClasses = {
      trigger: {
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
      option: {
        xs: 'text-xs px-2 py-1',
        sm: 'text-sm px-3 py-2',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-4 py-3',
      },
    };

    // Get theme color classes
    const getThemeColorClasses = () => {
      switch (primaryColor) {
        case 'blue':
          return {
            border: 'border-blue-500',
            ring: 'ring ring-blue-200',
            focus: 'focus:border-blue-500 focus:ring-blue-100',
            optionHover: 'hover:bg-blue-50',
            optionSelected: 'bg-blue-100 text-blue-900',
          };
        case 'purple':
          return {
            border: 'border-purple-500',
            ring: 'ring ring-purple-200',
            focus: 'focus:border-purple-500 focus:ring-purple-100',
            optionHover: 'hover:bg-purple-50',
            optionSelected: 'bg-purple-100 text-purple-900',
          };
        case 'green':
          return {
            border: 'border-green-500',
            ring: 'ring ring-green-200',
            focus: 'focus:border-green-500 focus:ring-green-100',
            optionHover: 'hover:bg-green-50',
            optionSelected: 'bg-green-100 text-green-900',
          };
        case 'orange':
          return {
            border: 'border-orange-500',
            ring: 'ring ring-orange-200',
            focus: 'focus:border-orange-500 focus:ring-orange-100',
            optionHover: 'hover:bg-orange-50',
            optionSelected: 'bg-orange-100 text-orange-900',
          };
        case 'red':
          return {
            border: 'border-red-500',
            ring: 'ring ring-red-200',
            focus: 'focus:border-red-500 focus:ring-red-100',
            optionHover: 'hover:bg-red-50',
            optionSelected: 'bg-red-100 text-red-900',
          };
        default:
          return getSemanticColorClasses('info');
      }
    };

    const getSemanticColorClasses = (
      scheme: DropdownColorScheme
    ): {
      border: string;
      ring: string;
      focus: string;
      optionHover: string;
      optionSelected: string;
    } => {
      switch (scheme) {
        case 'success':
          return {
            border: 'border-green-500',
            ring: 'ring ring-green-200',
            focus: 'focus:border-green-500 focus:ring-green-100',
            optionHover: 'hover:bg-green-50',
            optionSelected: 'bg-green-100 text-green-900',
          };
        case 'error':
          return {
            border: 'border-red-500',
            ring: 'ring ring-red-200',
            focus: 'focus:border-red-500 focus:ring-red-100',
            optionHover: 'hover:bg-red-50',
            optionSelected: 'bg-red-100 text-red-900',
          };
        case 'warning':
          return {
            border: 'border-yellow-500',
            ring: 'ring ring-yellow-200',
            focus: 'focus:border-yellow-500 focus:ring-yellow-100',
            optionHover: 'hover:bg-yellow-50',
            optionSelected: 'bg-yellow-100 text-yellow-900',
          };
        case 'info':
          return {
            border: 'border-blue-500',
            ring: 'ring ring-blue-200',
            focus: 'focus:border-blue-500 focus:ring-blue-100',
            optionHover: 'hover:bg-blue-50',
            optionSelected: 'bg-blue-100 text-blue-900',
          };
        case 'gray':
          return {
            border: 'border-gray-500',
            ring: 'ring ring-gray-200',
            focus: 'focus:border-gray-500 focus:ring-gray-100',
            optionHover: 'hover:bg-gray-50',
            optionSelected: 'bg-gray-100 text-gray-900',
          };
        case 'default':
        default:
          return getThemeColorClasses();
      }
    };

    const getColorClasses = () => {
      if (isInvalid) {
        return {
          border: 'border-red-500',
          ring: 'ring ring-red-200',
          focus: 'focus:border-red-500 focus:ring-red-100',
          optionHover: 'hover:bg-red-50',
          optionSelected: 'bg-red-100 text-red-900',
        };
      }

      if (colorScheme === 'default' && useThemeColor) {
        return getThemeColorClasses();
      }

      return getSemanticColorClasses(colorScheme);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
            handleOptionSelect(options[focusedIndex].value);
          }
          break;
      }
    };

    const handleOptionSelect = (optionValue: string | number) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
    };

    const selectedOption = options.find(opt => opt.value === value);
    const colors = getColorClasses();

    const triggerClasses = [
      'relative flex items-center justify-between w-full',
      'border border-gray-300 bg-white rounded-lg cursor-pointer',
      'transition duration-200',
      sizeClasses.trigger[size],
      isOpen ? `${colors.border} ${colors.ring}` : 'hover:border-gray-400',
      isInvalid ? 'border-red-500 text-red-900' : 'text-gray-900',
      isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : '',
      className,
    ].join(' ');

    const uniqueId = `dropdown-${Math.random().toString(36).slice(2, 11)}`;

    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
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

        {/* Trigger */}
        <div
          ref={ref}
          id={uniqueId}
          className={triggerClasses}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={isDisabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? (
              <div className="flex items-center">
                {selectedOption.icon && <span className="mr-2">{selectedOption.icon}</span>}
                {selectedOption.label}
              </div>
            ) : (
              placeholder
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <div
                key={option.value}
                className={[
                  'cursor-pointer transition-colors duration-150',
                  sizeClasses.option[size],
                  option.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-900',
                  !option.disabled && colors.optionHover,
                  option.value === value ? colors.optionSelected : '',
                  index === focusedIndex ? 'bg-gray-100' : '',
                ].join(' ')}
                onClick={() => !option.disabled && handleOptionSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                <div className="flex items-center">
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helper text or Error text */}
        {(helperText || (isInvalid && errorText)) && (
          <div className={`mt-1 ${sizeClasses.helperText[size]}`}>
            {isInvalid && errorText ? (
              <p className="text-red-600">{errorText}</p>
            ) : (
              helperText && <p className="text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

// ============================================================================
// FORM COMPONENT
// ============================================================================

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'end' | 'center' | 'between';
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, onSubmit, className = '', ...props }, ref) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      if (onSubmit) {
        event.preventDefault();
        onSubmit(event);
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={`space-y-6 ${className}`}
        {...props}
      >
        {children}
      </form>
    );
  }
);

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  ({ children, className = '', justify = 'end', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={`flex gap-3 ${justifyClasses[justify]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// ============================================================================
// DIALOG COMPONENT
// ============================================================================

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  className?: string;
}

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'end' | 'center' | 'between';
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      isOpen,
      onClose,
      children,
      size = 'md',
      closeOnOverlay = true,
      className = '',
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4',
    };

    // Close on escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeOnOverlay ? onClose : undefined}
        />

        {/* Dialog */}
        <div
          ref={ref}
          className={[
            'relative w-full bg-white rounded-lg shadow-xl',
            'max-h-[90vh] overflow-hidden',
            'transform transition-all',
            sizeClasses[size],
            className,
          ].join(' ')}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    );
  }
);

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-b border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 overflow-y-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, className = '', justify = 'end', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-t border-gray-200 flex gap-3 ${justifyClasses[justify]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Set display names
Dropdown.displayName = 'Dropdown';
Form.displayName = 'Form';
FormField.displayName = 'FormField';
FormActions.displayName = 'FormActions';
Dialog.displayName = 'Dialog';
DialogHeader.displayName = 'DialogHeader';
DialogBody.displayName = 'DialogBody';
DialogFooter.displayName = 'DialogFooter';