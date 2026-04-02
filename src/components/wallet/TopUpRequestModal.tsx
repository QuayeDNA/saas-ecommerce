// src/components/wallet/TopUpRequestModal.tsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { FaMoneyBillWave, FaWhatsapp, FaCheck, FaArrowLeft, FaArrowRight, FaBolt } from 'react-icons/fa';
import {
  Button, Input, Textarea, Alert, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner,
} from '../../design-system';
import { useToast } from '../../design-system/components/toast';
import { settingsService, type FeeSettings } from '../../services/settings.service';
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

const StepProgress: React.FC<{ current: number; steps: string[] }> = ({ current, steps }) => (
  <div className="flex items-center gap-1.5">
    {steps.map((_, idx) => {
      const stepNum = idx + 1;
      return (
        <React.Fragment key={stepNum}>
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all duration-300"
            style={stepNum <= current
              ? { backgroundColor: 'var(--color-primary-500)', color: '#fff' }
              : { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
          >
            {stepNum < current ? <FaCheck className="w-3.5 h-3.5" /> : stepNum}
          </div>
          {stepNum < steps.length && (
            <div
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: stepNum < current ? '#fff' : 'rgba(255,255,255,0.2)' }}
            />
          )}
        </React.Fragment>
      );
    })}
    <span className="ml-2 text-xs text-white/80 font-semibold whitespace-nowrap">
      {steps[current - 1]}
    </span>
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
  const [paystackMinimum, setPaystackMinimum] = useState(0);
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState<string | null>(null);

  const [checkingPending, setCheckingPending] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);
  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(null);

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
        const key = userType as keyof typeof minimums;
        setMinimumAmount(minimums[key] ?? minimums.default ?? 10);
        setPaystackMinimum(walletSettings.paystackMinimumTopUpAmount ?? 0);
      } catch {
        // Use default minimum
      }

      try {
        const { publicKey, configured, walletTopUpEnabled, paystackEnabled: paystackAllowed } = await walletService.getPaystackPublicKey();
        setPaystackPublicKey(publicKey || null);
        setPaystackEnabled(Boolean(publicKey && configured && walletTopUpEnabled && paystackAllowed));
      } catch {
        setPaystackEnabled(false);
      }

      try {
        const fees = await settingsService.getFeeSettings();
        setFeeSettings(fees);
      } catch {
        // Non-critical — fee preview just won't show
      }
    };

    init();
  }, [isOpen, user]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const parsedAmount = useMemo(() => parseFloat(form.amount || ''), [form.amount]);
  // effective minimum depends on mode:
  // - request mode uses the user-type minimum (admin-defined per role)
  // - instant (Paystack) mode uses the global Paystack minimum (regardless of role)
  //   (fall back to the role minimum when Paystack minimum isn't configured)
  const effectiveMinimum = useMemo(() => {
    if (mode === 'instant') {
      return paystackMinimum > 0 ? paystackMinimum : minimumAmount;
    }
    return minimumAmount;
  }, [mode, minimumAmount, paystackMinimum]);
  const isAmountValid = useMemo(
    () => !Number.isNaN(parsedAmount) && parsedAmount >= effectiveMinimum && parsedAmount <= 10_000,
    [parsedAmount, effectiveMinimum]
  );

  // ── Fee preview ───────────────────────────────────────────────────────────

  const collectionFeePreview = useMemo(() => {
    if (!feeSettings || !isAmountValid || Number.isNaN(parsedAmount)) return null;
    const paystackPercent = feeSettings.walletTopUpCollectionFeePercent ?? feeSettings.paystackCollectionFeePercent ?? 0;
    const platformPercent = feeSettings.walletTopUpPlatformFeePercent ?? feeSettings.platformFeePercent ?? 0;
    const delegateFees = feeSettings.walletTopUpDelegateFeesToCustomer ?? feeSettings.delegateFeesToCustomer ?? true;
    const totalFeePercent = paystackPercent + platformPercent;
    if (totalFeePercent <= 0) return null;

    if (delegateFees) {
      // delegateFeesToCustomer=true → agent PAYS the fee (gross-up)
      // Goal: wallet credited parsedAmount; agent charged parsedAmount + fee
      const agentPays = Math.round((parsedAmount / (1 - totalFeePercent / 100)) * 100) / 100;
      const feeAmount = Math.round((agentPays - parsedAmount) * 100) / 100;
      return {
        feePercent: totalFeePercent,
        feeAmount,
        netCredit: parsedAmount,   // wallet always gets what they entered
        agentPays,                 // this is what Paystack charges them
        agentBearsFee: true,
      };
    } else {
      // delegateFeesToCustomer=false → platform absorbs fee
      // Agent pays parsedAmount, wallet credited parsedAmount, platform pays the fee
      return {
        feePercent: totalFeePercent,
        feeAmount: Math.round(parsedAmount * (totalFeePercent / 100) * 100) / 100,
        netCredit: parsedAmount,
        agentPays: parsedAmount,
        agentBearsFee: false,
      };
    }
  }, [feeSettings, parsedAmount, isAmountValid]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAmount = (): boolean => {
    const raw = form.amount.trim();
    if (!raw) return setError('amount', 'Amount is required'), false;
    if (Number.isNaN(parsedAmount)) return setError('amount', 'Enter a valid number'), false;
    const minReq = mode === 'instant' ? effectiveMinimum : minimumAmount;
    if (parsedAmount < minReq) {
      return setError('amount', `Minimum amount is GH₵${minReq}`), false;
    }
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
        amount: init.amountPesewas,   // gross charge in pesewas (includes fee if delegated)
        currency: 'GHS',
        ref: reference,
        metadata: {
          type: 'wallet_topup',
          userId: user?.id ?? user?._id,
          userName: user?.fullName,
          targetCreditAmount: init.targetCreditAmount, // wallet credit amount (pre-fee)
          chargeAmount: init.chargeAmount,
          paystackFee: init.paystackFee,
          platformFee: init.platformFee,
          totalFee: init.totalFee,
          feesDelegate: init.feesDelegate,
        },
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
        {!isBlocked && (
          <StepProgress
            current={step}
            steps={["Amount & Method", "Confirm"]}
          />
        )}
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
            {/* Mode selector — visual selection cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Admin request card */}
              <button
                type="button"
                onClick={() => setMode('request')}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 ${mode === 'request'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
                  }`}
              >
                {mode === 'request' && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                    <FaCheck className="h-2 w-2" />
                  </span>
                )}
                <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${mode === 'request' ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                  <FaWhatsapp className={`h-4 w-4 ${mode === 'request' ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div className="text-center leading-tight">
                  <p className="font-semibold">Admin Request</p>
                  <p className={`mt-0.5 text-xs ${mode === 'request' ? 'text-blue-500' : 'text-gray-400'}`}>Via WhatsApp</p>
                </div>
              </button>

              {/* Paystack instant card */}
              <button
                type="button"
                onClick={paystackEnabled && canHaveWallet(user?.userType ?? '') ? () => setMode('instant') : undefined}
                disabled={!paystackEnabled || !canHaveWallet(user?.userType ?? '')}
                title={!paystackEnabled ? 'Paystack not configured' : undefined}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${!paystackEnabled || !canHaveWallet(user?.userType ?? '')
                  ? 'border-gray-200 bg-gray-50 text-gray-400'
                  : mode === 'instant'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
                  }`}
              >
                {mode === 'instant' && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <FaCheck className="h-2 w-2" />
                  </span>
                )}
                <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${mode === 'instant' && paystackEnabled ? 'bg-emerald-100' : 'bg-gray-200'
                  }`}>
                  <FaBolt className={`h-4 w-4 ${mode === 'instant' && paystackEnabled ? 'text-emerald-600' : 'text-gray-500'}`} />
                </div>
                <div className="text-center leading-tight">
                  <p className="font-semibold">Instant Pay</p>
                  <p className={`mt-0.5 text-xs ${mode === 'instant' && paystackEnabled ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {paystackEnabled ? 'Via Paystack' : 'Not available'}
                  </p>
                </div>
              </button>
            </div>

            {/* Amount input */}
            <Input
              id="amount"
              label={`Amount (GH₵)`}
              type="number"
              min={effectiveMinimum}
              step="0.01"
              placeholder={`Minimum GH₵${effectiveMinimum}`}
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

            {/* Fee preview (instant mode only) */}
            {mode === 'instant' && collectionFeePreview && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm space-y-1.5">
                <p className="font-medium text-blue-800 text-xs uppercase tracking-wide">Fee breakdown</p>
                <div className="flex justify-between text-gray-600">
                  <span>Wallet credited</span>
                  <span className="font-medium text-green-700">GH₵{collectionFeePreview.netCredit.toFixed(2)}</span>
                </div>
                {collectionFeePreview.agentBearsFee ? (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span>Processing fee ({collectionFeePreview.feePercent.toFixed(2)}%)</span>
                      <span>+ GH₵{collectionFeePreview.feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-blue-200 pt-1.5">
                      <span className="text-gray-800">You will be charged</span>
                      <span className="text-gray-900">GH₵{collectionFeePreview.agentPays.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 border-t border-blue-200 pt-1.5">Processing fee is covered by the platform — you are charged exactly GH₵{parsedAmount.toFixed(2)}.</p>
                )}
              </div>
            )}

            {/* Mode-specific info */}
            {mode === 'request' ? (
              <InfoBox>
                Your request will be reviewed by an administrator. You'll be notified and can follow up via WhatsApp once submitted.
              </InfoBox>
            ) : (
              <InfoBox>
                Pay instantly via Paystack. Your wallet is credited automatically on payment confirmation — no admin approval needed.
                {paystackMinimum > 0 && (
                  <p className="mt-1 text-xs text-white/80">
                    Minimum GH₵{paystackMinimum} applies to instant top-ups.
                  </p>
                )}
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
                <>
                  <SummaryRow label="Payment gateway" value="Paystack (instant)" />
                  <SummaryRow
                    label="Wallet credited"
                    value={<span className="text-green-600 font-semibold">GH₵{parsedAmount.toFixed(2)}</span>}
                  />
                  {collectionFeePreview?.agentBearsFee ? (
                    <>
                      <SummaryRow
                        label={`Processing fee (${collectionFeePreview.feePercent.toFixed(2)}%)`}
                        value={<span className="text-orange-600">+ GH₵{collectionFeePreview.feeAmount.toFixed(2)}</span>}
                      />
                      <div className="border-t border-gray-200 pt-2">
                        <SummaryRow
                          label="Total charged by Paystack"
                          value={<span className="font-bold text-gray-900">GH₵{collectionFeePreview.agentPays.toFixed(2)}</span>}
                        />
                      </div>
                    </>
                  ) : collectionFeePreview ? (
                    <SummaryRow label="Processing fee" value={<span className="text-gray-400 text-xs">Covered by platform</span>} />
                  ) : null}
                </>
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