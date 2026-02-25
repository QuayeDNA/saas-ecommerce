// src/components/wallet/TopUpRequestModal.tsx
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { FaMoneyBillWave, FaWhatsapp, FaCheck, FaArrowLeft, FaArrowRight, FaBolt } from 'react-icons/fa';
import {
  Button, Input, Textarea, Alert, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner, Tabs, TabsList, TabsTrigger,
} from '../../design-system';
import { useToast } from '../../design-system/components/toast';
import { settingsService } from '../../services/settings.service';
import { walletService } from '../../services/wallet-service';
import { AuthContext } from '../../contexts/AuthContext';
import { canHaveWallet } from '../../utils/userTypeHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────

type TopUpMode = 'request' | 'instant';

interface FormState {
  amount: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Alert status="info">
    <div className="ml-3 text-sm">{children}</div>
  </Alert>
);

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i + 1 <= current ? 'bg-white' : 'bg-white/20 text-white'
            }`}
            style={i + 1 <= current ? { color: 'var(--color-primary-500)' } : {}}
          >
            {i + 1 < current ? <FaCheck className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-1 mx-2 transition-colors ${i + 1 < current ? 'bg-white' : 'bg-white/20'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
    <p className="text-center text-xs text-white/80">Step {current} of {total}</p>
  </div>
);

// ─── Paystack Inline Helper ───────────────────────────────────────────────────

async function loadPaystackScript(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).PaystackPop) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(s);
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const TopUpRequestModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, isSubmitting, error }) => {
  const { addToast } = useToast();
  const { authState } = useContext(AuthContext)!;
  const user = authState?.user;

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<TopUpMode>('request');
  const [form, setForm] = useState<FormState>({ amount: '', description: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});

  const [minimumAmount, setMinimumAmount] = useState(10);
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState<string | null>(null);

  const [checkingPending, setCheckingPending] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);

  const TOTAL_STEPS = 2;

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      setCheckingPending(true);
      try {
        const hasPending = await walletService.checkPendingTopUpRequest();
        setHasPendingRequest(hasPending);
      } catch {
        // Non-critical — just don't block the user
      } finally {
        setCheckingPending(false);
      }

      try {
        const walletSettings = await settingsService.getWalletSettings();
        const minimums = walletSettings.minimumTopUpAmounts;
        const userType = user?.userType ?? 'agent';
        setMinimumAmount(minimums[userType] ?? minimums.default ?? 10);
      } catch {
        // Use default minimum
      }

      try {
        const { publicKey, configured } = await walletService.getPaystackPublicKey();
        setPaystackPublicKey(publicKey || null);
        setPaystackEnabled(Boolean(publicKey && configured));
      } catch {
        setPaystackEnabled(false);
      }
    };

    init();
  }, [isOpen, user]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const parsedAmount = useMemo(() => parseFloat(form.amount || ''), [form.amount]);
  const isAmountValid = useMemo(
    () => !Number.isNaN(parsedAmount) && parsedAmount >= minimumAmount && parsedAmount <= 10_000,
    [parsedAmount, minimumAmount]
  );

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAmount = (): boolean => {
    const raw = form.amount.trim();
    if (!raw) return setError('amount', 'Amount is required'), false;
    if (Number.isNaN(parsedAmount)) return setError('amount', 'Enter a valid number'), false;
    if (parsedAmount < minimumAmount) return setError('amount', `Minimum amount is GH₵${minimumAmount}`), false;
    if (parsedAmount > 10_000) return setError('amount', 'Maximum amount is GH₵10,000'), false;
    return true;
  };

  const setError = (field: keyof FormState, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  };

  const resetModal = () => {
    setStep(1);
    setMode('request');
    setForm({ amount: '', description: '' });
    setFieldErrors({});
    setHasPendingRequest(false);
    setIsPaystackLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateAmount()) return;
    setStep(2);
  };

  const handleBack = () => {
    setFieldErrors({});
    setStep(1);
  };

  // ── Paystack Inline Checkout ───────────────────────────────────────────────

  const handlePaystackCheckout = async () => {
    if (!paystackEnabled) {
      addToast('Paystack is not enabled for this platform.', 'error');
      return;
    }

    setIsPaystackLoading(true);
    try {
      // Get checkout config from server — no DB record created yet
      const init = await walletService.initiatePaystackTopUp(parsedAmount);
      const { reference } = init;
      const publicKey = init.publicKey || paystackPublicKey;

      if (!reference) throw new Error('Missing transaction reference from server');
      if (!publicKey) throw new Error('Paystack public key unavailable');

      await loadPaystackScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) throw new Error('Paystack inline script failed to load');

      const handler = PaystackPop.setup({
        key: publicKey,
        email: user?.email,
        amount: Math.round(parsedAmount * 100), // pesewas
        currency: 'GHS',
        ref: reference,
        onClose: () => {
          // Nothing to clean up in DB — the transaction only exists after payment
          addToast('Payment window closed. No charge was made.', 'info', 4000);
          setIsPaystackLoading(false);
        },
        callback: (response: { reference: string }) => {
          // Immediately verify on the server so the wallet is credited
          walletService
            .verifyPaystackReference(response.reference)
            .then(() => {
              addToast('Payment successful! Your wallet has been credited.', 'success', 5000);
              handleClose();
            })
            .catch((verifyErr) => {
              console.error('[TopUpModal] Verification failed:', verifyErr);
              addToast(
                'Payment received but verification is pending. Your wallet will be updated shortly.',
                'warning',
                8000
              );
              handleClose();
            });
        },
      });

      handler.openIframe();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start Paystack checkout';

      if (/authentication failed|secret key/i.test(message)) {
        addToast('Paystack is not correctly configured. Contact your administrator.', 'error', 8000);
      } else if (/currency not supported/i.test(message)) {
        addToast('Paystack does not support GHS on this account. Contact your administrator.', 'error', 10000);
      } else {
        addToast(message, 'error');
      }

      setIsPaystackLoading(false);
    }
  };

  // ── Manual Request Submission ──────────────────────────────────────────────

  const handleManualSubmit = async () => {
    const description = form.description.trim() || 'Wallet top-up request via WhatsApp';
    handleClose();
    await onSubmit(parsedAmount, description);
    addToast(`Top-up request of GH₵${parsedAmount} submitted. You'll be notified when it's processed.`, 'success', 5000);
    openWhatsApp();
  };

  const openWhatsApp = () => {
    const msg = `Hi, I need a wallet top-up of GH₵${parsedAmount}. Please process my request.`;
    window.open(`https://wa.me/+233548983019?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  const isBlocked = checkingPending || hasPendingRequest;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="md">
      {/* ── Header ── */}
      <DialogHeader
        className="text-white"
        style={{ background: 'linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaMoneyBillWave className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Wallet Top-Up</h3>
          </div>
          <Button variant="ghost" iconOnly aria-label="Close" onClick={handleClose} className="text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        {!isBlocked && <StepIndicator current={step} total={TOTAL_STEPS} />}
      </DialogHeader>

      {/* ── Body ── */}
      <DialogBody className="space-y-4">
        {/* Loading state */}
        {checkingPending && (
          <div className="flex items-center justify-center py-8 gap-3 text-gray-500">
            <Spinner size="lg" color="primary" />
            <span>Checking your account…</span>
          </div>
        )}

        {/* Blocked: pending request exists */}
        {!checkingPending && hasPendingRequest && (
          <Alert status="warning" variant="solid">
            You already have a pending top-up request. Please wait for it to be processed before making a new request.
          </Alert>
        )}

        {/* External error passed from parent */}
        {!checkingPending && !hasPendingRequest && error && (
          <Alert status="error" variant="solid">{error}</Alert>
        )}

        {/* ── Step 1: Amount + Mode ── */}
        {!isBlocked && step === 1 && (
          <div className="space-y-4">
            {/* Mode selector */}
            <Tabs value={mode} onValueChange={(v: string) => setMode(v as TopUpMode)}>
              <TabsList className="w-full">
                <TabsTrigger value="request" className="flex-1">
                  Request (Admin)
                </TabsTrigger>
                {paystackEnabled && canHaveWallet(user?.userType ?? '') ? (
                  <TabsTrigger value="instant" className="flex-1 flex items-center gap-1.5">
                    <FaBolt className="w-3 h-3" /> Instant (Paystack)
                  </TabsTrigger>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed" title="Paystack not configured">
                    <FaBolt className="w-3 h-3" /> Instant (Paystack)
                  </div>
                )}
              </TabsList>
            </Tabs>

            {/* Amount input */}
            <Input
              id="amount"
              label={`Amount (GH₵)`}
              type="number"
              min={minimumAmount}
              step="0.01"
              placeholder={`Minimum GH₵${minimumAmount}`}
              value={form.amount}
              onChange={(e) => updateField('amount', e.target.value)}
              isInvalid={Boolean(fieldErrors.amount)}
              errorText={fieldErrors.amount}
            />

            {/* Optional description */}
            <Textarea
              id="description"
              label="Description (optional)"
              rows={2}
              placeholder="Reason for top-up…"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />

            {/* Mode-specific info */}
            {mode === 'request' ? (
              <InfoBox>
                Your request will be reviewed by an administrator. You'll be notified and can follow up via WhatsApp once submitted.
              </InfoBox>
            ) : (
              <InfoBox>
                Pay instantly via Paystack. Your wallet is credited automatically on payment confirmation — no admin approval needed.
              </InfoBox>
            )}
          </div>
        )}

        {/* ── Step 2: Confirm ── */}
        {!isBlocked && step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Confirm Your {mode === 'instant' ? 'Payment' : 'Request'}</h4>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              <SummaryRow label="Amount" value={`GH₵${parsedAmount.toFixed(2)}`} />
              {form.description && <SummaryRow label="Description" value={form.description} />}
              {mode === 'request' ? (
                <>
                  <SummaryRow label="Method" value="Admin approval" />
                  <SummaryRow label="Follow-up" value={<span className="flex items-center gap-1"><FaWhatsapp className="text-green-500" /> WhatsApp</span>} />
                </>
              ) : (
                <SummaryRow label="Payment gateway" value="Paystack (instant)" />
              )}
            </div>

            {mode === 'instant' ? (
              <InfoBox>
                Clicking <strong>Pay Now</strong> will open the Paystack payment window. Your wallet is credited immediately after a successful payment.
              </InfoBox>
            ) : (
              <InfoBox>
                After submitting, a WhatsApp message will open so you can notify the admin directly.
              </InfoBox>
            )}
          </div>
        )}
      </DialogBody>

      {/* ── Footer ── */}
      <DialogFooter justify="end">
        {isBlocked && (
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        )}

        {!isBlocked && step === 1 && (
          <Button onClick={handleNext} disabled={!isAmountValid}>
            <span>Next</span>
            <FaArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        )}

        {!isBlocked && step === 2 && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleBack} disabled={isSubmitting || isPaystackLoading}>
              <FaArrowLeft className="w-3.5 h-3.5 mr-2" />
              <span>Back</span>
            </Button>

            {mode === 'request' ? (
              <Button onClick={handleManualSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Spinner size="sm" color="primary" /><span className="ml-2">Submitting…</span></>
                ) : (
                  <><FaCheck className="w-3.5 h-3.5 mr-2" /><span>Submit Request</span></>
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePaystackCheckout}
                disabled={!paystackEnabled || isPaystackLoading}
              >
                {isPaystackLoading ? (
                  <><Spinner size="sm" color="primary" /><span className="ml-2">Opening Paystack…</span></>
                ) : (
                  <><FaBolt className="w-3.5 h-3.5 mr-2" /><span>Pay Now</span></>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogFooter>
    </Dialog>
  );
};