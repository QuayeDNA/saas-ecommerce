/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/orders/SingleOrderModal.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaPhone,
  FaWifi,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useOrder } from "../../contexts/OrderContext";
import { useSiteStatus } from "../../contexts/site-status-context";
import { useAuth } from "../../hooks/use-auth";
import { getProviderColors } from "../../utils/provider-colors";
import {
  getPriceForUserType,
  formatCurrency,
} from "../../utils/pricingHelpers";
import { DuplicateOrderWarningModal } from "./DuplicateOrderWarningModal";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Card,
  CardBody,
  Alert,
  Spinner,
  Input,
  useToast,
} from "../../design-system";
import type { Bundle } from "../../types/package";
import type {
  CreateSingleOrderData,
  DuplicateCheckResult,
} from "../../types/order";

/**
 * SingleOrderModal expects a Bundle object that is fetched using the new ProviderPackageDisplay logic.
 * The bundle should be for the selected package and contain all required fields.
 */
interface SingleOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bundle: Bundle; // Must be fetched using ProviderPackageDisplay or direct bundleService
}

export const SingleOrderModal: React.FC<SingleOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bundle,
}) => {
  const { createSingleOrder, loading } = useOrder();
  const { siteStatus } = useSiteStatus();
  const { authState } = useAuth();
  const { addToast } = useToast();
  const userType = authState.user?.userType;
  const navigate = useNavigate();
  const [customerPhone, setCustomerPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{
    bundle: {
      name: string;
      dataVolume: number;
      dataUnit: string;
      validity: number;
      validityUnit: string;
      price: number;
      currency: string;
    };
    customerPhone: string;
    totalPrice: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateInfo, setDuplicateInfo] =
    useState<DuplicateCheckResult | null>(null);
  const [pendingOrderData, setPendingOrderData] =
    useState<CreateSingleOrderData | null>(null);

  // Get provider colors for branding
  const providerColors = getProviderColors(
    bundle.provider?.toString() || "MTN"
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCustomerPhone("");
      setPhoneError("");
      setShowSummary(false);
      setOrderSummary(null);
      setError(null);
    }
  }, [isOpen]);

  // Validate phone number - simplified validation
  const validatePhone = (phone: string): boolean => {
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
      setPhoneError("Remove unnecessary spaces between digits");
      return false;
    }

    // Check length - must be exactly 10 digits
    if (localPhone.length !== 10) {
      if (localPhone.length > 10) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError("Phone number must be exactly 10 digits");
      }
      return false;
    }

    // Check if it starts with 0
    if (!localPhone.startsWith("0")) {
      setPhoneError("Phone number must start with 0");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (value: string) => {
    setCustomerPhone(value);
    // Clear any existing phone error when user starts typing
    if (phoneError) {
      setPhoneError("");
    }
  };

  const handleContinue = () => {
    if (!validatePhone(customerPhone)) {
      return;
    }

    // Create order summary with user-specific pricing
    const userPrice = getPriceForUserType(bundle, userType);
    const summary = {
      bundle: {
        name: bundle.name,
        dataVolume: bundle.dataVolume,
        dataUnit: bundle.dataUnit,
        validity: bundle.validity,
        validityUnit: bundle.validityUnit,
        price: userPrice,
        currency: bundle.currency,
      },
      customerPhone: customerPhone.replace(/^\+?233/, "0"),
      totalPrice: userPrice,
    };

    // Fix type error: ensure validity and validityUnit are strings/numbers as expected
    setOrderSummary({
      ...summary,
      bundle: {
        ...summary.bundle,
        validity:
          typeof summary.bundle.validity === "number"
            ? summary.bundle.validity
            : 0,
        validityUnit:
          typeof summary.bundle.validityUnit === "string"
            ? summary.bundle.validityUnit
            : "",
      },
    });
    setShowSummary(true);
  };

  const handleConfirmOrder = async () => {
    try {
      setError(null);

      // Check if site is closed
      if (siteStatus && !siteStatus.isSiteOpen) {
        setError(
          `Site is currently under maintenance: ${siteStatus.customMessage}`
        );
        return;
      }

      const orderData: CreateSingleOrderData = {
        packageGroupId:
          typeof bundle.packageId === "object" &&
          bundle.packageId !== null &&
          "_id" in bundle.packageId
            ? (bundle.packageId as { _id: string })._id
            : bundle.packageId,
        packageItemId: bundle._id || "",
        customerPhone: customerPhone.replace(/^\+?233/, "0"),
        bundleSize: {
          value: bundle.dataVolume,
          unit: bundle.dataUnit as "MB" | "GB",
        },
        quantity: 1,
      };

      await createSingleOrder(orderData);

      // Order created successfully (including draft orders)
      addToast("Order created successfully", "success");
      onSuccess();
      onClose();
      navigate("/agent/dashboard/orders");
    } catch (err: any) {
      // Check if this is a duplicate order error
      if (err && err.code === "DUPLICATE_ORDER_DETECTED") {
        const orderData: CreateSingleOrderData = {
          packageGroupId:
            typeof bundle.packageId === "object" &&
            bundle.packageId !== null &&
            "_id" in bundle.packageId
              ? (bundle.packageId as { _id: string })._id
              : bundle.packageId,
          packageItemId: bundle._id || "",
          customerPhone: customerPhone.replace(/^\+?233/, "0"),
          bundleSize: {
            value: bundle.dataVolume,
            unit: bundle.dataUnit as "MB" | "GB",
          },
          quantity: 1,
        };

        setPendingOrderData(orderData);
        setDuplicateInfo(err.duplicateInfo);
        setShowDuplicateWarning(true);
        return;
      }

      if (err instanceof Error) {
        const errorMessage = err.message;

        // Check if this is a draft order (insufficient wallet balance)
        if (
          errorMessage.includes("draft") ||
          errorMessage.includes("insufficient")
        ) {
          setError(errorMessage);
          addToast("Order created as draft due to insufficient wallet balance", "warning");
          // Don't close modal, let user see the error and potentially top up wallet
          return;
        }

        // Check if site is closed
        if (
          errorMessage.includes("maintenance") ||
          errorMessage.includes("Site is currently under maintenance")
        ) {
          setError(errorMessage);
          addToast("Site is currently under maintenance", "error");
          return;
        }

        setError(errorMessage || "Failed to create order");
        addToast(errorMessage || "Failed to create order", "error");
      } else {
        setError("Failed to create order");
      }
    }
  };

  const handleBack = () => {
    setShowSummary(false);
    setOrderSummary(null);
  };

  // Handle duplicate order warning actions
  const handleDuplicateProceed = async () => {
    if (pendingOrderData) {
      try {
        setShowDuplicateWarning(false);

        // Add forceOverride flag and retry order creation
        const orderDataWithOverride = {
          ...pendingOrderData,
          forceOverride: true,
        };
        await createSingleOrder(orderDataWithOverride);

        // Order created successfully
        addToast("Order created successfully", "success");
        onSuccess();
        onClose();
        navigate("/agent/dashboard/orders");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Failed to create order after override");
        } else {
          setError("Failed to create order after override");
        }
      } finally {
        setPendingOrderData(null);
        setDuplicateInfo(null);
      }
    }
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateWarning(false);
    setPendingOrderData(null);
    setDuplicateInfo(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {showSummary ? "Order Summary" : "Order Bundle"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes size={20} />
        </Button>
      </DialogHeader>

      <DialogBody>
        {!showSummary ? (
          // Order Form
          <div className="space-y-4">
            {/* Bundle Info */}
            <Card>
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{bundle.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {bundle.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-lg font-bold"
                      style={{ color: providerColors.primary }}
                    >
                      {formatCurrency(
                        getPriceForUserType(bundle, userType),
                        bundle.currency
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaWifi className="text-blue-500" />
                    <span>
                      {bundle.dataVolume} {bundle.dataUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-green-500" />
                    <span>
                      {bundle.validity === "unlimited" &&
                      bundle.validityUnit === "unlimited"
                        ? "Unlimited"
                        : `${bundle.validity} ${bundle.validityUnit}`}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="Phone Number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Customer Phone Number
              </label>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter 10-digit phone number"
                leftIcon={<FaPhone className="text-gray-400" />}
                isInvalid={!!phoneError}
                errorText={phoneError}
              />
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={
                !customerPhone || loading || siteStatus?.isSiteOpen === false
              }
              className="w-full"
              style={{
                backgroundColor: providerColors.primary,
                color: providerColors.text,
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : siteStatus && !siteStatus.isSiteOpen ? (
                "Site Under Maintenance"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        ) : (
          // Order Summary
          <div className="space-y-4">
            {/* Bundle Summary */}
            <Card>
              <CardBody>
                <h3 className="font-medium text-gray-900 mb-3">
                  Bundle Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle:</span>
                    <span className="font-medium">
                      {orderSummary?.bundle.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">
                      {orderSummary?.bundle.dataVolume}{" "}
                      {orderSummary?.bundle.dataUnit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validity:</span>
                    <span className="font-medium">
                      {orderSummary?.bundle.validityUnit === "unlimited"
                        ? "Unlimited"
                        : `${orderSummary?.bundle.validity} ${orderSummary?.bundle.validityUnit}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span
                      className="font-bold"
                      style={{ color: providerColors.primary }}
                    >
                      {orderSummary?.bundle.currency}{" "}
                      {orderSummary?.bundle.price}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardBody>
                <h3 className="font-medium text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone className="text-blue-500" />
                  <span>{orderSummary?.customerPhone}</span>
                </div>
              </CardBody>
            </Card>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span style={{ color: providerColors.primary }}>
                  {orderSummary?.bundle.currency} {orderSummary?.totalPrice}
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
          <div className="flex gap-3 w-full">
            <Button variant="secondary" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={loading || siteStatus?.isSiteOpen === false}
              className="flex-1"
              style={{
                backgroundColor: providerColors.primary,
                color: providerColors.text,
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : siteStatus && !siteStatus.isSiteOpen ? (
                <>
                  <FaTimes />
                  Site Under Maintenance
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Confirm Order
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      )}

      {/* Duplicate Order Warning Modal */}
      {duplicateInfo && (
        <DuplicateOrderWarningModal
          isOpen={showDuplicateWarning}
          onClose={handleDuplicateCancel}
          onProceed={handleDuplicateProceed}
          onCancel={handleDuplicateCancel}
          duplicateInfo={duplicateInfo}
          orderType="single"
        />
      )}
    </Dialog>
  );
};
