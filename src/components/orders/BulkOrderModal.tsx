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
import { getProviderColors } from "../../utils/provider-colors";
import { 
  Dialog, 
  DialogHeader, 
  DialogBody, 
  DialogFooter,
  Button, 
  Card, 
  CardBody, 
  Badge, 
  Alert, 
  Spinner
} from "../../design-system";
import type { Bundle } from "../../types/package";

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

  // Get provider colors for branding
  const providerColors = getProviderColors(provider);

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

  // Fetch bundles for the selected packageId - get all bundles without pagination
  useEffect(() => {
    if (isOpen && packageId) {
      bundleService
        .getBundlesByPackage(packageId, { limit: 1000 })
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
      // Parse format: "Number 10" (assume GB) - handle multiple spaces
      const parts = line.split(/\s+/);
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
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-gray-900 truncate">
          {showSummary
            ? "Bulk Order Summary"
            : `Bulk Order for ${providerName}`}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={18} />
        </Button>
      </DialogHeader>

      <DialogBody>
        {!showSummary ? (
          // Order Form
          <div className="space-y-4">
            {/* Package Info */}
            <Card variant="outlined">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {providerName} Package
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Available bundles in this package
                    </p>
                  </div>
                </div>
                {/* Make available bundles scrollable */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Array.isArray(availableBundles) &&
                    availableBundles.length > 0 &&
                    availableBundles.map((bundle: Bundle) => (
                      <div
                        key={bundle._id}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FaWifi className="text-blue-500 flex-shrink-0" />
                          <span className="truncate">
                            {bundle.dataVolume} {bundle.dataUnit}
                          </span>
                          <span className="text-gray-500 hidden sm:inline">•</span>
                          <FaClock className="text-green-500 flex-shrink-0" />
                          <span className="truncate">
                            {bundle.validityUnit === 'unlimited'
                              ? 'Unlimited'
                              : `${bundle.validity} ${bundle.validityUnit}`}
                          </span>
                        </div>
                        <div 
                          className="font-bold text-sm flex-shrink-0 ml-2"
                          style={{ color: providerColors.primary }}
                        >
                          {bundle.currency} {bundle.price}
                        </div>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>

            {/* Import Method Selection */}
            <Card>
              <CardBody>
                <h3 className="font-medium text-gray-900 mb-4">
                  Import Method
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={importMethod === "file" ? "primary" : "secondary"}
                    onClick={() => setImportMethod("file")}
                    className="flex-1"
                    style={importMethod === "file" ? {
                      backgroundColor: providerColors.primary,
                      color: providerColors.text
                    } : {}}
                  >
                    <FaFileUpload className="flex-shrink-0" />
                    <span className="truncate">Import CSV/Excel</span>
                  </Button>
                  <Button
                    variant={importMethod === "manual" ? "primary" : "secondary"}
                    onClick={() => setImportMethod("manual")}
                    className="flex-1"
                    style={importMethod === "manual" ? {
                      backgroundColor: providerColors.primary,
                      color: providerColors.text
                    } : {}}
                  >
                    <FaPlus className="flex-shrink-0" />
                    <span className="truncate">Manual Entry</span>
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* File Upload */}
            {importMethod === "file" && (
              <Card>
                <CardBody>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h3 className="font-medium text-gray-900">Upload File</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadTemplate}
                      className="text-blue-600 hover:text-blue-700 self-start sm:self-center"
                    >
                      <FaDownload className="flex-shrink-0" />
                      <span className="truncate">Download Template</span>
                    </Button>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: CSV, Excel. Format: PhoneNumber DataVolume
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Manual Entry */}
            {importMethod === "manual" && (
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      Bulk Order Input
                    </h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter orders (one per line)
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => handleBulkTextChange(e.target.value)}
                      placeholder={`0241234567 5\n0201234567 2\n0271234567 1`}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Format: PhoneNumber DataVolume (e.g., 0241234567 5). All values are in GB.<br/>
                      <span className="text-red-500 font-semibold">Do not type GB or MB, just the number.</span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Alert status="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={orderItems.length === 0 || loading || (siteStatus?.isSiteOpen === false)}
              className="w-full"
              style={{ 
                backgroundColor: providerColors.primary, 
                color: providerColors.text 
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : (siteStatus?.isSiteOpen === false) ? (
                'Site Under Maintenance'
              ) : (
                `Continue (${orderItems.length} items)`
              )}
            </Button>
          </div>
        ) : (
          // Order Summary
          <div className="space-y-4">
            {/* Package Summary Mini Card */}
            <Card>
              <CardBody>
                <div
                  className="rounded-lg flex items-center gap-4 p-4 mb-4"
                  style={{
                    backgroundColor: providerColors.background,
                    border: `1.5px solid ${providerColors.primary}`,
                  }}
                >
                  <div
                    className="flex items-center justify-center w-14 h-14 rounded-full flex-shrink-0"
                    style={{ backgroundColor: providerColors.primary }}
                  >
                    <FaWifi
                      className="text-2xl"
                      style={{ color: providerColors.text }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <span
                        className="text-lg font-bold truncate"
                        style={{ color: providerColors.primary }}
                      >
                        {providerName}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <Badge colorScheme="success" size="sm">
                          <FaCheckCircle className="flex-shrink-0" />
                          {validOrders.length} Valid
                        </Badge>
                        <Badge colorScheme="error" size="sm">
                          <FaExclamationCircle className="flex-shrink-0" />
                          {invalidOrders.length} Invalid
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
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
              </CardBody>
            </Card>

            {/* Valid Orders */}
            <Card>
              <CardBody>
                <h3 className="font-medium text-green-800 mb-3">
                  Valid Orders ({validOrders.length})
                </h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {validOrders.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.customerPhone}</div>
                        <div className="text-xs text-gray-600">
                          {item.dataVolume} GB
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        {item.bundle && (
                          <div 
                            className="text-sm font-medium"
                            style={{ color: providerColors.primary }}
                          >
                            {item.bundle.currency} {item.bundle.price}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Invalid Orders */}
            {invalidOrders.length > 0 && (
              <Card>
                <CardBody>
                  <h3 className="font-medium text-red-800 mb-3">
                    Invalid Orders ({invalidOrders.length})
                  </h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {invalidOrders.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {item.customerPhone}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.dataVolume} GB
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          {item.phoneError && (
                            <div className="text-xs text-red-600 truncate max-w-32">
                              {item.phoneError}
                            </div>
                          )}
                          {item.dataError && (
                            <div className="text-xs text-red-600 truncate max-w-32">
                              {item.dataError}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span 
                  style={{ color: providerColors.primary }}
                >
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
              <Alert status="error" title="Error">
                {error}
              </Alert>
            )}
          </div>
        )}
      </DialogBody>

      {showSummary && (
        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="secondary"
              onClick={handleBack}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={loading || validOrders.length === 0 || (siteStatus?.isSiteOpen === false)}
              className="flex-1"
              style={{ 
                backgroundColor: providerColors.primary, 
                color: providerColors.text 
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : (siteStatus?.isSiteOpen === false) ? (
                <>
                  <FaTimes className="flex-shrink-0" />
                  Site Under Maintenance
                </>
              ) : (
                <>
                  <FaCheckCircle className="flex-shrink-0" />
                  Confirm Bulk Order
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      )}
    </Dialog>
  );
}; 
