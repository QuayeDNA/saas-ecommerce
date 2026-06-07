import { FaUsers, FaUserTie, FaMoneyBillWave, FaUserPlus, FaBox, FaChartLine, FaLayerGroup, FaPercent } from "react-icons/fa";
import type { ReferralAdminStats, LeaderboardEntry } from "../../../types/referral";
import { ReferralBatchProcessor } from "./ReferralBatchProcessor";
import { ReferralLeaderboard } from "./ReferralLeaderboard";
import { StatsGrid, Spinner } from "../../../design-system";
import type { StatCardProps } from "../../../design-system/components/stats-card";

interface ReferralOverviewTabProps {
  adminStats: ReferralAdminStats | null;
  commissionRate: number;
  loading: boolean;
  processing: boolean;
  batchResult: { success: boolean; message: string; data?: { processed: number; skipped: number; message: string; date: string } } | null;
  onProcessBatch: () => void;
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;
  leaderboardTimeframe: string;
  onLeaderboardTimeframeChange: (tf: string) => void;
}

export const ReferralOverviewTab = ({
  adminStats, commissionRate, loading, processing, batchResult, onProcessBatch,
  leaderboard, leaderboardLoading, leaderboardTimeframe, onLeaderboardTimeframeChange,
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
    { title: "Commission Paid", value: `GHS ${(adminStats.totalCommissionsPaid || 0).toFixed(2)}`, subtitle: "All time", icon: <FaMoneyBillWave /> },
    { title: "Total Referred", value: adminStats.totalReferred, icon: <FaUserPlus /> },
  ] : [];

  const secondaryStats: StatCardProps[] = adminStats ? [
    { title: "Total Batches", value: adminStats.totalBatches, icon: <FaLayerGroup />, size: "sm" as const },
    { title: "Orders from Referrals", value: adminStats.totalOrdersFromReferrals, icon: <FaBox />, size: "sm" as const },
    { title: "Referred with Orders", value: adminStats.referredWithOrders, icon: <FaChartLine />, size: "sm" as const },
    { title: "Conversion Rate", value: `${adminStats.referralConversionRate}%`, icon: <FaPercent />, size: "sm" as const },
  ] : [];

  return (
    <div className="space-y-6">
      {adminStats && <StatsGrid stats={primaryStats} columns={4} gap="md" />}
      {adminStats && <StatsGrid stats={secondaryStats} columns={4} gap="md" />}

      {adminStats && (
        <div
          className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: "var(--bg-surface-alt)", borderColor: "var(--border-color)" }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Current Commission Rate</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Percentage of order value credited to referring agents
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-secondary)" }}>{commissionRate}%</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              GH₵ {(100 * commissionRate / 100).toFixed(2)} per GH₵ 100 order
            </p>
          </div>
        </div>
      )}

      <ReferralLeaderboard
        data={leaderboard}
        loading={leaderboardLoading}
        timeframe={leaderboardTimeframe}
        onTimeframeChange={onLeaderboardTimeframeChange}
      />

      <ReferralBatchProcessor
        processing={processing}
        batchResult={batchResult}
        onProcess={onProcessBatch}
      />
    </div>
  );
};
