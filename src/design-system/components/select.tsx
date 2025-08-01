import { forwardRef, useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  disabled?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    label, 
    value,
    onChange,
    options,
    placeholder = "Select an option",
    error, 
    helperText, 
    size = 'md', 
    variant = 'default',
    disabled = false,
    className = '', 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      outline: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    };

    const baseClasses = [
      'w-full rounded-lg border bg-white transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-opacity-50',
      'disabled:bg-gray-50 disabled:cursor-not-allowed',
      sizeClasses[size],
      variantClasses[variant],
    ];

    if (error) {
      baseClasses.push('border-red-300 focus:border-red-500 focus:ring-red-500');
    }

    if (disabled) {
      baseClasses.push('opacity-50 cursor-not-allowed');
    }

    const selectClasses = [...baseClasses, className].join(' ');

    // Calculate dropdown position
    const updateDropdownPosition = () => {
      if (selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Calculate available space
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = Math.min(options.length * 40 + 16, 240); // Approximate height
        
        // Determine if dropdown should appear above or below
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldShowAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        
        // Determine horizontal position
        let left = rect.left + scrollLeft;
        const dropdownWidth = Math.max(rect.width, 200);
        
        // Ensure dropdown doesn't go off-screen horizontally
        if (left + dropdownWidth > viewportWidth + scrollLeft) {
          left = viewportWidth + scrollLeft - dropdownWidth - 8; // 8px margin
        }
        if (left < scrollLeft) {
          left = scrollLeft + 8; // 8px margin
        }
        
        setDropdownPosition({
          top: shouldShowAbove 
            ? rect.top + scrollTop - dropdownHeight 
            : rect.bottom + scrollTop,
          left,
          width: dropdownWidth,
        });
      }
    };

    // Click outside to close
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // Update position when opening
        updateDropdownPosition();
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Update position on scroll and resize
    useEffect(() => {
      if (isOpen) {
        const handleScroll = () => updateDropdownPosition();
        const handleResize = () => updateDropdownPosition();
        
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('scroll', handleScroll, true);
          window.removeEventListener('resize', handleResize);
        };
      }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setHighlightedIndex(prev => 
              prev < options.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
            break;
          case 'Enter':
            event.preventDefault();
            if (highlightedIndex >= 0) {
              const option = options[highlightedIndex];
              if (!option.disabled) {
                onChange(option.value);
                setIsOpen(false);
                setHighlightedIndex(-1);
              }
            }
            break;
          case 'Escape':
            setIsOpen(false);
            setHighlightedIndex(-1);
            break;
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, highlightedIndex, options, onChange]);

    const selectedOption = options.find(option => option.value === value);

    const handleOptionClick = (option: SelectOption) => {
      if (!option.disabled) {
        onChange(option.value);
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        setHighlightedIndex(-1);
      }
    };

    return (
      <div className="w-full" ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative" ref={selectRef}>
          <button
            type="button"
            className={`${selectClasses} flex items-center justify-between w-full text-left`}
            onClick={handleToggle}
            disabled={disabled}
          >
            <span className={`${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <FaChevronDown 
              className={`ml-2 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown - Fixed positioning outside container */}
          {isOpen && (
            <div 
              ref={dropdownRef}
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                minWidth: '200px',
              }}
            >
              <div className="py-1">
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors duration-150 ${
                      option.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : index === highlightedIndex
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => handleOptionClick(option)}
                    disabled={option.disabled}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <FaCheck className="text-blue-600 text-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select'; 