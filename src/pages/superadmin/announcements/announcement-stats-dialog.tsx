import React from "react";
import { X } from "lucide-react";
import { Dialog } from "../../../design-system/components/dialog";
import { DialogHeader } from "../../../design-system/components/dialog-header";
import { DialogBody } from "../../../design-system/components/dialog-body";
import type { Announcement, AnnouncementStats } from "../../../types/announcement";

interface Props {
  isOpen: boolean;
  announcement: Announcement | null;
  stats: AnnouncementStats | null;
  onClose: () => void;
}

export const AnnouncementStatsDialog: React.FC<Props> = ({
  isOpen,
  announcement,
  stats,
  onClose,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Announcement Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody>
        {stats && announcement && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                {announcement.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {announcement.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-[var(--info)]/5 rounded-lg border border-[var(--info)]/20">
                <div className="text-sm text-[var(--text-secondary)]">
                  Total Eligible Users
                </div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {stats.totalEligibleUsers}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[var(--success)]/5 rounded-lg border border-[var(--success)]/20">
                <div className="text-sm text-[var(--text-secondary)]">Viewed</div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {stats.viewedCount}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {stats.viewedPercentage}%
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[var(--color-secondary)]/5 rounded-lg border border-[var(--color-secondary)]/20">
                <div className="text-sm text-[var(--text-secondary)]">Acknowledged</div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {stats.acknowledgedCount}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {stats.acknowledgedPercentage}%
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[var(--warning)]/5 rounded-lg border border-[var(--warning)]/20">
                <div className="text-sm text-[var(--text-secondary)]">Not Viewed</div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  {stats.totalEligibleUsers - stats.viewedCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
};
