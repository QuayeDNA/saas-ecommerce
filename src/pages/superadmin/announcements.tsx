import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, Send, BarChart3, X } from "lucide-react";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { Select } from "../../design-system/components/select";
import { Textarea } from "../../design-system/components/textarea";
import { Dialog } from "../../design-system/components/dialog";
import { DialogHeader } from "../../design-system/components/dialog-header";
import { DialogBody } from "../../design-system/components/dialog-body";
import { DialogFooter } from "../../design-system/components/dialog-footer";
import { useToast } from "../../design-system/components/toast";
import { UserTypeSelector } from "../../components/announcements/user-selector";
import announcementService from "../../services/announcement.service";
import type {
  Announcement,
  CreateAnnouncementDTO,
  AnnouncementFilters,
  AnnouncementStats,
  AnnouncementTemplate,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
} from "../../types/announcement";

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [templates, setTemplates] = useState<AnnouncementTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const { addToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateAnnouncementDTO>({
    title: "",
    message: "",
    type: "info",
    priority: "medium",
    targetAudience: [],
    status: "draft",
    actionRequired: false,
  });

  // Fetch announcements
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

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const data = await announcementService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchTemplates();
  }, [filters, fetchAnnouncements]);

  // Create announcement
  const handleCreate = async () => {
    try {
      await announcementService.createAnnouncement(formData);
      addToast("Announcement created successfully", "success");
      setIsCreateModalOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to create announcement", "error");
    }
  };

  // Update announcement
  const handleUpdate = async () => {
    if (!selectedAnnouncement) return;

    try {
      await announcementService.updateAnnouncement(
        selectedAnnouncement._id,
        formData
      );
      addToast("Announcement updated successfully", "success");
      setIsEditModalOpen(false);
      setSelectedAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to update announcement", "error");
    }
  };

  // Delete announcement
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

  // Broadcast announcement
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

  // View stats
  const handleViewStats = async (announcement: Announcement) => {
    try {
      const data = await announcementService.getAnnouncementStats(
        announcement._id
      );
      setStats(data);
      setSelectedAnnouncement(announcement);
      setIsStatsModalOpen(true);
    } catch (error) {
      const err = error as Error;
      addToast(err.message || "Failed to fetch stats", "error");
    }
  };

  // Apply template
  const applyTemplate = (template: AnnouncementTemplate) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      actionRequired: template.actionRequired,
      actionText: template.actionText,
      actionUrl: template.actionUrl,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      targetAudience: [],
      status: "draft",
      actionRequired: false,
    });
  };

  // Open edit modal
  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: Array.isArray(announcement.targetAudience)
        ? announcement.targetAudience
        : [], // Handle old announcements with string targetAudience
      status: announcement.status,
      expiresAt: announcement.expiresAt,
      actionRequired: announcement.actionRequired,
      actionUrl: announcement.actionUrl,
      actionText: announcement.actionText,
    });
    setIsEditModalOpen(true);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      archived: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system-wide announcements and broadcasts
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </Button>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow">
        <Select
          value={filters.status || ""}
          onChange={(value) =>
            setFilters({ ...filters, status: value as AnnouncementStatus })
          }
          options={[
            { value: "", label: "All Statuses" },
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
            { value: "archived", label: "Archived" },
          ]}
        />

        <Select
          value={filters.type || ""}
          onChange={(value) =>
            setFilters({ ...filters, type: value as AnnouncementType })
          }
          options={[
            { value: "", label: "All Types" },
            { value: "info", label: "Info" },
            { value: "warning", label: "Warning" },
            { value: "success", label: "Success" },
            { value: "error", label: "Error" },
            { value: "maintenance", label: "Maintenance" },
          ]}
        />
      </div>
      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No announcements found
                  </td>
                </tr>
              ) : (
                announcements.map((announcement) => (
                  <tr key={announcement._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {announcement.message}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {announcement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                          announcement.priority
                        )}`}
                      >
                        {announcement.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          announcement.status
                        )}`}
                      >
                        {announcement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(announcement.targetAudience) &&
                        announcement.targetAudience.length > 0 ? (
                          announcement.targetAudience.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
                            >
                              {type.replace("_", " ")}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {Array.isArray(announcement.targetAudience)
                              ? "None"
                              : announcement.targetAudience}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewStats(announcement)}
                          title="View Stats"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(announcement)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {announcement.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBroadcast(announcement._id)}
                            title="Broadcast"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(announcement._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create/Edit Dialog */}
      <Dialog
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedAnnouncement(null);
          resetForm();
        }}
        size="lg"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditModalOpen ? "Edit Announcement" : "Create Announcement"}
            </h2>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedAnnouncement(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* Templates */}
            {!isEditModalOpen && templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Announcement title"
              required
            />

            <Textarea
              label="Message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Announcement message"
              rows={4}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                value={formData.type}
                onChange={(value) =>
                  setFormData({ ...formData, type: value as AnnouncementType })
                }
                options={[
                  { value: "info", label: "Info" },
                  { value: "warning", label: "Warning" },
                  { value: "success", label: "Success" },
                  { value: "error", label: "Error" },
                  { value: "maintenance", label: "Maintenance" },
                ]}
              />

              <Select
                label="Priority"
                value={formData.priority}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as AnnouncementPriority,
                  })
                }
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>

            {/* User Type Selector */}
            <UserTypeSelector
              selectedTypes={formData.targetAudience}
              onSelectionChange={(types) =>
                setFormData({ ...formData, targetAudience: types })
              }
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as AnnouncementStatus,
                })
              }
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]}
            />

            <Input
              label="Expires At (Optional)"
              type="datetime-local"
              value={formData.expiresAt?.slice(0, 16) || ""}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
              }
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="actionRequired"
                checked={formData.actionRequired}
                onChange={(e) =>
                  setFormData({ ...formData, actionRequired: e.target.checked })
                }
                className="rounded"
              />
              <label htmlFor="actionRequired" className="text-sm text-gray-700">
                Action Required
              </label>
            </div>

            {formData.actionRequired && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Action Text"
                  value={formData.actionText || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, actionText: e.target.value })
                  }
                  placeholder="View Details"
                />
                <Input
                  label="Action URL"
                  value={formData.actionUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, actionUrl: e.target.value })
                  }
                  placeholder="/dashboard"
                />
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setSelectedAnnouncement(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={isEditModalOpen ? handleUpdate : handleCreate}
          >
            {isEditModalOpen ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </Dialog>{" "}
      {/* Stats Dialog */}
      <Dialog
        isOpen={isStatsModalOpen}
        onClose={() => {
          setIsStatsModalOpen(false);
          setStats(null);
          setSelectedAnnouncement(null);
        }}
        size="lg"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Announcement Statistics
            </h2>
            <button
              onClick={() => {
                setIsStatsModalOpen(false);
                setStats(null);
                setSelectedAnnouncement(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <DialogBody>
          {stats && selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAnnouncement.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Total Eligible Users
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.totalEligibleUsers}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Viewed</div>
                  <div className="text-2xl font-bold">{stats.viewedCount}</div>
                  <div className="text-sm text-gray-500">
                    {stats.viewedPercentage}%
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Acknowledged</div>
                  <div className="text-2xl font-bold">
                    {stats.acknowledgedCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.acknowledgedPercentage}%
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">Not Viewed</div>
                  <div className="text-2xl font-bold">
                    {stats.totalEligibleUsers - stats.viewedCount}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
      </Dialog>
    </div>
  );
};

export default AnnouncementsPage;
