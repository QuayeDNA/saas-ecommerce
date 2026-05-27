import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-b border-[var(--border-color)] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DialogHeader.displayName = 'DialogHeader';
