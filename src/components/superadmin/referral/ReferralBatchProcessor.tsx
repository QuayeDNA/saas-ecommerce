import { Card, CardBody, Button, Alert } from "../../../design-system";
import { FaCalendarCheck, FaPlay, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

interface BatchResult {
  success: boolean;
  message: string;
  data?: { processed: number; skipped: number; message: string; date: string };
}

interface ReferralBatchProcessorProps {
  processing: boolean;
  batchResult: BatchResult | null;
  onProcess: () => void;
}

export const ReferralBatchProcessor = ({ processing, batchResult, onProcess }: ReferralBatchProcessorProps) => (
  <Card variant="outlined">
    <CardBody>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <FaCalendarCheck className="w-4 h-4 text-[var(--color-secondary)]" /> Daily Batch Processing
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Manually trigger the daily commission calculation for all referred users
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onProcess}
          disabled={processing}
          isLoading={processing}
          loadingText="Processing..."
          leftIcon={<FaPlay className="w-4 h-4" />}
        >
          Run Daily Batch
        </Button>
      </div>
      {batchResult && (
        <div className="mt-4">
          {batchResult.success !== false ? (
            <Alert status="success" variant="subtle">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="w-4 h-4" />
                <span>{batchResult.message || "Commission calculation complete"}</span>
              </div>
            </Alert>
          ) : (
            <Alert status="error" variant="subtle">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="w-4 h-4" />
                <span>{batchResult.message || "Batch processing failed"}</span>
              </div>
            </Alert>
          )}
          {batchResult.data && batchResult.success !== false && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[var(--bg-surface-alt)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--text-muted)]">Processed</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{batchResult.data.processed}</p>
              </div>
              <div className="bg-[var(--bg-surface-alt)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--text-muted)]">Skipped</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{batchResult.data.skipped}</p>
              </div>
              <div className="bg-[var(--bg-surface-alt)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--text-muted)]">Date</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{batchResult.data.date}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </CardBody>
  </Card>
);
