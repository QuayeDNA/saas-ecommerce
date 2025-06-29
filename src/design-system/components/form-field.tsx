import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
