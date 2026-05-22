import { useState, useEffect } from "react";
import { referralService } from "../../services/referral.service";
import { commissionService } from "../../services/commission.service";
import type { ReferralAdminStats, ReferralAdminUser } from "../../types/referral";
import type { CommissionStats } from "../../types/commission";

export const ReferralManagement = () => {
  const [adminStats, setAdminStats] = useState<ReferralAdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<ReferralAdminUser[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [stats, users, commStats] = await Promise.all([
          referralService.getAdminStats(),
          referralService.getAdminUsers(),
          commissionService.getStats(),
        ]);
        setAdminStats(stats);
        setAdminUsers(users);
        setCommissionStats(commStats);
      } catch (err) {
        console.error("Failed to load referral admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleProcessDaily = async () => {
    setProcessing(true);
    setBatchResult(null);
    try {
      const result = await commissionService.processDailyBatch();
      setBatchResult(result);
    } catch (err: any) {
      setBatchResult({ success: false, message: err?.response?.data?.message || err?.message || "Batch processing failed" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-6">Loading referral management...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Referral & Commission Management</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Admin Stats</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(adminStats, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Commission Stats (All Users)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(commissionStats, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Process Daily Batch (Manual)</h2>
        <button
          onClick={handleProcessDaily}
          disabled={processing}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {processing ? "Processing..." : "Run Daily Batch Processing"}
        </button>
        {batchResult && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm mt-2">
            {JSON.stringify(batchResult, null, 2)}
          </pre>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Users with Referrals</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96 overflow-y-auto">
          {JSON.stringify(adminUsers, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default ReferralManagement;
