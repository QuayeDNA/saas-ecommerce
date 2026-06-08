import React from "react";
import { CheckSquare, Square } from "lucide-react";
import type { TargetAudience } from "../../types/announcement";
import { ANNOUNCEMENT_TARGET_TYPES } from "../../utils/userTypeHelpers";

interface UserTypeSelectorProps {
  selectedTypes: TargetAudience[];
  onSelectionChange: (types: TargetAudience[]) => void;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedTypes,
  onSelectionChange,
}) => {
  const toggleType = (type: TargetAudience) => {
    if (selectedTypes.includes(type)) {
      onSelectionChange(selectedTypes.filter((t) => t !== type));
    } else {
      onSelectionChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => {
    onSelectionChange(ANNOUNCEMENT_TARGET_TYPES.map((t) => t.value as TargetAudience));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Select User Types to Broadcast To
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
          >
            Select All
          </button>
          <span className="text-[var(--border-color)]">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {ANNOUNCEMENT_TARGET_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.value as TargetAudience);
          return (
            <div
              key={type.value}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-accent-soft)]"
                  : "border-[var(--border-color)] hover:border-[var(--border-color-strong)] hover:bg-[var(--bg-surface-alt)]"
              }`}
              onClick={() => toggleType(type.value as TargetAudience)}
            >
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-[var(--color-primary)]" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--text-muted)]" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-[var(--color-primary-active)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {type.label}
              </span>
            </div>
          );
        })}
      </div>

      {selectedTypes.length > 0 && (
        <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-surface-alt)] p-2 rounded">
          {selectedTypes.length} user type{selectedTypes.length > 1 ? "s" : ""}{" "}
          selected
        </div>
      )}
    </div>
  );
};
