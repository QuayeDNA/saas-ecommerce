import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
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

    const fee = destType === 'bank_account'
      ? dashboard.transferFees.bank_account
      : dashboard.transferFees.mobile_money;
    const feeBearer = dashboard.payoutFeeBearer || 'agent';
    const numAmt = Number(amount);
    const netAmount = feeBearer === 'agent' ? Math.max(0, numAmt - fee) : numAmt;

    return { fee, netAmount, feeBearer };
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
      await walletService.requestPayout(numericAmount, dest);
      addToast('Payout requested — awaiting admin review', 'success');
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Balance summary card ──────────────────────────────────────────────── */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Available Earnings</div>
            <div className="text-3xl font-bold text-green-600 mt-1">
              GH₵ {dashboard ? dashboard.availableBalance.toFixed(2) : '0.00'}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>Total earned: <span className="font-medium text-gray-700 dark:text-gray-300">GH₵ {dashboard ? dashboard.totalEarned.toFixed(2) : '0.00'}</span></span>
              <span>Withdrawn: <span className="font-medium text-gray-700 dark:text-gray-300">GH₵ {dashboard ? dashboard.totalWithdrawn.toFixed(2) : '0.00'}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={openRequest} disabled={!dashboard?.canRequestPayout}>
              Request Payout
            </Button>
            <Button variant="outline" onClick={load} isLoading={loading} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ── Transfer fee info (if agent bears fees) ───────────────────────────── */}
      {dashboard?.payoutFeeBearer === 'agent' && dashboard?.transferFees && (
        <Card>
          <CardBody className="text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Transfer fees apply to payouts:</span>{' '}
                Mobile Money — GH₵ {dashboard.transferFees.mobile_money.toFixed(2)} per transfer,{' '}
                Bank Account — GH₵ {dashboard.transferFees.bank_account.toFixed(2)} per transfer.
                Fees are deducted from your payout amount.
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Payout history table ──────────────────────────────────────────────── */}
      <Card>
        <CardBody>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payout History</h4>
          <div className="overflow-x-auto">
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
                  const cfg = STATUS_CONFIG[p.status] || { color: 'info' as const, label: p.status };
                  return (
                    <TableRow key={p._id}>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <div className="text-gray-400">{new Date(p.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      </TableCell>
                      <TableCell className="font-medium">GH₵ {p.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {p.transferFee != null ? `GH₵ ${p.transferFee.toFixed(2)}` : '—'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {p.netAmount != null ? `GH₵ ${p.netAmount.toFixed(2)}` : `GH₵ ${p.amount.toFixed(2)}`}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        {p.destination.type === 'mobile_money' ? (
                          <div>
                            <span className="font-medium">{p.destination.mobileProvider}</span>
                            <br />{p.destination.phoneNumber}
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium">Bank</span>
                            <br />{p.destination.accountNumber}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme={cfg.color}>{cfg.label}</Badge>
                        {p.status === 'rejected' && p.rejectionReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={p.rejectionReason}>
                            {p.rejectionReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
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
            <h3 className="text-lg font-semibold">Request Payout</h3>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            {/* Available balance reminder */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Available balance</div>
              <div className="text-lg font-bold text-green-600">
                GH₵ {dashboard?.availableBalance.toFixed(2) || '0.00'}
              </div>
            </div>

            <FormField label="Amount (GHS)">
              <Input
                value={amount === '' ? '' : String(amount)}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                min={minimumPayout}
                max={dashboard?.availableBalance}
                placeholder={`Min: GH₵ ${minimumPayout.toFixed(2)}`}
              />
            </FormField>

            <FormField label="Payout Method">
              <Select
                value={destType}
                onChange={(v: string) => setDestType(v as 'mobile_money' | 'bank_account')}
                options={[
                  { value: 'mobile_money', label: 'Mobile Money' },
                  { value: 'bank_account', label: 'Bank Account' },
                ]}
              />
            </FormField>

            {destType === 'mobile_money' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Network">
                  <Select value={momoProvider} onChange={(v) => setMomoProvider(v)} options={MOMO_PROVIDERS} />
                </FormField>
                <FormField label="Phone Number">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0244123456" />
                </FormField>
              </div>
            ) : (
              <div className="space-y-3">
                <FormField label="Bank Code / Name">
                  <Input value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="e.g., GCB" />
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

            {/* ── Fee breakdown preview ───────────────────────────────────────── */}
            {feeEstimate && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payout amount</span>
                  <span className="font-medium">GH₵ {Number(amount).toFixed(2)}</span>
                </div>
                {feeEstimate.feeBearer === 'agent' && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Transfer fee ({destType === 'bank_account' ? 'bank' : 'MoMo'})</span>
                    <span>− GH₵ {feeEstimate.fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1 font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">You receive</span>
                  <span className="text-green-600">GH₵ {feeEstimate.netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Payout requests are reviewed by the admin. Processing typically takes 5–30 minutes after approval.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={submitRequest}
              isLoading={submitting}
              disabled={submitting || !amount || Number(amount) < minimumPayout}
            >
              Request Payout
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default EarningsManager;
