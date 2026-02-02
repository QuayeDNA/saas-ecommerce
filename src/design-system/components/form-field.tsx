import { forwardRef, type ReactNode, type HTMLAttributes } from "react";

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  label?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className = "", label, required, ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`} {...props}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {children}
      </div>
    );
  },
);

FormField.displayName = "FormField";
