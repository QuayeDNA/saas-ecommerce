import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";

type BadgeVariant = "solid" | "subtle" | "outline";
type BadgeSize = "xs" | "sm" | "md" | "lg";
type BadgeColorScheme =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gray";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  colorScheme?: BadgeColorScheme;
  className?: string;
  rounded?: boolean;
}

const sizeClasses = {
  xs: "text-xs px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const colorMap: Record<BadgeColorScheme, Record<BadgeVariant, string>> = {
  default: {
    solid: "bg-[var(--color-primary)] text-white",
    subtle: "bg-[var(--color-accent-soft)] text-[var(--color-secondary)]",
    outline: "bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)]",
  },
  success: {
    solid: "bg-[var(--success)] text-white",
    subtle: "bg-[var(--success)]/10 text-[var(--success)]",
    outline: "bg-transparent border border-[var(--success)] text-[var(--success)]",
  },
  warning: {
    solid: "bg-[var(--warning)] text-white",
    subtle: "bg-[var(--warning)]/10 text-[var(--warning)]",
    outline: "bg-transparent border border-[var(--warning)] text-[var(--warning)]",
  },
  error: {
    solid: "bg-[var(--error)] text-white",
    subtle: "bg-[var(--error)]/10 text-[var(--error)]",
    outline: "bg-transparent border border-[var(--error)] text-[var(--error)]",
  },
  info: {
    solid: "bg-[var(--info)] text-white",
    subtle: "bg-[var(--info)]/10 text-[var(--info)]",
    outline: "bg-transparent border border-[var(--info)] text-[var(--info)]",
  },
  gray: {
    solid: "bg-gray-500 text-white",
    subtle: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    outline: "bg-transparent border border-gray-500 text-gray-700 dark:text-gray-300",
  },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "subtle",
      size = "sm",
      colorScheme = "default",
      className = "",
      rounded = false,
      ...props
    },
    ref,
  ) => {
    const badgeClasses = [
      "inline-flex items-center justify-center",
      "font-medium",
      rounded ? "rounded-full" : "rounded-md",
      sizeClasses[size],
      colorMap[colorScheme][variant],
      className,
    ].join(" ");

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
