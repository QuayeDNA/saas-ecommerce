import React, { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../design-system/components/button";
import { useToast } from "../../../design-system/components/toast";
import announcementService from "../../../services/announcement.service";
import type {
  Announcement,
  CreateAnnouncementDTO,
  AnnouncementFilters,
  AnnouncementStats,
  AnnouncementTemplate,
} from "../../../types/announcement";
import { AnnouncementFiltersBar } from "./announcement-filters";
import { AnnouncementTable } from "./announcement-table";
import { AnnouncementCards } from "./announcement-cards";
import { AnnouncementFormDialog } from "./announcement-form-dialog";
import { AnnouncementStatsDialog } from "./announcement-stats-dialog";

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilters>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const { addToast } = useToast();

  const defaultForm: CreateAnnouncementDTO = {
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    targetAudience: [],
    targetStorefront: "",
    status: "active",
    actionRequired: false,
  };

  const [formData, setFormData] = useState<CreateAnnouncementDTO>(defaultForm);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAllAnnouncements(filters);
      setAnnouncements(data);
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to fetch announcements", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  const fetchTemplates = async () => {
    try {
      const data = await announcementService.getTemplates();
      setTemplates(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchTemplates();
  }, [filters, fetchAnnouncements]);

  const resetForm = () => setFormData(defaultForm);

  const handleCreate = async () => {
    try {
      await announcementService.createAnnouncement(formData);
      addToast("Announcement created successfully", "success");
      setShowCreate(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to create announcement", "error");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      await announcementService.updateAnnouncement(selected._id, formData);
      addToast("Announcement updated successfully", "success");
      setShowEdit(false);
      setSelected(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to update announcement", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementService.deleteAnnouncement(id);
      addToast("Announcement deleted successfully", "success");
      await fetchAnnouncements();
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to delete announcement", "error");
    }
  };

  const handleBroadcast = async (id: string) => {
    if (!confirm("Broadcast this announcement to all eligible users?")) return;
    try {
      await announcementService.broadcastAnnouncement(id);
      addToast("Announcement broadcast successfully", "success");
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to broadcast announcement", "error");
    }
  };

  const handleViewStats = async (announcement: Announcement) => {
    try {
      const data = await announcementService.getAnnouncementStats(announcement._id);
      setStats(data);
      setSelected(announcement);
      setShowStats(true);
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to fetch stats", "error");
    }
  };

  const openEdit = (announcement: Announcement) => {
    setSelected(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: Array.isArray(announcement.targetAudience)
        ? announcement.targetAudience
        : [],
      targetStorefront: (announcement as any).targetStorefront || "",
      status: announcement.status,
      expiresAt: announcement.expiresAt,
      actionRequired: announcement.actionRequired,
      actionUrl: announcement.actionUrl,
      actionText: announcement.actionText,
    });
    setShowEdit(true);
  };

  const closeForm = () => {
    setShowCreate(false);
    setShowEdit(false);
    setSelected(null);
    resetForm();
  };

  const closeStats = () => {
    setShowStats(false);
    setStats(null);
    setSelected(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage system-wide announcements and broadcasts
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Create Announcement</span>
          <span className="xs:hidden">Create</span>
        </Button>
      </div>

      <AnnouncementFiltersBar filters={filters} onChange={setFilters} />

      <div className="bg-[var(--bg-surface)] rounded-lg shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="block lg:hidden">
          <AnnouncementCards
            announcements={announcements}
            loading={loading}
            onViewStats={handleViewStats}
            onEdit={openEdit}
            onBroadcast={handleBroadcast}
            onDelete={handleDelete}
          />
        </div>
        <div className="hidden lg:block">
          <AnnouncementTable
            announcements={announcements}
            loading={loading}
            onViewStats={handleViewStats}
            onEdit={openEdit}
            onBroadcast={handleBroadcast}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <AnnouncementFormDialog
        isOpen={showCreate || showEdit}
        isEdit={showEdit}
        formData={formData}
        templates={templates}
        onChange={setFormData}
        onClose={closeForm}
        onSubmit={showEdit ? handleUpdate : handleCreate}
      />

      <AnnouncementStatsDialog
        isOpen={showStats}
        announcement={selected}
        stats={stats}
        onClose={closeStats}
      />
    </div>
  );
};

export default AnnouncementsPage;
