import React from "react";
import { Select } from "../../../design-system/components/select";
import type { AnnouncementFilters, AnnouncementType, AnnouncementStatus } from "../../../types/announcement";

interface Props {
  filters: AnnouncementFilters;
  onChange: (filters: AnnouncementFilters) => void;
}

export const AnnouncementFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--bg-surface)] rounded-lg shadow-[var(--shadow-sm)]">
      <Select
        value={filters.status || ""}
        onChange={(value) =>
          onChange({ ...filters, status: value as AnnouncementStatus })
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
          onChange({ ...filters, type: value as AnnouncementType })
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
  );
};
