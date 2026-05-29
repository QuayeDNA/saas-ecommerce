import { FaUsers, FaUserPlus, FaWallet, FaMoneyBillWave } from "react-icons/fa";
import { StatsGrid } from "../../../design-system/components/stats-card";
import type { StatCardProps } from "../../../design-system/components/stats-card";
import type { ReferralDashboard } from "../../../types/referral";

interface ReferralStatsProps {
  dashboard: ReferralDashboard;
}

export const ReferralStats = ({ dashboard }: ReferralStatsProps) => {
  const stats: StatCardProps[] = [
    { title: "Total Referrals", value: dashboard.totalReferred, icon: <FaUsers /> },
    { title: "Active Referrals", value: dashboard.activeReferred, icon: <FaUserPlus /> },
    { title: "Commission Balance", value: `GHS ${(dashboard.commissionBalance || 0).toFixed(2)}`, icon: <FaWallet /> },
    { title: "Total Earned", value: `GHS ${(dashboard.totalCommissionsEarned || 0).toFixed(2)}`, icon: <FaMoneyBillWave /> },
  ];

  return <StatsGrid stats={stats} columns={4} gap="md" />;
};
