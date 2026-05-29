export const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "bg-[var(--bg-surface-alt)] text-[var(--text-muted)]",
    active: "bg-[var(--success)]/10 text-[var(--success)]",
    expired: "bg-[var(--error)]/10 text-[var(--error)]",
    archived: "bg-[var(--warning)]/10 text-[var(--warning)]",
  };
  return colors[status] || colors.draft;
};

export const priorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-[var(--info)]/10 text-[var(--info)]",
    medium: "bg-[var(--warning)]/10 text-[var(--warning)]",
    high: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    urgent: "bg-[var(--error)]/10 text-[var(--error)]",
  };
  return colors[priority] || colors.medium;
};
