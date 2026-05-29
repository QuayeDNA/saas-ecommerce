import { FaMoneyBillWave } from "react-icons/fa";
import { Card, CardBody } from "../../../design-system/components/card";
import { Input } from "../../../design-system/components/input";
import { Button } from "../../../design-system/components/button";
import { Alert } from "../../../design-system/components/alert";

interface WithdrawFormProps {
  balance: number;
  withdrawAmount: string;
  withdrawing: boolean;
  withdrawError: string | null;
  withdrawResult: { commissionBalance: number } | null;
  onAmountChange: (value: string) => void;
  onWithdraw: () => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export const WithdrawForm = ({
  balance,
  withdrawAmount,
  withdrawing,
  withdrawError,
  withdrawResult,
  onAmountChange,
  onWithdraw,
}: WithdrawFormProps) => {
  return (
    <Card variant="outlined">
      <CardBody>
        <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <FaMoneyBillWave className="w-4 h-4" style={{ color: "var(--color-secondary)" }} /> Withdraw Commission
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="w-full sm:w-64">
            <Input
              label="Amount (GHS)"
              type="number"
              value={withdrawAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="Enter amount to withdraw"
              leftIcon={<FaMoneyBillWave style={{ color: "var(--text-muted)" }} />}
              min="0"
              step="0.01"
            />
          </div>
          <Button
            variant="primary"
            onClick={onWithdraw}
            disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            isLoading={withdrawing}
            loadingText="Processing..."
            className="w-full sm:w-auto"
          >
            Withdraw
          </Button>
        </div>
        {balance > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {QUICK_AMOUNTS.filter((v) => v <= balance).map((v) => (
              <button
                key={v}
                onClick={() => onAmountChange(v.toString())}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: "var(--bg-surface-alt)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 15%, transparent)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-surface-alt)"}
              >
                GHS {v}
              </button>
            ))}
          </div>
        )}
        {withdrawError && (
          <Alert status="error" variant="subtle" className="mt-3">
            {withdrawError}
          </Alert>
        )}
        {withdrawResult && (
          <Alert status="success" variant="subtle" className="mt-3">
            Withdrawal of GHS {parseFloat(withdrawAmount).toFixed(2)} successful! New commission balance: GHS {(withdrawResult.commissionBalance ?? balance).toFixed(2)}
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};
