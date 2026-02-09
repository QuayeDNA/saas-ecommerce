import { forwardRef } from "react";

// Switch sizes
type SwitchSize = "sm" | "md" | "lg";

// Switch color schemes - use 'default' to use theme primary color
type SwitchColorScheme =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";

// Switch props interface
interface SwitchProps {
  size?: SwitchSize;
  colorScheme?: SwitchColorScheme;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  isDisabled?: boolean;
  label?: string;
  className?: string;
}

// Static Tailwind classes for non-default color schemes (visible to JIT scanner)
const SCHEME_CHECKED_BG: Record<
  Exclude<SwitchColorScheme, "default">,
  string
> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
  gray: "bg-gray-500",
};

const SCHEME_RING_COLOR: Record<
  Exclude<SwitchColorScheme, "default">,
  string
> = {
  success: "focus:ring-green-500",
  error: "focus:ring-red-500",
  warning: "focus:ring-yellow-500",
  info: "focus:ring-blue-500",
  gray: "focus:ring-gray-500",
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      size = "md",
      colorScheme = "default",
      checked = false,
      onCheckedChange,
      isDisabled = false,
      label,
      className = "",
    },
    ref,
  ) => {
    // Size configurations
    const sizeConfig = {
      sm: {
        switch: "w-8 h-4",
        knob: "w-3 h-3",
        translate: "translate-x-4",
      },
      md: {
        switch: "w-11 h-6",
        knob: "w-5 h-5",
        translate: "translate-x-5",
      },
      lg: {
        switch: "w-14 h-7",
        knob: "w-6 h-6",
        translate: "translate-x-7",
      },
    };

    const config = sizeConfig[size];
    const isDefault = colorScheme === "default";

    // Determine background class and inline style
    let bgClass: string;
    let bgStyle: React.CSSProperties = {};

    if (isDisabled) {
      bgClass = "bg-gray-300 cursor-not-allowed";
    } else if (!checked) {
      bgClass = "bg-gray-300";
    } else if (isDefault) {
      // Use CSS variable for theme-aware primary color (avoids Tailwind JIT purge)
      bgClass = "";
      bgStyle = { backgroundColor: "var(--color-primary-500)" };
    } else {
      bgClass = SCHEME_CHECKED_BG[colorScheme] ?? "bg-blue-500";
    }

    // Determine focus ring class and inline style
    let ringClass: string;
    let ringStyle: React.CSSProperties = {};

    if (isDefault) {
      ringClass = "focus:ring-2 focus:ring-offset-2";
      ringStyle = {
        "--tw-ring-color": "var(--color-primary-500)",
      } as React.CSSProperties;
    } else {
      ringClass = `focus:ring-2 focus:ring-offset-2 ${SCHEME_RING_COLOR[colorScheme] ?? "focus:ring-blue-500"}`;
    }

    const handleClick = () => {
      if (!isDisabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <div className={`inline-flex items-center ${className}`}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={isDisabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`
            relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none
            ${ringClass} ${config.switch} ${bgClass}
          `}
          style={{ ...bgStyle, ...ringStyle }}
        >
          <span
            className={`
              pointer-events-none inline-block transform rounded-full shadow ring-0
              transition duration-200 ease-in-out bg-white
              ${config.knob}
              ${checked ? config.translate : "translate-x-0"}
            `}
          />
        </button>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-900">
            {label}
          </span>
        )}
      </div>
    );
  },
);

Switch.displayName = "Switch";
