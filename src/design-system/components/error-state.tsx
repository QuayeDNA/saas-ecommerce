import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  action,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}
  >
    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--error)]/10">
      <AlertCircle className="w-7 h-7 text-[var(--error)]" />
    </div>
    <div className="text-center">
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      <p className="text-sm mt-0.5 text-[var(--text-secondary)]">{message}</p>
    </div>
    {action}
  </div>
);
