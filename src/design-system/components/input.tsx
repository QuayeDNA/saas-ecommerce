import { forwardRef, useState } from "react";
import type { ReactNode, InputHTMLAttributes } from "react";

type InputSize = "xs" | "sm" | "md" | "lg";
type InputVariant = "outline" | "filled" | "flushed";
type InputColorScheme =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "gray";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
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
  required?: boolean;
}

const sizeClasses = {
  input: {
    xs: "text-xs h-7 px-2",
    sm: "text-sm h-8 px-3",
    md: "text-sm h-10 px-4",
    lg: "text-base h-12 px-4",
  },
  label: { xs: "text-xs", sm: "text-xs", md: "text-sm", lg: "text-sm" },
  helperText: { xs: "text-xs", sm: "text-xs", md: "text-xs", lg: "text-sm" },
  iconSize: { xs: "w-3.5 h-3.5", sm: "w-4 h-4", md: "w-5 h-5", lg: "w-5 h-5" },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "outline",
      colorScheme = "default",
      isInvalid = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      label,
      helperText,
      errorText,
      fullWidth = false,
      className = "",
      required = false,
      id,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const variantClasses = {
      outline: "border border-[var(--border-color)] bg-[var(--bg-surface)] rounded-lg",
      filled: "border border-transparent bg-[var(--bg-surface-alt)] rounded-lg",
      flushed: "border-b-2 border-[var(--border-color)] rounded-none px-0",
    };

    const getFocusBorder = () => {
      if (isInvalid) return "border-[var(--error)]";
      if (colorScheme === "success") return "border-[var(--success)]";
      if (colorScheme === "warning") return "border-[var(--warning)]";
      if (colorScheme === "error") return "border-[var(--error)]";
      if (colorScheme === "info") return "border-[var(--info)]";
      return "border-[var(--color-secondary)]";
    };

    const iconLeftPad = {
      xs: leftIcon ? "pl-7" : "px-2",
      sm: leftIcon ? "pl-9" : "px-3",
      md: leftIcon ? "pl-11" : "px-4",
      lg: leftIcon ? "pl-12" : "px-4",
    };
    const iconRightPad = {
      xs: rightIcon ? "pr-7" : "",
      sm: rightIcon ? "pr-9" : "",
      md: rightIcon ? "pr-11" : "",
      lg: rightIcon ? "pr-12" : "",
    };

    const colorBorder = isInvalid
      ? "border-[var(--error)]"
      : isFocused
        ? getFocusBorder()
        : "";

    const inputClasses = [
      "form-input w-full",
      "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
      sizeClasses.input[size],
      iconLeftPad[size],
      iconRightPad[size],
      variantClasses[variant],
      isFocused ? `ring-1 ${getFocusBorder().replace("border-", "ring-")} ring-opacity-30` : "",
      colorBorder,
      "outline-none transition-colors duration-200",
      "focus:ring-1 focus:ring-[var(--color-secondary)] focus:ring-opacity-30",
      isInvalid ? "text-[var(--error)]" : "",
      isDisabled ? "opacity-60 cursor-not-allowed" : "",
      className,
    ].join(" ");

    const uniqueId = id ?? `input-${Math.random().toString(36).slice(2, 11)}`;

    return (
      <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={uniqueId}
            className={`block ${sizeClasses.label[size]} font-medium text-[var(--text-primary)] mb-1`}
          >
            {label}
            {required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={`text-[var(--text-muted)] ${sizeClasses.iconSize[size]}`}>
                {leftIcon}
              </div>
            </div>
          )}
          <input
            ref={ref}
            id={uniqueId}
            type={type}
            disabled={isDisabled}
            className={inputClasses}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <div className={`text-[var(--text-muted)] ${sizeClasses.iconSize[size]}`}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        {(helperText || (isInvalid && errorText)) && (
          <div className={`mt-1 ${sizeClasses.helperText[size]}`}>
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

Input.displayName = "Input";
