// src/components/orders/UnifiedOrderExcel.tsx
import React, { useMemo, useState } from "react";
import { DataGrid } from "react-data-grid";
import type { Order } from "../../types/order";
import { Badge, Dialog, Alert } from "../../design-system";
import {
  FaFileExcel,
  FaDownload,
  FaCopy,
  FaSpinner,
  FaCheck,
  FaCheckSquare,
  FaSquare,
  FaClock,
} from "react-icons/fa";
import { useOrder } from "../../contexts/OrderContext";

interface UnifiedOrderExcelProps {
  orders: Order[];
  loading?: boolean;
}

interface ExcelRow {
  id: string;
  orderId: string;
  contactNumber: string;
  dataVolume: string;
  providerName: string;
  status: string;
  date: string;
  total: number;
  orderType: string;
  paymentStatus: string;
}

export const UnifiedOrderExcel: React.FC<UnifiedOrderExcelProps> = ({
  orders,
  loading = false,
}) => {
  const { bulkProcessOrders } = useOrder();

  // Selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Processing dialog state
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processingType, setProcessingType] = useState<"afa" | "data" | null>(null);
  const [batchSize, setBatchSize] = useState(10);
  const [statusUpdate, setStatusUpdate] = useState<"none" | "processing" | "completed">("processing");
  
  // Progress state
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
    currentBatch: 0,
    totalBatches: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Alert states
  const [alertState, setAlertState] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    message: string;
  }>({
    show: false,
    type: "info",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => {
    setAlertState({ show: true, type, message });
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setAlertState((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // Extract Ghana Card number from notes
  const extractGhanaCardFromNotes = (notes: string | undefined) => {
    if (!notes) return null;
    const match = notes.match(/Ghana Card:\s*([A-Z0-9-]+)/i);
    return match ? match[1] : null;
  };

  // Format AFA order for copying: phone | name | ghanaCard | price
  const formatAFAOrder = (order: Order) => {
    const phone =
      order.customerInfo?.phone || order.items[0]?.customerPhone || "N/A";
    const name = order.customerInfo?.name || "N/A";
    const ghanaCard = extractGhanaCardFromNotes(order.notes) || "N/A";
    const price = order.total.toFixed(2);

    return `${phone} | ${name} | ${ghanaCard} | ${price}`;
  };

  // Format Data order for copying: phone volume
  const formatDataOrder = (order: Order) => {
    const phone =
      order.customerInfo?.phone || order.items[0]?.customerPhone || "N/A";
    const dataVolumeRaw =
      order.items[0]?.packageDetails?.dataVolume || "0";
    const dataVolumeNumber = dataVolumeRaw.toString().replace(/[^\d.]/g, "");

    return `${phone} ${dataVolumeNumber}`;
  };

  // Chunk array into batches
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Handle opening process dialog for AFA orders
  const handleCopyProcessAFAOrders = () => {
    if (selectedAFAOrders.length === 0) {
      showAlert("warning", "No AFA orders selected.");
      return;
    }
    setProcessingType("afa");
    setShowProcessDialog(true);
  };

  // Handle opening process dialog for Data orders
  const handleCopyProcessDataOrders = () => {
    if (selectedDataOrders.length === 0) {
      showAlert("warning", "No data orders selected.");
      return;
    }
    setProcessingType("data");
    setShowProcessDialog(true);
  };

  // Process orders with batch size and status update
  const processOrders = async (
    orders: Order[],
    type: "afa" | "data",
    copyOnly: boolean = false
  ) => {
    try {
      setShowProcessDialog(false);
      setIsProcessing(true);

      // Format orders for clipboard
      const formattedData = orders
        .map((order) => (type === "afa" ? formatAFAOrder(order) : formatDataOrder(order)))
        .join("\n");

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(formattedData);
        showAlert("success", `Copied ${orders.length} ${type.toUpperCase()} orders to clipboard!`);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = formattedData;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showAlert("success", `Copied ${orders.length} ${type.toUpperCase()} orders to clipboard!`);
      }

      // If not copy-only and status update is requested
      if (!copyOnly && statusUpdate !== "none") {
        setShowProgressDialog(true);
        const batches = chunkArray(orders, batchSize);
        setProcessingProgress({
          current: 0,
          total: orders.length,
          currentBatch: 0,
          totalBatches: batches.length,
        });

        // Process each batch
        for (let i = 0; i < batches.length; i++) {
          setProcessingProgress((prev) => ({
            ...prev,
            currentBatch: i + 1,
          }));

          const orderIds = batches[i]
            .map((order) => order._id || "")
            .filter(Boolean);

          await bulkProcessOrders(orderIds, statusUpdate);

          setProcessingProgress((prev) => ({
            ...prev,
            current: prev.current + batches[i].length,
          }));
        }

        setShowProgressDialog(false);
        showAlert("success", `Successfully updated ${orders.length} orders to ${statusUpdate}!`);
        
        // Clear selection after successful processing
        setSelectedOrderIds([]);
      }
    } catch (error) {
      console.error("Error processing orders:", error);
      showAlert("error", "Failed to process orders. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle row selection
  const toggleRowSelection = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select all pending orders
  const handleSelectAllPending = () => {
    const pendingOrderIds = orders
      .filter((order) => order.status === "pending")
      .map((order) => order._id || "")
      .filter(Boolean);
    setSelectedOrderIds(pendingOrderIds);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedOrderIds([]);
  };

  // Get selected orders grouped by type
  const selectedAFAOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        selectedOrderIds.includes(order._id || "") &&
        order.items[0]?.packageDetails?.provider === "AFA"
    );
  }, [orders, selectedOrderIds]);

  const selectedDataOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        selectedOrderIds.includes(order._id || "") &&
        order.items[0]?.packageDetails?.provider !== "AFA"
    );
  }, [orders, selectedOrderIds]);

  // Define columns with selection
  const columns = useMemo(
    () => [
      {
        key: "select",
        name: "",
        width: 50,
        resizable: false,
        frozen: true,
        renderCell: ({ row }: { row: ExcelRow }) => (
          <input
            type="checkbox"
            checked={selectedOrderIds.includes(row.id)}
            onChange={() => toggleRowSelection(row.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        key: "orderId",
        name: "Order ID",
        width: 150,
        resizable: true,
        sortable: true,
      },
  {
    key: "contactNumber",
    name: "Contact Number",
    width: 150,
    resizable: true,
    sortable: true,
  },
  {
    key: "dataVolume",
    name: "Volume/Service",
    width: 120,
    resizable: true,
    sortable: true,
  },
  {
    key: "providerName",
    name: "Provider",
    width: 120,
    resizable: true,
    sortable: true,
  },
  {
    key: "status",
    name: "Status",
    width: 120,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <Badge
        variant="subtle"
        colorScheme={
          row.status === "completed"
            ? "success"
            : row.status === "processing"
            ? "warning"
            : row.status === "cancelled"
            ? "error"
            : row.status === "failed"
            ? "error"
            : "default"
        }
        className="text-xs"
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </Badge>
    ),
  },
  {
    key: "date",
    name: "Date",
    width: 120,
    resizable: true,
    sortable: true,
  },
  {
    key: "total",
    name: "Total (GHS)",
    width: 120,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <span className="font-mono text-sm">
        {row.total.toLocaleString("en-GH", {
          style: "currency",
          currency: "GHS",
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    key: "orderType",
    name: "Order Type",
    width: 100,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <Badge
        variant="subtle"
        colorScheme={row.orderType === "bulk" ? "warning" : "default"}
        className="text-xs"
      >
        {row.orderType.charAt(0).toUpperCase() + row.orderType.slice(1)}
      </Badge>
    ),
  },
  {
    key: "paymentStatus",
    name: "Payment",
    width: 100,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <Badge
        variant="subtle"
        colorScheme={
          row.paymentStatus === "paid"
            ? "success"
            : row.paymentStatus === "failed"
            ? "error"
            : "warning"
        }
        className="text-xs"
      >
        {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
      </Badge>
    ),
  },
],
    [selectedOrderIds]
  );
  
  // Transform orders to Excel format
  const excelRows = useMemo(() => {
    return orders.map((order) => {
      // Get the first item's data volume and provider
      const firstItem = order.items[0];
      const isAfaOrder = firstItem?.packageDetails?.provider === 'AFA';
      
      // Extract Ghana Card number from notes
      const extractGhanaCardFromNotes = (notes: string | undefined) => {
        if (!notes) return null;
        const match = notes.match(/Ghana Card:\s*([A-Z0-9-]+)/i);
        return match ? match[1] : null;
      };
      
      let dataVolume;
      if (isAfaOrder) {
        // For AFA orders, show Ghana Card number or service type
        dataVolume = order.customerInfo?.ghanaCardNumber || extractGhanaCardFromNotes(order.notes) || "AFA Registration Service";
      } else {
        // For regular orders, show data volume
        dataVolume = firstItem?.packageDetails?.dataVolume
          ? `${firstItem.packageDetails.dataVolume}`
          : "N/A";
      }

      const providerName = firstItem?.packageDetails?.provider || "N/A";

      // Get contact number from customer info or first item
      const contactNumber =
        order.customerInfo?.phone || firstItem?.customerPhone || "N/A";

      return {
        id: order._id || "",
        orderId: order.orderNumber,
        contactNumber,
        dataVolume,
        providerName,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        total: order.total,
        orderType: order.orderType,
        paymentStatus: order.paymentStatus,
      };
    });
  }, [orders]);

  // Sort rows by date (newest first)
  const sortedRows = useMemo(() => {
    return [...excelRows].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return bDate - aDate; // Newest first
    });
  }, [excelRows]);

  const handleExport = () => {
    // Create CSV content
    const headers = columns.map((col) => col.name).join(",");
    const rows = sortedRows
      .map((row) =>
        [
          row.orderId,
          row.contactNumber,
          row.dataVolume,
          row.providerName,
          row.status,
          row.date,
          row.total.toFixed(2),
          row.orderType,
          row.paymentStatus,
        ].join(",")
      )
      .join("\n");

    const csvContent = `${headers}\n${rows}`;

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Excel view...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 w-full h-full flex flex-col">
      {/* Excel Header */}
      <div className="flex flex-col bg-white p-3 sm:p-4 rounded-lg border border-gray-200 gap-3">
        {/* Title and Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <FaFileExcel className="text-green-600 text-lg sm:text-xl flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Excel View
              </h3>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
              {sortedRows.length} orders • {selectedOrderIds.length} selected
            </span>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSelectAllPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FaCheckSquare className="text-xs" />
            Select All Pending
          </button>
          <button
            onClick={handleDeselectAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaSquare className="text-xs" />
            Deselect All
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyProcessAFAOrders}
            disabled={isProcessing || selectedAFAOrders.length === 0}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              isProcessing || selectedAFAOrders.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            <FaCopy className="text-xs sm:text-sm" />
            <span>Copy/Process AFA Orders ({selectedAFAOrders.length})</span>
          </button>
          
          <button
            onClick={handleCopyProcessDataOrders}
            disabled={isProcessing || selectedDataOrders.length === 0}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              isProcessing || selectedDataOrders.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            <FaCopy className="text-xs sm:text-sm" />
            <span>Copy/Process Data Orders ({selectedDataOrders.length})</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <FaDownload className="text-xs sm:text-sm" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Excel Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full flex-1">
        <div className="w-full h-full">
          <DataGrid
            columns={columns}
            rows={sortedRows}
            className="rdg-light w-full h-full"
            style={
              {
                "--rdg-color": "#374151",
                "--rdg-summary-border-color": "#d1d5db",
                "--rdg-border-color": "#e5e7eb",
                "--rdg-summary-background-color": "#f9fafb",
                "--rdg-background-color": "#ffffff",
                "--rdg-header-background-color": "#f3f4f6",
                "--rdg-row-hover-background-color": "#f9fafb",
                "--rdg-row-selected-background-color": "#dbeafe",
                "--rdg-row-selected-hover-background-color": "#bfdbfe",
                "--rdg-checkbox-color": "#3b82f6",
                "--rdg-checkbox-focus-color": "#1d4ed8",
                "--rdg-checkbox-disabled-color": "#9ca3af",
                "--rdg-selection-color": "#3b82f6",
                "--rdg-font-size": "14px",
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      {/* Excel Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg gap-2 sm:gap-0">
        <div>
          Showing {sortedRows.length} of {sortedRows.length} orders
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
          <span>Sorted by: Date (Newest first)</span>
          <span className="hidden sm:inline">•</span>
          <span>Click column headers to sort</span>
        </div>
      </div>

      {/* Alert Component */}
      {alertState.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert
            status={alertState.type}
            isClosable
            onClose={() => setAlertState((prev) => ({ ...prev, show: false }))}
            className="shadow-lg"
          >
            {alertState.message}
          </Alert>
        </div>
      )}

      {/* Processing Dialog */}
      <Dialog
        isOpen={showProcessDialog}
        onClose={() => setShowProcessDialog(false)}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaCopy className="text-blue-600 text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Process {processingType === "afa" ? "AFA" : "Data"} Orders
              </h3>
              <p className="text-sm text-gray-600">
                {processingType === "afa"
                  ? `Selected: ${selectedAFAOrders.length} AFA orders`
                  : `Selected: ${selectedDataOrders.length} Data orders`}
              </p>
            </div>
          </div>

          {/* Copy Format Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copy Format Preview:
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                {processingType === "afa"
                  ? selectedAFAOrders
                      .slice(0, 3)
                      .map(formatAFAOrder)
                      .join("\n")
                  : selectedDataOrders
                      .slice(0, 3)
                      .map(formatDataOrder)
                      .join("\n")}
                {(processingType === "afa"
                  ? selectedAFAOrders.length
                  : selectedDataOrders.length) > 3 &&
                  `\n... and ${
                    (processingType === "afa"
                      ? selectedAFAOrders.length
                      : selectedDataOrders.length) - 3
                  } more`}
              </pre>
            </div>
          </div>

          {/* Status Update Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status After Copy:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusUpdate"
                  value="none"
                  checked={statusUpdate === "none"}
                  onChange={(e) => setStatusUpdate(e.target.value as "none" | "processing" | "completed")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Don't update status</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusUpdate"
                  value="processing"
                  checked={statusUpdate === "processing"}
                  onChange={(e) => setStatusUpdate(e.target.value as "none" | "processing" | "completed")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mark as Processing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="statusUpdate"
                  value="completed"
                  checked={statusUpdate === "completed"}
                  onChange={(e) => setStatusUpdate(e.target.value as "none" | "processing" | "completed")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mark as Completed</span>
              </label>
            </div>
          </div>

          {/* Batch Size */}
          {statusUpdate !== "none" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size: {batchSize} orders at a time
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Smaller batches work better on slow networks
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowProcessDialog(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                processOrders(
                  processingType === "afa" ? selectedAFAOrders : selectedDataOrders,
                  processingType!,
                  true
                )
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copy Only
            </button>
            <button
              onClick={() =>
                processOrders(
                  processingType === "afa" ? selectedAFAOrders : selectedDataOrders,
                  processingType!,
                  false
                )
              }
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Copy & Process
            </button>
          </div>
        </div>
      </Dialog>

      {/* Progress Dialog */}
      <Dialog
        isOpen={showProgressDialog}
        onClose={() => {}}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaSpinner className="text-blue-600 text-lg animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Processing Orders...
              </h3>
              <p className="text-sm text-gray-600">
                Updating order status...
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>Progress: {processingProgress.current}/{processingProgress.total} orders</span>
              <span>{Math.round((processingProgress.current / processingProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{
                  width: `${(processingProgress.current / processingProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Batch Progress */}
          <div className="space-y-2 text-sm">
            {Array.from({ length: processingProgress.totalBatches }).map((_, index) => {
              const batchNum = index + 1;
              const isComplete = batchNum < processingProgress.currentBatch;
              const isCurrent = batchNum === processingProgress.currentBatch;
              const isPending = batchNum > processingProgress.currentBatch;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isComplete
                      ? "bg-green-50 text-green-700"
                      : isCurrent
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {isComplete && <FaCheck className="text-green-600" />}
                  {isCurrent && <FaSpinner className="text-blue-600 animate-spin" />}
                  {isPending && <FaClock className="text-gray-400" />}
                  <span>
                    Batch {batchNum} ({batchSize} orders) -{" "}
                    {isComplete ? "Complete" : isCurrent ? "Processing..." : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
