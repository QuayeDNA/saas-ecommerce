import { useState, useEffect, useCallback, useRef } from "react";
import type { Announcement } from "../types/announcement";
import announcementService from "../services/announcement.service";
import { websocketService } from "../services/websocket.service";

interface UsePublicAnnouncementsOptions {
  businessName: string;
  dismissedKey: string;
  viewedKey: string;
}

export function usePublicAnnouncements({ businessName, dismissedKey, viewedKey }: UsePublicAnnouncementsOptions) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load persisted dismiss/view state
  useEffect(() => {
    try {
      const storedViewed = localStorage.getItem(viewedKey);
      if (storedViewed) setViewed(new Set(JSON.parse(storedViewed)));
    } catch { /* ignore */ }

    try {
      const storedDismissed = localStorage.getItem(dismissedKey);
      if (storedDismissed) setDismissed(new Set(JSON.parse(storedDismissed)));
    } catch { /* ignore */ }
  }, [viewedKey, dismissedKey]);

  const persistSet = (key: string, set: Set<string>) => {
    try { localStorage.setItem(key, JSON.stringify(Array.from(set))); } catch { /* ignore */ }
  };

  const markViewed = useCallback((id: string) => {
    setViewed(prev => {
      const next = new Set(prev);
      next.add(id);
      persistSet(viewedKey, next);
      return next;
    });
  }, [viewedKey]);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(id);
      persistSet(dismissedKey, next);
      return next;
    });
    markViewed(id);
  }, [dismissedKey, markViewed]);

  // Fetch active announcements
  useEffect(() => {
    if (!businessName) return;
    setLoading(true);
    announcementService.getPublicActiveAnnouncements(businessName)
      .then(setAnnouncements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessName]);

  // WebSocket for real-time
  const wsConnected = useRef<string | null>(null);
  useEffect(() => {
    if (!businessName) return;
    if (wsConnected.current !== businessName) {
      websocketService.connect(`public:${businessName}`);
      wsConnected.current = businessName;
    }
    const handler = (data: unknown) => {
      const announcement = data as Announcement;
      if (!announcement?._id) return;
      setAnnouncements(prev => {
        const exists = prev.some(a => a._id === announcement._id);
        if (exists) return prev.map(a => a._id === announcement._id ? announcement : a);
        return [announcement, ...prev];
      });
    };
    websocketService.on("announcement", handler);
    return () => { websocketService.off("announcement", handler); };
  }, [businessName]);

  const active = announcements.filter(a => !dismissed.has(a._id) && !viewed.has(a._id));

  return { announcements, active, loading, markViewed, dismiss };
}
