import { Badge } from "../../../design-system/components/badge";

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatTime = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
};

export const CommissionStatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { scheme: "success" | "warning" | "error" | "info"; label: string }> = {
    credited: { scheme: "success", label: "Credited" },
    pending: { scheme: "warning", label: "Pending" },
    cancelled: { scheme: "error", label: "Cancelled" },
  };
  const c = colors[status] || { scheme: "info" as const, label: status };
  return <Badge colorScheme={c.scheme} size="sm">{c.label}</Badge>;
};
