import { forwardRef, useState, useEffect, createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Toast types for different visual styles
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Individual toast data structure
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Context for the toast system
interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast item component
interface ToastItemProps extends Toast {
  onClose: (id: string) => void;
}

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(
  ({ id, message, type, onClose }, ref) => {
    // Auto-remove after duration
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose(id);
      }, 5000); // Default to 5 seconds if not specified

      return () => clearTimeout(timer);
    }, [id, onClose]);

    // Animation state
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      setVisible(true);
      return () => setVisible(false);
    }, []);

    // Get appropriate styling based on toast type
    const getToastStyles = () => {
      switch (type) {
        case 'success':
          return {
            container: 'bg-green-600 border-green-700 text-white',
            icon: (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            ),
          };
        case 'error':
          return {
            container: 'bg-red-600 border-red-700 text-white',
            icon: (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            ),
          };
        case 'warning':
          return {
            container: 'bg-yellow-500 border-yellow-700 text-white',
            icon: (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            ),
          };
        case 'info':
        default:
          return {
            container: 'bg-[#142850] border-[#0f1f3a] text-white',
            icon: (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" 
                  clipRule="evenodd" 
                />
              </svg>
            ),
          };
      }
    };

    const styles = getToastStyles();

    return (
      <div
        ref={ref}
        className={`max-w-xs w-full sm:max-w-md border-l-8 rounded-xl shadow-2xl p-4 mb-4 flex items-center font-semibold text-base sm:text-lg border ${styles.container} 
          ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} 
          transition-all duration-500 ease-in-out
        `}
        role="alert"
        style={{ minWidth: 240 }}
      >
        <div className="flex-shrink-0 mr-4">
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className="break-words leading-snug">{message}</p>
        </div>
        <div>
          <button
            onClick={() => onClose(id)}
            className="ml-2 text-white/70 hover:text-white focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

ToastItem.displayName = 'ToastItem';

// Toast container component
const ToastContainer = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  const { toasts, removeToast } = context;
  
  // Create a portal for the toast container
  return createPortal(
    <div className="fixed top-4 right-2 sm:right-4 z-50 flex flex-col items-end space-y-2 px-2 w-full max-w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

// Toast provider component
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

    // Remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  // Add a new toast
  const addToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = Math.random().toString(36).substring(2);
    
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return { toasts, addToast, removeToast };
  }, [toasts, addToast, removeToast]);
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};
