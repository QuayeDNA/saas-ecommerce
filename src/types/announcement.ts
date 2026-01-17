// Announcement Types and Interfaces

export type AnnouncementType =
  | "info"
  | "warning"
  | "success"
  | "error"
  | "maintenance";

export type AnnouncementPriority = "low" | "medium" | "high" | "urgent";

export type AnnouncementStatus = "draft" | "active" | "expired" | "archived";

export type TargetAudience =
  | "agent"
  | "super_agent"
  | "dealer"
  | "super_dealer"
  | "admin";

export type AnnouncementTemplateType =
  | "network_slow"
  | "maintenance"
  | "service_restored"
  | "urgent_action"
  | "new_feature"
  | "custom";

export interface ViewRecord {
  user: string;
  viewedAt: string;
}

export interface AcknowledgeRecord {
  user: string;
  acknowledgedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  targetAudience: TargetAudience[];
  status: AnnouncementStatus;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  expiresAt?: string;
  broadcastedAt?: string;
  viewedBy: ViewRecord[];
  acknowledgedBy: AcknowledgeRecord[];
  template: AnnouncementTemplateType;
  actionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  updatedAt: string;
  hasViewed?: boolean;
  hasAcknowledged?: boolean;
}

export interface CreateAnnouncementDTO {
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  targetAudience: TargetAudience[];
  status?: AnnouncementStatus; // Now optional, defaults to "active"
  expiresAt?: string;
  template?: AnnouncementTemplateType;
  actionRequired?: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface UpdateAnnouncementDTO {
  title?: string;
  message?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  targetAudience?: TargetAudience[];
  status?: AnnouncementStatus;
  expiresAt?: string;
  template?: AnnouncementTemplateType;
  actionRequired?: boolean;
  actionUrl?: string;
  actionText?: string;
}

export interface AnnouncementStats {
  totalEligibleUsers: number;
  viewedCount: number;
  acknowledgedCount: number;
  viewedPercentage: string;
  acknowledgedPercentage: string;
}

export interface AnnouncementTemplate {
  id: string;
  name: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  title: string;
  message: string;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
}

export interface AnnouncementFilters {
  status?: AnnouncementStatus;
  type?: AnnouncementType;
}

export interface AnnouncementContextValue {
  announcements: Announcement[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchActiveAnnouncements: () => Promise<void>;
  fetchUnreadAnnouncements: () => Promise<void>;
  markAsViewed: (announcementId: string) => Promise<void>;
  markAsAcknowledged: (announcementId: string) => Promise<void>;
  clearError: () => void;
}
