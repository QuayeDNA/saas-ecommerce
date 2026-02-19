import React, { useState, useEffect, useContext } from "react";
import {
  FaMoneyBillWave,
  FaWhatsapp,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { Button, Input, Textarea, Alert, Tabs, TabsList, TabsTrigger, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner } from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { settingsService } from "../../services/settings.service";
import { walletService } from "../../services/wallet-service";
import { AuthContext } from "../../contexts/AuthContext";
import { canHaveWallet } from "../../utils/userTypeHelpers";

interface TopUpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
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
  error,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { addToast } = useToast();
  const { authState } = useContext(AuthContext)!;
  const user = authState?.user;
  const [stepData, setStepData] = useState<StepData>({
    amount: "",
    description: "",
    contactMethod: "whatsapp",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [minimumAmount, setMinimumAmount] = useState<number>(10); // Default fallback
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [checkingPending, setCheckingPending] = useState(false);
  // Mode: 'request' -> send admin request | 'instant' -> Paystack checkout
  const [topUpMode, setTopUpMode] = useState<'request' | 'instant'>('request');
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [isInitiatingPaystack, setIsInitiatingPaystack] = useState(false); // used to disable Paystack button & show spinner

  const totalSteps = 3;

  // Small reusable pieces to keep the component DRY
  const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Alert status="info">
      <div className="flex items-start">
        <div className="ml-3">{children}</div>
      </div>
    </Alert>
  );

  const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  // Check for pending top-up request and fetch minimum amount on modal open
  useEffect(() => {
    const checkPendingAndFetchSettings = async () => {
      if (!isOpen) return;

      // Check for pending request
      setCheckingPending(true);
      try {
        const hasPending = await walletService.checkPendingTopUpRequest();
        setHasPendingRequest(hasPending);
      } catch (error) {
        console.error("Failed to check pending top-up request:", error);
      } finally {
        setCheckingPending(false);
      }

      // Fetch minimum amount based on user type
      try {
        const walletSettings = await settingsService.getWalletSettings();
        const userType = user?.userType || "agent";

        // Get minimum for user's type, fallback to default
        const minimums = walletSettings.minimumTopUpAmounts;
        let userMinimum = minimums.default;

        if (userType === "agent" && minimums.agent) {
          userMinimum = minimums.agent;
        } else if (userType === "super_agent" && minimums.super_agent) {
          userMinimum = minimums.super_agent;
        } else if (userType === "dealer" && minimums.dealer) {
          userMinimum = minimums.dealer;
        } else if (userType === "super_dealer" && minimums.super_dealer) {
          userMinimum = minimums.super_dealer;
        }

        setMinimumAmount(userMinimum);

        // Prefer wallet-level public key endpoint (works for agents). Fallback to admin API settings only if needed.
        try {
          const { publicKey, configured } = await walletService.getPaystackPublicKey();
          // Only enable instant top-up when both publicKey and server-side configuration (secret) exist
          setPaystackEnabled(Boolean(publicKey && configured));
        } catch (err) {
          console.error('Failed to fetch Paystack public key from wallet endpoint:', err);
          // Fallback: super-admin-only API settings (may fail for non-admins)
          try {
            const apiSettings = await settingsService.getApiSettings();
            setPaystackEnabled(Boolean(apiSettings?.paystackEnabled));
          } catch (err2) {
            console.error('Fallback: failed to fetch API settings (paystack flag):', err2);
            setPaystackEnabled(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch minimum top-up amount:", error);
      }
    };

    checkPendingAndFetchSettings();
  }, [isOpen, user]);

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      const raw = stepData.amount?.toString().trim() ?? "";
      const amt = Number(raw);

      if (!raw) {
        newErrors.amount = "Amount is required";
      } else if (Number.isNaN(amt)) {
        newErrors.amount = "Enter a valid numeric amount";
      } else if (amt < minimumAmount) {
        newErrors.amount = `Amount must be at least GH₵${minimumAmount}`;
      } else if (amt > 10000) {
        newErrors.amount = "Amount cannot exceed GH₵10,000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStep1Valid = React.useMemo(() => {
    const raw = stepData.amount?.toString().trim() ?? "";
    const amt = Number(raw);
    return raw !== "" && !Number.isNaN(amt) && amt >= minimumAmount && amt <= 10000;
  }, [stepData.amount, minimumAmount]);

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    // For instant mode we go to a Paystack-specific step (step 2)
    if (currentStep === 1 && topUpMode === "instant") {
      setCurrentStep(2);
      return;
    }

    setCurrentStep((s) => Math.min(totalSteps, s + 1));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const handleInstantTopUp = async () => {
    // Start Paystack checkout for instant top-up
    if (!paystackEnabled) {
      addToast("Paystack is not enabled for this platform.", "error");
      return;
    }

    // Open a blank popup synchronously to avoid browser popup blockers
    const popup = window.open("", "_blank");
    if (!popup) {
      addToast(
        "Popup blocked by browser. Please allow popups for this site or try again.",
        "error"
      );
      return;
    }

    try {
      setIsInitiatingPaystack(true);
      const amount = parseFloat(stepData.amount);
      const init = await walletService.initiatePaystackTopUp(amount);
      // normalize response shape from walletService
      type InitResp = { authorizationUrl?: string; authorization_url?: string };
      const resp = init as InitResp;
      const authorizationUrl = resp.authorizationUrl ?? resp.authorization_url;

      if (authorizationUrl) {
        try {
          // Navigate the already-open popup to the checkout URL (preserves user gesture)
          popup.location.href = authorizationUrl;
        } catch (navErr) {
          // Some browsers disallow setting location on cross-origin blank popups; fallback to replace
          // log the navigation error (helpful in diagnostics)
          console.debug('Paystack popup navigation failed, falling back to window.open', navErr);
          popup.close();
          window.open(authorizationUrl, "_blank");
        }

        addToast(
          "Paystack checkout opened — complete payment to auto-credit your wallet.",
          "success",
          6000
        );
        handleClose();
      } else {
        popup.close();
        throw new Error("Paystack initialization did not return an authorization URL");
      }
    } catch (err: unknown) {
      // Normalize error message
      const serverMsg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'toString' in err
            ? String(err)
            : 'Failed to start Paystack checkout';

      // Friendly messages for common Paystack misconfiguration
      if (/Paystack authentication failed|secret key is not configured|invalid/i.test(serverMsg)) {
        addToast(
          'Paystack is not correctly configured on the server. Contact your administrator to set Paystack keys.',
          'error',
          8000
        );
      } else {
        addToast(serverMsg, 'error');
      }

      try {
        if (popup && !popup.closed) popup.close();
      } catch (closeErr) {
        console.debug('Failed to close popup after Paystack error', closeErr);
      }
    } finally {
      setIsInitiatingPaystack(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Instant (Paystack) flow
    if (topUpMode === "instant") {
      await handleInstantTopUp();
      return;
    }

    // Default: request -> submit admin request
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
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStepData({
      amount: "",
      description: "",
      contactMethod: "whatsapp",
    });
    setErrors({});
    setHasPendingRequest(false);
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
    <Dialog isOpen={isOpen} onClose={handleClose} size="md">
      <DialogHeader
        className="text-white"
        style={{
          background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaMoneyBillWave className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Request Wallet Top-Up</h3>
          </div>
          <Button variant="ghost" iconOnly aria-label="Close" onClick={handleClose} className="text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index + 1 <= currentStep ? "bg-white" : "bg-white/20 text-white"
                    }`}
                  style={index + 1 <= currentStep ? { color: "var(--color-primary-500)" } : {}}
                >
                  {index + 1 < currentStep ? <FaCheck className="w-4 h-4" /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${index + 1 < currentStep ? "bg-white" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-white text-center">Step {currentStep} of {totalSteps}</div>
        </div>
      </DialogHeader>

      <DialogBody>
        {checkingPending && (
          <div className="flex items-center justify-center py-4">
            <Spinner size="lg" color="primary" />
            <span className="ml-3 text-gray-600">Checking status...</span>
          </div>
        )}

        {!checkingPending && hasPendingRequest && (
          <Alert variant="solid" status="error" className="mb-4">You already have a pending top-up request. Please wait for it to be processed before making a new request.</Alert>
        )}

        {!checkingPending && !hasPendingRequest && error && (
          <Alert variant="solid" status="error" className="mb-4">{error}</Alert>
        )}

        {!checkingPending && !hasPendingRequest && (
          <>
            {currentStep === 1 && (
              <div className="space-y-4">
                <Tabs value={topUpMode} onValueChange={(v: string) => setTopUpMode(v as 'request' | 'instant')}>
                  <TabsList className="w-full justify-center">
                    <TabsTrigger value="request">Request (Admin)</TabsTrigger>
                    {paystackEnabled && canHaveWallet(user?.userType || '') ? (
                      <TabsTrigger value="instant">Instant (Paystack)</TabsTrigger>
                    ) : (
                      <div className="inline-flex items-center rounded-md px-3 py-1.5 text-sm text-gray-400" aria-hidden>
                        Instant (Paystack)
                      </div>
                    )}
                  </TabsList>
                </Tabs>

                {!paystackEnabled && <div className="text-xs text-gray-400">Paystack not enabled or server keys missing</div>}

                <div>
                  <Input
                    id="amount"
                    label={`Top-Up Amount (GH₵)`}
                    type="number"
                    min={minimumAmount}
                    step="0.01"
                    placeholder={`Minimum GH₵${minimumAmount}`}
                    value={stepData.amount}
                    onChange={(e) => updateStepData("amount", e.target.value)}
                    isInvalid={Boolean(errors.amount)}
                  />
                </div>

                <div>
                  <Textarea
                    id="description"
                    label="Description (Optional)"
                    rows={3}
                    placeholder="Reason for top-up request..."
                    value={stepData.description}
                    onChange={(e) => updateStepData("description", e.target.value)}
                    error={errors.description}
                  />
                </div>

                <InfoBox>
                  <p className="text-sm">Minimum top-up amount is GH₵{minimumAmount}. Your top-up request will be reviewed by an administrator. You'll be notified once it's processed.</p>
                </InfoBox>
              </div>
            )}

            {currentStep === 2 && topUpMode === "request" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Choose Contact Method</h4>
                  <p className="text-sm text-gray-600">Select how you'd like to inform the admin about your top-up request.</p>
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => updateStepData('contactMethod', 'whatsapp')}
                    leftIcon={
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${stepData.contactMethod === 'whatsapp' ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
                        <FaWhatsapp className={`${stepData.contactMethod === 'whatsapp' ? 'text-white' : 'text-emerald-600'} w-5 h-5`} />
                      </div>
                    }
                    rightIcon={
                      stepData.contactMethod === 'whatsapp' ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <FaCheck className="w-3.5 h-3.5 text-white flex items-end" />
                        </div>
                      ) : undefined
                    }
                    className={`w-full justify-start rounded-md p-4 ${stepData.contactMethod === 'whatsapp' ? 'bg-emerald-50 border border-emerald-100' : 'bg-white border border-gray-200'}`}
                  >
                    <div className="text-left">
                      <div className="font-medium text-gray-900">WhatsApp Message</div>
                      <div className="text-sm text-gray-500">Send a pre-filled message to admin</div>
                    </div>
                  </Button>
                </div>

                {errors.contactMethod && <p className="text-sm text-red-600">{errors.contactMethod}</p>}
              </div>
            )}

            {currentStep === 2 && topUpMode === "instant" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Pay with Paystack</h4>
                  <p className="text-sm text-gray-600">You will be redirected to Paystack to complete payment. Once the payment is successful your wallet will be automatically credited.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <SummaryRow label="Amount" value={<span>GH₵{stepData.amount || '—'}</span>} />
                  <SummaryRow label="Payment provider" value={<span>Paystack</span>} />
                </div>

                {!paystackEnabled && (
                  <Alert status="error">Paystack is not configured for this platform. Contact your administrator.</Alert>
                )}

                <p className="text-sm text-gray-500">Use the <strong>Next</strong> button below to proceed to Paystack and complete the payment.</p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Confirm Your Request</h4>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <SummaryRow label="Amount" value={<span>GH₵{stepData.amount}</span>} />

                  {stepData.description && (
                    <SummaryRow label="Description" value={<span className="font-medium text-sm">{stepData.description}</span>} />
                  )}

                  {topUpMode === 'request' ? (
                    <SummaryRow label="Contact Method" value={<span className="font-medium capitalize">{stepData.contactMethod}</span>} />
                  ) : (
                    <SummaryRow label="Payment Method" value={<span className="font-medium">Paystack (instant)</span>} />
                  )}
                </div>

                <InfoBox>
                  <p className="text-sm">
                    {topUpMode === 'request'
                      ? 'Your request will be submitted and you can contact the admin using your selected method.'
                      : 'You will be redirected to Paystack to complete the payment. On success your wallet will be auto-credited.'}
                  </p>
                </InfoBox>
              </div>
            )}
          </>
        )}
      </DialogBody>

      <DialogFooter justify="end">
        {!checkingPending && !hasPendingRequest && currentStep > 1 && (
          <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
            <FaArrowLeft className="w-4 h-4 mr-2" />
            <span>Back</span>
          </Button>
        )}

        {!checkingPending && !hasPendingRequest && currentStep < totalSteps && (
          <Button
            onClick={() => {
              if (currentStep === 2 && topUpMode === 'instant') {
                void handleInstantTopUp();
              } else {
                handleNext();
              }
            }}
            disabled={
              isSubmitting ||
              (currentStep === 1 && !isStep1Valid) ||
              (currentStep === 2 && topUpMode === 'instant' && (!paystackEnabled || isInitiatingPaystack))
            }
          >
            <span>{currentStep === 2 && topUpMode === 'instant' ? 'Proceed to Paystack' : 'Next'}</span>
            <FaArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {!checkingPending && !hasPendingRequest && currentStep === totalSteps && (
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center space-x-2">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="primary" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4 mr-2" />
                  <span>{topUpMode === 'instant' ? 'Pay with Paystack' : 'Submit Request'}</span>
                </>
              )}
            </Button>
          </div>
        )}

        {(checkingPending || hasPendingRequest) && (
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};
