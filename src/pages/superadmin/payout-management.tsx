// src/pages/superadmin/payout-management.tsx
//
// Single unified admin payout page.
// Mode-aware: auto / semi-auto / manual driven by `autoPayoutEnabled` setting.
//
// Auto mode:      No pending queue — only history. Admin cannot take action.
// Semi-auto:      Approve → Send via Paystack. Admin triggers transfer.
// Manual:         Approve → Mark Paid. Admin sends money outside platform.
//
// Replaces the old payouts.tsx and payout-history.tsx.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  FormField,
  Input,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '../../design-system';
import { useToast } from '../../design-system';
import { SearchAndFilter } from '../../components/common/SearchAndFilter';
import type { PayoutRequestItem } from '../../types/wallet';
import { walletService } from '../../services/wallet-service';
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
  Send,
  Zap,
  XCircle,
  Building2,
  Smartphone,
  Info,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AutoPayoutStatus {
  autoPayoutEnabled: boolean;
  canAutoPayout: boolean;
  paystackConfigured: boolean;
  message: string;
}

type ConfirmType = 'approve' | 'process' | 'markPaid' | 'reject' | null;

interface ConfirmState {
  open: boolean;
  type: ConfirmType;
  payout?: PayoutRequestItem;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(n);
}

function fmtDate(v: string | Date | undefined) {
  if (!v) return '—';
  return new Date(v).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function userName(user: unknown) {
  if (!user) return 'Unknown';
  if (typeof user === 'object' && user !== null) {
    const u = user as Record<string, unknown>;
    return (u.fullName as string) || (u.email as string) || 'Unknown';
  }
  return String(user);
}

function userEmail(user: unknown) {
  if (!user || typeof user !== 'object') return '';
  return ((user as Record<string, unknown>).email as string) || '';
}

function destLabel(dest?: PayoutRequestItem['destination']) {
  if (!dest) return '—';
  if (dest.type === 'mobile_money') return `${dest.mobileProvider ?? ''} ${dest.phoneNumber ?? ''}`.trim();
  return `Bank · ${dest.accountNumber ?? ''}`;
}

type BadgeColor = 'success' | 'warning' | 'error' | 'info' | 'gray';

function statusColor(s: string): BadgeColor {
  switch (s) {
    case 'pending':    return 'warning';
    case 'approved':   return 'info';
    case 'processing': return 'info';
    case 'completed':  return 'success';
    case 'rejected':
    case 'failed':     return 'error';
    default:           return 'gray';
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    processing: 'Processing',
    completed: 'Completed',
    rejected: 'Rejected',
    failed: 'Failed',
  };
  return map[s] ?? s;
}

function statusIcon(s: string) {
  switch (s) {
    case 'pending':    return <Clock className="w-3 h-3" />;
    case 'approved':   return <CheckCircle2 className="w-3 h-3" />;
    case 'processing': return <Loader2 className="w-3 h-3 animate-spin" />;
    case 'completed':  return <CheckCircle2 className="w-3 h-3" />;
    case 'rejected':
    case 'failed':     return <XCircle className="w-3 h-3" />;
    default:           return null;
  }
}

const STATUS_OPTIONS = [
  { value: 'all',        label: 'All statuses' },
  { value: 'pending',    label: 'Pending' },
  { value: 'approved',   label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed',  label: 'Completed' },
  { value: 'rejected',   label: 'Rejected' },
  { value: 'failed',     label: 'Failed' },
];

// ─── Mode banner ──────────────────────────────────────────────────────────────

interface ModeBannerProps {
  status: AutoPayoutStatus | null;
  loading: boolean;
}

const ModeBanner: React.FC<ModeBannerProps> = ({ status, loading }) => {
  if (loading || !status) return null;

  if (status.autoPayoutEnabled && status.canAutoPayout) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-emerald-900">Auto Payout Mode</p>
          <p className="text-emerald-700 mt-0.5">
            Agent requests trigger an immediate Paystack transfer. No admin action is required.
            Completed and failed transfers appear in history below.
          </p>
        </div>
      </div>
    );
  }

  if (!status.paystackConfigured) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-amber-900">Manual Payout Mode — Paystack not configured</p>
          <p className="text-amber-700 mt-0.5">
            Approve requests, then send money manually (MoMo/bank), and click <strong>Mark Paid</strong> to record completion.
            Configure Paystack in <em>Settings → API</em> to enable the automatic transfer option.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
        <Send className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-blue-900">Semi-Auto Payout Mode</p>
        <p className="text-blue-700 mt-0.5">
          Approve each request to deduct the agent's earnings, then click <strong>Send via Paystack</strong> to trigger the transfer, or <strong>Mark Paid</strong> if you sent money manually.
        </p>
      </div>
    </div>
  );
};

// ─── Action buttons per payout status ────────────────────────────────────────

interface ActionCellProps {
  payout: PayoutRequestItem;
  autoMode: boolean;
  paystackConfigured: boolean;
  loading: boolean;
  onApprove: (p: PayoutRequestItem) => void;
  onProcess: (p: PayoutRequestItem) => void;
  onMarkPaid: (p: PayoutRequestItem) => void;
  onReject: (p: PayoutRequestItem) => void;
}

const ActionCell: React.FC<ActionCellProps> = ({
  payout, autoMode, paystackConfigured, loading,
  onApprove, onProcess, onMarkPaid, onReject,
}) => {
  const { status } = payout;

  // Auto mode: no manual actions (transfers happen automatically)
  if (autoMode) {
    if (status === 'processing') return <span className="text-xs text-blue-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing…</span>;
    if (status === 'completed')  return <span className="text-xs text-green-600">Completed</span>;
    if (status === 'failed')     return <span className="text-xs text-red-600">Failed — earnings refunded</span>;
    return null;
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button size="xs" variant="success" onClick={() => onApprove(payout)} disabled={loading}>
          Approve
        </Button>
        <Button size="xs" variant="danger" onClick={() => onReject(payout)} disabled={loading}>
          Reject
        </Button>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {paystackConfigured && (
          <Button size="xs" onClick={() => onProcess(payout)} disabled={loading}>
            <Send className="w-3 h-3 mr-1" />Send via Paystack
          </Button>
        )}
        <Button size="xs" variant="success" onClick={() => onMarkPaid(payout)} disabled={loading}>
          Mark Paid
        </Button>
        <Button size="xs" variant="danger" onClick={() => onReject(payout)} disabled={loading}>
          Reject
        </Button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-blue-600 flex items-center gap-1 mr-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Awaiting Paystack…
        </span>
        <Button size="xs" variant="success" onClick={() => onMarkPaid(payout)} disabled={loading}>
          Mark Paid
        </Button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button size="xs" variant="success" onClick={() => onMarkPaid(payout)} disabled={loading}>
          Mark Paid
        </Button>
        <Button size="xs" variant="danger" onClick={() => onReject(payout)} disabled={loading}>
          Decline
        </Button>
      </div>
    );
  }

  return null;
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PayoutManagementPage() {
  const { addToast } = useToast();

  const [payouts, setPayouts]         = useState<PayoutRequestItem[]>([]);
  const [loading, setLoading]         = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination]   = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [modeStatus, setModeStatus]   = useState<AutoPayoutStatus | null>(null);
  const [modeLoading, setModeLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [dateRange, setDateRange]       = useState({ startDate: '', endDate: '' });

  const [confirm, setConfirm]    = useState<ConfirmState>({ open: false, type: null });
  const [confirmInput, setConfirmInput] = useState('');

  // ── Load mode status ────────────────────────────────────────────────────────
  useEffect(() => {
    walletService.getAutoPayoutAvailability()
      .then(setModeStatus)
      .catch(() => setModeStatus({ autoPayoutEnabled: false, canAutoPayout: false, paystackConfigured: false, message: 'Unable to determine mode' }))
      .finally(() => setModeLoading(false));
  }, []);

  // ── Fetch payouts ───────────────────────────────────────────────────────────
  const fetchPayouts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await walletService.getAdminPayoutHistory(
        page,
        pagination.limit,
        statusFilter === 'all' ? undefined : statusFilter,
        undefined,
        searchTerm || undefined,
        dateRange.startDate || undefined,
        dateRange.endDate || undefined,
      );
      setPayouts(result.payouts);
      setPagination(result.pagination);
    } catch {
      addToast('Failed to load payouts', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, pagination.limit, statusFilter, searchTerm, dateRange]);

  useEffect(() => { void fetchPayouts(1); }, [fetchPayouts]);

  const refresh = () => fetchPayouts(pagination.page);

  // ── Confirm modal helpers ───────────────────────────────────────────────────
  const openConfirm = (type: ConfirmType, payout: PayoutRequestItem) => {
    setConfirmInput('');
    setConfirm({ open: true, type, payout });
  };
  const closeConfirm = () => setConfirm({ open: false, type: null });

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleApprove = async (payout: PayoutRequestItem) => {
    setActionLoading(payout._id);
    try {
      await walletService.approvePayout(payout._id);
      addToast('Payout approved — earnings deducted. You can now send the transfer.', 'success');
      void refresh();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to approve payout', 'error');
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  };

  const handleProcess = async (payout: PayoutRequestItem) => {
    setActionLoading(payout._id);
    try {
      await walletService.processPayout(payout._id);
      addToast('Paystack transfer initiated. Agent will be notified on completion.', 'success');
      void refresh();
    } catch (err: unknown) {
      void refresh();
      type ErrShape = { response?: { data?: { code?: string; message?: string } } };
      const apiErr = (err as ErrShape).response?.data;
      const code   = apiErr?.code;
      const msg    = apiErr?.message ?? (err instanceof Error ? err.message : 'Transfer failed');

      if (code === 'NOT_APPROVED') {
        addToast('Approve this payout first before sending the transfer.', 'warning');
      } else if (code === 'ALREADY_PROCESSING') {
        addToast('This transfer is already in progress.', 'info');
      } else if (code === 'PAYSTACK_NOT_CONFIGURED') {
        addToast('Paystack is not configured — use Mark Paid for manual processing.', 'error');
      } else if (code === 'ZERO_NET_AMOUNT') {
        addToast('Net amount is zero after fees. Adjust payout amount or fee settings.', 'error');
      } else {
        addToast(`Transfer blocked: ${msg}. Try Mark Paid instead.`, 'error');
      }
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  };

  const handleMarkPaid = async (payout: PayoutRequestItem, ref?: string) => {
    setActionLoading(payout._id);
    try {
      await walletService.markPayoutComplete(payout._id, ref || undefined);
      addToast('Payout marked as completed.', 'success');
      void refresh();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to mark payout complete', 'error');
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  };

  const handleReject = async (payout: PayoutRequestItem, reason?: string) => {
    setActionLoading(payout._id);
    try {
      await walletService.rejectPayout(payout._id, reason || undefined);
      addToast('Payout rejected. Agent has been notified.', 'success');
      void refresh();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Failed to reject payout', 'error');
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isAutoMode        = modeStatus?.autoPayoutEnabled && modeStatus?.canAutoPayout;
  const psConfigured      = modeStatus?.paystackConfigured ?? false;
  const hasFilters        = statusFilter !== 'all' || !!searchTerm.trim() || !!dateRange.startDate || !!dateRange.endDate;
  const pendingCount      = payouts.filter(p => p.status === 'pending').length;
  const approvedCount     = payouts.filter(p => p.status === 'approved').length;
  const processingCount   = payouts.filter(p => p.status === 'processing').length;
  const completedCount    = payouts.filter(p => p.status === 'completed').length;

  // ── Confirm dialog body text ────────────────────────────────────────────────
  const confirmContent = useMemo(() => {
    const p = confirm.payout;
    if (!p) return { title: '', body: null, confirmLabel: '', variant: 'primary' as const };

    switch (confirm.type) {
      case 'approve':
        return {
          title: 'Approve Payout',
          body: (
            <div className="space-y-3 text-sm text-gray-700">
              <p>Approving will deduct <strong>{fmt(p.amount)}</strong> from <strong>{userName(p.user)}</strong>&apos;s earnings balance.</p>
              {!isAutoMode && psConfigured && (
                <p className="text-blue-700">After approval, use <strong>Send via Paystack</strong> or <strong>Mark Paid</strong> to complete the transfer.</p>
              )}
              {!isAutoMode && !psConfigured && (
                <p className="text-amber-700">Paystack is not configured. After approval, send the funds manually and use <strong>Mark Paid</strong>.</p>
              )}
            </div>
          ),
          confirmLabel: 'Approve',
          variant: 'success' as const,
        };

      case 'process':
        return {
          title: 'Send via Paystack',
          body: (
            <div className="space-y-3 text-sm text-gray-700">
              <p>This transfers <strong>{fmt(p.netAmount ?? p.amount)}</strong> from your Paystack account balance directly to the agent.</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Requires sufficient Paystack balance and Transfers enabled</li>
                <li>If it fails, the payout stays approved so you can retry or use Mark Paid</li>
              </ul>
              {p.paystackTransfer?.failureReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800 text-xs">Previous failure:</p>
                  <p className="text-red-700 text-xs mt-1">{p.paystackTransfer.failureReason}</p>
                </div>
              )}
            </div>
          ),
          confirmLabel: 'Send Transfer',
          variant: 'primary' as const,
        };

      case 'markPaid':
        return {
          title: 'Mark as Paid',
          body: (
            <div className="space-y-3 text-sm text-gray-700">
              <p>Use this after sending the money manually (MoMo/bank/Paystack dashboard).</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Send <strong>{fmt(p.netAmount ?? p.amount)}</strong> to {destLabel(p.destination)}</li>
                <li>Enter the transaction reference below (recommended)</li>
                <li>Click Mark as Paid to update the agent&apos;s dashboard</li>
              </ol>
              <FormField label="Transfer reference (recommended)">
                <Input
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="e.g. MoMo transaction ID or bank reference"
                />
              </FormField>
            </div>
          ),
          confirmLabel: 'Mark as Paid',
          variant: 'success' as const,
        };

      case 'reject':
        return {
          title: 'Reject Payout',
          body: (
            <div className="space-y-3 text-sm text-gray-700">
              <p>Rejecting will notify the agent. If their earnings were already deducted, they will be refunded automatically.</p>
              <FormField label="Reason (optional)">
                <Input
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="e.g. Invalid account details"
                />
              </FormField>
            </div>
          ),
          confirmLabel: 'Reject',
          variant: 'danger' as const,
        };

      default:
        return { title: '', body: null, confirmLabel: 'Confirm', variant: 'primary' as const };
    }
  }, [confirm, confirmInput, isAutoMode, psConfigured]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Payout Management</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {modeLoading
                  ? 'Loading mode…'
                  : isAutoMode
                  ? 'Auto mode — transfers process automatically'
                  : psConfigured
                  ? 'Semi-auto mode — approve then send via Paystack'
                  : 'Manual mode — approve then send outside platform'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto border-white/40 text-white hover:bg-white/10"
            onClick={refresh}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Total',      value: pagination.total,  icon: <DollarSign className="w-4 h-4" />, bg: 'bg-white/15' },
            { label: 'Pending',    value: pendingCount,       icon: <Clock className="w-4 h-4" />,       bg: 'bg-amber-500/30 border border-amber-400/30' },
            { label: 'Processing', value: processingCount,   icon: <Loader2 className="w-4 h-4" />,     bg: 'bg-blue-500/30 border border-blue-400/30' },
            { label: 'Completed',  value: completedCount,    icon: <CheckCircle2 className="w-4 h-4" />, bg: 'bg-green-500/30 border border-green-400/30' },
          ].map(({ label, value, icon, bg }) => (
            <div key={label} className={`${bg} rounded-lg px-3 py-2.5 flex items-center gap-2`}>
              <span className="text-white/70 shrink-0">{icon}</span>
              <div className="min-w-0">
                <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">{label}</p>
                <p className="text-white font-bold text-sm sm:text-base">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mode banner ──────────────────────────────────────────────────────── */}
      <ModeBanner status={modeStatus} loading={modeLoading} />

      {/* ── Approved queue notice (semi-auto/manual only) ─────────────────── */}
      {!isAutoMode && approvedCount > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-blue-800">
            <span className="font-semibold">{approvedCount} approved payout{approvedCount > 1 ? 's' : ''} waiting for transfer.</span>{' '}
            {psConfigured
              ? 'Use "Send via Paystack" to trigger the transfer automatically, or "Mark Paid" if you\'ve sent it manually.'
              : 'Send the funds manually, then click "Mark Paid" to complete.'}
          </div>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(v) => { setSearchTerm(v); setPagination(p => ({ ...p, page: 1 })); }}
        searchPlaceholder="Search by reference, phone or account…"
        filters={{ status: { value: statusFilter, options: STATUS_OPTIONS, label: 'Status' } }}
        onFilterChange={(k, v) => { if (k === 'status') setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })); }}
        onSearch={(e) => e.preventDefault()}
        onClearFilters={() => { setSearchTerm(''); setStatusFilter('all'); setDateRange({ startDate: '', endDate: '' }); setPagination(p => ({ ...p, page: 1 })); }}
        showDateRange
        dateRange={dateRange}
        onDateRangeChange={(start, end) => { setDateRange({ startDate: start, endDate: end }); setPagination(p => ({ ...p, page: 1 })); }}
        showSearchButton={false}
        isLoading={loading}
      />

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]" variant="simple" size="md">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Requested</TableHeaderCell>
                <TableHeaderCell>Agent</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Destination</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-10 flex items-center justify-center gap-2 text-gray-500 text-sm">
                      <Spinner size="sm" />Loading payouts…
                    </div>
                  </TableCell>
                </TableRow>
              ) : payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-12 text-center text-sm text-gray-500">
                      {hasFilters ? 'No payouts match your filters.' : 'No payout requests found.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((payout) => (
                  <TableRow key={payout._id}>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{fmtDate(payout.requestedAt)}</div>
                      <div className="text-xs text-gray-400">{fmtDate(payout.createdAt)}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{userName(payout.user)}</div>
                      <div className="text-xs text-gray-400">{userEmail(payout.user)}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-semibold text-gray-900">{fmt(payout.amount)}</div>
                      {payout.transferFee != null && (
                        <div className="text-xs text-orange-600">Fee: {fmt(payout.transferFee)}</div>
                      )}
                      {payout.netAmount != null && (
                        <div className="text-xs text-green-600 font-medium">Net: {fmt(payout.netAmount)}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-900">
                        {payout.destination?.type === 'mobile_money'
                          ? <Smartphone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          : <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        }
                        {destLabel(payout.destination)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge colorScheme={statusColor(payout.status)} size="sm">
                        <span className="flex items-center gap-1">
                          {statusIcon(payout.status)}
                          {statusLabel(payout.status)}
                        </span>
                      </Badge>
                      {payout.paystackTransfer?.failureReason && (
                        <div className="text-xs text-red-600 mt-1 max-w-[180px]" title={payout.paystackTransfer.failureReason}>
                          {payout.paystackTransfer.failureReason}
                        </div>
                      )}
                      {payout.rejectionReason && payout.status === 'rejected' && (
                        <div className="text-xs text-gray-500 mt-1 max-w-[180px]" title={payout.rejectionReason}>
                          {payout.rejectionReason}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <ActionCell
                        payout={payout}
                        autoMode={!!isAutoMode}
                        paystackConfigured={psConfigured}
                        loading={actionLoading === payout._id}
                        onApprove={(p) => openConfirm('approve', p)}
                        onProcess={(p) => openConfirm('process', p)}
                        onMarkPaid={(p) => openConfirm('markPaid', p)}
                        onReject={(p) => openConfirm('reject', p)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Pagination ────────────────────────────────────────────────────────── */}
      {pagination.pages > 1 && (
        <div className="flex justify-end">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => {
              setPagination(p => ({ ...p, page }));
              void fetchPayouts(page);
            }}
          />
        </div>
      )}

      {/* ── Confirm dialog ────────────────────────────────────────────────────── */}
      <Dialog isOpen={confirm.open} onClose={closeConfirm} size="sm">
        <DialogHeader>{confirmContent.title}</DialogHeader>
        <DialogBody>{confirmContent.body}</DialogBody>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button variant="secondary" onClick={closeConfirm} disabled={!!actionLoading}>
              Cancel
            </Button>
            <Button
              variant={confirmContent.variant}
              isLoading={!!actionLoading}
              onClick={async () => {
                const p = confirm.payout;
                if (!p) return;
                switch (confirm.type) {
                  case 'approve':  await handleApprove(p); break;
                  case 'process':  await handleProcess(p); break;
                  case 'markPaid': await handleMarkPaid(p, confirmInput || undefined); break;
                  case 'reject':   await handleReject(p, confirmInput || undefined); break;
                }
              }}
            >
              {confirmContent.confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  );
}