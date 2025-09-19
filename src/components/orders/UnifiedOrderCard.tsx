// src/components/orders/UnifiedOrderCard.tsx
import React, { useState } from "react";
import {
  FaWifi,
  FaChevronRight,
  FaTimes,
  FaUser,
  FaPhone,
  FaDatabase,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Button } from "../../design-system";
import { Select } from "../../design-system/components/select";
import { ReportModal } from "./ReportModal";
import { getToken } from "../../utils/auth-storage";
import type { Order } from "../../types/order";

interface UnifiedOrderCardProps {
  order: Order;
  isAdmin: boolean;
  currentUserId?: string;
  onUpdateStatus: (orderId: string, status: string, notes?: string) => void;
  onCancel: (orderId: string) => void;
  onSelect?: (orderId: string) => void;
  isSelected?: boolean;
  onRefresh?: () => void;
  onUpdateReceptionStatus?: (orderId: string, status: string) => Promise<void>;
}

export const UnifiedOrderCard: React.FC<UnifiedOrderCardProps> = ({
  order,
  isAdmin,
  currentUserId,
  onUpdateStatus,
  onCancel,
  onSelect,
  isSelected = false,
  onRefresh,
  onUpdateReceptionStatus,
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleReportClick = () => {
    if (order.reported) {
      // Show alert for already reported orders
      alert("This order has already been reported for data delivery issues.");
      return;
    }
    setReportModalOpen(true);
  };

  const handleReceptionStatusUpdate = async (newStatus: string) => {
    if (!onUpdateReceptionStatus) return;

    try {
      await onUpdateReceptionStatus(order._id!, newStatus);
      // Refresh the list to show updated status
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating reception status:", error);
    }
  };

  // Click outside handler to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (statusDropdownOpen && !target.closest(".status-dropdown")) {
        setStatusDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && statusDropdownOpen) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [statusDropdownOpen]);

  // Available status options (excluding 'failed' as it's system-controlled)
  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#006400] text-gray-200";
      case "processing":
        return "bg-[#00008B] text-gray-200";
      case "failed":
        return "bg-[#8B0000] text-gray-200";
      case "cancelled":
        return "bg-[#8B0000] text-gray-200";
      case "pending":
        return "bg-[#B8860B] text-gray-200";
      case "confirmed":
        return "bg-[#800080] text-gray-200";
      default:
        return "bg-[#696969] text-gray-200";
    }
  };

  const getReceptionStatusColor = (receptionStatus: string) => {
    switch (receptionStatus) {
      case "received":
        return "bg-green-100 text-green-800";
      case "not_received":
        return "bg-red-100 text-red-800";
      case "checking":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      onUpdateStatus(order._id!, newStatus);
      setStatusDropdownOpen(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Get provider from order items
  const getOrderProvider = (order: Order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].packageDetails?.provider || "Unknown";
    }
    return "Unknown";
  };

  // Get recipient info (phone number for single orders, count for bulk)
  const getOrderRecipient = (order: Order) => {
    if (order.orderType === "bulk") {
      return `${order.items.length} recipients`;
    }
    if (order.items && order.items.length > 0) {
      return order.items[0].customerPhone || "N/A";
    }
    return "N/A";
  };

  // Get total volume
  const getOrderVolume = (order: Order) => {
    if (!order.items || order.items.length === 0) return "N/A";

    const totalVolume = order.items.reduce((sum, item) => {
      const volume =
        item.bundleSize?.value || item.packageDetails?.dataVolume || 0;
      return sum + volume;
    }, 0);

    if (totalVolume >= 1) {
      return `${totalVolume.toFixed(1)} GB`;
    } else {
      return `${(totalVolume * 1000).toFixed(0)} MB`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const canCancel = (status: string) =>
    ["pending", "confirmed", "processing", "draft"].includes(status);

  const canUserCancelOrder = (order: Order) => {
    if (!canCancel(order.status)) return false;

    // Admins can cancel any order
    if (isAdmin) return true;

    // Agents can cancel their own draft or pending orders
    if (
      (order.status === "draft" || order.status === "pending") &&
      currentUserId
    ) {
      const createdById =
        typeof order.createdBy === "string"
          ? order.createdBy
          : (order.createdBy as { _id: string })?._id;
      if (createdById === currentUserId) {
        return true;
      }
    }

    return false;
  };

  const canUserReportOrder = (order: Order) => {
    // Only business users can report (not admins)
    if (isAdmin) return false;

    // Only completed orders can be reported
    if (order.status !== "completed") return false;

    // Check if order is already reported
    if (order.reported) return false;

    // Check if order is older than 3 days
    const orderDate = new Date(order.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    if (orderDate < threeDaysAgo) return false;

    // Only the order creator can report
    if (currentUserId) {
      const createdById =
        typeof order.createdBy === "string"
          ? order.createdBy
          : (order.createdBy as { _id: string })?._id;
      return createdById === currentUserId;
    }

    return false;
  };

  const shouldShowReceptionStatusEditor = (order: Order) => {
    // Only show reception status editor for reported orders
    if (!order.reported) return false;

    // If the order is not resolved, always show the editor
    if (order.receptionStatus !== "resolved") return true;

    // If the order is resolved, check if it's been more than 3 days since resolution
    // For now, we'll use the order's updatedAt or createdAt as a proxy
    // In a real implementation, you'd want a specific field for when the status was set to resolved
    const resolvedDate = new Date(order.updatedAt || order.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Hide the editor if it's been more than 3 days since resolution
    return resolvedDate >= threeDaysAgo;
  };

  const shouldShowReceptionStatusDisplay = (order: Order) => {
    // Only show reception status display for completed orders with reception status
    if (order.status !== "completed" || !order.receptionStatus) return false;

    // If the order is not resolved, always show the display
    if (order.receptionStatus !== "resolved") return true;

    // If the order is resolved, check if it's been more than 3 days since resolution
    const resolvedDate = new Date(order.updatedAt || order.createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Hide the display if it's been more than 3 days since resolution
    return resolvedDate >= threeDaysAgo;
  };

  const handleReportSubmit = async () => {
    setIsReporting(true);
    try {
      const token = getToken();

      if (!token) {
        throw new Error("You must be logged in to submit a report");
      }

      const response = await fetch(`/api/orders/${order._id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to submit report: ${response.status}`
        );
      }

      setReportModalOpen(false);
      // Refresh the order list after successful reporting
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      // You might want to show an error toast here
      throw error; // Re-throw so the modal can handle it
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="p-4">
        {/* Header - Order Number, Date, and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isAdmin && onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(order._id!)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                {order.orderNumber}
              </h3>
              <p className="text-xs text-gray-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0 ml-3">
            <div className="flex flex-col gap-1">
              <div className="relative">
                {isAdmin ? (
                  <button
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )} hover:bg-opacity-80 transition-colors status-dropdown`}
                  >
                    <span>{order.status}</span>
                    <FaChevronRight className="text-xs ml-1" />
                  </button>
                ) : (
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <span>{order.status}</span>
                  </div>
                )}

                {isAdmin && statusDropdownOpen && (
                  <div className="absolute z-10 mt-1 right-0 bg-white rounded-md shadow-lg border border-gray-200 status-dropdown min-w-32">
                    <div className="py-1 flex flex-col">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                            option.value === order.status
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reception Status - Show for completed orders */}
              {order.status === "completed" &&
                order.receptionStatus &&
                shouldShowReceptionStatusDisplay(order) && (
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getReceptionStatusColor(
                      order.receptionStatus
                    )}`}
                  >
                    <span>{order.receptionStatus.replace("_", " ")}</span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Order Details - Vertical List Format */}
        <div className="space-y-2 mb-3">
          {/* Network */}
          <div className="flex items-center gap-2 text-sm">
            <FaWifi className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-gray-700 font-medium min-w-0 w-16">
              Network:
            </span>
            <span className="text-gray-900 truncate">
              {getOrderProvider(order)}
            </span>
          </div>

          {/* Recipient */}
          <div className="flex items-center gap-2 text-sm">
            <FaPhone className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-gray-700 font-medium min-w-0 w-16">
              Recipient:
            </span>
            <span className="text-gray-900 truncate">
              {getOrderRecipient(order)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 text-sm">
            <FaDatabase className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-gray-700 font-medium min-w-0 w-16">
              Volume:
            </span>
            <span className="text-gray-900">{getOrderVolume(order)}</span>
          </div>

          {/* Total */}
          <div className="flex items-center gap-2 text-sm">
            <FaMoneyBillWave className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-gray-700 font-medium min-w-0 w-16">
              Total:
            </span>
            <span className="text-gray-900 font-semibold">
              {formatCurrency(order.total)}
            </span>
          </div>

          {/* Type */}
          <div className="flex items-center gap-2 text-sm">
            <FaUser className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <span className="text-gray-700 font-medium min-w-0 w-16">
              Type:
            </span>
            <span className="text-gray-900 capitalize">
              {order.orderType} • {order.items?.length || 0} item(s)
            </span>
          </div>
        </div>

        {/* Cancel Action */}
        {canUserCancelOrder(order) && (
          <div className="flex justify-start">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(order._id!)}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 px-3 py-1 text-sm"
            >
              <FaTimes className="w-3 h-3 mr-1" />
              {order.status === "draft" ? "Delete Draft" : "Cancel"}
            </Button>
          </div>
        )}

        {/* Report Action */}
        {canUserReportOrder(order) && (
          <div className="flex justify-start mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReportClick}
              className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 px-3 py-1 text-sm"
            >
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              Report Issue
            </Button>
          </div>
        )}

        {/* Already Reported Indicator */}
        {order.reported && !isAdmin && (
          <div className="flex justify-start mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <FaExclamationTriangle className="w-3 h-3 mr-1" />
              Already Reported
            </span>
          </div>
        )}

        {/* Super Admin Reception Status Editor */}
        {order.reported &&
          isAdmin &&
          shouldShowReceptionStatusEditor(order) && (
            <div className="flex justify-start mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Reception Status:
                </span>
                <Select
                  value={order.receptionStatus || "not_received"}
                  onChange={handleReceptionStatusUpdate}
                  options={[
                    { value: "not_received", label: "Not Received" },
                    { value: "received", label: "Received" },
                    { value: "checking", label: "Checking" },
                    { value: "resolved", label: "Resolved" },
                  ]}
                  size="sm"
                  className="w-40"
                />
              </div>
            </div>
          )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        isSubmitting={isReporting}
        orderNumber={order.orderNumber}
        phoneNumber={order.items?.[0]?.customerPhone || "N/A"}
        packageVolume={
          order.items?.[0]?.bundleSize
            ? `${order.items[0].bundleSize.value} ${order.items[0].bundleSize.unit}`
            : order.items?.[0]?.packageDetails?.dataVolume
            ? `${order.items[0].packageDetails.dataVolume} GB`
            : undefined
        }
        provider={order.items?.[0]?.packageDetails?.provider || undefined}
        orderDate={
          order.createdAt
            ? new Date(order.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : undefined
        }
      />
    </div>
  );
};
