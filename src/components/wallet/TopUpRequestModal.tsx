import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaWhatsapp,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { Button, Input, Alert } from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { settingsService } from "../../services/settings.service";

interface TopUpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => Promise<void>;
  isSubmitting: boolean;
}

type ContactMethod = "whatsapp" | null;

interface StepData {
  amount: string;
  description: string;
  contactMethod: ContactMethod;
}

export const TopUpRequestModal: React.FC<TopUpRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { addToast } = useToast();
  const [stepData, setStepData] = useState<StepData>({
    amount: "",
    description: "",
    contactMethod: "whatsapp",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [minimumAmount, setMinimumAmount] = useState<number>(10); // Default fallback

  const totalSteps = 3;

  // Fetch minimum amount on component mount
  useEffect(() => {
    const fetchMinimumAmount = async () => {
      try {
        const walletSettings = await settingsService.getWalletSettings();
        setMinimumAmount(walletSettings.minimumTopUpAmount);
      } catch (error) {
        console.error("Failed to fetch minimum top-up amount:", error);
        // Keep default value if fetch fails
      }
    };

    if (isOpen) {
      fetchMinimumAmount();
    }
  }, [isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!stepData.amount) {
        newErrors.amount = "Amount is required";
      } else if (parseFloat(stepData.amount) < minimumAmount) {
        newErrors.amount = `Amount must be at least GH₵${minimumAmount}`;
      } else if (parseFloat(stepData.amount) > 10000) {
        newErrors.amount = "Amount cannot exceed GH₵10,000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      const description =
        stepData.description || `Top-up request via ${stepData.contactMethod}`;

      // Close the modal first
      handleClose();

      // Submit the request
      await onSubmit(parseFloat(stepData.amount), description);

      // Show success toast notification
      addToast(
        `Your wallet top-up request of GH₵${stepData.amount} has been submitted successfully. You will be notified when it's processed.`,
        "success",
        5000
      );

      // Handle routing after successful submission
      if (stepData.contactMethod === "whatsapp") {
        handleWhatsAppContact();
      }
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStepData({
      amount: "",
      description: "",
      contactMethod: "whatsapp",
    });
    setErrors({});
    onClose();
  };

  const updateStepData = (
    field: keyof StepData,
    value: string | ContactMethod
  ) => {
    setStepData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hi, I need a wallet top-up of GH₵${stepData.amount}. Please process my request.`;
    const whatsappUrl = `https://wa.me/+233548983019?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
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
          <div className="bg-gradient-to-r from-[#142850] to-[#0f1f3a] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaMoneyBillWave className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">
                  Request Wallet Top-Up
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

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index + 1 <= currentStep
                          ? "bg-white text-[#142850]"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {index + 1 < currentStep ? (
                        <FaCheck className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < totalSteps - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          index + 1 < currentStep ? "bg-white" : "bg-white/20"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-white text-center">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Top-Up Amount (GH₵)
                  </label>
                  <Input
                    type="number"
                    id="amount"
                    min={minimumAmount}
                    step="0.01"
                    placeholder={`Minimum GH₵${minimumAmount}`}
                    value={stepData.amount}
                    onChange={(e) => updateStepData("amount", e.target.value)}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#142850] focus:border-[#142850] sm:text-sm"
                    placeholder="Reason for top-up request..."
                    value={stepData.description}
                    onChange={(e) =>
                      updateStepData("description", e.target.value)
                    }
                  />
                </div>

                <Alert status="info" className="mt-4">
                  <div className="flex items-start">
                    <FaCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#142850]" />
                    <div className="ml-3">
                      <p className="text-sm">
                        Minimum top-up amount is GH₵{minimumAmount}. Your top-up
                        request will be reviewed by an administrator. You'll be
                        notified once it's processed.
                      </p>
                    </div>
                  </div>
                </Alert>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Choose Contact Method
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Select how you'd like to inform the admin about your top-up
                    request:
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => updateStepData("contactMethod", "whatsapp")}
                    className={`w-full p-4 border-2 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      stepData.contactMethod === "whatsapp"
                        ? "border-[#142850] bg-[#142850]/10 text-[#142850]"
                        : "border-gray-300 hover:border-[#142850] hover:bg-[#142850]/5"
                    }`}
                  >
                    <FaWhatsapp
                      className={`w-6 h-6 ${
                        stepData.contactMethod === "whatsapp"
                          ? "text-[#142850]"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="text-left">
                      <div className="font-medium">WhatsApp Message</div>
                      <div className="text-sm opacity-75">
                        Send a pre-filled message to admin
                      </div>
                    </div>
                    {stepData.contactMethod === "whatsapp" && (
                      <FaCheck className="w-5 h-5 text-[#142850] ml-auto" />
                    )}
                  </button>
                </div>

                {errors.contactMethod && (
                  <p className="text-sm text-red-600">{errors.contactMethod}</p>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Confirm Your Request
                  </h4>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">GH₵{stepData.amount}</span>
                  </div>
                  {stepData.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-sm">
                        {stepData.description}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Method:</span>
                    <span className="font-medium capitalize">
                      {stepData.contactMethod}
                    </span>
                  </div>
                </div>

                <Alert status="info">
                  <div className="flex items-start">
                    <FaCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#142850]" />
                    <div className="ml-3">
                      <p className="text-sm">
                        Your request will be submitted and you can contact the
                        admin using your selected method.
                      </p>
                    </div>
                  </div>
                </Alert>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
            )}

            {currentStep < totalSteps && (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center space-x-2 ml-auto"
              >
                <span>Next</span>
                <FaArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === totalSteps && (
              <div className="flex space-x-3 ml-auto">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4 mr-2" />
                      <span>Submit Request</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
