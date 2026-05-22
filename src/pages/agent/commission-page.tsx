import { useState, useEffect } from "react";
import { commissionService } from "../../services/commission.service";
import type { Commission, CommissionStats } from "../../types/commission";

export const CommissionPage = () => {
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<any>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bal, stat, comms, wds] = await Promise.all([
        commissionService.getBalance(),
        commissionService.getStats(),
        commissionService.getCommissions(),
        commissionService.getWithdrawalHistory(),
      ]);
      setBalance(bal);
      setStats(stat);
      setCommissions(comms as unknown as Commission[]);
      setWithdrawals(wds);
    } catch (err) {
      console.error("Failed to load commission data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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

  if (loading) return <div className="p-6">Loading commission data...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Commission Wallet</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Balance</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify({ commissionBalance: balance }, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Stats</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Withdraw Commission</h2>
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
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Commission History</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-80 overflow-y-auto">
          {JSON.stringify(commissions, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Withdrawal History</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-80 overflow-y-auto">
          {JSON.stringify(withdrawals, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default CommissionPage;
