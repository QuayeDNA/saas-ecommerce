import React, { createContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  Announcement,
  AnnouncementContextValue,
} from "../types/announcement";
import announcementService from "../services/announcement.service";
import { useAuth } from "../hooks/use-auth";

const AnnouncementContext = createContext<AnnouncementContextValue | undefined>(
  undefined
);

interface AnnouncementProviderProps {
  children: ReactNode;
}

export const AnnouncementProvider: React.FC<AnnouncementProviderProps> = ({
  children,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const user = authState.user;

  // Fetch active announcements for the user
  const fetchActiveAnnouncements = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await announcementService.getMyActiveAnnouncements();
      setAnnouncements(data);

      // Calculate unread count
      const unread = data.filter((a) => !a.hasViewed).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching active announcements:", err);
      const error = err as Error;
      setError(error.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch unread announcements
  const fetchUnreadAnnouncements = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await announcementService.getMyUnreadAnnouncements();
      setUnreadCount(data.length);
    } catch (err) {
      console.error("Error fetching unread announcements:", err);
      const error = err as Error;
      setError(error.message || "Failed to fetch unread announcements");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark announcement as viewed
  const markAsViewed = useCallback(async (announcementId: string) => {
    try {
      await announcementService.markAsViewed(announcementId);

      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcementId ? { ...a, hasViewed: true } : a
        )
      );

      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking announcement as viewed:", err);
      const error = err as Error;
      setError(error.message || "Failed to mark as viewed");
    }
  }, []);

  // Mark announcement as acknowledged
  const markAsAcknowledged = useCallback(async (announcementId: string) => {
    try {
      await announcementService.markAsAcknowledged(announcementId);

      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcementId ? { ...a, hasAcknowledged: true } : a
        )
      );
    } catch (err) {
      console.error("Error marking announcement as acknowledged:", err);
      const error = err as Error;
      setError(error.message || "Failed to mark as acknowledged");
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch when user logs in
  useEffect(() => {
    if (user) {
      fetchActiveAnnouncements();
    } else {
      setAnnouncements([]);
      setUnreadCount(0);
    }
  }, [user, fetchActiveAnnouncements]);

  const value: AnnouncementContextValue = {
    announcements,
    unreadCount,
    loading,
    error,
    fetchActiveAnnouncements,
    fetchUnreadAnnouncements,
    markAsViewed,
    markAsAcknowledged,
    clearError,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export default AnnouncementContext;
