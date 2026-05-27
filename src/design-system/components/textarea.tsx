import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2 border border-[var(--border-color)]
            rounded-md shadow-sm
            placeholder-[var(--text-muted)]
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-[var(--bg-surface-alt)] disabled:cursor-not-allowed
            bg-[var(--bg-surface)] text-[var(--text-primary)]
            ${
              error
                ? "border-error focus:ring-error focus:border-error"
                : "focus:ring-primary"
            }
            ${className}
          `}
          style={
            !error
              ? ({
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties)
              : undefined
          }
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
