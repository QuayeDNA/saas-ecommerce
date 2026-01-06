// src/components/orders/UnifiedOrderTable.tsx
import React, { useState } from "react";
import { Button } from "../../design-system";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import type { Order } from "../../types/order";

interface ReceptionStatusDropdownProps {
  orderId: string;
  currentStatus: string;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const ReceptionStatusDropdown: React.FC<ReceptionStatusDropdownProps> = ({
  orderId,
  currentStatus,
  onStatusChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const receptionStatusOptions = [
    {
      value: "not_received",
      label: "Not Received",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "checking",
      label: "Checking",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "resolved",
      label: "Resolved",
      color: "bg-blue-100 text-blue-800",
    },
  ];

  const getReceptionStatusColor = (status: string) => {
    const option = receptionStatusOptions.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(orderId, newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${getReceptionStatusColor(
          currentStatus
        )} hover:bg-opacity-80 transition-colors`}
      >
        {currentStatus.replace("_", " ")}
        <FaChevronRight className="text-xs" />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200"
          style={{ top: "100%", left: "0" }}
        >
          <div className="py-1 flex flex-col">
            {receptionStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                  option.value === currentStatus
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
  );
};

interface UnifiedOrderTableProps {
  orders: Order[];
  isAdmin: boolean;
  currentUserId?: string;
  onUpdateStatus: (orderId: string, status: string, notes?: string) => void;
  onUpdateReceptionStatus?: (orderId: string, receptionStatus: string) => void;
  onCancel: (orderId: string) => void;
  onSelect?: (orderId: string) => void;
  selectedOrders: string[];
  onSelectAll: () => void;
  loading?: boolean;
}

export const UnifiedOrderTable: React.FC<UnifiedOrderTableProps> = ({
  orders,
  isAdmin,
  currentUserId,
  onUpdateStatus,
  onUpdateReceptionStatus,
  onCancel,
  onSelect,
  selectedOrders,
  onSelectAll,
  loading = false,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [statusDropdowns, setStatusDropdowns] = useState<Set<string>>(
    new Set()
  );

  // Click outside handler to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (statusDropdowns.size > 0 && !target.closest(".status-dropdown")) {
        setStatusDropdowns(new Set());
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && statusDropdowns.size > 0) {
        setStatusDropdowns(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [statusDropdowns]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";

      case "confirmed":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FaCheck className="text-green-600" />;
      case "processing":
        return <FaClock className="text-blue-600" />;
      case "failed":
        return <FaTimes className="text-red-600" />;
      case "pending":
        return <FaClock className="text-yellow-600" />;
      case "confirmed":
        return <FaCheck className="text-purple-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      onUpdateStatus(orderId, newStatus);
      setStatusDropdowns(new Set());
    } catch {
      // Failed to update status
    }
  };

  const toggleStatusDropdown = (orderId: string) => {
    const newDropdowns = new Set(statusDropdowns);
    if (newDropdowns.has(orderId)) {
      newDropdowns.delete(orderId);
    } else {
      newDropdowns.add(orderId);
    }
    setStatusDropdowns(newDropdowns);
  };

  const getOrderProvider = (order: Order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].packageDetails?.provider || "Unknown";
    }
    return "Unknown";
  };

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

  // Check if order is AFA
  const isAfaOrder = (order: Order) => {
    return (
      order.items &&
      order.items.length > 0 &&
      order.items[0].packageDetails?.provider === "AFA"
    );
  };

  // Extract Ghana Card number from notes
  const extractGhanaCardFromNotes = (notes: string | undefined) => {
    if (!notes) return null;
    const match = notes.match(/Ghana Card:\s*([A-Z0-9-]+)/i);
    return match ? match[1] : null;
  };

  // Get display info for AFA orders
  const getAfaOrderInfo = (order: Order) => {
    const ghanaCardNumber =
      order.customerInfo?.ghanaCardNumber ||
      extractGhanaCardFromNotes(order.notes);
    return ghanaCardNumber || "AFA Registration Service";
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

    // Agents can only cancel their own draft orders
    if (order.status === "draft" && currentUserId) {
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

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },

    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop-optimized table - minimum lg screen required */}
      <div className="overflow-x-auto min-w-full">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {isAdmin && onSelect && (
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === orders.length &&
                      orders.length > 0
                    }
                    onChange={onSelectAll}
                    className="rounded"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Network
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Status
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Reception
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 8 : 7}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50">
                    {isAdmin && onSelect && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id || "")}
                          onChange={() => onSelect(order._id || "")}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {order.orderType}
                          </span>
                          {order.bulkData && (
                            <span className="text-xs text-gray-500">
                              {order.bulkData.totalItems} items
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.customerInfo?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerInfo?.phone ||
                          order.items[0]?.customerPhone ||
                          "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getOrderProvider(order)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isAfaOrder(order)
                          ? getAfaOrderInfo(order)
                          : getOrderVolume(order)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        {isAdmin ? (
                          // Admin can change status
                          <button
                            onClick={() => toggleStatusDropdown(order._id!)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )} hover:bg-opacity-80 transition-colors status-dropdown`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status.replace("_", " ")}
                            <FaChevronRight className="text-xs" />
                          </button>
                        ) : (
                          // Agent can only view status
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status.replace("_", " ")}
                          </span>
                        )}

                        {isAdmin && statusDropdowns.has(order._id!) && (
                          <div
                            className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 status-dropdown"
                            style={{ top: "100%", left: "0" }}
                          >
                            <div className="py-1 flex flex-col">
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleStatusChange(order._id!, option.value)
                                  }
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
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {order.status === "completed" ? (
                          <ReceptionStatusDropdown
                            orderId={order._id!}
                            currentStatus={
                              order.receptionStatus || "not_received"
                            }
                            onStatusChange={onUpdateReceptionStatus!}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Cancel order action */}
                        {canUserCancelOrder(order) && (
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => onCancel(order._id!)}
                            title={
                              order.status === "draft"
                                ? "Delete Draft Order"
                                : "Cancel Order"
                            }
                          >
                            <FaTimes className="w-3 h-3" />
                          </Button>
                        )}

                        {/* Expand/Collapse button */}
                        {order.items && order.items.length > 0 && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => toggleRowExpansion(order._id!)}
                          >
                            {expandedRows.has(order._id!) ? (
                              <FaChevronUp className="w-3 h-3" />
                            ) : (
                              <FaChevronDown className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row for order items */}
                  {expandedRows.has(order._id!) &&
                    order.items &&
                    order.items.length > 0 && (
                      <tr>
                        <td
                          colSpan={isAdmin ? 8 : 7}
                          className="px-6 py-4 bg-gray-50"
                        >
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Order Items
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {order.items.map((item) => (
                                <div
                                  key={item._id}
                                  className="bg-white rounded-lg p-3 border border-gray-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-900">
                                        {item.packageDetails?.name || "Bundle"}
                                      </h5>
                                      <p className="text-xs text-gray-500">
                                        {item.customerPhone}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.bundleSize?.value}
                                        {item.bundleSize?.unit}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                          item.processingStatus
                                        )}`}
                                      >
                                        {item.processingStatus}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
