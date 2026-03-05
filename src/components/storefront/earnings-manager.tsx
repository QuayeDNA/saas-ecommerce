import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  FormField,
  Select,
} from '../../design-system';
import { useToast } from '../../design-system';
import { walletService } from '../../services/wallet-service';
import type { EarningsDashboard, PayoutRequestItem, PayoutDestination } from '../../types/wallet';
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  RefreshCw,
  Info,
  Smartphone,
  Building2,
} from 'lucide-react';

const MOMO_PROVIDERS = [
  { value: 'MTN', label: 'MTN Mobile Money' },
  { value: 'VOD', label: 'Vodafone Cash' },
  { value: 'ATL', label: 'AirtelTigo Money' },
];

function isValidGhanaPhone(phone: string) {
  const cleaned = (phone || '').replace(/\D/g, '');
  return /^0\d{9}$/.test(cleaned) || /^233\d{9}$/.test(cleaned);
}

const STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error' | 'info'; label: string }> = {
  pending: { color: 'warning', label: 'Pending Review' },
  approved: { color: 'info', label: 'Approved' },
  processing: { color: 'info', label: 'Processing' },
  completed: { color: 'success', label: 'Completed' },
  rejected: { color: 'error', label: 'Rejected' },
  failed: { color: 'error', label: 'Failed' },
};

export const EarningsManager: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<EarningsDashboard | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request form
  const [amount, setAmount] = useState<number | ''>('');
  const [destType, setDestType] = useState<'mobile_money' | 'bank_account'>('mobile_money');
  const [momoProvider, setMomoProvider] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletService.getEarningsDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      console.error(err);
      addToast('Failed to load earnings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { void load(); }, [load]);

  // ── Fee calculation ─────────────────────────────────────────────────────────
  const feeEstimate = useMemo(() => {
    if (!dashboard?.transferFees || !amount || Number(amount) <= 0) return null;

    const paystackFlatFee = destType === 'bank_account'
      ? dashboard.transferFees.bank_account
      : dashboard.transferFees.mobile_money;
    const platformFeePercent = dashboard.platformPayoutFeePercent || 0;
    const numAmt = Number(amount);
    const platformFee = Math.round(numAmt * platformFeePercent) / 100;
    const totalFee = Math.round((paystackFlatFee + platformFee) * 100) / 100;
    const feeBearer = dashboard.payoutFeeBearer || 'agent';
    const netAmount = feeBearer === 'agent' ? Math.max(0, Math.round((numAmt - totalFee) * 100) / 100) : numAmt;

    return { paystackFlatFee, platformFee, totalFee, netAmount, feeBearer, platformFeePercent };
  }, [amount, destType, dashboard]);

  const minimumPayout = useMemo(() => {
    if (!dashboard?.minimumPayoutAmounts) return 5;
    return destType === 'bank_account'
      ? dashboard.minimumPayoutAmounts.bank_account
      : dashboard.minimumPayoutAmounts.mobile_money;
  }, [destType, dashboard]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const openRequest = () => {
    setAmount('');
    setPhone('');
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setDestType('mobile_money');
    setMomoProvider('MTN');
    setShowRequestDialog(true);
  };

  const submitRequest = async () => {
    if (!amount || Number(amount) <= 0) {
      addToast('Enter a valid amount', 'error');
      return;
    }

    const numericAmount = Number(amount);
    if (numericAmount < minimumPayout) {
      addToast(`Minimum payout for ${destType === 'bank_account' ? 'bank transfer' : 'mobile money'} is GH₵ ${minimumPayout.toFixed(2)}`, 'error');
      return;
    }
    if (dashboard && numericAmount > dashboard.availableBalance) {
      addToast('Amount exceeds your available earnings', 'error');
      return;
    }

    const dest: PayoutDestination = { type: destType } as PayoutDestination;

    if (destType === 'mobile_money') {
      if (!isValidGhanaPhone(phone)) { addToast('Enter a valid Ghana mobile number', 'error'); return; }
      dest.mobileProvider = momoProvider;
      dest.phoneNumber = phone.replace(/\s+/g, '');
    } else {
      if (!bankCode || !accountNumber) { addToast('Provide bank and account number', 'error'); return; }
      dest.bankCode = bankCode.trim();
      dest.accountNumber = accountNumber.trim();
      if (accountName) dest.accountName = accountName.trim();
    }

    try {
      setSubmitting(true);
      const { autoPayoutEnabled } = await walletService.requestPayout(numericAmount, dest);
      if (autoPayoutEnabled) {
        addToast('Transfer initiated — you will be notified when it completes', 'success');
      } else {
        addToast('Payout requested — awaiting admin review', 'success');
      }
      setShowRequestDialog(false);
      void load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      addToast(msg, 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Balance hero card ─────────────────────────────────────────────────── */}
      <Card variant="elevated">
        <CardBody className="p-0 overflow-hidden">
          {/* Gradient header */}
          <div
            className="px-5 pt-5 pb-6 text-white"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #EC4899 100%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white/90 tracking-wide uppercase">
                  Available Earnings
                </span>
              </div>
              <button
                onClick={load}
                disabled={loading}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="text-4xl font-black tracking-tight mb-1">
              GH₵ {dashboard ? dashboard.availableBalance.toFixed(2) : '0.00'}
            </div>
            <p className="text-white/70 text-sm">Balance available for withdrawal</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 bg-white">
            <div className="flex flex-col items-center py-3 px-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-gray-500">Total Earned</span>
              </div>
              <span className="text-base font-bold text-gray-900">
                GH₵ {dashboard ? dashboard.totalEarned.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex flex-col items-center py-3 px-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-500">Withdrawn</span>
              </div>
              <span className="text-base font-bold text-gray-900">
                GH₵ {dashboard ? dashboard.totalWithdrawn.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-3 bg-white">
            <Button
              className="w-full"
              onClick={openRequest}
              disabled={!dashboard?.canRequestPayout}
              leftIcon={<ArrowDownToLine className="w-4 h-4" />}
            >
              {dashboard?.autoPayoutEnabled ? 'Withdraw via Paystack' : 'Request Payout'}
            </Button>
            {!dashboard?.canRequestPayout && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Payouts are currently unavailable
              </p>
            )}
            {dashboard?.autoPayoutEnabled && dashboard?.canRequestPayout && (
              <p className="text-xs text-center text-green-600 mt-2 flex items-center justify-center gap-1">
                <span>⚡</span> Instant transfer — no admin approval needed
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Transfer fee notice ───────────────────────────────────────────────── */}
      {dashboard?.payoutFeeBearer === 'agent' && dashboard?.transferFees && (
        <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-gray-600">
            <span className="font-semibold text-gray-800">Transfer fees (deducted from payout):</span>{' '}
            Mobile Money — GH₵ {dashboard.transferFees.mobile_money.toFixed(2)} Paystack
            {(dashboard.platformPayoutFeePercent ?? 0) > 0 && ` + ${dashboard.platformPayoutFeePercent}% platform`},&nbsp;
            Bank Account — GH₵ {dashboard.transferFees.bank_account.toFixed(2)} Paystack
            {(dashboard.platformPayoutFeePercent ?? 0) > 0 && ` + ${dashboard.platformPayoutFeePercent}% platform`}.
          </div>
        </div>
      )}

      {/* ── Payout history ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Payout History
              </h3>
            </div>
            {dashboard && (
              <Badge colorScheme="gray" variant="subtle" size="sm">
                {dashboard.recentPayouts.length} records
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {/* Mobile card list (below sm) */}
          <div className="sm:hidden">
            {!dashboard || dashboard.recentPayouts.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500">
                No payouts yet. Start earning from your storefront sales!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dashboard.recentPayouts.map((p: PayoutRequestItem) => {
                  const cfg = STATUS_CONFIG[p.status] ?? { color: 'info' as const, label: p.status };
                  return (
                    <div key={p._id} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          {p.destination.type === 'mobile_money'
                            ? <Smartphone className="w-4 h-4 text-gray-500" />
                            : <Building2 className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">GH₵ {p.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            {p.destination.type === 'mobile_money'
                              ? `${p.destination.mobileProvider} · ${p.destination.phoneNumber}`
                              : `Bank · ${p.destination.accountNumber}`}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                          {p.status === 'rejected' && p.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={p.rejectionReason}>
                              {p.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge colorScheme={cfg.color} variant="subtle" size="sm">{cfg.label}</Badge>
                        {p.netAmount != null && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            Net: GH₵ {p.netAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop table (sm and above) */}
          <div className="hidden sm:block overflow-x-auto">
            <Table size="sm">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Fee</TableHeaderCell>
                  <TableHeaderCell>You Receive</TableHeaderCell>
                  <TableHeaderCell>Destination</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Reference</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboard?.recentPayouts || []).map((p: PayoutRequestItem) => {
                  const cfg = STATUS_CONFIG[p.status] ?? { color: 'info' as const, label: p.status };
                  return (
                    <TableRow key={p._id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <div className="text-gray-400">
                          {new Date(p.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">GH₵ {p.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {p.transferFee != null ? `GH₵ ${p.transferFee.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {p.netAmount != null ? `GH₵ ${p.netAmount.toFixed(2)}` : `GH₵ ${p.amount.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-xs max-w-[180px]">
                        {p.destination.type === 'mobile_money' ? (
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="w-3 h-3 text-gray-400 shrink-0" />
                            <div>
                              <span className="font-medium">{p.destination.mobileProvider}</span>
                              <br />{p.destination.phoneNumber}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            <div>
                              <span className="font-medium">Bank</span>
                              <br />{p.destination.accountNumber}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme={cfg.color} variant="subtle" size="sm">{cfg.label}</Badge>
                        {p.status === 'rejected' && p.rejectionReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={p.rejectionReason}>
                            {p.rejectionReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 font-mono">
                        {p.paystackTransfer?.transferReference || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!dashboard || dashboard.recentPayouts.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-gray-500 py-8">
                      No payouts yet. Start earning from your storefront sales!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── Request payout dialog ─────────────────────────────────────────────── */}
      <Dialog isOpen={showRequestDialog} onClose={() => setShowRequestDialog(false)} size="sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Request Payout</h3>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            {/* Balance pill */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-sm text-gray-500">Available balance</span>
              <span className="text-lg font-bold text-green-600">
                GH₵ {dashboard?.availableBalance.toFixed(2) ?? '0.00'}
              </span>
            </div>

            <FormField label="Amount (GHS)">
              <Input
                value={amount === '' ? '' : String(amount)}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                min={minimumPayout}
                max={dashboard?.availableBalance}
                placeholder={`Min: GH₵ ${minimumPayout.toFixed(2)}`}
                leftIcon={<span className="text-sm font-medium text-gray-500">GH₵</span>}
                helperText={`Minimum payout: GH₵ ${minimumPayout.toFixed(2)}`}
              />
            </FormField>

            <FormField label="Payout Method">
              <Select
                value={destType}
                onChange={(v: string) => setDestType(v as 'mobile_money' | 'bank_account')}
                options={[
                  { value: 'mobile_money', label: '📱 Mobile Money' },
                  { value: 'bank_account', label: '🏦 Bank Account' },
                ]}
              />
            </FormField>

            {destType === 'mobile_money' ? (
              <div className="space-y-3">
                <FormField label="Mobile Network">
                  <Select value={momoProvider} onChange={(v) => setMomoProvider(v)} options={MOMO_PROVIDERS} />
                </FormField>
                <FormField label="Mobile Money Number">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0244 123 456"
                    helperText="Ghana number — e.g. 0244123456"
                  />
                </FormField>
              </div>
            ) : (
              <div className="space-y-3">
                <FormField label="Bank Code">
                  <Input
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="e.g. GCB, ECOBANK"
                  />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Account Number">
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </FormField>
                  <FormField label="Account Name (optional)">
                    <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  </FormField>
                </div>
              </div>
            )}

            {/* Fee breakdown */}
            {feeEstimate && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Payout amount</span>
                  <span className="font-medium">GH₵ {Number(amount).toFixed(2)}</span>
                </div>
                {feeEstimate.feeBearer === 'agent' && (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span>Paystack flat fee ({destType === 'bank_account' ? 'bank' : 'MoMo'})</span>
                      <span>− GH₵ {feeEstimate.paystackFlatFee.toFixed(2)}</span>
                    </div>
                    {feeEstimate.platformFeePercent > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Platform fee ({feeEstimate.platformFeePercent}%)</span>
                        <span>− GH₵ {feeEstimate.platformFee.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between border-t border-indigo-200 pt-2 font-semibold">
                  <span className="text-gray-700">You receive</span>
                  <span className="text-green-600">GH₵ {feeEstimate.netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Manual/auto notice */}
            <p className="text-xs text-gray-400">
              {dashboard?.autoPayoutEnabled
                ? '⚡ Auto-payout is enabled. Your transfer will be sent via Paystack immediately after submission.'
                : 'Payout requests are reviewed by admin. Processing takes 5–30 minutes after approval.'}
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" onClick={() => setShowRequestDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={submitRequest}
              isLoading={submitting}
              disabled={submitting || !amount || Number(amount) < minimumPayout}
              leftIcon={<ArrowDownToLine className="w-4 h-4" />}
            >
              {dashboard?.autoPayoutEnabled ? 'Withdraw Now' : 'Request Payout'}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default EarningsManager;
