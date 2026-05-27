import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
} from "react";

interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

type DropdownSize = "xs" | "sm" | "md" | "lg";
type DropdownColorScheme =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";

interface DropdownProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: DropdownOption[];
  value?: string | number;
  placeholder?: string;
  size?: DropdownSize;
  colorScheme?: DropdownColorScheme;
  isDisabled?: boolean;
  isInvalid?: boolean;
  fullWidth?: boolean;
  className?: string;
  onChange?: (value: string | number) => void;
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

const sizeClasses = {
  trigger: { xs: "text-xs h-7 px-2", sm: "text-sm h-8 px-3", md: "text-sm h-10 px-4", lg: "text-base h-12 px-4" },
  label: { xs: "text-xs", sm: "text-xs", md: "text-sm", lg: "text-sm" },
  helper: { xs: "text-xs", sm: "text-xs", md: "text-xs", lg: "text-sm" },
  option: { xs: "text-xs px-2 py-1", sm: "text-sm px-3 py-2", md: "text-sm px-4 py-2", lg: "text-base px-4 py-3" },
};

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      options,
      value,
      placeholder = "Select an option...",
      size = "md",
      isDisabled = false,
      isInvalid = false,
      fullWidth = false,
      className = "",
      onChange,
      label,
      helperText,
      errorText,
      required = false,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
          event.preventDefault();
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }
      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((p) => (p < options.length - 1 ? p + 1 : p));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((p) => (p > 0 ? p - 1 : p));
          break;
        case "Enter":
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

    const selectedOption = options.find((opt) => opt.value === value);

    const triggerClasses = [
      "relative flex items-center justify-between w-full",
      "border border-[var(--border-color)] bg-[var(--bg-surface)] rounded-lg cursor-pointer",
      "transition-colors duration-200",
      sizeClasses.trigger[size],
      isOpen ? `ring-1 ring-[var(--color-secondary)] border-[var(--color-secondary)]` : "hover:border-[var(--color-secondary)]",
      isInvalid ? "border-[var(--error)]" : "",
      isDisabled ? "opacity-60 cursor-not-allowed" : "",
      className,
    ].join(" ");

    const uniqueId = `dropdown-${Math.random().toString(36).slice(2, 11)}`;

    return (
      <div className={`relative ${fullWidth ? "w-full" : ""}`} ref={dropdownRef}>
        {label && (
          <label htmlFor={uniqueId} className={`block ${sizeClasses.label[size]} font-medium text-[var(--text-primary)] mb-1`}>
            {label}
            {required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>
        )}
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
          <span className={selectedOption ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <svg className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <div
                key={option.value}
                className={[
                  "cursor-pointer transition-colors duration-150",
                  sizeClasses.option[size],
                  option.disabled ? "opacity-50 cursor-not-allowed" : "",
                  !option.disabled ? "hover:bg-[var(--bg-surface-alt)]" : "",
                  option.value === value ? "bg-[var(--color-accent-soft)] text-[var(--color-secondary)]" : "text-[var(--text-primary)]",
                  index === focusedIndex ? "bg-[var(--bg-surface-alt)]" : "",
                ].join(" ")}
                onClick={() => !option.disabled && handleOptionSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                <span className="flex items-center gap-2">
                  {option.icon && option.icon}
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {(helperText || (isInvalid && errorText)) && (
          <div className={`mt-1 ${sizeClasses.helper[size]}`}>
            {isInvalid && errorText ? (
              <p className="text-[var(--error)]">{errorText}</p>
            ) : (
              helperText && <p className="text-[var(--text-muted)]">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";
