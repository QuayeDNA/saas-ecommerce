// src/components/products/PackageItem.tsx
import React from "react";
import type { PackageItem as PackageItemType } from "../../types/package";
import { useAuth } from "../../hooks/use-auth";
import {
  getPriceForUserType,
  formatCurrency,
} from "../../utils/pricingHelpers";
import { FaEdit, FaTrash } from "react-icons/fa";

interface PackageItemProps {
  item: PackageItemType;
  onEdit?: (item: PackageItemType) => void;
  onDelete?: (id: string) => void;
}

export const PackageItem: React.FC<PackageItemProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const { authState } = useAuth();
  const userType = authState.user?.userType;

  return (
    <div className="bg-white border rounded-lg p-4 mb-3 relative">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">{item.name}</h4>

        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit package item"
            >
              <FaEdit size={14} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(item._id || "")}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Delete package item"
            >
              <FaTrash size={14} />
            </button>
          )}
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="text-sm">
          <span className="text-gray-500">Price:</span>
          <span className="text-gray-900 font-medium ml-1">
            {formatCurrency(getPriceForUserType(item, userType), item.currency)}
          </span>
        </div>

        <div className="text-sm">
          <span className="text-gray-500">Data:</span>
          <span className="text-gray-900 font-medium ml-1">
            {item.dataVolume < 1
              ? `${(item.dataVolume * 1000).toFixed(0)} MB`
              : `${item.dataVolume.toFixed(1)} GB`}
          </span>
        </div>

        <div className="text-sm">
          <span className="text-gray-500">Validity:</span>
          <span className="text-gray-900 font-medium ml-1">
            {item.validity} {item.validity === 1 ? "day" : "days"}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>

        <span className="text-xs text-gray-500">Code: {item.bundleCode}</span>
      </div>
    </div>
  );
};
