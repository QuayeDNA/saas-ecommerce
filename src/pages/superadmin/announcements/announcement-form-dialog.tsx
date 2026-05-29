import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../design-system/components/button";
import { Input } from "../../../design-system/components/input";
import { Select } from "../../../design-system/components/select";
import { Textarea } from "../../../design-system/components/textarea";
import { Dialog } from "../../../design-system/components/dialog";
import { DialogHeader } from "../../../design-system/components/dialog-header";
import { DialogBody } from "../../../design-system/components/dialog-body";
import { DialogFooter } from "../../../design-system/components/dialog-footer";
import { UserTypeSelector } from "../../../components/announcements/user-selector";
import type {
  AnnouncementTemplate,
  CreateAnnouncementDTO,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementStatus,
} from "../../../types/announcement";

interface Props {
  isOpen: boolean;
  isEdit: boolean;
  formData: CreateAnnouncementDTO;
  templates: AnnouncementTemplate[];
  onChange: (data: CreateAnnouncementDTO) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const AnnouncementFormDialog: React.FC<Props> = ({
  isOpen,
  isEdit,
  formData,
  templates,
  onChange,
  onClose,
  onSubmit,
}) => {
  const update = (partial: Partial<CreateAnnouncementDTO>) =>
    onChange({ ...formData, ...partial });

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="full" className="sm:max-w-2xl">
      <DialogHeader>
        <div className="flex items-center justify-between p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] pr-8">
            {isEdit ? "Edit Announcement" : "Create Announcement"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody className="px-4 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          {!isEdit && templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Quick Templates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange({
                        ...formData,
                        title: template.title,
                        message: template.message,
                        type: template.type,
                        priority: template.priority,
                        actionRequired: template.actionRequired,
                        actionText: template.actionText,
                        actionUrl: template.actionUrl,
                      })
                    }
                    className="text-left justify-start h-auto p-3"
                  >
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {template.type} &bull; {template.priority}
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
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Announcement title"
              required
              className="text-sm"
            />

            <Textarea
              label="Message"
              value={formData.message}
              onChange={(e) => update({ message: e.target.value })}
              placeholder="Announcement message"
              rows={4}
              required
              className="text-sm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Type"
                value={formData.type}
                onChange={(value) => update({ type: value as AnnouncementType })}
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
                onChange={(value) => update({ priority: value as AnnouncementPriority })}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
                className="text-sm"
              />
            </div>

            <UserTypeSelector
              selectedTypes={formData.targetAudience}
              onSelectionChange={(types) => update({ targetAudience: types })}
            />

            {formData.targetAudience.includes("public") && (
              <div className="mt-2">
                <Input
                  label="Target Storefront (optional)"
                  value={formData.targetStorefront || ""}
                  onChange={(e) => update({ targetStorefront: e.target.value })}
                  placeholder="e.g. my-business-name"
                  helperText="Leave empty to target all public storefronts."
                  className="text-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Status"
                value={formData.status || "active"}
                onChange={(value) => update({ status: value as AnnouncementStatus })}
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
                  onChange={(e) => update({ expiresAt: e.target.value })}
                  className="text-sm"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Leave empty for auto-expiration in 1 day
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[var(--bg-surface-alt)] rounded-lg">
              <input
                type="checkbox"
                id="actionRequired"
                checked={formData.actionRequired}
                onChange={(e) => update({ actionRequired: e.target.checked })}
                className="rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="actionRequired" className="text-sm text-[var(--text-secondary)] font-medium">
                Action Required
              </label>
            </div>

            {formData.actionRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--color-accent-soft)] rounded-lg">
                <Input
                  label="Action Text"
                  value={formData.actionText || ""}
                  onChange={(e) => update({ actionText: e.target.value })}
                  placeholder="View Details"
                  className="text-sm"
                />
                <Input
                  label="Action URL"
                  value={formData.actionUrl || ""}
                  onChange={(e) => update({ actionUrl: e.target.value })}
                  placeholder="/dashboard"
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
