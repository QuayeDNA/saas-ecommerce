export const ORDER_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PENDING_PAYMENT: "pending_payment",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  PARTIALLY_COMPLETED: "partially_completed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
  WORK_IN_PROGRESS: "work_in_progress",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.DRAFT]: "Draft",
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.PENDING_PAYMENT]: "Awaiting Payment",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PROCESSING]: "Processing",
  [ORDER_STATUS.PARTIALLY_COMPLETED]: "Partial",
  [ORDER_STATUS.COMPLETED]: "Delivered ✓",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
  [ORDER_STATUS.FAILED]: "Failed",
  [ORDER_STATUS.WORK_IN_PROGRESS]: "WIP",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  [ORDER_STATUS.DRAFT]: "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]",
  [ORDER_STATUS.PENDING]: "bg-[var(--warning-lighter)] text-[var(--warning)]",
  [ORDER_STATUS.PENDING_PAYMENT]: "bg-[var(--warning-lighter)] text-[var(--warning)]",
  [ORDER_STATUS.CONFIRMED]: "bg-[var(--color-accent-soft)] text-[var(--color-secondary)]",
  [ORDER_STATUS.PROCESSING]: "bg-[var(--info)] text-white",
  [ORDER_STATUS.PARTIALLY_COMPLETED]: "bg-[var(--warning-lighter)] text-[var(--warning)]",
  [ORDER_STATUS.COMPLETED]: "bg-[var(--success)] text-white",
  [ORDER_STATUS.CANCELLED]: "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]",
  [ORDER_STATUS.FAILED]: "bg-[var(--error)] text-white",
  [ORDER_STATUS.WORK_IN_PROGRESS]: "bg-[var(--warning-lighter)] text-[var(--warning)]",
};

export const TERMINAL_STATUSES: readonly string[] = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.FAILED,
  ORDER_STATUS.PARTIALLY_COMPLETED,
];

export const CANCELLABLE_STATUSES: readonly string[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.DRAFT,
  ORDER_STATUS.WORK_IN_PROGRESS,
];

export function getStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] ?? "bg-[var(--bg-surface)] text-[var(--text-primary)]";
}
