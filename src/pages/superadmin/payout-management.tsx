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

interface AdminPayoutSummary {
  totalProfit: number;
  availableEarnings: number;
  totalWithdrawn: number;
  processingAmount: number;
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

  const name = dest.accountName || dest.recipientName;
  if (dest.type === 'mobile_money') {
    const provider = dest.mobileProvider ? `${dest.mobileProvider} ` : '';
    const number = dest.phoneNumber || '—';
    return (
      <div className="space-y-0.5">
        <div>{`${provider}${number}`.trim()}</div>
        {name ? <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{name}</div> : null}
      </div>
    );
  }

  const account = dest.accountNumber || '—';
  const bank = dest.bankCode ? ` (${dest.bankCode})` : '';
  return (
    <div className="space-y-0.5">
      <div>{`${account}${bank}`.trim()}</div>
      {name ? <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{name}</div> : null}
    </div>
  );
}

type BadgeColor = 'success' | 'warning' | 'error' | 'info' | 'gray';

function statusColor(s: string): BadgeColor {
  switch (s) {
    case 'pending': return 'warning';
    case 'approved': return 'info';
    case 'processing': return 'info';
    case 'completed': return 'success';
    case 'rejected':
    case 'failed': return 'error';
    default: return 'gray';
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
    case 'pending': return <Clock className="w-3 h-3" />;
    case 'approved': return <CheckCircle2 className="w-3 h-3" />;
    case 'processing': return <Loader2 className="w-3 h-3 animate-spin" />;
    case 'completed': return <CheckCircle2 className="w-3 h-3" />;
    case 'rejected':
    case 'failed': return <XCircle className="w-3 h-3" />;
    default: return null;
  }
}

function statusSectionStyle(s: string): React.CSSProperties {
  const base: React.CSSProperties = { color: 'white' };
  switch (s) {
    case 'pending': return { ...base, backgroundColor: 'color-mix(in srgb, var(--warning) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--warning) 50%, transparent)' };
    case 'approved': return { ...base, backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 50%, transparent)' };
    case 'processing': return { ...base, backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 50%, transparent)' };
    case 'completed': return { ...base, backgroundColor: 'color-mix(in srgb, var(--success) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--success) 50%, transparent)' };
    case 'rejected':
    case 'failed': return { ...base, backgroundColor: 'color-mix(in srgb, var(--error) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--error) 50%, transparent)' };
    default: return { ...base, backgroundColor: 'color-mix(in srgb, var(--text-muted) 60%, transparent)', borderColor: 'color-mix(in srgb, var(--text-muted) 50%, transparent)' };
  }
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' },
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
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 20%, transparent)' }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--success)' }}>
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--success)' }}>Auto Payout Mode</p>
          <p className="mt-0.5" style={{ color: 'var(--success)' }}>
            Agent requests trigger an immediate Paystack transfer. No admin action is required.
            Completed and failed transfers appear in history below.
          </p>
        </div>
      </div>
    );
  }

  if (!status.paystackConfigured) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--warning) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--warning) 20%, transparent)' }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--warning)' }}>
          <Info className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--warning)' }}>Manual Payout Mode — Paystack not configured</p>
          <p className="mt-0.5" style={{ color: 'var(--warning)' }}>
            Approve requests, then send money manually (MoMo/bank), and click <strong>Mark Paid</strong> to record completion.
            Configure Paystack in <em>Settings → API</em> to enable the automatic transfer option.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-primary)' }}>
        <Send className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>Semi-Auto Payout Mode</p>
        <p className="mt-0.5" style={{ color: 'var(--color-primary)' }}>
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
    if (status === 'processing') return <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Loader2 className="w-3 h-3 animate-spin" /> Processing…</span>;
    if (status === 'completed') return <span className="text-xs" style={{ color: 'var(--success)' }}>Completed</span>;
    if (status === 'failed') return <span className="text-xs" style={{ color: 'var(--error)' }}>Failed — earnings refunded</span>;
    return null;
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-wrap gap-2">
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
      <div className="flex flex-wrap gap-2">
        {paystackConfigured && (
          <Button size="xs" variant="primary" onClick={() => onProcess(payout)} disabled={loading}>
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
      <div className="flex flex-wrap gap-2">
        <span className="text-xs flex items-center gap-1 mr-1" style={{ color: 'var(--color-primary)' }}>
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
      <div className="flex flex-wrap gap-2">
        <Button size="xs" variant="primary" onClick={() => onProcess(payout)} disabled={loading}>
          Retry Send
        </Button>
        <Button size="xs" variant="success" onClick={() => onMarkPaid(payout)} disabled={loading}>
          Mark Paid
        </Button>
      </div>
    );
  }

  return null;
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PayoutManagementPage() {
  const { addToast } = useToast();

  const [payouts, setPayouts] = useState<PayoutRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [modeStatus, setModeStatus] = useState<AutoPayoutStatus | null>(null);
  const [modeLoading, setModeLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const [summary, setSummary] = useState<AdminPayoutSummary>({
    totalProfit: 0,
    availableEarnings: 0,
    totalWithdrawn: 0,
    processingAmount: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, type: null });
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

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await walletService.getAdminPayoutSummary();
      setSummary(data);
    } catch {
      addToast('Failed to load payout summary', 'error');
    } finally {
      setSummaryLoading(false);
    }
  }, [addToast]);

  useEffect(() => { void fetchSummary(); }, [fetchSummary]);

  const refresh = () => {
    void Promise.all([
      fetchPayouts(pagination.page),
      fetchSummary(),
    ]);
  };

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
      const code = apiErr?.code;
      const msg = apiErr?.message ?? (err instanceof Error ? err.message : 'Transfer failed');

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
  const isAutoMode = modeStatus?.autoPayoutEnabled && modeStatus?.canAutoPayout;
  const psConfigured = modeStatus?.paystackConfigured ?? false;
  const hasFilters = statusFilter !== 'all' || !!searchTerm.trim() || !!dateRange.startDate || !!dateRange.endDate;
  const pendingCount = payouts.filter(p => p.status === 'pending').length;
  const approvedCount = payouts.filter(p => p.status === 'approved').length;
  const processingCount = payouts.filter(p => p.status === 'processing').length;
  const completedCount = payouts.filter(p => p.status === 'completed').length;
  const failedCount = payouts.filter(p => p.status === 'failed').length;

  // ── Confirm dialog body text ────────────────────────────────────────────────
  const confirmContent = useMemo(() => {
    const p = confirm.payout;
    if (!p) return { title: '', body: null, confirmLabel: '', variant: 'primary' as const };

    switch (confirm.type) {
      case 'approve':
        return {
          title: 'Approve Payout',
          body: (
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
              <p>Approving will deduct <strong>{fmt(p.amount)}</strong> from <strong>{userName(p.user)}</strong>&apos;s earnings balance.</p>
              {!isAutoMode && psConfigured && (
                <p style={{ color: 'var(--color-primary)' }}>After approval, use <strong>Send via Paystack</strong> or <strong>Mark Paid</strong> to complete the transfer.</p>
              )}
              {!isAutoMode && !psConfigured && (
                <p style={{ color: 'var(--warning)' }}>Paystack is not configured. After approval, send the funds manually and use <strong>Mark Paid</strong>.</p>
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
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
              <p>This transfers <strong>{fmt(p.netAmount ?? p.amount)}</strong> from your Paystack account balance directly to the agent.</p>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>Requires sufficient Paystack balance and Transfers enabled</li>
                <li>If it fails, the payout stays approved so you can retry or use Mark Paid</li>
              </ul>
              {p.paystackTransfer?.failureReason && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)' }}>
                  <p className="font-medium text-xs" style={{ color: 'var(--error)' }}>Previous failure:</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{p.paystackTransfer.failureReason}</p>
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
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
              <p>Use this after sending the money manually (MoMo/bank/Paystack dashboard).</p>
              <ol className="list-decimal list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
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
      <div
        className="rounded-xl p-4 sm:p-6"
        style={{ background: 'var(--gradient-primary)', color: 'white' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Payout Management</h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto"
            style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
            onClick={refresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              label: 'Total Profit',
              value: summary.totalProfit,
              icon: <DollarSign className="w-4 h-4" />,
              bg: 'rgba(255,255,255,0.15)',
              border: undefined,
              note: 'Available + withdrawn',
            },
            {
              label: 'Available Earnings',
              value: summary.availableEarnings,
              icon: <CheckCircle2 className="w-4 h-4" />,
              bg: 'color-mix(in srgb, var(--success) 30%, transparent)',
              border: 'color-mix(in srgb, var(--success) 40%, transparent)',
            },
            {
              label: 'Total Withdrawn',
              value: summary.totalWithdrawn,
              icon: <ArrowDownToLine className="w-4 h-4" />,
              bg: 'rgba(255,255,255,0.15)',
              border: undefined,
              note: summary.processingAmount
                ? `Processing: ${fmt(summary.processingAmount)}`
                : undefined,
            },
          ].map(({ label, value, icon, bg, border, note }) => (
            <div key={label} className="rounded-lg px-3 py-2.5 flex flex-col gap-2" style={{ backgroundColor: bg, border: border ? `1px solid ${border}` : undefined }}>
              <div className="flex items-center gap-2">
                <span className="shrink-0" style={{ color: 'rgba(255,255,255,0.7)' }}>{icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
                  <p className="font-bold text-sm sm:text-base" style={{ color: 'white' }}>
                    {summaryLoading ? 'Loading…' : fmt(value)}
                  </p>
                </div>
              </div>
              {note ? <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{note}</p> : null}
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {[
            { label: 'Total', value: pagination.total, icon: <DollarSign className="w-4 h-4" />, bg: 'rgba(255,255,255,0.15)' },
            { label: 'Pending', value: pendingCount, icon: <Clock className="w-4 h-4" />, bg: 'color-mix(in srgb, var(--warning) 30%, transparent)', border: 'color-mix(in srgb, var(--warning) 40%, transparent)' },
            { label: 'Processing', value: processingCount, icon: <Loader2 className="w-4 h-4" />, bg: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', border: 'color-mix(in srgb, var(--color-primary) 40%, transparent)' },
            { label: 'Completed', value: completedCount, icon: <CheckCircle2 className="w-4 h-4" />, bg: 'color-mix(in srgb, var(--success) 30%, transparent)', border: 'color-mix(in srgb, var(--success) 40%, transparent)' },
            { label: 'Failed', value: failedCount, icon: <XCircle className="w-4 h-4" />, bg: 'color-mix(in srgb, var(--error) 30%, transparent)', border: 'color-mix(in srgb, var(--error) 40%, transparent)' },
          ].map(({ label, value, icon, bg, border }) => (
            <div key={label} className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: bg, border: border ? `1px solid ${border}` : undefined }}>
              <span className="shrink-0" style={{ color: 'rgba(255,255,255,0.7)' }}>{icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
                <p className="font-bold text-sm sm:text-base" style={{ color: 'white' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mode banner ──────────────────────────────────────────────────────── */}
      <ModeBanner status={modeStatus} loading={modeLoading} />

      {/* ── Approved queue notice (semi-auto/manual only) ─────────────────── */}
      {!isAutoMode && approvedCount > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <div style={{ color: 'var(--color-primary)' }}>
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
      <Card className="overflow-hidden rounded-xl shadow-lg" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Spinner size="sm" />
            <span>Loading payouts…</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <ArrowDownToLine className="text-2xl" style={{ color: 'rgba(255,255,255,0.6)' }} />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>No payouts found</p>
              <p className="text-sm mt-0.5">
                {hasFilters ? 'Try adjusting your filters.' : 'No payout requests in the system yet.'}
              </p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateRange({ startDate: '', endDate: '' }); setPagination(p => ({ ...p, page: 1 })); }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout._id}
                  className="rounded-xl border p-2 transition-shadow"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.9)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.5)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.5)'; }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'var(--gradient-primary)', color: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}
                      >
                        {userName(payout.user).charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'white' }}>{userName(payout.user)}</p>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{userEmail(payout.user)}</p>
                      </div>
                    </div>
                    <Badge
                      colorScheme={statusColor(payout.status)}
                      size="xs"
                    >
                      {statusLabel(payout.status)}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="min-w-[45%] flex-1 rounded-3xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Requested</p>
                      <p className="text-sm font-semibold" style={{ color: 'white' }}>{fmtDate(payout.requestedAt)}</p>
                      <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{fmtDate(payout.createdAt)}</p>
                    </div>
                    <div className="min-w-[45%] flex-1 rounded-3xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Amount</p>
                      <p className="text-sm font-semibold" style={{ color: 'white' }}>{fmt(payout.amount)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {payout.transferFee != null && (
                          <p className="text-[11px]" style={{ color: 'var(--warning)' }}>Fee: {fmt(payout.transferFee)}</p>
                        )}
                        {payout.netAmount != null && (
                          <p className="text-[11px]" style={{ color: 'var(--success)' }}>Net: {fmt(payout.netAmount)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="min-w-[45%] flex-1 rounded-3xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Destination</p>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {payout.destination?.type === 'mobile_money'
                          ? <Smartphone className="w-3 h-3" />
                          : <Building2 className="w-3 h-3" />
                        }
                        <span className="truncate">{destLabel(payout.destination)}</span>
                      </div>
                    </div>
                    <div className="min-w-[45%] flex-1 rounded-3xl border p-3" style={statusSectionStyle(payout.status)}>
                      <p className="text-[11px] text-white/80 uppercase tracking-[0.18em] mb-2">Status</p>
                      <p className="text-sm font-semibold">{statusLabel(payout.status)}</p>
                      {payout.rejectionReason && payout.status === 'rejected' && (
                        <p className="text-[11px] text-white/80 mt-2">{payout.rejectionReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
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
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="min-w-[760px]" variant="simple" size="md">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell style={{ color: 'rgba(255,255,255,0.8)' }}>Requested</TableHeaderCell>
                    <TableHeaderCell style={{ color: 'rgba(255,255,255,0.8)' }}>Agent</TableHeaderCell>
                    <TableHeaderCell style={{ color: 'rgba(255,255,255,0.8)' }}>Amount</TableHeaderCell>
                    <TableHeaderCell style={{ color: 'rgba(255,255,255,0.8)' }}>Destination</TableHeaderCell>
                    <TableHeaderCell style={{ color: 'rgba(255,255,255,0.8)' }}>Status</TableHeaderCell>
                    <TableHeaderCell className="text-right" style={{ color: 'rgba(255,255,255,0.8)' }}>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout._id} style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <TableCell>
                        <div className="text-sm font-medium" style={{ color: 'white' }}>{fmtDate(payout.requestedAt)}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{fmtDate(payout.createdAt)}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm font-medium" style={{ color: 'white' }}>{userName(payout.user)}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{userEmail(payout.user)}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm font-semibold" style={{ color: 'white' }}>{fmt(payout.amount)}</div>
                        {payout.transferFee != null && (
                          <div className="text-xs" style={{ color: 'var(--warning)' }}>Fee: {fmt(payout.transferFee)}</div>
                        )}
                        {payout.netAmount != null && (
                          <div className="text-xs font-medium" style={{ color: 'var(--success)' }}>Net: {fmt(payout.netAmount)}</div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'white' }}>
                          {payout.destination?.type === 'mobile_money'
                            ? <Smartphone className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }} />
                            : <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.6)' }} />
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
                          <div className="text-xs mt-1 max-w-[180px]" style={{ color: 'var(--error)' }} title={payout.paystackTransfer.failureReason}>
                            {payout.paystackTransfer.failureReason}
                          </div>
                        )}
                        {payout.rejectionReason && payout.status === 'rejected' && (
                          <div className="text-xs mt-1 max-w-[180px]" style={{ color: 'rgba(255,255,255,0.6)' }} title={payout.rejectionReason}>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────────── */}
        {pagination.pages > 1 && !loading && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
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
      </Card>

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
                  case 'approve': await handleApprove(p); break;
                  case 'process': await handleProcess(p); break;
                  case 'markPaid': await handleMarkPaid(p, confirmInput || undefined); break;
                  case 'reject': await handleReject(p, confirmInput || undefined); break;
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