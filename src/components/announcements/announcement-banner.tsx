import React from "react";
import { X, AlertTriangle, AlertCircle, Info, Wrench, CheckCircle } from "lucide-react";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { Button } from "../../design-system/components/button";

const typeConfig: Record<string, { icon: React.ReactNode; fg: string; bg: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    fg: "var(--success)",
    bg: "color-mix(in srgb, var(--success) 10%, transparent)",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    fg: "var(--error)",
    bg: "color-mix(in srgb, var(--error) 10%, transparent)",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    fg: "var(--warning)",
    bg: "color-mix(in srgb, var(--warning) 10%, transparent)",
  },
  maintenance: {
    icon: <Wrench className="w-5 h-5" />,
    fg: "var(--color-secondary)",
    bg: "color-mix(in srgb, var(--color-secondary) 10%, transparent)",
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    fg: "var(--info)",
    bg: "color-mix(in srgb, var(--info) 10%, transparent)",
  },
};

export const AnnouncementBanner: React.FC = () => {
  const { announcements, markAsViewed, markAsAcknowledged } = useAnnouncements();
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const urgentAnnouncements = announcements.filter(
    (a) =>
      !a.hasViewed &&
      !dismissed.has(a._id) &&
      (a.priority === "urgent" || a.priority === "high")
  );

  const current = urgentAnnouncements[0];

  if (!current) return null;

  const config = typeConfig[current.type] || typeConfig.info;

  const handleDismiss = async () => {
    setDismissed((prev) => new Set(prev).add(current._id));
    await markAsViewed(current._id);
  };

  const handleAction = async () => {
    if (current.actionUrl) {
      window.location.href = current.actionUrl;
    }
    await markAsAcknowledged(current._id);
    setDismissed((prev) => new Set(prev).add(current._id));
  };

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b text-sm"
      style={{ backgroundColor: config.bg, borderColor: "color-mix(in srgb, " + config.fg + " 25%, transparent)", color: config.fg }}
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{current.title}</p>
        <p className="text-xs mt-0.5 opacity-80 line-clamp-2">{current.message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {current.actionRequired && current.actionUrl && (
          <Button variant="ghost" size="sm" onClick={handleAction} style={{ color: config.fg }}>
            {current.actionText || "View"}
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
