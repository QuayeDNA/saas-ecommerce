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
    status: "active", // Changed from "draft" to "active" as new default
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
      status: "active", // Changed from "draft" to "active" as new default
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system-wide announcements and broadcasts
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Create Announcement</span>
          <span className="xs:hidden">Create</span>
        </Button>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg shadow">
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
          className="text-sm"
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
          className="text-sm"
        />
      </div>
      {/* Announcements List - Mobile Cards / Desktop Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-2"></div>
              Loading...
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No announcements found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {announcement.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {announcement.type}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        announcement.priority
                      )}`}
                    >
                      {announcement.priority}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        announcement.status
                      )}`}
                    >
                      {announcement.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
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

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewStats(announcement)}
                      className="p-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(announcement)}
                      className="p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {announcement.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBroadcast(announcement._id)}
                        className="p-2"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
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
        size="full"
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <div className="flex items-center justify-between p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-8">
              {isEditModalOpen ? "Edit Announcement" : "Create Announcement"}
            </h2>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedAnnouncement(null);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <DialogBody className="px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Templates */}
            {!isEditModalOpen && templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Templates
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                      className="text-left justify-start h-auto p-3"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.type} • {template.priority}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Announcement title"
                required
                className="text-sm"
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
                className="text-sm"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as AnnouncementType,
                    })
                  }
                  options={[
                    { value: "info", label: "Info" },
                    { value: "warning", label: "Warning" },
                    { value: "success", label: "Success" },
                    { value: "error", label: "Error" },
                    { value: "maintenance", label: "Maintenance" },
                  ]}
                  className="text-sm"
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
                  className="text-sm"
                />
              </div>

              {/* User Type Selector */}
              <UserTypeSelector
                selectedTypes={formData.targetAudience}
                onSelectionChange={(types) =>
                  setFormData({ ...formData, targetAudience: types })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  value={formData.status || "active"}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as AnnouncementStatus,
                    })
                  }
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active (Default)" },
                    { value: "archived", label: "Archived" },
                  ]}
                  className="text-sm"
                />

                <div>
                  <Input
                    label="Expires At (Optional)"
                    type="datetime-local"
                    value={formData.expiresAt?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for auto-expiration in 1 day
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="actionRequired"
                  checked={formData.actionRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      actionRequired: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="actionRequired"
                  className="text-sm text-gray-700 font-medium"
                >
                  Action Required
                </label>
              </div>

              {formData.actionRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <Input
                    label="Action Text"
                    value={formData.actionText || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, actionText: e.target.value })
                    }
                    placeholder="View Details"
                    className="text-sm"
                  />
                  <Input
                    label="Action URL"
                    value={formData.actionUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, actionUrl: e.target.value })
                    }
                    placeholder="/dashboard"
                    className="text-sm"
                  />
                </div>
              )}
            </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Total Eligible Users
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.totalEligibleUsers}
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Viewed</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.viewedCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.viewedPercentage}%
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Acknowledged</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {stats.acknowledgedCount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.acknowledgedPercentage}%
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">Not Viewed</div>
                  <div className="text-xl sm:text-2xl font-bold">
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
