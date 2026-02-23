import React, { useEffect, useState, useCallback } from 'react';
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
  { value: 'MTN', label: 'MTN' },
  { value: 'VOD', label: 'Vodafone' },
  { value: 'ATL', label: 'AirtelTigo' },
];

function isValidGhanaPhone(phone: string) {
  const cleaned = (phone || '').replace(/\D/g, '');
  return /^0\d{9}$/.test(cleaned) || /^233\d{9}$/.test(cleaned);
}

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

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500">Available earnings</div>
            <div className="text-2xl font-bold mt-1">GH₵ {dashboard ? dashboard.availableBalance.toFixed(2) : '0.00'}</div>
            <div className="text-sm text-gray-500 mt-1">Total earned: GH₵ {dashboard ? dashboard.totalEarned.toFixed(2) : '0.00'} &nbsp;•&nbsp; Withdrawn: GH₵ {dashboard ? dashboard.totalWithdrawn.toFixed(2) : '0.00'}</div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={openRequest} disabled={!dashboard?.canRequestPayout}>Request Payout</Button>
            <Button variant="outline" onClick={load} isLoading={loading} disabled={loading}>Refresh</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Payouts</h4>
          <div className="overflow-x-auto">
            <Table size="sm">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Destination</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Reference</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dashboard?.recentPayouts || []).map((p: PayoutRequestItem) => (
                  <TableRow key={p._id}>
                    <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                    <TableCell>GH₵ {p.amount.toFixed(2)}</TableCell>
                    <TableCell className="truncate max-w-[240px] text-xs">
                      {p.destination.type === 'mobile_money' ? `${p.destination.mobileProvider} • ${p.destination.phoneNumber}` : `${p.destination.bankCode || ''} • ${p.destination.accountNumber || ''}`}
                    </TableCell>
                    <TableCell>
                      <Badge colorScheme={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : p.status === 'failed' || p.status === 'rejected' ? 'error' : 'info'}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{p.paystackTransfer?.transferReference || p.paystackTransfer?.transfer_code || '—'}</TableCell>
                  </TableRow>
                ))}
                {(!dashboard || dashboard.recentPayouts.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-6">No payouts yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Request dialog */}
      <Dialog isOpen={showRequestDialog} onClose={() => setShowRequestDialog(false)} size="sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Request Payout</h3>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-3">
            <FormField label="Amount (GHS)">
              <Input value={amount === '' ? '' : String(amount)} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} type="number" />
            </FormField>

            <FormField label="Destination Type">
              <Select value={destType} onChange={(v: string) => setDestType(v as 'mobile_money' | 'bank_account')} options={[{ value: 'mobile_money', label: 'Mobile Money' }, { value: 'bank_account', label: 'Bank Account' }]} />
            </FormField>

            {destType === 'mobile_money' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="Provider">
                  <Select value={momoProvider} onChange={(v) => setMomoProvider(v)} options={MOMO_PROVIDERS} />
                </FormField>
                <FormField label="Phone Number">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0244123456" />
                </FormField>
              </div>
            ) : (
              <div className="space-y-2">
                <FormField label="Bank Code / Name">
                  <Input value={bankCode} onChange={(e) => setBankCode(e.target.value)} placeholder="e.g., GCB" />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <FormField label="Account Number">
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </FormField>
                  <FormField label="Account Name (optional)">
                    <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  </FormField>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">Payout requests are reviewed by the platform admin. Typical processing time: 5–30 minutes.</p>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button className="flex-1" onClick={submitRequest} isLoading={submitting} disabled={submitting}>Request Payout</Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default EarningsManager;
