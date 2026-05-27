import { FaUsers, FaUserTie, FaMoneyBillWave, FaUserPlus } from "react-icons/fa";
import type { ReferralAdminStats } from "../../../types/referral";
import { formatCurrency } from "../../../utils/pricingHelpers";
import { ReferralBatchProcessor } from "./ReferralBatchProcessor";
import { StatsGrid, Spinner } from "../../../design-system";
import type { StatCardProps } from "../../../design-system/components/stats-card";

interface ReferralOverviewTabProps {
  adminStats: ReferralAdminStats | null;
  commissionRate: number;
  loading: boolean;
  processing: boolean;
  batchResult: { success: boolean; message: string; data?: { processed: number; skipped: number; message: string; date: string } } | null;
  onProcessBatch: () => void;
}

export const ReferralOverviewTab = ({
  adminStats, commissionRate, loading, processing, batchResult, onProcessBatch,
}: ReferralOverviewTabProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const primaryStats: StatCardProps[] = adminStats ? [
    { title: "Total Referrers", value: adminStats.totalReferrers, icon: <FaUsers /> },
    { title: "Active Referrers", value: adminStats.activeReferrers, icon: <FaUserTie /> },
    { title: "Commission Paid", value: formatCurrency(adminStats.totalCommissionsPaid || 0), icon: <FaMoneyBillWave />, subtitle: "All time" },
    { title: "Total Referred", value: adminStats.totalReferred, icon: <FaUserPlus /> },
  ] : [];

  return (
    <div className="space-y-6">
      {adminStats && <StatsGrid stats={primaryStats} columns={4} gap="md" />}

      {adminStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SecondaryStat label="Total Batches" value={adminStats.totalBatches} />
          <SecondaryStat label="Orders from Referrals" value={adminStats.totalOrdersFromReferrals} />
          <SecondaryStat label="Referred with Orders" value={adminStats.referredWithOrders} />
          <SecondaryStat label="Conversion Rate" value={`${adminStats.referralConversionRate}%`} />
        </div>
      )}

      {/* Current Commission Rate */}
      <div className="bg-[var(--bg-surface-alt)] border border-[var(--border-color)] rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Current Commission Rate</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Percentage of order value credited to referring agents
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xl sm:text-2xl font-bold text-[var(--color-secondary)]">{commissionRate}%</p>
          <p className="text-xs text-[var(--text-muted)]">
            GH₵ {(100 * commissionRate / 100).toFixed(2)} per GH₵ 100 order
          </p>
        </div>
      </div>

      <ReferralBatchProcessor
        processing={processing}
        batchResult={batchResult}
        onProcess={onProcessBatch}
      />
    </div>
  );
};

const SecondaryStat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-[var(--bg-surface-alt)] rounded-lg p-4 text-center">
    <p className="text-xs text-[var(--text-muted)]">{label}</p>
    <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
  </div>
);
