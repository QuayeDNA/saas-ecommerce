import { forwardRef, useEffect, type ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  className?: string;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      isOpen,
      onClose,
      children,
      size = 'md',
      closeOnOverlay = true,
      className = '',
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4',
    };

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeOnOverlay ? onClose : undefined}
        />
        <div
          ref={ref}
          className={[
            'relative w-full bg-white rounded-lg shadow-xl',
            'max-h-[90vh] overflow-hidden',
            'transform transition-all',
            sizeClasses[size],
            className,
          ].join(' ')}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    );
  }
);

Dialog.displayName = 'Dialog';
