import { FaCalendarCheck, FaPlay } from "react-icons/fa";
import { Card, CardBody, Button, Alert, StatsGrid } from "../../../design-system";
import { FaCheckCircle, FaExclamationTriangle, FaUsers, FaUserSlash, FaCalendar } from "react-icons/fa";

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
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaCalendarCheck className="w-4 h-4" style={{ color: "var(--color-secondary)" }} /> Daily Batch Processing
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
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
            <div className="mt-3">
              <StatsGrid
                stats={[
                  { title: "Processed", value: batchResult.data.processed, icon: <FaUsers />, size: "sm" },
                  { title: "Skipped", value: batchResult.data.skipped, icon: <FaUserSlash />, size: "sm" },
                  { title: "Date", value: batchResult.data.date, icon: <FaCalendar />, size: "sm" },
                ]}
                columns={3}
                gap="sm"
              />
            </div>
          )}
        </div>
      )}
    </CardBody>
  </Card>
);
