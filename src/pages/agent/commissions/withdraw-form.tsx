import { useState, type FormEvent } from "react";
import { Dialog } from "../../../design-system/components/dialog";
import { DialogHeader } from "../../../design-system/components/dialog-header";
import { DialogBody } from "../../../design-system/components/dialog-body";
import { DialogFooter } from "../../../design-system/components/dialog-footer";
import { Input } from "../../../design-system/components/input";
import { Button } from "../../../design-system/components/button";
import { X, Wallet, Banknote } from "lucide-react";

interface WithdrawFormProps {
  isOpen: boolean;
  balance: number;
  withdrawing: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export const WithdrawForm = ({
  isOpen,
  balance,
  withdrawing,
  error,
  onClose,
  onSubmit,
}: WithdrawFormProps) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || val > balance) return;
    onSubmit(val);
  };

  const handleClose = () => {
    if (!withdrawing) {
      setAmount("");
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="sm">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5" style={{ color: "var(--color-secondary)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Withdraw Commission
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg transition-colors hover:bg-[var(--bg-surface-alt)]"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody>
          <div
            className="flex items-center gap-3 p-3 rounded-lg mb-4"
            style={{ background: "var(--bg-surface-alt)" }}
          >
            <Wallet className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Available Balance</p>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                GHS {balance.toFixed(2)}
              </p>
            </div>
          </div>

          <Input
            label="Amount (GHS)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to withdraw"
            min="0"
            step="0.01"
            max={balance}
            disabled={withdrawing}
          />

          {balance > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {QUICK_AMOUNTS.filter((v) => v <= balance).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v.toString())}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: "var(--bg-surface-alt)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 15%, transparent)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-surface-alt)"}
                  disabled={withdrawing}
                >
                  GHS {v}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div
              className="mt-3 text-sm p-3 rounded-lg"
              style={{
                background: "color-mix(in srgb, var(--color-error) 10%, transparent)",
                color: "var(--color-error)",
                border: "1px solid color-mix(in srgb, var(--color-error) 30%, transparent)",
              }}
            >
              {error}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={handleClose} disabled={withdrawing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance || withdrawing}
            isLoading={withdrawing}
            loadingText="Processing..."
          >
            Withdraw
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};

export default WithdrawForm;
