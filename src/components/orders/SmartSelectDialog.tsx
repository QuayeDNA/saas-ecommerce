import React, { useMemo, useState } from "react";
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
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
    };
  }, [orders]);

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

  type OptionStyle = {
    borderColor: string;
    backgroundColor: string;
    iconColor: string;
    avatarBg: string;
    badgeColor: string;
    checkColor: string;
  };

  const getOptionStyle = (count: number, semantic: string, hoverKey: string): OptionStyle => {
    const isActive = count > 0;
    const isHovered = hoveredOption === hoverKey;
    const hoverBg = isHovered ? `color-mix(in srgb, var(--${semantic}) 12%, transparent)` : undefined;

    if (!isActive) {
      return {
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-surface-alt)",
        iconColor: "var(--text-muted)",
        avatarBg: "var(--bg-surface-alt)",
        badgeColor: "var(--text-muted)",
        checkColor: "var(--text-muted)",
      };
    }

    return {
      borderColor: `color-mix(in srgb, var(--${semantic}) 40%, transparent)`,
      backgroundColor: hoverBg || `color-mix(in srgb, var(--${semantic}) 8%, transparent)`,
      iconColor: `var(--${semantic})`,
      avatarBg: `color-mix(in srgb, var(--${semantic}) 15%, transparent)`,
      badgeColor: `var(--${semantic})`,
      checkColor: `var(--${semantic})`,
    };
  };

  const renderOption = (
    key: string,
    count: number,
    semantic: string,
    label: string,
    description: string,
    onClick: () => void,
  ) => {
    const style = getOptionStyle(count, semantic, key);
    return (
      <button
        onClick={onClick}
        disabled={count === 0}
        onMouseEnter={() => setHoveredOption(key)}
        onMouseLeave={() => setHoveredOption(null)}
        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${count === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        style={{
          borderColor: style.borderColor,
          backgroundColor: style.backgroundColor,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: style.avatarBg }}
          >
            <span className="text-lg font-semibold" style={{ color: style.badgeColor }}>
              {count}
            </span>
          </div>
          <div className="text-left">
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{description}</p>
          </div>
        </div>
        {count > 0 && (
          <FaCheckSquare className="text-xl" style={{ color: style.checkColor }} />
        )}
      </button>
    );
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <FaCheckSquare style={{ color: "var(--color-primary)" }} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Smart Bulk Selection
          </h2>
        </div>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          {/* Info Banner */}
          <div
            className="rounded-lg p-3 flex gap-2"
            style={{
              backgroundColor: `color-mix(in srgb, var(--color-primary) 8%, transparent)`,
              border: `1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)`,
            }}
          >
            <FaInfoCircle className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
            <div className="text-sm" style={{ color: "var(--color-primary)" }}>
              <p className="font-medium mb-1">Select orders by status</p>
              <p>
                Only Pending and Processing orders can be bulk selected.
                Completed, Failed, Cancelled, and Draft orders are excluded.
              </p>
            </div>
          </div>

          {/* Status Selection Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Select Orders by Status:
            </h3>

            {renderOption("pending", statusCounts.pending, "warning", "Pending Orders", "Select all pending orders", () => handleSelectStatus(["pending"]))}
            {renderOption("processing", statusCounts.processing, "color-primary", "Processing Orders", "Select all processing orders", () => handleSelectStatus(["processing"]))}
            {renderOption("all-selectable", totalSelectableOrders, "color-primary", "All Selectable", "Select all pending and processing orders", () => handleSelectStatus(["pending", "processing"]))}
          </div>

          {/* Reported Orders Section */}
          {onSelectByReceptionStatus && totalReportedOrders > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 pb-2" style={{ borderBottom: "1px solid var(--border-color)" }}>
                <FaExclamationTriangle style={{ color: "var(--warning)" }} />
                <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Reported Orders (Reception Issues)
                </h3>
              </div>

              {renderOption("not-received", reportedCounts.not_received, "error", "Not Received", "Select all orders reported as not received", () => handleSelectReceptionStatus(["not_received"]))}
              {renderOption("checking", reportedCounts.checking, "warning", "Checking", "Select all orders being checked", () => handleSelectReceptionStatus(["checking"]))}
              {renderOption("all-reported", totalReportedOrders, "error", "All Reported", "Select all not received and checking orders", () => handleSelectReceptionStatus(["not_received", "checking"]))}
            </div>
          )}

          {/* Copy Orders Note */}
          {onSwitchToExcel && currentViewMode !== "excel" && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: `color-mix(in srgb, var(--success) 8%, transparent)`,
                border: `1px solid color-mix(in srgb, var(--success) 20%, transparent)`,
              }}
            >
              <div className="flex items-start gap-2">
                <FaTable className="flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                <div className="text-sm" style={{ color: "var(--success)" }}>
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
                    className="font-medium underline"
                    style={{ color: "var(--success)" }}
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
