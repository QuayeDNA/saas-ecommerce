// src/components/orders/SmartSelectDialog.tsx
import React, { useMemo } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button } from "../../design-system";
import { FaCheckSquare, FaTable, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import type { Order } from "../../types/order";

interface SmartSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectByStatus: (statuses: string[]) => void;
  onSelectByReceptionStatus?: (receptionStatuses: string[]) => void;
  onSwitchToExcel?: () => void;
  currentViewMode?: "cards" | "table" | "excel";
}

export const SmartSelectDialog: React.FC<SmartSelectDialogProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectByStatus,
  onSelectByReceptionStatus,
  onSwitchToExcel,
  currentViewMode,
}) => {
  // Count orders by status (only selectable statuses: pending and processing)
  const statusCounts = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
    };
  }, [orders]);

  // Count reported orders by reception status
  const reportedCounts = useMemo(() => {
    return {
      not_received: orders.filter((o) => o.reported && o.receptionStatus === "not_received").length,
      checking: orders.filter((o) => o.reported && o.receptionStatus === "checking").length,
    };
  }, [orders]);

  const handleSelectStatus = (statuses: string[]) => {
    onSelectByStatus(statuses);
    onClose();
  };

  const handleSelectReceptionStatus = (receptionStatuses: string[]) => {
    if (onSelectByReceptionStatus) {
      onSelectByReceptionStatus(receptionStatuses);
      onClose();
    }
  };

  const totalSelectableOrders =
    statusCounts.pending + statusCounts.processing;

  const totalReportedOrders = 
    reportedCounts.not_received + reportedCounts.checking;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <FaCheckSquare className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Smart Bulk Selection
          </h2>
        </div>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <FaInfoCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Select orders by status</p>
              <p>
                Only Pending and Processing orders can be bulk selected.
                Completed, Failed, Cancelled, and Draft orders are excluded.
              </p>
            </div>
          </div>

          {/* Status Selection Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              Select Orders by Status:
            </h3>

            {/* Pending Orders */}
            <button
              onClick={() => handleSelectStatus(["pending"])}
              disabled={statusCounts.pending === 0}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                statusCounts.pending > 0
                  ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100 cursor-pointer"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-yellow-700">
                    {statusCounts.pending}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Pending Orders</p>
                  <p className="text-xs text-gray-600">
                    Select all pending orders
                  </p>
                </div>
              </div>
              {statusCounts.pending > 0 && (
                <FaCheckSquare className="text-yellow-600 text-xl" />
              )}
            </button>

            {/* Processing Orders */}
            <button
              onClick={() => handleSelectStatus(["processing"])}
              disabled={statusCounts.processing === 0}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                statusCounts.processing > 0
                  ? "border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-700">
                    {statusCounts.processing}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Processing Orders</p>
                  <p className="text-xs text-gray-600">
                    Select all processing orders
                  </p>
                </div>
              </div>
              {statusCounts.processing > 0 && (
                <FaCheckSquare className="text-blue-600 text-xl" />
              )}
            </button>

            {/* All Selectable */}
            <button
              onClick={() =>
                handleSelectStatus(["pending", "processing"])
              }
              disabled={totalSelectableOrders === 0}
              className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                totalSelectableOrders > 0
                  ? "border-purple-300 bg-purple-50 hover:bg-purple-100 cursor-pointer"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-purple-700">
                    {totalSelectableOrders}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">All Selectable</p>
                  <p className="text-xs text-gray-600">
                    Select all pending and processing orders
                  </p>
                </div>
              </div>
              {totalSelectableOrders > 0 && (
                <FaCheckSquare className="text-purple-600 text-xl" />
              )}
            </button>
          </div>

          {/* Reported Orders Section */}
          {onSelectByReceptionStatus && totalReportedOrders > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <FaExclamationTriangle className="text-orange-600" />
                <h3 className="text-sm font-medium text-gray-700">
                  Reported Orders (Reception Issues)
                </h3>
              </div>

              {/* Not Received Orders */}
              <button
                onClick={() => handleSelectReceptionStatus(["not_received"])}
                disabled={reportedCounts.not_received === 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  reportedCounts.not_received > 0
                    ? "border-red-300 bg-red-50 hover:bg-red-100 cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-red-700">
                      {reportedCounts.not_received}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Not Received</p>
                    <p className="text-xs text-gray-600">
                      Select all orders reported as not received
                    </p>
                  </div>
                </div>
                {reportedCounts.not_received > 0 && (
                  <FaCheckSquare className="text-red-600 text-xl" />
                )}
              </button>

              {/* Checking Orders */}
              <button
                onClick={() => handleSelectReceptionStatus(["checking"])}
                disabled={reportedCounts.checking === 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  reportedCounts.checking > 0
                    ? "border-orange-300 bg-orange-50 hover:bg-orange-100 cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-orange-700">
                      {reportedCounts.checking}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Checking</p>
                    <p className="text-xs text-gray-600">
                      Select all orders being checked
                    </p>
                  </div>
                </div>
                {reportedCounts.checking > 0 && (
                  <FaCheckSquare className="text-orange-600 text-xl" />
                )}
              </button>

              {/* All Reported */}
              <button
                onClick={() => handleSelectReceptionStatus(["not_received", "checking"])}
                disabled={totalReportedOrders === 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  totalReportedOrders > 0
                    ? "border-rose-300 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                    : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-rose-700">
                      {totalReportedOrders}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">All Reported</p>
                    <p className="text-xs text-gray-600">
                      Select all not received and checking orders
                    </p>
                  </div>
                </div>
                {totalReportedOrders > 0 && (
                  <FaCheckSquare className="text-rose-600 text-xl" />
                )}
              </button>
            </div>
          )}

          {/* Copy Orders Note */}
          {onSwitchToExcel && currentViewMode !== "excel" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FaTable className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">
                    Need to copy order details?
                  </p>
                  <p className="mb-2">
                    Switch to Excel view to copy order information (phone
                    numbers, volumes, Ghana Card numbers) for bulk processing.
                  </p>
                  <button
                    onClick={() => {
                      onSwitchToExcel();
                      onClose();
                    }}
                    className="text-green-700 font-medium underline hover:text-green-900"
                  >
                    Switch to Excel View →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
