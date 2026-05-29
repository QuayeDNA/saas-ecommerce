import { useState, useEffect, useRef } from "react";
import { commissionService } from "../../../services/commission.service";
import { referralService } from "../../../services/referral.service";
import { FaWallet, FaShareAlt } from "react-icons/fa";
import { Card, CardBody } from "../../../design-system/components/card";
import { Badge } from "../../../design-system/components/badge";
import { Spinner } from "../../../design-system/components/spinner";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "../../../design-system/components/tabs";
import { StatsGrid } from "../../../design-system/components/stats-card";
import type { StatCardProps } from "../../../design-system/components/stats-card";
import { ReferralBanner } from "./referral-banner";
import { ReferralStats } from "./referral-stats";
import { WithdrawForm } from "./withdraw-form";
import { CommissionHistory } from "./commission-history";
import { WithdrawalHistory } from "./withdrawal-history";
import { ReferralTree } from "./referral-tree";
import type { Commission, CommissionStats, WithdrawResponse, Withdrawal } from "../../../types/commission";
import type { ReferralDashboard, ReferralTreeNode } from "../../../types/referral";

export const CommissionPage = () => {
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResponse["data"] | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("commission");

  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const treeFetchedRef = useRef(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bal, stat, comms, wds, dash] = await Promise.all([
        commissionService.getBalance(),
        commissionService.getStats(),
        commissionService.getCommissions(),
        commissionService.getWithdrawalHistory(),
        referralService.getDashboard(),
      ]);
      setBalance(bal);
      setStats(stat);
      setCommissions(comms);
      setWithdrawals(wds);
      setDashboard(dash);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (activeTab === "tree" && !treeFetchedRef.current) {
      treeFetchedRef.current = true;
      referralService.getReferralTree().then(setTree).catch(() => {});
    }
  }, [activeTab]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    setWithdrawing(true);
    setWithdrawResult(null);
    setWithdrawError(null);
    try {
      const result = await commissionService.withdraw(amount);
      setWithdrawResult(result);
      setBalance(result.commissionBalance);
      setWithdrawAmount("");
      fetchAll();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setWithdrawError(error?.response?.data?.message || error?.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading commission data...</p>
        </div>
      </div>
    );
  }

  const commissionStatCards: StatCardProps[] = [
    { title: "Available Balance", value: `GHS ${balance.toFixed(2)}`, subtitle: "Ready to withdraw", icon: <FaWallet />, size: "md" },
  ];

  if (stats) {
    commissionStatCards.push(
      { title: "Total Earned", value: `GHS ${(stats.totalCommissions || 0).toFixed(2)}`, subtitle: `${stats.creditedCount || 0} credited · ${stats.pendingCount || 0} pending`, icon: <FaWallet />, size: "md" },
      { title: "Daily Average", value: `GHS ${(stats.totalEarned || 0).toFixed(2)}`, subtitle: "Total credited", icon: <FaWallet />, size: "md" },
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Commission & Referrals</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Track earnings, withdraw commissions, and manage referrals</p>
        </div>
      </div>

      {dashboard?.referralCode && (
        <ReferralBanner referralCode={dashboard.referralCode} />
      )}

      {dashboard && <ReferralStats dashboard={dashboard} />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="commission">
            <FaWallet className="w-4 h-4 mr-1.5" /> Commission
          </TabsTrigger>
          <TabsTrigger value="tree">
            <FaShareAlt className="w-4 h-4 mr-1.5" /> Referral Tree
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="space-y-4 pt-4">
          {stats && <StatsGrid stats={commissionStatCards} columns={stats ? 3 : 1} gap="md" />}

          <WithdrawForm
            balance={balance}
            withdrawAmount={withdrawAmount}
            withdrawing={withdrawing}
            withdrawError={withdrawError}
            withdrawResult={withdrawResult}
            onAmountChange={setWithdrawAmount}
            onWithdraw={handleWithdraw}
          />

          <CommissionHistory commissions={commissions} />
          <WithdrawalHistory withdrawals={withdrawals} />
        </TabsContent>

        <TabsContent value="tree" className="space-y-4 pt-4">
          <ReferralTree tree={tree} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommissionPage;
