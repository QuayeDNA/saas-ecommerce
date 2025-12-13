import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { useTheme } from "../../hooks/use-theme";
import type { ThemeColor } from "../../contexts/theme-context-value";

// Alert variants
export type AlertVariant =
  | "solid"
  | "subtle"
  | "outline"
  | "left-accent"
  | "top-accent";

// Alert statuses
type AlertStatus =
  | ThemeColor
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral";

// Alert props interface
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
    ref
  ) => {
    // Use the theme context if needed for dynamic theming later
    useTheme();
    // Status color mapping
    const getStatusColors = (statusType: AlertStatus) => {
      switch (statusType) {
        case "success":
          return {
            bg: "bg-green-600",
            subtleBg: "bg-green-50",
            textColor: "text-white",
            subtleTextColor: "text-green-800",
            borderColor: "border-green-600",
            icon: (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ),
          };
        case "error":
          return {
            bg: "bg-red-600",
            subtleBg: "bg-red-50",
            textColor: "text-white",
            subtleTextColor: "text-red-800",
            borderColor: "border-red-600",
            icon: (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
          };
        case "warning":
          return {
            bg: "bg-yellow-500",
            subtleBg: "bg-yellow-50",
            textColor: "text-white",
            subtleTextColor: "text-yellow-800",
            borderColor: "border-yellow-500",
            icon: (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
          };
        case "info":
          return {
            bg: "bg-primary-500",
            subtleBg: "bg-primary-50",
            textColor: "text-white",
            subtleTextColor: "text-primary-900",
            borderColor: "border-primary-500",
            icon: (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
          };
        case "neutral":
          return {
            bg: "bg-gray-600",
            subtleBg: "bg-gray-50",
            textColor: "text-white",
            subtleTextColor: "text-gray-800",
            borderColor: "border-gray-600",
            icon: (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
          };
        default:
          // Map ThemeColors to the primary color classes
          return {
            bg: "bg-primary-600",
            subtleBg: "bg-primary-50",
            textColor: "text-white",
            subtleTextColor: "text-primary-800",
            borderColor: "border-primary-600",
            icon: (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg>
            ),
          };
      }
    };

    // Get styles based on status
    const statusStyles = getStatusColors(status);

    // Variant specific styles
    const getVariantStyles = () => {
      switch (variant) {
        case "solid":
          return `${statusStyles.bg} ${statusStyles.textColor}`;
        case "subtle":
          return `${statusStyles.subtleBg} ${statusStyles.subtleTextColor}`;
        case "outline":
          return `bg-transparent border ${statusStyles.borderColor} ${statusStyles.subtleTextColor}`;
        case "left-accent":
          return `${statusStyles.subtleBg} ${statusStyles.subtleTextColor} border-l-4 ${statusStyles.borderColor}`;
        case "top-accent":
          return `${statusStyles.subtleBg} ${statusStyles.subtleTextColor} border-t-4 ${statusStyles.borderColor}`;
        default:
          return `${statusStyles.subtleBg} ${statusStyles.subtleTextColor}`;
      }
    };

    const alertClasses = [
      "rounded-md p-4",
      "relative",
      getVariantStyles(),
      className,
    ].join(" ");

    return (
      <div ref={ref} role="alert" className={alertClasses} {...props}>
        <div className="flex">
          {(icon || statusStyles.icon) && (
            <div className="flex-shrink-0 mr-3">
              {icon || statusStyles.icon}
            </div>
          )}

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
                    ? "bg-transparent text-white hover:bg-white hover:bg-opacity-10 focus:ring-white"
                    : `bg-transparent hover:${statusStyles.bg} hover:bg-opacity-10 focus:ring-${statusStyles.borderColor}`
                }`}
                aria-label="Close"
                onClick={onClose}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";
