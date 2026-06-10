import React, { createContext, useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  Announcement,
  AnnouncementContextValue,
} from "../types/announcement";
import announcementService from "../services/announcement.service";
import { useAuth } from "../hooks/use-auth";
import { websocketService } from "../services/websocket.service";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const user = authState.user;

  const unreadCount = announcements.filter((a) => !a.hasViewed).length;

  const fetchActiveAnnouncements = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await announcementService.getMyActiveAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsViewed = useCallback(async (announcementId: string) => {
    try {
      await announcementService.markAsViewed(announcementId);
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcementId ? { ...a, hasViewed: true } : a
        )
      );
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to mark as viewed");
    }
  }, []);

  const markAsAcknowledged = useCallback(async (announcementId: string) => {
    try {
      await announcementService.markAsAcknowledged(announcementId);
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcementId ? { ...a, hasAcknowledged: true } : a
        )
      );
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to mark as acknowledged");
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (user) {
      fetchActiveAnnouncements();
    } else {
      setAnnouncements([]);
    }
  }, [user, fetchActiveAnnouncements]);

  useEffect(() => {
    if (!user) return;
    const handleAnnouncement = (data: unknown) => {
      const newAnnouncement = data as Announcement;
      setAnnouncements((prev) => {
        const exists = prev.some((a) => a._id === newAnnouncement._id);
        if (exists) {
          return prev.map((a) =>
            a._id === newAnnouncement._id ? newAnnouncement : a
          );
        }
        return [newAnnouncement, ...prev];
      });
    };
    websocketService.on("announcement", handleAnnouncement);
    return () => {
      websocketService.off("announcement", handleAnnouncement);
    };
  }, [user]);

  const value = useMemo<AnnouncementContextValue>(
    () => ({
      announcements,
      unreadCount,
      loading,
      error,
      fetchActiveAnnouncements,
      markAsViewed,
      markAsAcknowledged,
      clearError,
    }),
    [
      announcements,
      unreadCount,
      loading,
      error,
      fetchActiveAnnouncements,
      markAsViewed,
      markAsAcknowledged,
      clearError,
    ]
  );

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export default AnnouncementContext;
