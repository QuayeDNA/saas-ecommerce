import { useState, useEffect, useCallback } from "react";
import { commissionService } from "../../services/commission.service";
import { referralService } from "../../services/referral.service";
import { useAuth } from "../../hooks";
import {
  FaCopy, FaShareAlt, FaWhatsapp, FaSms, FaCheck,
  FaUsers, FaMoneyBillWave, FaLink, FaTrophy,
} from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";
import type { Commission, CommissionStats } from "../../types/commission";
import type { ReferralDashboard, LeaderboardEntry, ReferralTreeNode } from "../../types/referral";

export const CommissionPage = () => {
  const { authState } = useAuth();
  const { addToast } = useToast();

  // Commission state
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<any>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Referral state
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tree, setTree] = useState<ReferralTreeNode | null>(null);
  const [referralTimeframe, setReferralTimeframe] = useState<"weekly" | "monthly" | "all">("monthly");
  const [copied, setCopied] = useState(false);
  const referralCode = dashboard?.referralCode || authState.user?.agentCode || "";
  const shareLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bal, stat, comms, wds, dash, board, referralTree] = await Promise.all([
        commissionService.getBalance(),
        commissionService.getStats(),
        commissionService.getCommissions(),
        commissionService.getWithdrawalHistory(),
        referralService.getDashboard(),
        referralService.getLeaderboard(referralTimeframe),
        referralService.getReferralTree(3),
      ]);
      setBalance(bal);
      setStats(stat);
      setCommissions(comms as unknown as Commission[]);
      setWithdrawals(wds);
      setDashboard(dash);
      setLeaderboard(board);
      setTree(referralTree);
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
    if (!loading) {
      referralService.getLeaderboard(referralTimeframe).then(setLeaderboard);
    }
  }, [referralTimeframe]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    setWithdrawing(true);
    setWithdrawResult(null);
    setWithdrawError(null);
    try {
      const result = await commissionService.withdraw(amount);
      setWithdrawResult(result);
      setBalance(result.newBalance);
      setWithdrawAmount("");
      fetchAll();
    } catch (err: any) {
      setWithdrawError(err?.response?.data?.message || err?.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [addToast]);

  const shareVia = (platform: "whatsapp" | "sms") => {
    const text = `Join me on BryteLinks and start vending airtime & data! Use my referral code: ${referralCode}`;
    const url = platform === "whatsapp"
      ? `https://wa.me/?text=${encodeURIComponent(text + " " + shareLink)}`
      : `sms:?body=${encodeURIComponent(text + " " + shareLink)}`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Commission & Referrals</h1>

      {/* ---------- REFERRAL SECTION ---------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Referral Program</h2>

        {/* Referral Code Card */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">YOUR REFERRAL CODE</p>
              <p className="text-3xl font-bold tracking-widest mt-1">{referralCode}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
              >
                {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy Code"}
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => copyToClipboard(shareLink)}
              className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs hover:bg-white/25 transition-colors"
            >
              <FaLink className="h-3 w-3" /> Copy Link
            </button>
            <button
              onClick={() => shareVia("whatsapp")}
              className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs hover:bg-white/25 transition-colors"
            >
              <FaWhatsapp className="h-3 w-3" /> WhatsApp
            </button>
            <button
              onClick={() => shareVia("sms")}
              className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs hover:bg-white/25 transition-colors"
            >
              <FaSms className="h-3 w-3" /> SMS
            </button>
          </div>
        </div>

        {/* Referral Stats Cards */}
        {dashboard && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Referrals", value: dashboard.totalReferrals, icon: FaUsers, color: "text-blue-600 bg-blue-100" },
              { label: "Active", value: dashboard.activeReferrals, icon: FaUsers, color: "text-green-600 bg-green-100" },
              { label: "Commission Balance", value: `GHS ${(dashboard.commissionBalance || 0).toFixed(2)}`, icon: FaMoneyBillWave, color: "text-emerald-600 bg-emerald-100" },
              { label: "Total Earned", value: `GHS ${(dashboard.totalEarnedFromReferrals || 0).toFixed(2)}`, icon: FaTrophy, color: "text-amber-600 bg-amber-100" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`inline-flex rounded-lg p-2 ${stat.color} mb-2`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------- COMMISSION SECTION ---------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Commission Wallet</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Available Balance</p>
            <p className="text-3xl font-bold text-slate-900">GHS {balance.toFixed(2)}</p>
          </div>
          {stats && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Commission Earned</p>
              <p className="text-3xl font-bold text-slate-900">
                GHS {(stats.totalCommission || 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.pendingCount || 0} pending, {stats.paidCount || 0} paid
              </p>
            </div>
          )}
        </div>

        {/* Withdraw Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Withdraw Commission</h3>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount (GHS)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="border rounded px-3 py-2 w-48"
                min="0"
                step="0.01"
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {withdrawing ? "Processing..." : "Withdraw"}
            </button>
          </div>
          {withdrawResult && (
            <pre className="bg-green-50 p-4 rounded overflow-auto text-sm mt-2">
              {JSON.stringify(withdrawResult, null, 2)}
            </pre>
          )}
          {withdrawError && (
            <p className="text-red-600 text-sm mt-2">{withdrawError}</p>
          )}
        </div>
      </section>

      {/* ---------- RAW DATA ---------- */}
      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="flex items-center gap-2 p-4 cursor-pointer font-medium text-slate-700 hover:bg-slate-50">
          <FaShareAlt /> Raw API Data
        </summary>
        <div className="p-4 border-t border-slate-100 space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">Commission Stats</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Commission History</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-60 overflow-y-auto">
              {JSON.stringify(commissions, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Withdrawal History</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-60 overflow-y-auto">
              {JSON.stringify(withdrawals, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Referral Dashboard</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(dashboard, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Leaderboard ({referralTimeframe})</h2>
            <div className="flex gap-2 mb-2">
              {(["weekly", "monthly", "all"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setReferralTimeframe(t)}
                  className={`px-3 py-1 rounded text-sm ${
                    referralTimeframe === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(leaderboard, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Referral Tree</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(tree, null, 2)}
            </pre>
          </section>
        </div>
      </details>
    </div>
  );
};

export default CommissionPage;