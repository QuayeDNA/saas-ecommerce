import {
  forwardRef,
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const typeToVars = {
  success: {
    bg: "var(--success)",
    border: "var(--success)",
    color: "var(--text-inverse)",
  },
  error: {
    bg: "var(--error)",
    border: "var(--error)",
    color: "var(--text-inverse)",
  },
  warning: {
    bg: "var(--warning)",
    border: "var(--warning)",
    color: "var(--text-inverse)",
  },
  info: {
    bg: "var(--info)",
    border: "var(--info)",
    color: "var(--text-inverse)",
  },
} as const satisfies Record<ToastType, Record<string, string>>;

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

interface ToastItemProps extends Toast {
  onClose: (id: string) => void;
}

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(
  ({ id, message, type, onClose }, ref) => {
    const [visible, setVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => onClose(id), 300);
    };

    const vars = typeToVars[type];

    return (
      <div
        ref={ref}
        className={[
          "pointer-events-auto flex w-full max-w-xs items-center gap-4 border-l-8 p-4 sm:max-w-md",
          visible && !isClosing ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        ].join(" ")}
        role="alert"
        style={{
          minWidth: 240,
          background: vars.bg,
          borderColor: vars.border,
          color: vars.color,
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)",
          fontFamily: "var(--font-family)",
          fontWeight: "var(--font-weight-semibold)",
          fontSize: "var(--font-2xl)",
          transition: "all var(--transition-normal)",
        }}
      >
        <span
          className="flex-shrink-0"
          style={{ width: "var(--space-6)", height: "var(--space-6)" }}
        >
          {icons[type]}
        </span>

        <p
          className="flex-1 break-words"
          style={{
            lineHeight: "var(--line-height-tight)",
            margin: 0,
            color: "inherit",
          }}
        >
          {message}
        </p>

        <button
          onClick={handleClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleClose();
          }}
          aria-label="Close"
          type="button"
          className="flex-shrink-0 touch-manipulation"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "var(--text-inverse)",
            opacity: 0.8,
            width: "var(--space-5)",
            height: "var(--space-5)",
            transition: "opacity var(--transition-fast), transform var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  },
);

ToastItem.displayName = "ToastItem";

const ToastContainer = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { toasts, removeToast } = context;

  return createPortal(
    <div
      className="fixed flex w-full max-w-full flex-col items-end px-2"
      style={{
        top: "var(--space-4)",
        right: "var(--space-2)",
        zIndex: 1000,
        gap: "var(--space-2)",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body,
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
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Add a new toast
  const addToast = useCallback(
    (message: string, type: ToastType, duration = 5000) => {
      const id = Math.random().toString(36).substring(2);

      setToasts((prev) => [...prev, { id, message, type, duration }]);

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    const showToast = (
      message: string,
      type: ToastType = "info",
      duration?: number,
    ) => {
      addToast(message, type, duration);
    };

    return { toasts, addToast, removeToast, showToast };
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
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
