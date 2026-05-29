import type { Announcement } from "../../types/announcement";
import type { ToastType } from "../../design-system/components/toast";

const announcementToToastType: Record<string, ToastType> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  maintenance: "info",
};

export function announcementToToast(announcement: Announcement): {
  message: string;
  type: ToastType;
  duration?: number;
} {
  const type = announcementToToastType[announcement.type] || "info";
  const urgencyDurations: Record<string, number> = {
    urgent: 12000,
    high: 8000,
    medium: 6000,
    low: 4000,
  };

  return {
    message: `${announcement.title}: ${announcement.message}`,
    type,
    duration: urgencyDurations[announcement.priority] || 6000,
  };
}

export function isUrgentAnnouncement(announcement: Announcement): boolean {
  return announcement.priority === "urgent" || announcement.priority === "high";
}
