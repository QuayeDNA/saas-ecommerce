import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'end' | 'center' | 'between';
}

export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  ({ children, className = '', justify = 'end', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={`flex gap-3 ${justifyClasses[justify]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = 'FormActions';
