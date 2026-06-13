import { useState, useEffect, useCallback } from "react";
import { referralService } from "../../services/referral.service";
import { commissionService } from "../../services/commission.service";
import { settingsService } from "../../services/settings.service";
import { useToast } from "../../design-system";
import {
  Spinner,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "../../design-system";
import {
  FaUsers, FaUserTie, FaMoneyBillWave, FaHistory,
} from "react-icons/fa";
import {
  ReferralOverviewTab,
  ReferralUsersTab,
  ReferralCommissionsTab,
  ReferralWithdrawalsTab,
} from "../../components/superadmin/referral";
import type { ReferralAdminStats, ReferralAdminUser, LeaderboardEntry } from "../../types/referral";
import type { Commission } from "../../types/commission";
import type { Withdrawal } from "../../types/commission";

type CommissionStatusFilter = "all" | "pending" | "credited" | "cancelled";

const TAB_ITEMS = [
  { id: "overview", label: "Overview", icon: FaUsers },
  { id: "users", label: "Users", icon: FaUserTie },
  { id: "commissions", label: "Commissions", icon: FaMoneyBillWave },
  { id: "withdrawals", label: "Withdrawals", icon: FaHistory },
] as const;

export const ReferralManagement = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");

  const [adminStats, setAdminStats] = useState<ReferralAdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<ReferralAdminUser[]>([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [usersPage, setUsersPage] = useState(1);
  const [commissionRate, setCommissionRate] = useState(5);

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionsPagination, setCommissionsPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [commissionsFilter, setCommissionsFilter] = useState<CommissionStatusFilter>("all");
  const [commissionsPage, setCommissionsPage] = useState(1);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsPagination, setWithdrawalsPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState("all-time");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [batchResult, setBatchResult] = useState<{
    success: boolean; message: string;
    data?: { processed: number; skipped: number; message: string; date: string };
  } | null>(null);

  const fetchMainData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, feeSettings] = await Promise.all([
        referralService.getAdminStats(),
        settingsService.getFeeSettings().catch(() => null),
      ]);
      setAdminStats(stats);
      if (feeSettings) setCommissionRate(feeSettings.commissionRatePercent ?? 5);
    } catch (err) {
      console.error("Failed to load admin data", err);
      addToast("Failed to load referral data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchUsers = useCallback(async (page: number) => {
    setUsersLoading(true);
    try {
      const result = await referralService.getAdminUsers(page);
      setAdminUsers(result.users);
      const bp = result.pagination;
      setUsersPagination({
        page: bp?.page ?? page,
        limit: bp?.limit ?? 20,
        total: bp?.total ?? 0,
        pages: bp?.totalPages ?? 0,
      });
    } catch {
      setAdminUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchCommissions = useCallback(async (page: number, status: CommissionStatusFilter) => {
    setCommissionsLoading(true);
    try {
      const statusParam = status === "all" ? undefined : status;
      const result = await commissionService.getCommissionHistory(page, 20, statusParam);
      setCommissions(result.data);
      setCommissionsPagination(result.pagination);
    } catch {
      setCommissions([]);
    } finally {
      setCommissionsLoading(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(async (page: number) => {
    setWithdrawalsLoading(true);
    try {
      const result = await commissionService.getWithdrawalHistoryPaginated(page);
      setWithdrawals(result.withdrawals);
      setWithdrawalsPagination(result.pagination);
    } catch {
      setWithdrawals([]);
    } finally {
      setWithdrawalsLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async (timeframe: string) => {
    setLeaderboardLoading(true);
    try {
      const result = await referralService.getLeaderboard(timeframe as "this-week" | "this-month" | "all-time", 1);
      setLeaderboard(result.entries);
    } catch {
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMainData();
  }, [fetchMainData]);

  useEffect(() => {
    if (activeTab === "overview") fetchLeaderboard(leaderboardTimeframe);
  }, [activeTab, leaderboardTimeframe, fetchLeaderboard]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers(usersPage);
  }, [activeTab, usersPage, fetchUsers]);

  useEffect(() => {
    if (activeTab === "commissions") fetchCommissions(commissionsPage, commissionsFilter);
  }, [activeTab, commissionsPage, commissionsFilter, fetchCommissions]);

  useEffect(() => {
    if (activeTab === "withdrawals") fetchWithdrawals(withdrawalsPage);
  }, [activeTab, withdrawalsPage, fetchWithdrawals]);

  const handleProcessDaily = async () => {
    setProcessing(true);
    setBatchResult(null);
    try {
      const result = await commissionService.processDailyBatch();
      setBatchResult(result);
      addToast("Daily batch processing completed", "success");
      fetchMainData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || "Batch processing failed";
      setBatchResult({ success: false, message: msg });
      addToast(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleCommissionFilterChange = (filter: CommissionStatusFilter) => {
    setCommissionsFilter(filter);
    setCommissionsPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--text-secondary)]">Loading referral management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Referral & Commission Management</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Oversee referral program performance, users, commissions, and withdrawals
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          {TAB_ITEMS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <ReferralOverviewTab
            adminStats={adminStats}
            commissionRate={commissionRate}
            loading={loading}
            processing={processing}
            batchResult={batchResult}
            onProcessBatch={handleProcessDaily}
            leaderboard={leaderboard}
            leaderboardLoading={leaderboardLoading}
            leaderboardTimeframe={leaderboardTimeframe}
            onLeaderboardTimeframeChange={setLeaderboardTimeframe}
          />
        </TabsContent>

        <TabsContent value="users">
          <ReferralUsersTab
            users={adminUsers}
            pagination={usersPagination}
            loading={usersLoading}
            onPageChange={setUsersPage}
          />
        </TabsContent>

        <TabsContent value="commissions">
          <ReferralCommissionsTab
            commissions={commissions}
            pagination={commissionsPagination}
            filter={commissionsFilter}
            loading={commissionsLoading}
            onFilterChange={handleCommissionFilterChange}
            onPageChange={setCommissionsPage}
          />
        </TabsContent>

        <TabsContent value="withdrawals">
          <ReferralWithdrawalsTab
            withdrawals={withdrawals}
            pagination={withdrawalsPagination}
            loading={withdrawalsLoading}
            onPageChange={setWithdrawalsPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralManagement;
