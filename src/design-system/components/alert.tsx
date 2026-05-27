import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";

export type AlertVariant =
  | "solid"
  | "subtle"
  | "outline"
  | "left-accent"
  | "top-accent";

type AlertStatus =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: AlertVariant;
  status?: AlertStatus;
  title?: string;
  icon?: ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
  className?: string;
}

const SuccessIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
  </svg>
);

const statusConfig: Record<AlertStatus, { bg: string; subtleBg: string; textColor: string; subtleTextColor: string; borderColor: string; icon: ReactNode }> = {
  primary: {
    bg: "bg-[var(--color-primary)]",
    subtleBg: "bg-[var(--color-accent-soft)]",
    textColor: "text-[var(--text-inverse)]",
    subtleTextColor: "text-[var(--color-secondary)]",
    borderColor: "border-[var(--color-primary)]",
    icon: <InfoIcon />,
  },
  success: {
    bg: "bg-[var(--success)]",
    subtleBg: "bg-[var(--success)]/10",
    textColor: "text-white",
    subtleTextColor: "text-[var(--success)]",
    borderColor: "border-[var(--success)]",
    icon: <SuccessIcon />,
  },
  error: {
    bg: "bg-[var(--error)]",
    subtleBg: "bg-[var(--error)]/10",
    textColor: "text-white",
    subtleTextColor: "text-[var(--error)]",
    borderColor: "border-[var(--error)]",
    icon: <ErrorIcon />,
  },
  warning: {
    bg: "bg-[var(--warning)]",
    subtleBg: "bg-[var(--warning)]/10",
    textColor: "text-white",
    subtleTextColor: "text-[var(--warning)]",
    borderColor: "border-[var(--warning)]",
    icon: <WarningIcon />,
  },
  info: {
    bg: "bg-[var(--info)]",
    subtleBg: "bg-[var(--info)]/10",
    textColor: "text-white",
    subtleTextColor: "text-[var(--info)]",
    borderColor: "border-[var(--info)]",
    icon: <InfoIcon />,
  },
  neutral: {
    bg: "bg-gray-600",
    subtleBg: "bg-gray-100 dark:bg-gray-700",
    textColor: "text-white",
    subtleTextColor: "text-gray-800 dark:text-gray-200",
    borderColor: "border-gray-600",
    icon: <InfoIcon />,
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      variant = "subtle",
      status = "info",
      title,
      icon,
      isClosable = false,
      onClose,
      className = "",
      ...props
    },
    ref,
  ) => {
    const colors = statusConfig[status];

    const variantClasses: Record<AlertVariant, string> = {
      solid: `${colors.bg} ${colors.textColor}`,
      subtle: `${colors.subtleBg} ${colors.subtleTextColor}`,
      outline: `bg-transparent border ${colors.borderColor} ${colors.subtleTextColor}`,
      "left-accent": `${colors.subtleBg} ${colors.subtleTextColor} border-l-4 ${colors.borderColor}`,
      "top-accent": `${colors.subtleBg} ${colors.subtleTextColor} border-t-4 ${colors.borderColor}`,
    };

    const alertClasses = ["rounded-md p-4 relative", variantClasses[variant], className].join(" ");

    return (
      <div ref={ref} role="alert" className={alertClasses} {...props}>
        <div className="flex">
          {(icon || colors.icon) && <div className="flex-shrink-0 mr-3">{icon || colors.icon}</div>}
          <div className="flex-1">
            {title && <div className="font-medium mb-1">{title}</div>}
            <div className={title ? "text-sm" : ""}>{children}</div>
          </div>
          {isClosable && (
            <div className="ml-3 flex-shrink-0">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  variant === "solid"
                    ? "text-white hover:bg-white/10 focus:ring-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                aria-label="Close"
                onClick={onClose}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";
