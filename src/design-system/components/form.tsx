import { forwardRef, type FormHTMLAttributes, type ReactNode } from 'react';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ children, onSubmit, className = '', ...props }, ref) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      if (onSubmit) {
        event.preventDefault();
        onSubmit(event);
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={`space-y-6 ${className}`}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';
