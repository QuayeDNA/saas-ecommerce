import { useState, useEffect, useRef } from "react";
import { commissionService } from "../../../services/commission.service";
import { referralService } from "../../../services/referral.service";
import { useAgentAnalytics, useInvalidateAnalytics } from "../../../hooks/use-analytics";
import { FaWallet, FaShareAlt, FaUsers, FaUserPlus } from "react-icons/fa";
import { Spinner } from "../../../design-system/components/spinner";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "../../../design-system/components/tabs";
import { StatsGrid } from "../../../design-system/components/stats-card";
import type { StatCardProps } from "../../../design-system/components/stats-card";
import { Button } from "../../../design-system/components/button";
import { useToast } from "../../../design-system/components/toast";
import { ReferralBanner } from "./referral-banner";
import { WithdrawForm } from "./withdraw-form";
import { CommissionHistory } from "./commission-history";
import { WithdrawalHistory } from "./withdrawal-history";
import { ReferralTree } from "./referral-tree";
import type { Commission, Withdrawal } from "../../../types/commission";
import type { ReferralTreeNode } from "../../../types/referral";

export const CommissionPage = () => {
  const [balance, setBalance] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("commission");
  const { showToast } = useToast();

  const { data: analytics, isLoading: analyticsLoading } = useAgentAnalytics();
  const { invalidateAgent } = useInvalidateAnalytics();

  const [totalReferred, setTotalReferred] = useState(0);
  const [activeReferred, setActiveReferred] = useState(0);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const treeFetchedRef = useRef(false);

  const [nonAnalyticsLoaded, setNonAnalyticsLoaded] = useState(false);

  const fetchNonAnalytics = async () => {
    try {
      const [dash, comms, wds] = await Promise.all([
        referralService.getDashboard(),
        commissionService.getCommissions(),
        commissionService.getWithdrawalHistory(),
      ]);
      setReferralCode(dash.referralCode);
      setTotalReferred(dash.totalReferred);
      setActiveReferred(dash.activeReferred);
      setCommissions(comms);
      setWithdrawals(wds);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setNonAnalyticsLoaded(true);
    }
  };

  useEffect(() => {
    fetchNonAnalytics();
  }, []);

  useEffect(() => {
    if (!analyticsLoading && nonAnalyticsLoaded) {
      setLoading(false);
    }
  }, [analyticsLoading, nonAnalyticsLoaded]);

  // Sync analytics into local balance on first load
  useEffect(() => {
    if (analytics?.commissions?.commissionBalance != null && balance === 0) {
      setBalance(analytics.commissions.commissionBalance);
    }
  }, [analytics, balance]);

  const totalEarned = analytics?.commissions?.totalEarned ?? 0;
  const totalWithdrawn = analytics?.commissions?.totalWithdrawn ?? 0;
  const creditedCount = analytics?.commissions?.creditedCount ?? 0;

  useEffect(() => {
    if (activeTab === "tree" && !treeFetchedRef.current) {
      treeFetchedRef.current = true;
      setTreeLoading(true);
      referralService.getReferralTree().then(setTree).catch(() => {}).finally(() => setTreeLoading(false));
    }
  }, [activeTab]);

  const handleWithdraw = async (amount: number) => {
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      const result = await commissionService.withdraw(amount);
      setBalance(result.commissionBalance);
      setWithdrawDialogOpen(false);
      showToast(`Withdrawal of GHS ${amount.toFixed(2)} successful!`, "success");
      invalidateAgent();
      fetchNonAnalytics();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message = error?.response?.data?.message || error?.message || "Withdrawal failed";
      setWithdrawError(message);
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
    { title: "Total Earned", value: `GHS ${totalEarned.toFixed(2)}`, subtitle: `${creditedCount} batches credited`, icon: <FaWallet />, size: "md" },
    { title: "Total Withdrawn", value: `GHS ${totalWithdrawn.toFixed(2)}`, subtitle: "Cumulative withdrawals", icon: <FaWallet />, size: "md" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Commission & Referrals</h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Track earnings, withdraw commissions, and manage referrals</p>
        </div>
      </div>

      {referralCode && <ReferralBanner referralCode={referralCode} />}

      <StatsGrid
        stats={[
          { title: "Total Referrals", value: String(totalReferred), subtitle: "Users referred", icon: <FaUsers />, size: "md" },
          { title: "Active Referrals", value: String(activeReferred), subtitle: "Users with orders", icon: <FaUserPlus />, size: "md" },
        ]}
        columns={2}
        gap="xs"
      />

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
          <StatsGrid stats={commissionStatCards} columns={3} gap="xs" />

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setWithdrawDialogOpen(true)}
              leftIcon={<FaWallet className="w-4 h-4" />}
            >
              Withdraw
            </Button>
          </div>

          <WithdrawForm
            isOpen={withdrawDialogOpen}
            balance={balance}
            withdrawing={withdrawing}
            error={withdrawError}
            onClose={() => { setWithdrawDialogOpen(false); setWithdrawError(null); }}
            onSubmit={handleWithdraw}
          />

          <CommissionHistory commissions={commissions} />
          <WithdrawalHistory withdrawals={withdrawals} />
        </TabsContent>

        <TabsContent value="tree" className="space-y-4 pt-4">
          <ReferralTree tree={tree} loading={treeLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommissionPage;
