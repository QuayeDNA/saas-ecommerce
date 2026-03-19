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
    if (dest.type === 'mobile_money') return `${dest.mobileProvider ?? ''} · ${dest.phoneNumber ?? ''}`.trim();
    return `Bank · ${dest.accountNumber ?? ''}`;
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
                <div className="space-y-3 text-sm text-gray-700">
                    <p>Approving will deduct <strong>{fmt(p.amount)}</strong> from this agent&apos;s earnings.</p>
                    {!autoMode && paystackConfigured && <p className="text-blue-700">Use <strong>Send via Paystack</strong> or <strong>Mark Paid</strong> after approval.</p>}
                    {!autoMode && !paystackConfigured && <p className="text-amber-700">Send funds manually then use <strong>Mark Paid</strong>.</p>}
                </div>
            );
        }
        if (confirm.type === 'process') {
            return (
                <div className="space-y-3 text-sm text-gray-700">
                    <p>Transfers <strong>{fmt(net ?? p.amount)}</strong> from your Paystack balance to the agent.</p>
                    {p.paystackTransfer?.failureReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                            <strong>Previous failure:</strong> {p.paystackTransfer.failureReason}
                        </div>
                    )}
                </div>
            );
        }
        if (confirm.type === 'markPaid') {
            return (
                <div className="space-y-3 text-sm text-gray-700">
                    <p>Send <strong>{fmt(net ?? p.amount)}</strong> to <strong>{destLabel(p.destination)}</strong>, then enter the reference and confirm.</p>
                    <FormField label="Transfer reference (recommended)">
                        <Input value={confirmInput} onChange={e => setConfirmInput(e.target.value)} placeholder="MoMo ID or bank reference" />
                    </FormField>
                </div>
            );
        }
        if (confirm.type === 'reject') {
            return (
                <div className="space-y-3 text-sm text-gray-700">
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
            <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] z-50 bg-white shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-white shrink-0">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
                            <h3 className="font-semibold text-gray-900">{title}</h3>
                            {/* Mode pill */}
                            {autoMode ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                    <Zap className="w-3 h-3" /> Auto
                                </span>
                            ) : paystackConfigured ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    <Send className="w-3 h-3" /> Semi-Auto
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                    <AlertCircle className="w-3 h-3" /> Manual
                                </span>
                            )}
                        </div>
                        {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
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
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Mode hint */}
                {!autoMode && (
                    <div className="px-4 py-2.5 bg-gray-50 border-b text-xs text-gray-600 flex items-center gap-2">
                        {paystackConfigured
                            ? <><Send className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Approve → Send via Paystack, or Mark Paid if sent manually.</>
                            : <><AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Approve → send funds manually → Mark Paid.</>
                        }
                    </div>
                )}

                {/* Payout list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
                            <Spinner size="sm" /> Loading payouts…
                        </div>
                    ) : payouts.length === 0 ? (
                        <div className="py-16 text-center">
                            <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-500">No payout requests</p>
                            <p className="text-xs text-gray-400 mt-1">No pending, approved or processing payouts.</p>
                        </div>
                    ) : (
                        payouts.map(p => {
                            const isActionable = ['pending', 'approved', 'processing', 'failed'].includes(p.status);
                            const net = getNetAmount(p);
                            const isNetZero = typeof net === 'number' && net <= 0;

                            return (
                                <div
                                    key={p._id}
                                    className={`border rounded-xl p-4 ${isActionable ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'}`}
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
                                            <span className="text-xs text-gray-400">
                                                {new Date(p.requestedAt || p.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-base font-bold text-gray-900">{fmt(p.amount)}</div>
                                            {net != null && (
                                                <div className={`text-xs font-medium mt-0.5 ${isNetZero ? 'text-red-600' : 'text-green-600'}`}>
                                                    Receives: {fmt(net)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
                                        <div>
                                            <div className="text-gray-400 mb-0.5">Destination</div>
                                            <div className="font-medium text-gray-800 flex items-center gap-1">
                                                {p.destination?.type === 'mobile_money'
                                                    ? <Smartphone className="w-3 h-3 text-gray-400 shrink-0" />
                                                    : <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                                                }
                                                {destLabel(p.destination)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400 mb-0.5">Transfer fee</div>
                                            <div className="font-medium text-orange-600">
                                                {p.transferFee != null ? fmt(p.transferFee) : '—'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Zero net warning */}
                                    {isNetZero && (
                                        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 mb-3">
                                            Fee equals or exceeds payout amount — agent receives nothing. Adjust fees or amount before approving.
                                        </div>
                                    )}

                                    {/* Paystack transfer info */}
                                    {p.paystackTransfer?.transferReference && (
                                        <div className="bg-gray-50 rounded-lg px-2.5 py-2 text-xs text-gray-500 mb-3">
                                            Ref: <span className="font-mono text-gray-700">{p.paystackTransfer.transferReference}</span>
                                        </div>
                                    )}
                                    {p.paystackTransfer?.failureReason && (
                                        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-2 mb-3">
                                            {p.paystackTransfer.failureReason}
                                        </div>
                                    )}

                                    {/* Auto mode — no actions needed */}
                                    {autoMode && (
                                        <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-emerald-500" />
                                            {p.status === 'processing' ? 'Transfer in progress — awaiting Paystack confirmation.' : 'Transfer handled automatically.'}
                                        </div>
                                    )}

                                    {/* Semi-auto / manual actions */}
                                    {!autoMode && isActionable && (
                                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
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
                <div className="px-5 py-3 border-t bg-gray-50 shrink-0 text-xs text-gray-500 text-center">
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

