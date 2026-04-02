// src/components/storefront/earnings-manager.tsx
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../design-system';
import { useToast } from '../../design-system';
import { walletService } from '../../services/wallet-service';
import { storefrontService, type EarningsTransactionRecord } from '../../services/storefront.service';
import type { EarningsDashboard, PayoutRequestItem, PayoutDestination } from '../../types/wallet';
import { Pagination } from '../../design-system/components/pagination';
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  RefreshCw,
  Info,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOMO_PROVIDERS = [
  { value: 'MTN', label: 'MTN Mobile Money' },
  { value: 'TELECEL', label: 'Telecel Cash' },
  { value: 'AT', label: 'AT Money' },
];

function isValidGhanaPhone(phone: string) {
  const cleaned = (phone || '').replace(/\D/g, '');
  return /^0\d{9}$/.test(cleaned) || /^233\d{9}$/.test(cleaned);
}

// ─── Status display config ─────────────────────────────────────────────────

type StatusColor = 'success' | 'warning' | 'error' | 'info';

const STATUS_CONFIG: Record<string, { color: StatusColor; label: string; icon: React.ReactNode }> = {
  pending: { color: 'warning', label: 'Pending Review', icon: <Clock className="w-3 h-3" /> },
  approved: { color: 'info', label: 'Approved', icon: <CheckCircle2 className="w-3 h-3" /> },
  processing: { color: 'info', label: 'Processing', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  completed: { color: 'success', label: 'Completed', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { color: 'error', label: 'Rejected', icon: <XCircle className="w-3 h-3" /> },
  failed: { color: 'error', label: 'Failed', icon: <AlertCircle className="w-3 h-3" /> },
};

// ─── Payout mode banner ───────────────────────────────────────────────────────

interface ModeBannerProps {
  autoPayoutEnabled: boolean;
  canRequestPayout: boolean;
}

const ModeBanner: React.FC<ModeBannerProps> = ({ autoPayoutEnabled, canRequestPayout }) => {
  if (!canRequestPayout) return null;

  if (autoPayoutEnabled) {
    return (
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="text-emerald-800">
          <span className="font-semibold">Instant withdrawals enabled.</span>{' '}
          <span className="text-emerald-700">Your transfer is sent automatically via Paystack — no admin approval needed.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm">
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
        <Clock className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="text-blue-800">
        <span className="font-semibold">Manual review mode.</span>{' '}
        <span className="text-blue-700">Payout requests are reviewed by an admin before processing. Allow 5–30 minutes after approval.</span>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface EarningsManagerProps {
  defaultTab?: 'payouts' | 'earnings';
}

export const EarningsManager: React.FC<EarningsManagerProps> = ({
  defaultTab = 'payouts',
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<EarningsDashboard | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'payouts' | 'earnings'>(defaultTab);

  const [history, setHistory] = useState<EarningsTransactionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(20);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // Form state
  const [amount, setAmount] = useState<number | ''>('');
  const [destType, setDestType] = useState<'mobile_money' | 'bank_account'>('mobile_money');
  const [momoProvider, setMomoProvider] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [useSavedAccount, setUseSavedAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await walletService.getEarningsDashboard();
      setDashboard(data);
    } catch {
      addToast('Failed to load earnings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const loadHistory = useCallback(async (page = historyPage, limit = historyLimit) => {
    try {
      setHistoryLoading(true);
      const data = await storefrontService.getEarningsHistory(page, limit);
      setHistory(data.transactions || []);
      const pagination = data.pagination || {
        page,
        limit,
        total: data.transactions?.length || 0,
        totalPages: 1,
      };
      setHistoryPage(pagination.page);
      setHistoryLimit(pagination.limit);
      setHistoryTotal(pagination.total);
      setHistoryTotalPages(pagination.totalPages);
    } catch {
      addToast('Failed to load earnings history', 'error');
    } finally {
      setHistoryLoading(false);
    }
  }, [addToast, historyLimit, historyPage]);

  useEffect(() => {
    void loadHistory(historyPage, historyLimit);
  }, [historyPage, historyLimit, loadHistory]);

  // ── Fee calculation ────────────────────────────────────────────────────────
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
    const netAmount = feeBearer === 'agent'
      ? Math.max(0, Math.round((numAmt - totalFee) * 100) / 100)
      : numAmt;
    return { paystackFlatFee, platformFee, totalFee, netAmount, feeBearer, platformFeePercent };
  }, [amount, destType, dashboard]);

  const minimumPayout = useMemo(() => {
    const amounts = dashboard?.minimumPayoutAmounts;
    if (!amounts) return destType === 'bank_account' ? 50 : 1;
    return destType === 'bank_account'
      ? (amounts.bank_account ?? 50)
      : (amounts.mobile_money ?? 1);
  }, [destType, dashboard]);

  const formatCurrency = (value: number) =>
    `GH₵ ${value.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // canAutoPayout = setting enabled AND Paystack configured — the definitive mode flag.
  const isAutoMode = dashboard?.canAutoPayout ?? false;

  // ── Dialog actions ─────────────────────────────────────────────────────────
  const openRequest = () => {
    const saved = dashboard?.savedPayoutAccount;

    setAmount('');
    setUseSavedAccount(Boolean(saved));
    setEditingAccount(!saved);

    if (saved?.type === 'mobile_money') {
      setDestType('mobile_money');
      setMomoProvider(saved.mobileProvider || 'MTN');
      setPhone(saved.phoneNumber || '');
      setBankCode('');
      setAccountNumber('');
      setAccountName(saved.accountName || saved.recipientName || '');
    } else if (saved?.type === 'bank_account') {
      setDestType('bank_account');
      setBankCode(saved.bankCode || '');
      setAccountNumber(saved.accountNumber || '');
      setAccountName(saved.accountName || saved.recipientName || '');
      setPhone('');
      setMomoProvider('MTN');
    } else {
      setDestType('mobile_money');
      setMomoProvider('MTN');
      setPhone('');
      setBankCode('');
      setAccountNumber('');
      setAccountName('');
    }

    setShowRequestDialog(true);
  };

  const submitRequest = async () => {
    if (!amount || Number(amount) <= 0) { addToast('Enter a valid amount', 'error'); return; }
    const numericAmount = Number(amount);
    if (numericAmount < minimumPayout) {
      addToast(`Minimum payout is GH₵ ${minimumPayout.toFixed(2)}`, 'error');
      return;
    }
    if (dashboard && numericAmount > dashboard.availableBalance) {
      addToast('Amount exceeds your available earnings', 'error');
      return;
    }
    if (feeEstimate && feeEstimate.feeBearer === 'agent' && feeEstimate.netAmount <= 0) {
      addToast(`Amount must exceed the total fee (GH₵ ${feeEstimate.totalFee.toFixed(2)})`, 'error');
      return;
    }

    let destinationToSend: PayoutDestination | undefined;
    const shouldUseSaved = useSavedAccount && !editingAccount && dashboard?.savedPayoutAccount;

    if (!shouldUseSaved) {
      const dest: PayoutDestination = { type: destType };

      if (destType === 'mobile_money') {
        if (!momoProvider) {
          addToast('Select a mobile network', 'error');
          return;
        }
        if (!phone) {
          addToast('Enter your mobile money number', 'error');
          return;
        }
        if (!isValidGhanaPhone(phone)) {
          addToast('Enter a valid Ghana phone number', 'error');
          return;
        }
        dest.mobileProvider = momoProvider;
        dest.phoneNumber = phone;
        if (accountName.trim()) dest.accountName = accountName.trim();
      } else {
        if (!bankCode.trim() || !accountNumber.trim()) {
          addToast('Enter your bank code and account number', 'error');
          return;
        }
        dest.bankCode = bankCode.trim();
        dest.accountNumber = accountNumber.trim();
        if (accountName.trim()) dest.accountName = accountName.trim();
      }

      destinationToSend = dest;
    } else {
      destinationToSend = dashboard?.savedPayoutAccount ?? undefined;
    }

    try {
      setSubmitting(true);
      const result = await walletService.requestPayout(numericAmount, destinationToSend);
      setShowRequestDialog(false);
      addToast(result.autoPayoutEnabled ? 'Withdrawal sent successfully' : 'Payout request submitted', 'success');
      await load();
    } catch {
      addToast('Failed to submit payout request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const savedAccount = dashboard?.savedPayoutAccount ?? null;
  const canRequestPayout = dashboard?.canRequestPayout ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Earnings</h2>
          <p className="text-sm text-gray-500">Track earnings and withdrawals from your storefront.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={load}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            onClick={openRequest}
            disabled={!canRequestPayout}
            leftIcon={isAutoMode ? <Zap className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />}
          >
            {isAutoMode ? 'Withdraw Now' : 'Request Payout'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Available balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(dashboard?.availableBalance ?? 0)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total earned</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(dashboard?.totalEarned ?? 0)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Wallet balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(dashboard?.walletBalance ?? 0)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total withdrawn</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(dashboard?.totalWithdrawn ?? 0)}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <ArrowDownToLine className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ModeBanner autoPayoutEnabled={Boolean(dashboard?.autoPayoutEnabled)} canRequestPayout={canRequestPayout} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'payouts' | 'earnings')} className="space-y-3">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Payout History</h3>
                </div>
                {dashboard && (
                  <Badge colorScheme="gray" variant="subtle" size="sm">
                    {dashboard.recentPayouts.length} records
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {/* Mobile card list */}
              <div className="sm:hidden">
                {!dashboard || dashboard.recentPayouts.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-500">
                    No payouts yet. Start earning from your storefront sales!
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {dashboard.recentPayouts.map((p: PayoutRequestItem) => {
                      const cfg = STATUS_CONFIG[p.status] ?? { color: 'info' as StatusColor, label: p.status, icon: null };
                      return (
                        <div key={p._id} className="flex items-start justify-between gap-3 px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                              {p.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : p.status === 'failed' ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                GH₵ {p.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(p.requestedAt ?? p.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {p.destination?.type === 'mobile_money' ? 'Mobile Money' : 'Bank'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge colorScheme={cfg.color} variant="subtle" size="sm">
                              {cfg.label}
                            </Badge>
                            {p.netAmount != null && (
                              <p className="text-xs text-gray-500 mt-1">
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

              {/* Desktop table */}
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
                      const cfg = STATUS_CONFIG[p.status] ?? { color: 'info' as StatusColor, label: p.status, icon: null };
                      return (
                        <TableRow key={p._id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {new Date(p.requestedAt ?? p.createdAt).toLocaleDateString()}
                            <div className="text-[10px] text-gray-400">
                              {new Date(p.requestedAt ?? p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">GH₵ {p.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {p.transferFee ? `GH₵ ${p.transferFee.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-gray-700">
                            {p.netAmount ? `GH₵ ${p.netAmount.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {p.destination?.type === 'mobile_money' ? 'Mobile Money' : 'Bank'}
                          </TableCell>
                          <TableCell>
                            <Badge colorScheme={cfg.color} variant="subtle" size="sm">
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] text-gray-400 font-mono">
                            {p.paystackTransfer?.transferReference || p.paystackTransfer?.transferCode || '—'}
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
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Earnings History</h3>
                </div>
                <Badge colorScheme="gray" variant="subtle" size="sm">
                  {historyTotal} records
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {historyLoading ? (
                <div className="text-center py-10 text-sm text-gray-500">Loading earnings history…</div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-500">
                  No earnings history yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table size="sm">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Type</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Balance</TableHeaderCell>
                        <TableHeaderCell>Reference</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((txn) => (
                        <TableRow key={txn._id}>
                          <TableCell className="whitespace-nowrap text-xs">
                            {new Date(txn.createdAt).toLocaleDateString()}
                            <div className="text-[10px] text-gray-400">
                              {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 capitalize">
                            {txn.type}
                          </TableCell>
                          <TableCell className={`text-xs font-semibold ${txn.type === 'credit' ? 'text-green-700' : 'text-red-600'}`}>
                            {txn.type === 'credit' ? '+' : '−'}{formatCurrency(txn.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {formatCurrency(txn.balanceAfter)}
                          </TableCell>
                          <TableCell className="text-[10px] text-gray-400 font-mono">
                            {txn.reference || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {historyTotalPages > 1 && (
                <div className="p-3">
                  <Pagination
                    currentPage={historyPage}
                    totalPages={historyTotalPages}
                    totalItems={historyTotal}
                    itemsPerPage={historyLimit}
                    onPageChange={(page) => setHistoryPage(page)}
                    onItemsPerPageChange={(limit) => {
                      setHistoryLimit(limit);
                      setHistoryPage(1);
                    }}
                    showInfo
                    showPerPageSelector
                    variant="compact"
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>



      {/* ── Transfer fee notice (only when agent bears fees) ──────────────── */}
      {dashboard?.payoutFeeBearer === 'agent' && dashboard?.transferFees && (
        <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-sm">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-gray-600">
            <span className="font-semibold text-gray-800">Fees deducted from your payout:</span>{' '}
            Mobile Money GH₵ {dashboard.transferFees.mobile_money.toFixed(2)}
            {(dashboard.platformPayoutFeePercent ?? 0) > 0 && ` + ${dashboard.platformPayoutFeePercent}% platform`}
            {' · '}
            Bank GH₵ {dashboard.transferFees.bank_account.toFixed(2)}
            {(dashboard.platformPayoutFeePercent ?? 0) > 0 && ` + ${dashboard.platformPayoutFeePercent}% platform`}
          </div>
        </div>
      )}

      {/* ── Request payout dialog ─────────────────────────────────────────── */}
      <Dialog isOpen={showRequestDialog} onClose={() => setShowRequestDialog(false)} size="sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isAutoMode
              ? <Zap className="w-5 h-5 text-emerald-500" />
              : <ArrowDownToLine className="w-5 h-5 text-gray-500" />
            }
            <h3 className="text-lg font-semibold">
              {isAutoMode ? 'Instant Withdrawal' : 'Request Payout'}
            </h3>
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

            {/* Mode notice */}
            {isAutoMode ? (
              <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                <Zap className="w-4 h-4 shrink-0" />
                Transfer sent automatically via Paystack — funds arrive in minutes.
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <Clock className="w-4 h-4 shrink-0" />
                An admin will review and process this request. Allow 5–30 minutes after approval.
              </div>
            )}

            <FormField label="Amount (GHS)">
              <Input
                value={amount === '' ? '' : String(amount)}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                min={minimumPayout}
                max={dashboard?.availableBalance}
                placeholder={`Min: GH₵ ${minimumPayout.toFixed(2)}`}
                leftIcon={<span className="text-sm font-medium text-gray-500">GH₵</span>}
                helperText={`Minimum: GH₵ ${minimumPayout.toFixed(2)}`}
              />
            </FormField>

            {useSavedAccount && savedAccount && !editingAccount ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Saved payout account</p>
                    <p className="text-xs text-gray-500">Paystack-supported method for quick withdrawals</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setEditingAccount(true)}>
                    Edit
                  </Button>
                </div>

                <div className="mt-3 text-sm text-gray-700">
                  {savedAccount.type === 'mobile_money' ? (
                    <p>
                      <span className="font-medium">Mobile Money:</span> {savedAccount.mobileProvider} - {savedAccount.phoneNumber}
                      {savedAccount.accountName ? ` (${savedAccount.accountName})` : ''}
                    </p>
                  ) : (
                    <p>
                      <span className="font-medium">Bank:</span> {savedAccount.bankCode} - {savedAccount.accountNumber}
                      {savedAccount.accountName ? ` (${savedAccount.accountName})` : ''}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <FormField label="Payout Method">
                  <Select
                    value={destType}
                    onChange={(v: string) => setDestType(v as 'mobile_money' | 'bank_account')}
                    options={[
                      { value: 'mobile_money', label: '📱 Mobile Money (Paystack)' },
                      { value: 'bank_account', label: '🏦 Bank Account (Paystack)' },
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
                        helperText="This account will be saved for faster future payouts"
                      />
                    </FormField>
                    <FormField label="Account Name">
                      <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Enter full account name"
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

                {useSavedAccount && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setEditingAccount(false)}>
                      Use saved account instead
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Fee breakdown */}
            {feeEstimate && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Withdrawal amount</span>
                  <span className="font-medium">GH₵ {Number(amount).toFixed(2)}</span>
                </div>
                {feeEstimate.feeBearer === 'agent' && (
                  <>
                    <div className="flex justify-between text-orange-600">
                      <span>Paystack fee ({destType === 'bank_account' ? 'bank' : 'MoMo'})</span>
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
                {feeEstimate.feeBearer === 'platform' && (
                  <div className="text-xs text-green-600">Platform covers the transfer fee — you receive the full amount.</div>
                )}
                <div className="flex justify-between border-t border-indigo-200 pt-2 font-semibold">
                  <span className="text-gray-700">You receive</span>
                  <span className={feeEstimate.netAmount <= 0 ? 'text-red-600' : 'text-green-600'}>
                    GH₵ {feeEstimate.netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
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
              disabled={
                submitting ||
                !amount ||
                Number(amount) < minimumPayout ||
                (feeEstimate?.feeBearer === 'agent' && feeEstimate.netAmount <= 0)
              }
              leftIcon={isAutoMode
                ? <Zap className="w-4 h-4" />
                : <ArrowDownToLine className="w-4 h-4" />
              }
            >
              {isAutoMode ? 'Withdraw Now' : 'Submit Request'}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default EarningsManager;