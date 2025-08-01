// src/components/orders/BulkOrderModal.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTimes, 
  FaWifi, 
  FaClock, 
  FaCheckCircle, 
  FaFileUpload, 
  FaDownload,
  FaPlus,
  FaBox,
  FaExclamationCircle,
  FaDatabase,
} from "react-icons/fa";
import { useOrder } from "../../contexts/OrderContext";
import { useSiteStatus } from "../../contexts/site-status-context";
import { bundleService } from "../../services/bundle.service";
import type { Bundle } from "../../types/package";
import { getProviderColors } from "../../utils/provider-colors";

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageId: string;
  provider: string; // provider code for validation
  providerName: string; // provider name for display
}

interface BulkOrderItem {
  customerPhone: string;
  dataVolume: number;
  dataUnit: "MB" | "GB";
  bundle?: Bundle;
  phoneError?: string;
  dataError?: string;
}

export const BulkOrderModal: React.FC<BulkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  packageId,
  provider,
  providerName,
}) => {
  const { loading, createBulkOrder } = useOrder();
  const { siteStatus } = useSiteStatus();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const navigate = useNavigate();
  const [bulkText, setBulkText] = useState("");
  const [orderItems, setOrderItems] = useState<BulkOrderItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMethod, setImportMethod] = useState<"file" | "manual">("manual");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBulkText("");
      setOrderItems([]);
      setShowSummary(false);
      setError(null);
      setImportMethod("manual");
    }
  }, [isOpen]);

  // Fetch bundles for the selected packageId
  useEffect(() => {
    if (isOpen && packageId) {
      bundleService
        .getBundles({ packageId })
        .then((resp) => setBundles(resp.bundles || []))
        .catch(() => setBundles([]));
    }
  }, [isOpen, packageId]);

  // Get available bundles for this package
  const availableBundles: Bundle[] = Array.isArray(bundles)
    ? bundles.filter((bundle: Bundle) => bundle.isActive)
    : [];

  // Validate phone number - simplified validation
  const validatePhone = (phone: string): string | null => {
    // Remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    
    // Convert to local format if it starts with +233
    let localPhone = cleanPhone;
    if (cleanPhone.startsWith("+233")) {
      localPhone = "0" + cleanPhone.substring(4);
    } else if (cleanPhone.startsWith("233")) {
      localPhone = "0" + cleanPhone.substring(3);
    }

    // Check for unnecessary spaces between digits
    if (phone.includes(" ") && phone.replace(/\s/g, "").length === 10) {
      return "Remove unnecessary spaces between digits";
    }

    // Check length - must be exactly 10 digits
    if (localPhone.length !== 10) {
      if (localPhone.length > 10) {
        return "Phone number must be exactly 10 digits";
      } else {
        return "Phone number must be exactly 10 digits";
      }
    }

    // Check if it starts with 0
    if (!localPhone.startsWith("0")) {
      return "Phone number must start with 0";
    }

    return null;
  };

  // Only accept numbers (assume GB) in the textarea input
  const parseBulkText = (text: string): BulkOrderItem[] => {
    const lines = text.trim().split("\n");
    const items: BulkOrderItem[] = [];
    for (const element of lines) {
      const line = element.trim();
      if (!line) continue;
      // Parse format: "Number 10" (assume GB)
      const parts = line.split(" ");
      if (parts.length < 2) continue;
      const phoneNum = parts[0];
      const gbValue = parts[1];
      // Check for non-numeric characters (other than .) in gbValue
      if (/[^0-9.]/.test(gbValue)) {
        items.push({
          customerPhone: phoneNum,
          dataVolume: 0,
          dataUnit: "GB",
          bundle: undefined,
          dataError: "Do not include GB or MB, just enter the number (e.g. 10)"
        });
        continue;
      }
      const gbVolume = parseFloat(gbValue);
      if (isNaN(gbVolume)) continue;
      // Find matching bundle (always in GB)
      const foundBundle = availableBundles.find(
        (bundle) =>
          bundle.dataVolume === gbVolume &&
          bundle.dataUnit.toUpperCase() === "GB"
      );
      items.push({
        customerPhone: phoneNum,
        dataVolume: gbVolume,
        dataUnit: "GB",
        bundle: foundBundle,
      });
    }
    return items;
  };

  // Validate all order items, but allow continue even if some are invalid
  const validateOrderItems = (): {
    valid: BulkOrderItem[];
    invalid: BulkOrderItem[];
  } => {
    const validatedItems = orderItems.map((item) => {
      const phoneError = validatePhone(item.customerPhone);
      const dataError = !item.bundle
        ? "Data volume not available in this package"
        : undefined;
      return { ...item, phoneError: phoneError ?? undefined, dataError };
    });
    const valid = validatedItems.filter(
      (item) => !item.phoneError && !item.dataError
    );
    const invalid = validatedItems.filter(
      (item) => item.phoneError || item.dataError
    );
    setOrderItems(validatedItems);
    return { valid, invalid };
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const items = parseBulkText(csv);
        setOrderItems(items);
        setError(null);
      } catch {
        setError("Failed to parse CSV file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  // Handle bulk text change
  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    const items = parseBulkText(text);
    setOrderItems(items);
  };

  // Handle continue to summary (always allow)
  const [validOrders, setValidOrders] = useState<BulkOrderItem[]>([]);
  const [invalidOrders, setInvalidOrders] = useState<BulkOrderItem[]>([]);
  const handleContinue = () => {
    const { valid, invalid } = validateOrderItems();
    setValidOrders(valid);
    setInvalidOrders(invalid);
    setShowSummary(true);
  };

  // Handle confirm order (only send valid orders)
  const handleConfirmOrder = async () => {
    try {
      setError(null);
      
      // Check if site is closed
      if (siteStatus?.isSiteOpen === false) {
        setError(`Site is currently under maintenance: ${siteStatus.customMessage}`);
        return;
      }
      
      const items = validOrders.map(
        (item) => `${item.customerPhone},${item.dataVolume}GB`
      );
      const orderData = { items, packageId };
      await createBulkOrder(orderData);
      onSuccess();
      onClose();
      navigate("/agent/dashboard/orders");
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = err.message;
        
        // Check if site is closed
        if (errorMessage.includes('maintenance') || errorMessage.includes('Site is currently under maintenance')) {
          setError(errorMessage);
          return;
        }
        
        setError(errorMessage || "Failed to create bulk order");
      } else {
        setError("Failed to create bulk order");
      }
    }
  };

  // Handle back to form
  const handleBack = () => {
    setShowSummary(false);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const template = "0241234567 5GB\n0201234567 2GB\n0271234567 1GB";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_order_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "GHS":
        return "GH₵";
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      default:
        return currency + " ";
    }
  };

  // Provider colors for summary card
  const providerColors = getProviderColors(provider);

  // Aggregate total GB and currency
  const totalGB = validOrders.reduce(
    (sum, item) => sum + (item.dataVolume || 0),
    0
  );
  const totalPrice = validOrders.reduce(
    (sum, item) => sum + (item.bundle ? item.bundle.price : 0),
    0
  );
  const currency =
    validOrders.length > 0 && validOrders[0].bundle
      ? validOrders[0].bundle.currency
      : "GHS";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {showSummary
              ? "Bulk Order Summary"
              : `Bulk Order for ${providerName}`}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {!showSummary ? (
            // Order Form
            <div className="space-y-4 sm:space-y-6">
              {/* Package Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      {providerName} Package
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Available bundles in this package
                    </p>
                  </div>
                </div>
                {/* Make available bundles scrollable */}
                <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto pr-2">
                  {Array.isArray(availableBundles) &&
                    availableBundles.length > 0 &&
                    availableBundles.map((bundle: Bundle) => (
                      <div
                        key={bundle._id}
                        className="flex items-center justify-between text-xs sm:text-sm bg-white p-2 rounded"
                      >
                        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                          <FaWifi className="text-blue-500 flex-shrink-0" />
                          <span className="truncate">
                            {bundle.dataVolume} {bundle.dataUnit}
                          </span>
                          <span className="text-gray-500 hidden sm:inline">•</span>
                          <FaClock className="text-green-500 flex-shrink-0" />
                          <span className="truncate">
                            {bundle.validity} {bundle.validityUnit}
                          </span>
                        </div>
                        <div className="font-bold text-green-600 text-xs sm:text-sm flex-shrink-0 ml-2">
                          {bundle.currency} {bundle.price}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Import Method Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  Import Method
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <button
                    onClick={() => setImportMethod("file")}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 sm:p-3 border rounded-lg transition-colors text-xs sm:text-sm ${
                      importMethod === "file"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <FaFileUpload className="flex-shrink-0" />
                    <span className="truncate">Import CSV/Excel</span>
                  </button>
                  <button
                    onClick={() => setImportMethod("manual")}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 sm:p-3 border rounded-lg transition-colors text-xs sm:text-sm ${
                      importMethod === "manual"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <FaPlus className="flex-shrink-0" />
                    <span className="truncate">Manual Entry</span>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              {importMethod === "file" && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">Upload File</h3>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 self-start sm:self-center"
                    >
                      <FaDownload className="flex-shrink-0" />
                      <span className="truncate">Download Template</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: CSV, Excel. Format: PhoneNumber DataVolume
                  </p>
                </div>
              )}

              {/* Manual Entry */}
              {importMethod === "manual" && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      Bulk Order Input
                    </h3>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Enter orders (one per line)
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => handleBulkTextChange(e.target.value)}
                      placeholder={`0241234567 5\n0201234567 2\n0271234567 1`}
                      className="w-full h-24 sm:h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-xs sm:text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Format: PhoneNumber DataVolume (e.g., 0241234567 5). All values are in GB.<br/>
                      <span className="text-red-500 font-semibold">Do not type GB or MB, just the number.</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={orderItems.length === 0 || loading || (siteStatus?.isSiteOpen === false)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
              >
                {loading
                  ? "Processing..."
                  : (siteStatus?.isSiteOpen === false)
                  ? "Site Under Maintenance"
                  : `Continue (${orderItems.length} items)`}
              </button>
            </div>
          ) : (
            // Order Summary
            <div className="space-y-4 sm:space-y-6">
              {/* Package Summary Mini Card */}
              <div
                className="rounded-lg shadow flex items-center gap-3 sm:gap-4 p-3 sm:p-4 mb-4"
                style={{
                  backgroundColor: providerColors.background,
                  border: `1.5px solid ${providerColors.primary}`,
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full flex-shrink-0"
                  style={{ backgroundColor: providerColors.primary }}
                >
                  <FaWifi
                    className="text-lg sm:text-2xl"
                    style={{ color: providerColors.text }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <span
                      className="text-base sm:text-lg font-bold truncate"
                      style={{ color: providerColors.primary }}
                    >
                      {providerName}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                        <FaCheckCircle className="text-green-500 flex-shrink-0" />
                        <span className="truncate">{validOrders.length} Valid</span>
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                        <FaExclamationCircle className="text-red-500 flex-shrink-0" />
                        <span className="truncate">{invalidOrders.length} Invalid</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 text-gray-700">
                      <FaDatabase className="text-blue-500 flex-shrink-0" />
                      <span className="font-semibold">{totalGB} GB</span>
                      <span className="hidden sm:inline">Total</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <FaBox className="text-yellow-500 flex-shrink-0" />
                      <span className="font-semibold">{orderItems.length}</span>
                      <span className="hidden sm:inline">Orders</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <span className="font-semibold">
                        {getCurrencySymbol(currency)}{totalPrice.toFixed(2)}
                      </span>
                      <span className="hidden sm:inline">Total</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Valid Orders */}
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-medium text-green-800 mb-3 text-sm sm:text-base">
                  Valid Orders ({validOrders.length})
                </h3>
                <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                  {validOrders.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm truncate">{item.customerPhone}</div>
                        <div className="text-xs text-gray-600">
                          {item.dataVolume} GB
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        {item.bundle && (
                          <div className="text-xs sm:text-sm font-medium text-green-600">
                            {item.bundle.currency} {item.bundle.price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invalid Orders */}
              {invalidOrders.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-medium text-red-800 mb-3 text-sm sm:text-base">
                    Invalid Orders ({invalidOrders.length})
                  </h3>
                  <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                    {invalidOrders.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">
                            {item.customerPhone}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.dataVolume} GB
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          {item.phoneError && (
                            <div className="text-xs text-red-600 truncate max-w-24 sm:max-w-32">
                              {item.phoneError}
                            </div>
                          )}
                          {item.dataError && (
                            <div className="text-xs text-red-600 truncate max-w-24 sm:max-w-32">
                              {item.dataError}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3 sm:pt-4">
                <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                  <span className="text-sm sm:text-base">Total Amount:</span>
                  <span className="text-green-600 text-sm sm:text-base">
                    GHS{" "}
                    {validOrders
                      .reduce(
                        (sum, item) =>
                          sum + (item.bundle ? item.bundle.price : 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs sm:text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading || validOrders.length === 0 || (siteStatus?.isSiteOpen === false)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="truncate">Processing...</span>
                    </>
                  ) : (siteStatus?.isSiteOpen === false) ? (
                    <>
                      <FaTimes className="flex-shrink-0" />
                      <span className="truncate">Site Under Maintenance</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="flex-shrink-0" />
                      <span className="truncate">Confirm Bulk Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
