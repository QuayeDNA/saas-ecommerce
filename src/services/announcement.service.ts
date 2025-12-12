import { apiClient } from "../utils/api-client";
import type {
  Announcement,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementStats,
  AnnouncementFilters,
  AnnouncementTemplate,
} from "../types/announcement";

const ANNOUNCEMENT_BASE_URL = "/api/announcements";

export const announcementService = {
  // User endpoints - Get announcements for the current user
  async getMyActiveAnnouncements(): Promise<Announcement[]> {
    const response = await apiClient.get(`${ANNOUNCEMENT_BASE_URL}/active/me`);
    return response.data.data;
  },

  async getMyUnreadAnnouncements(): Promise<Announcement[]> {
    const response = await apiClient.get(`${ANNOUNCEMENT_BASE_URL}/unread/me`);
    return response.data.data;
  },

  async markAsViewed(announcementId: string): Promise<void> {
    await apiClient.post(`${ANNOUNCEMENT_BASE_URL}/${announcementId}/view`);
  },

  async markAsAcknowledged(announcementId: string): Promise<void> {
    await apiClient.post(
      `${ANNOUNCEMENT_BASE_URL}/${announcementId}/acknowledge`
    );
  },

  // Admin endpoints - Manage announcements
  async createAnnouncement(data: CreateAnnouncementDTO): Promise<Announcement> {
    const response = await apiClient.post(ANNOUNCEMENT_BASE_URL, data);
    return response.data.data;
  },

  async getAllAnnouncements(
    filters?: AnnouncementFilters
  ): Promise<Announcement[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);

    const queryString = params.toString();
    const url = queryString
      ? `${ANNOUNCEMENT_BASE_URL}/all?${queryString}`
      : `${ANNOUNCEMENT_BASE_URL}/all`;

    const response = await apiClient.get(url);
    return response.data.data;
  },

  async getAnnouncementById(announcementId: string): Promise<Announcement> {
    const response = await apiClient.get(
      `${ANNOUNCEMENT_BASE_URL}/${announcementId}`
    );
    return response.data.data;
  },

  async updateAnnouncement(
    announcementId: string,
    data: UpdateAnnouncementDTO
  ): Promise<Announcement> {
    const response = await apiClient.put(
      `${ANNOUNCEMENT_BASE_URL}/${announcementId}`,
      data
    );
    return response.data.data;
  },

  async deleteAnnouncement(announcementId: string): Promise<void> {
    await apiClient.delete(`${ANNOUNCEMENT_BASE_URL}/${announcementId}`);
  },

  async broadcastAnnouncement(announcementId: string): Promise<void> {
    await apiClient.post(
      `${ANNOUNCEMENT_BASE_URL}/${announcementId}/broadcast`
    );
  },

  async getAnnouncementStats(
    announcementId: string
  ): Promise<AnnouncementStats> {
    const response = await apiClient.get(
      `${ANNOUNCEMENT_BASE_URL}/${announcementId}/stats`
    );
    return response.data.data;
  },

  async getTemplates(): Promise<AnnouncementTemplate[]> {
    const response = await apiClient.get(`${ANNOUNCEMENT_BASE_URL}/templates`);
    return response.data.data;
  },
};

export default announcementService;
