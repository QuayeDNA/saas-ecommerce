import React, { useEffect, useState } from "react";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import type { Announcement } from "../../types/announcement";
import AnnouncementModal from "./announcement-modal";

/**
 * AnnouncementPopupHandler automatically displays unread announcements as popups
 * Priority order: urgent > high > medium > low
 */
export const AnnouncementPopupHandler: React.FC = () => {
  const { announcements } = useAnnouncements();
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null);
  const [queue, setQueue] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Build queue of unread announcements sorted by priority
  useEffect(() => {
    const unreadAnnouncements = announcements.filter(
      (a: Announcement) => !a.hasViewed
    );

    // Sort by priority (urgent first, then high, medium, low)
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const sorted = [...unreadAnnouncements].sort(
      (a: Announcement, b: Announcement) => {
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // If same priority, sort by creation date (newest first)
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    );

    setQueue(sorted);
  }, [announcements]);

  // Show next announcement in queue
  useEffect(() => {
    if (queue.length > 0 && !isOpen && !currentAnnouncement) {
      const [next, ...rest] = queue;
      setCurrentAnnouncement(next);
      setQueue(rest);
      setIsOpen(true);
    }
  }, [queue, isOpen, currentAnnouncement]);

  const handleClose = () => {
    setIsOpen(false);
    setCurrentAnnouncement(null);

    // Show next announcement after a short delay
    setTimeout(() => {
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setCurrentAnnouncement(next);
        setQueue(rest);
        setIsOpen(true);
      }
    }, 500);
  };

  if (!currentAnnouncement) {
    return null;
  }

  return (
    <AnnouncementModal
      announcement={currentAnnouncement}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};

export default AnnouncementPopupHandler;
