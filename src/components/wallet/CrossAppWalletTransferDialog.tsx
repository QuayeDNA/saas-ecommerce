/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaExchangeAlt,
  FaSync,
} from "react-icons/fa";
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Input,
  Spinner,
  Textarea,
} from "../../design-system";
import { useToast } from "../../design-system/components/toast";
import { walletService } from "../../services/wallet-service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onSuccess: () => void;
}

interface FormState {
  appId: string;
  identifier: string;
  pin: string;
  amount: string;
  note: string;
}

const emptyForm: FormState = {
  appId: "",
  identifier: "",
  pin: "",
  amount: "",
  note: "",
};

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

export function CrossAppWalletTransferDialog({
  isOpen,
  onClose,
  balance,
  onSuccess,
}: Props) {
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [targets, setTargets] = useState<{ appId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    reference: string;
    status: string;
  } | null>(null);
  const [rechecking, setRechecking] = useState(false);
  const [autoChecked, setAutoChecked] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setForm(emptyForm);
      setError(null);
      setResult(null);
      setAutoChecked(false);
      setRechecking(false);
      return;
    }
    walletService
      .getTransferTargets()
      .then(setTargets)
      .catch(() => setTargets([]));
  }, [isOpen]);

  const amountNum = parseFloat(form.amount) || 0;
  const canContinue =
    form.appId !== "" &&
    form.identifier.trim() !== "" &&
    /^\d{4,6}$/.test(form.pin) &&
    amountNum > 0 &&
    amountNum <= balance;

  const runRecheck = useCallback(
    async (reference: string) => {
      setRechecking(true);
      try {
        const t = await walletService.recheckTransfer(reference);
        setResult((prev) => (prev ? { ...prev, status: t.status } : prev));
        if (t.status === "completed") {
          addToast("Transfer confirmed", "success", 5000);
        }
      } catch {
        // destination still unreachable — leave the transfer pending
      } finally {
        setRechecking(false);
      }
    },
    [addToast],
  );

  useEffect(() => {
    if (step !== 3 || result?.status !== "pending" || autoChecked) return;
    setAutoChecked(true);
    const timer = setTimeout(() => void runRecheck(result.reference), 4000);
    return () => {
      clearTimeout(timer);
      setRechecking(false);
    };
  }, [step, result, autoChecked, runRecheck]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await walletService.crossAppTransfer(form.appId, {
        identifier: form.identifier.trim(),
        pin: form.pin,
        amount: amountNum,
        note: form.note.trim() || undefined,
      });
      setResult(res);
      setStep(3);
      if (res.status === "pending") {
        setAutoChecked(false);
        addToast("Transfer submitted — awaiting confirmation", "info", 5000);
        onSuccess();
      } else {
        addToast("Transfer completed", "success", 5000);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const selectedTarget = targets.find((t) => t.appId === form.appId);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <FaExchangeAlt style={{ color: "var(--color-secondary)" }} />
          <h3
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Transfer to Another App
          </h3>
        </div>
      </DialogHeader>

      <DialogBody>
        {step === 1 && (
          <div className="space-y-4">
            <Alert status="info">
              <div className="text-sm">
                Move balance from this wallet into your wallet on another
                connected app. You verify the destination with its security PIN.
              </div>
            </Alert>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Destination App
              </label>
              <select
                value={form.appId}
                onChange={(e) => setForm((f) => ({ ...f, appId: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-[var(--bg-surface)]"
                style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              >
                <option value="">Select destination app</option>
                {targets.map((t) => (
                  <option key={t.appId} value={t.appId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Destination Identifier (email / phone / agent code)
              </label>
              <Input
                value={form.identifier}
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                placeholder="e.g. agent@directdata.shop or 0244XXXXXX"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Destination Security PIN
              </label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={form.pin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))
                }
                placeholder="••••"
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Amount (GHS)
              </label>
              <Input
                type="number"
                min={0.01}
                max={balance}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder={`Available: ${balance}`}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Note (optional)
              </label>
              <Textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional note for this transfer"
              />
            </div>

            {amountNum > balance && (
              <Alert status="error">
                <div className="text-sm">Amount exceeds your available balance.</div>
              </Alert>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Alert status="info">
              <div className="text-sm">Review your transfer before submitting.</div>
            </Alert>
            <SummaryRow
              label="Destination"
              value={selectedTarget?.name || form.appId}
            />
            <SummaryRow label="Identifier" value={form.identifier} />
            <SummaryRow label="Amount" value={`GHS ${amountNum.toFixed(2)}`} />
            {form.note && <SummaryRow label="Note" value={form.note} />}
            {error && (
              <Alert status="error">
                <div className="text-sm">{error}</div>
              </Alert>
            )}
          </div>
        )}

        {step === 3 && result && (
          result.status === "pending" ? (
            <div className="flex flex-col items-center text-center py-4">
              <Spinner />
              <p className="font-semibold text-base mt-3" style={{ color: "var(--text-primary)" }}>
                Transfer submitted
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Waiting for the destination app to confirm your transfer. This can
                take a few seconds.
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Reference: <span className="font-mono">{result.reference}</span>
              </p>
              {rechecking && (
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  Checking status…
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--success) 15%, transparent)",
                }}
              >
                <FaCheck className="text-xl" style={{ color: "var(--success)" }} />
              </div>
              <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                Transfer Completed
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Reference: <span className="font-mono">{result.reference}</span>
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Status: {result.status}
              </p>
            </div>
          )
        )}
      </DialogBody>

      <DialogFooter>
        {step === 1 && (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<FaArrowRight />}
              disabled={!canContinue}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button
              variant="outline"
              leftIcon={<FaArrowLeft />}
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button variant="primary" isLoading={loading} onClick={handleSubmit}>
              Confirm Transfer
            </Button>
          </>
        )}
        {step === 3 && (
          result?.status === "pending" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={<FaSync />}
                isLoading={rechecking}
                disabled={rechecking}
                onClick={() => void runRecheck(result.reference)}
              >
                Check status
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          )
        )}
      </DialogFooter>
    </Dialog>
  );
}
