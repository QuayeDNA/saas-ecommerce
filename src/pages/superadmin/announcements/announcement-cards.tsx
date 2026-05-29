import React from "react";
import { Edit, Trash2, Send, BarChart3 } from "lucide-react";
import { Button } from "../../../design-system/components/button";
import type { Announcement } from "../../../types/announcement";
import { statusColor, priorityColor } from "./badge-helpers";

interface Props {
  announcements: Announcement[];
  loading: boolean;
  onViewStats: (a: Announcement) => void;
  onEdit: (a: Announcement) => void;
  onBroadcast: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AnnouncementCards: React.FC<Props> = ({
  announcements,
  loading,
  onViewStats,
  onEdit,
  onBroadcast,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="p-6 text-center text-[var(--text-muted)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--border-color)] mx-auto mb-2"></div>
        Loading...
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--text-muted)]">No announcements found</div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border-color)]">
      {announcements.map((a) => (
        <div key={a._id} className="p-4 hover:bg-[var(--bg-surface-alt)]">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {a.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                {a.message}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[var(--info)]/10 text-[var(--info)]">
              {a.type}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColor(a.priority)}`}>
              {a.priority}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(a.status)}`}>
              {a.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {Array.isArray(a.targetAudience) && a.targetAudience.length > 0
              ? a.targetAudience.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-accent-soft)] text-[var(--color-secondary)]"
                  >
                    {t.replace("_", " ")}
                  </span>
                ))
              : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onViewStats(a)} className="p-2">
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(a)} className="p-2">
              <Edit className="w-4 h-4" />
            </Button>
            {a.status === "active" && (
              <Button variant="ghost" size="sm" onClick={() => onBroadcast(a._id)} className="p-2">
                <Send className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onDelete(a._id)} className="p-2">
              <Trash2 className="w-4 h-4 text-[var(--error)]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
