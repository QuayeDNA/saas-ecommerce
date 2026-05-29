import { useEffect, useRef } from "react";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { useToast } from "../../design-system/components/toast";
import { announcementToToast, isUrgentAnnouncement } from "./announcement-toast";

export const AnnouncementWatcher: React.FC = () => {
  const { announcements } = useAnnouncements();
  const { addToast } = useToast();
  const notifiedIds = useRef(new Set<string>());

  useEffect(() => {
    for (const a of announcements) {
      if (notifiedIds.current.has(a._id)) continue;
      if (a.hasViewed || isUrgentAnnouncement(a)) continue;
      notifiedIds.current.add(a._id);
      const toast = announcementToToast(a);
      addToast(toast.message, toast.type, toast.duration);
    }
  }, [announcements, addToast]);

  return null;
};
