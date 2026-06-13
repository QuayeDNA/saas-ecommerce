import { useState, useEffect, useCallback } from "react";
import { referralService } from "../../services/referral.service";
import type { ReferralDashboard, LeaderboardEntry } from "../../types/referral";
import { useAuth } from "../../hooks";
import { FaCopy, FaWhatsapp, FaSms, FaCheck, FaUsers, FaMoneyBillWave, FaLink, FaTrophy } from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";

export const ReferralDashboardPage = () => {
  const { authState } = useAuth();
  const { addToast } = useToast();
  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"this-week" | "this-month" | "all-time">("all-time");
  const [copied, setCopied] = useState(false);

  const referralCode = dashboard?.referralCode || authState.user?.agentCode || "";
  const shareLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [dash, board] = await Promise.all([
          referralService.getDashboard(),
          referralService.getLeaderboard(timeframe, 1),
        ]);
        setDashboard(dash);
        setLeaderboard(board.entries);
      } catch (err) {
        console.error("Failed to load referral data", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [timeframe]);

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

  if (loading) return <div className="p-6">Loading referral dashboard...</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <h1 className="text-2xl font-bold">Referral Program</h1>

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

      {/* Stats Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Referrals", value: dashboard.totalReferred, icon: FaUsers, color: "text-blue-600 bg-blue-100" },
            { label: "Active", value: dashboard.activeReferred, icon: FaUsers, color: "text-green-600 bg-green-100" },
            { label: "Commission Balance", value: `GHS ${(dashboard.commissionBalance || 0).toFixed(2)}`, icon: FaMoneyBillWave, color: "text-emerald-600 bg-emerald-100" },
            { label: "Total Earned", value: `GHS ${(dashboard.totalCommissionsEarned || 0).toFixed(2)}`, icon: FaTrophy, color: "text-amber-600 bg-amber-100" },
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

      {/* Leaderboard */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FaTrophy className="text-amber-500" /> Leaderboard
        </h2>
        <div className="flex gap-2 mb-3">
          {(["this-week", "this-month", "all-time"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-500">No data yet</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.referrerId} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400 w-6">{i + 1}.</span>
                  <span className="text-sm font-medium">{entry.fullName}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">GHS {entry.commissionsEarned.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboardPage;
