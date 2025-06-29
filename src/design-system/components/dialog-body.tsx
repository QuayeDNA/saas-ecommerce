import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 overflow-y-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DialogBody.displayName = 'DialogBody';
