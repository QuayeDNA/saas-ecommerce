import { forwardRef } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "accent"
  | "danger"
  | "success"
  | "warning"
  | "info";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

type ButtonColorScheme =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorScheme?: ButtonColorScheme;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  rounded?: boolean;
  iconOnly?: boolean;
  loadingText?: string;
}

const sizeClasses = {
  xs: "text-xs px-2 py-1 h-6",
  sm: "text-sm px-3 py-1.5 h-8",
  md: "text-sm px-4 py-2 h-10",
  lg: "text-base px-5 py-2.5 h-12",
  xl: "text-lg px-6 py-3 h-14",
};

const iconOnlySizeClasses = {
  xs: "p-1 min-h-6 h-6 w-6",
  sm: "p-1.5 min-h-8 h-8 w-8",
  md: "p-2 min-h-10 h-10 w-10",
  lg: "p-2.5 min-h-12 h-12 w-12",
  xl: "p-3 min-h-14 h-14 w-14",
};

const semanticColors: Record<ButtonColorScheme, { solid: string; outline: string; ghost: string; link: string }> = {
  default: {
    solid: "text-white shadow-sm",
    outline: "bg-transparent border text-[var(--color-primary)] hover:bg-[var(--bg-surface-alt)]",
    ghost: "bg-transparent text-[var(--color-primary)] hover:bg-[var(--bg-surface-alt)]",
    link: "bg-transparent text-[var(--color-primary)] hover:underline p-0 h-auto",
  },
  success: {
    solid: "bg-[var(--success)] text-white hover:brightness-110 shadow-sm",
    outline: "bg-transparent border border-[var(--success)] text-[var(--success)]",
    ghost: "bg-transparent text-[var(--success)]",
    link: "bg-transparent text-[var(--success)] hover:underline p-0 h-auto",
  },
  warning: {
    solid: "bg-[var(--warning)] text-white hover:brightness-110 shadow-sm",
    outline: "bg-transparent border border-[var(--warning)] text-[var(--warning)]",
    ghost: "bg-transparent text-[var(--warning)]",
    link: "bg-transparent text-[var(--warning)] hover:underline p-0 h-auto",
  },
  error: {
    solid: "bg-[var(--error)] text-white hover:brightness-110 shadow-sm",
    outline: "bg-transparent border border-[var(--error)] text-[var(--error)]",
    ghost: "bg-transparent text-[var(--error)]",
    link: "bg-transparent text-[var(--error)] hover:underline p-0 h-auto",
  },
  info: {
    solid: "bg-[var(--info)] text-white hover:brightness-110 shadow-sm",
    outline: "bg-transparent border border-[var(--info)] text-[var(--info)]",
    ghost: "bg-transparent text-[var(--info)]",
    link: "bg-transparent text-[var(--info)] hover:underline p-0 h-auto",
  },
  danger: {
    solid: "bg-[var(--error)] text-white hover:brightness-110 shadow-sm",
    outline: "bg-transparent border border-[var(--error)] text-[var(--error)]",
    ghost: "bg-transparent text-[var(--error)]",
    link: "bg-transparent text-[var(--error)] hover:underline p-0 h-auto",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      colorScheme = "default",
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled = false,
      type = "button",
      rounded = false,
      iconOnly = false,
      loadingText,
      ...props
    },
    ref,
  ) => {
    const getVariantClasses = () => {
      const semanticVariant = variant === "danger" || variant === "success" || variant === "warning" || variant === "info"
        ? variant
        : undefined;
      const scheme = semanticVariant ?? colorScheme;
      const colors = semanticColors[scheme as ButtonColorScheme];

      switch (variant) {
        case "primary":
        case "accent":
          return colors.solid;
        case "secondary":
          return "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 shadow-sm";
        case "outline":
          return `${colors.outline} border`;
        case "ghost":
          return colors.ghost;
        case "link":
          return colors.link;
        default:
          return colors.solid;
      }
    };

    const getThemeStyles = (): React.CSSProperties => {
      const isSemanticVariant = variant === "danger" || variant === "success" || variant === "warning" || variant === "info";
      if (colorScheme !== "default" || isSemanticVariant) return {};

      if (variant === "primary" || variant === "accent") {
        return {
          background: "var(--gradient-primary)",
          color: "white",
        };
      }
      if (variant === "outline") {
        return {
          borderColor: "var(--color-primary)",
          color: "var(--color-primary)",
        };
      }
      if (variant === "ghost" || variant === "link") {
        return { color: "var(--color-primary)" };
      }
      return {};
    };

    const focusRing = variant === "link"
      ? "focus:outline-none"
      : "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]";

    const buttonClasses = [
      "inline-flex items-center justify-center",
      "font-medium",
      rounded ? "rounded-full" : "rounded-md",
      focusRing,
      "transition-all duration-200",
      iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
      getVariantClasses(),
      fullWidth ? "w-full" : "",
      disabled || isLoading ? "opacity-60 cursor-not-allowed" : "",
      className,
    ].join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        style={{ ...getThemeStyles(), ...props.style }}
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
              <span className={`flex items-center ${children ? "mr-2" : ""}`}>
                {leftIcon}
              </span>
            )}
            {children && (
              <span className={`flex items-center ${iconOnly ? "sr-only" : ""}`}>
                {children}
              </span>
            )}
            {rightIcon && (
              <span className={`flex items-center ${children ? "ml-2" : ""}`}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
