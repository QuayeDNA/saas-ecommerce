import { forwardRef } from "react";
import { useTheme } from "../../hooks/use-theme";

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
    const { primaryColor } = useTheme();

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

    // Color configurations
    const getColorClasses = () => {
      if (isDisabled) {
        return {
          switch: "bg-gray-300 cursor-not-allowed",
          knob: "bg-white",
        };
      }

      const colorMap = {
        default: {
          switch: checked ? `bg-${primaryColor}-500` : "bg-gray-300",
          knob: "bg-white",
        },
        success: {
          switch: checked ? "bg-green-500" : "bg-gray-300",
          knob: "bg-white",
        },
        error: {
          switch: checked ? "bg-red-500" : "bg-gray-300",
          knob: "bg-white",
        },
        warning: {
          switch: checked ? "bg-yellow-500" : "bg-gray-300",
          knob: "bg-white",
        },
        info: {
          switch: checked ? "bg-blue-500" : "bg-gray-300",
          knob: "bg-white",
        },
        gray: {
          switch: checked ? "bg-gray-500" : "bg-gray-300",
          knob: "bg-white",
        },
      };

      return colorMap[colorScheme] || colorMap.default;
    };

    const colors = getColorClasses();
    const config = sizeConfig[size];

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
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
            focus:ring-${primaryColor}-500 focus:ring-offset-2
            ${config.switch} ${colors.switch}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block transform rounded-full shadow ring-0
              transition duration-200 ease-in-out
              ${config.knob} ${colors.knob}
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
