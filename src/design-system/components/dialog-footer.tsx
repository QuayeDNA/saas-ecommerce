import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'end' | 'center' | 'between';
}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
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
        className={`px-6 py-4 border-t border-gray-200 flex gap-3 ${justifyClasses[justify]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DialogFooter.displayName = 'DialogFooter';
