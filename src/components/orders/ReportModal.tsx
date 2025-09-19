import React from "react";
import { FaExclamationTriangle, FaWhatsapp } from "react-icons/fa";
import { Button, Alert } from "../../design-system";
import { useToast } from "../../design-system/components/toast";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  orderNumber: string;
  phoneNumber: string;
  packageVolume?: string;
  provider?: string;
  orderDate?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  orderNumber,
  phoneNumber,
  packageVolume,
  provider,
  orderDate,
}) => {
  const { addToast } = useToast();

  const handleSubmit = async () => {
    try {
      // Submit the report
      await onSubmit();

      // Close the modal after successful submission
      handleClose();

      // Show success toast notification
      addToast(
        `Your data delivery report for order ${orderNumber} has been submitted successfully. The super admin will be notified.`,
        "success",
        5000
      );

      // Handle WhatsApp contact
      handleWhatsAppContact();
    } catch (error) {
      // Re-open the modal if there was an error
      // Note: handleClose() was called before onSubmit(), so we need to re-open it
      // Actually, let's not close it until we know it succeeded

      // Show error toast
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to submit report. Please try again.",
        "error",
        5000
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleWhatsAppContact = () => {
    let message = `⚠Report: Order Not Received\n\nOrder ID: ${orderNumber}\nPhone Number: ${phoneNumber}`;

    if (packageVolume) {
      message += `\nPackage Volume: ${packageVolume}`;
    }

    if (provider) {
      message += `\nProvider: ${provider}`;
    }

    if (orderDate) {
      message += `\n\nOrder Date: ${orderDate}`;
    }

    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    let whatsappUrl;

    if (isIOS) {
      // For iOS, use WhatsApp URL scheme first, then fallback to web.whatsapp.com
      const phoneNumber = "+233548983019";
      const encodedMessage = encodeURIComponent(message);

      // Try WhatsApp app first
      whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;

      // Create a fallback link for web.whatsapp.com
      const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

      // Open WhatsApp app, and if it fails, redirect to web version
      const link = document.createElement("a");
      link.href = whatsappUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      // Add a click handler to fallback to web version if app doesn't open
      link.onclick = () => {
        setTimeout(() => {
          window.open(webWhatsappUrl, "_blank", "noopener,noreferrer");
        }, 1000); // Wait 1 second, then open web version
      };

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For Android and desktop, use the standard wa.me URL
      whatsappUrl = `https://wa.me/+233548983019?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[10000]">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaExclamationTriangle className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Report Data Delivery Issue
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Data Delivery Report
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                This will notify the super admin that you haven't received data
                for order <strong>{orderNumber}</strong>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Order:</strong> {orderNumber}
                </div>
                <div>
                  <strong>Phone:</strong> {phoneNumber}
                </div>
                {packageVolume && (
                  <div>
                    <strong>Package Volume:</strong> {packageVolume}
                  </div>
                )}
                {provider && (
                  <div>
                    <strong>Provider:</strong> {provider}
                  </div>
                )}
                <div>
                  <strong>Issue:</strong> Data not received for completed order
                </div>
              </div>
            </div>

            <Alert status="warning" className="text-sm mb-6">
              <strong>Note:</strong> The super admin will be notified
              immediately via WhatsApp and will investigate this issue.
            </Alert>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
