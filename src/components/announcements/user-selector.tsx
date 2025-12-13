import React from "react";
import { CheckSquare, Square } from "lucide-react";
import type { TargetAudience } from "../../types/announcement";

interface UserTypeSelectorProps {
  selectedTypes: TargetAudience[];
  onSelectionChange: (types: TargetAudience[]) => void;
}

const USER_TYPES: { value: TargetAudience; label: string }[] = [
  { value: "agent", label: "Agents" },
  { value: "super_agent", label: "Super Agents" },
  { value: "dealer", label: "Dealers" },
  { value: "super_dealer", label: "Super Dealers" },
  { value: "admin", label: "Admins" },
];

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
    onSelectionChange(USER_TYPES.map((t) => t.value));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Select User Types to Broadcast To
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {USER_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type.value);
          return (
            <div
              key={type.value}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => toggleType(type.value)}
            >
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-blue-900" : "text-gray-700"
                }`}
              >
                {type.label}
              </span>
            </div>
          );
        })}
      </div>

      {selectedTypes.length > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {selectedTypes.length} user type{selectedTypes.length > 1 ? "s" : ""}{" "}
          selected
        </div>
      )}
    </div>
  );
};
