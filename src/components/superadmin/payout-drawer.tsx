// src/components/superadmin/payout-drawer.tsx
//
// Slide-in payout drawer used inside stores.tsx.
// Fully mode-aware: auto / semi-auto / manual.
// Extracted from stores.tsx so it can be independently tested and iterated.

import React, { useState } from 'react';
import {
    Badge,
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    FormField,
    Input,
    Spinner,
} from '../../design-system';
import { useToast } from '../../design-system';
import { walletService } from '../../services/wallet-service';
import type { PayoutRequestItem } from '../../types/wallet';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Clock,
    DollarSign,
    Loader2,
    RefreshCw,
    Send,
    Smartphone,
    X,
    XCircle,
    Zap,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return `GH₵ ${n.toFixed(2)}`;
}

function destLabel(dest?: PayoutRequestItem['destination']) {
    if (!dest) return '—';
    const name = dest.accountName || dest.recipientName;
    if (dest.type === 'mobile_money') {
        const base = `${dest.mobileProvider ?? ''} · ${dest.phoneNumber ?? ''}`.trim();
        return name ? `${base} • ${name}` : base;
    }
    const base = `Bank · ${dest.accountNumber ?? ''}`.trim();
    return name ? `${base} • ${name}` : base;
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
        pending: 'Pending Review', approved: 'Approved',
        processing: 'Processing', completed: 'Completed',
        rejected: 'Rejected', failed: 'Failed',
    };
    return map[s] ?? s;
}

function getNetAmount(p: PayoutRequestItem): number | null {
    if (typeof p.netAmount === 'number') return p.netAmount;
    if (typeof p.amount === 'number' && typeof p.transferFee === 'number') return p.amount - p.transferFee;
    return null;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayoutDrawerProps {
    open: boolean;
    payouts: PayoutRequestItem[];
    loading: boolean;
    title: string;
    subtitle?: string;
    autoMode: boolean;
    paystackConfigured: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

type ConfirmType = 'approve' | 'process' | 'markPaid' | 'reject' | null;

// ─── Component ────────────────────────────────────────────────────────────────

export const PayoutDrawer: React.FC<PayoutDrawerProps> = ({
    open, payouts, loading, title, subtitle,
    autoMode, paystackConfigured,
    onClose, onRefresh,
}) => {
    const { addToast } = useToast();
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<{ type: ConfirmType; payout?: PayoutRequestItem }>({ type: null });
    const [confirmInput, setConfirmInput] = useState('');

    if (!open) return null;

    const pendingPayouts = payouts.filter(p => p.status === 'pending');

    // ── Actions ──────────────────────────────────────────────────────────────────
    const withAction = async (payoutId: string, fn: () => Promise<void>) => {
        setActionLoading(payoutId);
        try {
            await fn();
            onRefresh();
        } finally {
            setActionLoading(null);
            setConfirm({ type: null });
            setConfirmInput('');
        }
    };

    const handleApprove = (p: PayoutRequestItem) => withAction(p._id, async () => {
        await walletService.approvePayout(p._id);
        addToast('Payout approved — earnings deducted.', 'success');
    });

    const handleProcess = (p: PayoutRequestItem) => withAction(p._id, async () => {
        try {
            await walletService.processPayout(p._id);
            addToast('Transfer initiated via Paystack.', 'success');
        } catch (err: unknown) {
            type ErrShape = { response?: { data?: { code?: string; message?: string } } };
            const apiErr = (err as ErrShape).response?.data;
            const code = apiErr?.code;
            const msg = apiErr?.message ?? (err instanceof Error ? err.message : 'Transfer failed');
            if (code === 'PAYSTACK_NOT_CONFIGURED') {
                addToast('Paystack not configured — use Mark Paid.', 'error');
            } else {
                addToast(`Transfer blocked: ${msg}. Try Mark Paid.`, 'error');
            }
            throw err;
        }
    });

    const handleMarkPaid = (p: PayoutRequestItem, ref?: string) => withAction(p._id, async () => {
        await walletService.markPayoutComplete(p._id, ref || undefined);
        addToast('Payout marked as completed.', 'success');
    });

    const handleReject = (p: PayoutRequestItem, reason?: string) => withAction(p._id, async () => {
        await walletService.rejectPayout(p._id, reason || undefined);
        addToast('Payout rejected. Earnings refunded if already deducted.', 'success');
    });

    const handleBulkApprove = async () => {
        const valid = pendingPayouts.filter(p => {
            const net = getNetAmount(p);
            return typeof net !== 'number' || net > 0;
        });
        if (!valid.length) return;

        let approved = 0;
        for (const p of valid) {
            try {
                setActionLoading(p._id);
                await walletService.approvePayout(p._id);
                approved++;
            } catch { /* continue */ }
        }
        setActionLoading(null);
        if (approved > 0) {
            addToast(`${approved} payout${approved > 1 ? 's' : ''} approved.`, 'success');
            onRefresh();
        }
    };

    // ── Confirm dialog content ───────────────────────────────────────────────────
    const renderConfirmBody = () => {
        const p = confirm.payout;
        if (!p) return null;
        const net = getNetAmount(p);

        if (confirm.type === 'approve') {
            return (
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <p>Approving will deduct <strong>{fmt(p.amount)}</strong> from this agent&apos;s earnings.</p>
                    {!autoMode && paystackConfigured && <p style={{ color: 'var(--color-primary)' }}>Use <strong>Send via Paystack</strong> or <strong>Mark Paid</strong> after approval.</p>}
                    {!autoMode && !paystackConfigured && <p style={{ color: 'var(--warning)' }}>Send funds manually then use <strong>Mark Paid</strong>.</p>}
                </div>
            );
        }
        if (confirm.type === 'process') {
            return (
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <p>Transfers <strong>{fmt(net ?? p.amount)}</strong> from your Paystack balance to the agent.</p>
                    {p.paystackTransfer?.failureReason && (
                        <div className="p-3 rounded-lg text-xs" style={{ color: 'var(--error)', backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)' }}>
                            <strong>Previous failure:</strong> {p.paystackTransfer.failureReason}
                        </div>
                    )}
                </div>
            );
        }
        if (confirm.type === 'markPaid') {
            return (
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <p>Send <strong>{fmt(net ?? p.amount)}</strong> to <strong>{destLabel(p.destination)}</strong>, then enter the reference and confirm.</p>
                    <FormField label="Transfer reference (recommended)">
                        <Input value={confirmInput} onChange={e => setConfirmInput(e.target.value)} placeholder="MoMo ID or bank reference" />
                    </FormField>
                </div>
            );
        }
        if (confirm.type === 'reject') {
            return (
                <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <p>The agent will be notified. If earnings were already deducted, they will be refunded.</p>
                    <FormField label="Reason (optional)">
                        <Input value={confirmInput} onChange={e => setConfirmInput(e.target.value)} placeholder="e.g. Invalid account details" />
                    </FormField>
                </div>
            );
        }
        return null;
    };

    const confirmTitles: Record<string, string> = {
        approve: 'Approve Payout',
        process: 'Send via Paystack',
        markPaid: 'Mark as Paid',
        reject: 'Reject Payout',
    };
    const confirmLabels: Record<string, string> = {
        approve: 'Approve',
        process: 'Send Transfer',
        markPaid: 'Mark as Paid',
        reject: 'Reject',
    };
    const confirmVariants: Record<string, 'success' | 'primary' | 'danger'> = {
        approve: 'success',
        process: 'primary',
        markPaid: 'success',
        reject: 'danger',
    };

    const handleConfirm = async () => {
        const p = confirm.payout;
        if (!p || !confirm.type) return;
        switch (confirm.type) {
            case 'approve': await handleApprove(p); break;
            case 'process': await handleProcess(p); break;
            case 'markPaid': await handleMarkPaid(p, confirmInput || undefined); break;
            case 'reject': await handleReject(p, confirmInput || undefined); break;
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

            {/* Slide-in panel */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] z-50 flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', boxShadow: 'var(--shadow-xl)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                            {/* Mode pill */}
                            {autoMode ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: 'var(--success)', backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)' }}>
                                    <Zap className="w-3 h-3" /> Auto
                                </span>
                            ) : paystackConfigured ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                                    <Send className="w-3 h-3" /> Semi-Auto
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: 'var(--warning)', backgroundColor: 'color-mix(in srgb, var(--warning) 10%, transparent)' }}>
                                    <AlertCircle className="w-3 h-3" /> Manual
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {!autoMode && pendingPayouts.length > 1 && (
                            <Button size="sm" variant="success" onClick={handleBulkApprove} disabled={!!actionLoading}>
                                Approve All ({pendingPayouts.length})
                            </Button>
                        )}
                        <Button
                            iconOnly size="sm" variant="ghost"
                            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                            onClick={onRefresh} disabled={loading}
                        />
                        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-alt)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mode hint */}
                {!autoMode && (
                    <div className="px-4 py-2.5 border-b text-xs flex items-center gap-2" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                        {paystackConfigured
                            ? <><Send className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} /> Approve → Send via Paystack, or Mark Paid if sent manually.</>
                            : <><AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--warning)' }} /> Approve → send funds manually → Mark Paid.</>
                        }
                    </div>
                )}

                {/* Payout list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <Spinner size="sm" /> Loading payouts…
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="py-16 text-center">
                            <DollarSign className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No payout requests</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No pending, approved or processing payouts.</p>
                        </div>
                    ) : (
                        payouts.map(p => {
                            const isActionable = ['pending', 'approved', 'processing', 'failed'].includes(p.status);
                            const net = getNetAmount(p);
                            const isNetZero = typeof net === 'number' && net <= 0;

                            return (
                                <div
                                    key={p._id}
                                    className="border rounded-xl p-4"
                                    style={isActionable ? { borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' } : { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
                                >
                                    {/* Status + amount row */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge colorScheme={statusColor(p.status)} size="sm">
                                                <span className="flex items-center gap-1">
                                                    {p.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                                                    {p.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                    {p.status === 'failed' && <XCircle className="w-3 h-3" />}
                                                    {p.status === 'pending' && <Clock className="w-3 h-3" />}
                                                    {statusLabel(p.status)}
                                                </span>
                                            </Badge>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {new Date(p.requestedAt || p.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(p.amount)}</div>
                                            {net != null && (
                                                <div className="text-xs font-medium mt-0.5" style={{ color: isNetZero ? 'var(--error)' : 'var(--success)' }}>
                                                    Receives: {fmt(net)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
                                        <div>
                                            <div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Destination</div>
                                            <div className="font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                                {p.destination?.type === 'mobile_money'
                                                    ? <Smartphone className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                                    : <Building2 className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
                                                }
                                                {destLabel(p.destination)}
                                            </div>
                                        </div>
                                        {(p.destination?.accountName || p.destination?.recipientName) && (
                                            <div>
                                                <div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Account name</div>
                                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {p.destination?.accountName || p.destination?.recipientName}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Transfer fee</div>
                                            <div className="font-medium" style={{ color: 'var(--warning)' }}>
                                                {p.transferFee != null ? fmt(p.transferFee) : '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Zero net warning */}
                                    {isNetZero && (
                                        <div className="text-xs rounded-lg px-2.5 py-1.5 mb-3" style={{ color: 'var(--error)', backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)' }}>
                                            Fee equals or exceeds payout amount — agent receives nothing. Adjust fees or amount before approving.
                                        </div>
                                    )}

                                    {/* Paystack transfer info */}
                                    {p.paystackTransfer?.transferReference && (
                                        <div className="rounded-lg px-2.5 py-2 text-xs mb-3" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--text-secondary)' }}>
                                            Ref: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{p.paystackTransfer.transferReference}</span>
                                        </div>
                                    )}
                                    {p.paystackTransfer?.failureReason && (
                                        <div className="text-xs rounded-lg px-2.5 py-2 mb-3" style={{ color: 'var(--error)', backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)' }}>
                                            {p.paystackTransfer.failureReason}
                                        </div>
                                    )}

                                    {/* Auto mode — no actions needed */}
                                    {autoMode && (
                                        <div className="pt-2 text-xs flex items-center gap-1" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                            <Zap className="w-3 h-3" style={{ color: 'var(--success)' }} />
                                            {p.status === 'processing' ? 'Transfer in progress — awaiting Paystack confirmation.' : 'Transfer handled automatically.'}
                                        </div>
                                    )}

                                    {/* Semi-auto / manual actions */}
                                    {!autoMode && isActionable && (
                                        <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                                            {p.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm" variant="success"
                                                        onClick={() => { setConfirm({ type: 'approve', payout: p }); setConfirmInput(''); }}
                                                        disabled={!!actionLoading || isNetZero}
                                                        isLoading={actionLoading === p._id}
                                                        title={isNetZero ? 'Net amount is zero — cannot approve' : undefined}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="danger"
                                                        onClick={() => { setConfirm({ type: 'reject', payout: p }); setConfirmInput(''); }}
                                                        disabled={!!actionLoading}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {p.status === 'approved' && (
                                                <>
                                                    {paystackConfigured && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => { setConfirm({ type: 'process', payout: p }); setConfirmInput(''); }}
                                                            disabled={!!actionLoading || isNetZero}
                                                            isLoading={actionLoading === p._id}
                                                        >
                                                            <Send className="w-3.5 h-3.5 mr-1" />
                                                            Send via Paystack
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm" variant="success"
                                                        onClick={() => { setConfirm({ type: 'markPaid', payout: p }); setConfirmInput(''); }}
                                                        disabled={!!actionLoading}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="danger"
                                                        onClick={() => { setConfirm({ type: 'reject', payout: p }); setConfirmInput(''); }}
                                                        disabled={!!actionLoading}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {(p.status === 'processing' || p.status === 'failed') && (
                                                <>
                                                    <Button
                                                        size="sm" variant="success"
                                                        onClick={() => { setConfirm({ type: 'markPaid', payout: p }); setConfirmInput(''); }}
                                                        disabled={!!actionLoading}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                    <Button
                                                        size="sm" variant="danger"
                                                        onClick={() => { setConfirm({ type: 'reject', payout: p }); setConfirmInput(''); }}
                                                        disabled={!!actionLoading}
                                                    >
                                                        Decline
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t shrink-0 text-xs text-center" style={{ backgroundColor: 'var(--bg-surface-alt)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                    {payouts.length > 0 && `${payouts.length} payout request${payouts.length !== 1 ? 's' : ''} total`}
                </div>
            </div>

            {/* Confirm dialog */}
            {confirm.type && (
                <Dialog isOpen onClose={() => { setConfirm({ type: null }); setConfirmInput(''); }} size="sm">
                    <DialogHeader>{confirm.type ? confirmTitles[confirm.type] : ''}</DialogHeader>
                    <DialogBody>{renderConfirmBody()}</DialogBody>
                    <DialogFooter>
                        <div className="flex gap-2 justify-end w-full">
                            <Button variant="secondary" onClick={() => { setConfirm({ type: null }); setConfirmInput(''); }} disabled={!!actionLoading}>
                                Cancel
                            </Button>
                            <Button
                                variant={confirm.type ? confirmVariants[confirm.type] : 'primary'}
                                isLoading={!!actionLoading}
                                onClick={handleConfirm}
                            >
                                {confirm.type ? confirmLabels[confirm.type] : 'Confirm'}
                            </Button>
                        </div>
                    </DialogFooter>
                </Dialog>
            )}
        </>
    );
};

export default PayoutDrawer;

