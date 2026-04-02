/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/superadmin/stores.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Alert,
  Spinner,
  StatsGrid,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  FormField,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Pagination,
} from "../../design-system";
import { useToast } from "../../design-system";
import { walletService } from '../../services/wallet-service';
import type { EarningsReconciliation, EarningsBackfillPreview } from '../../types/wallet';
import {
  storefrontService,
  type AdminStorefrontData,
  type AdminStorefrontStats,
  type AdminStorefrontDetail,
} from "../../services/storefront.service";
import { settingsService } from "../../services/settings.service";
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Shield,
  ShieldOff,
  ShieldAlert,
  Search,
  AlertTriangle,
  Trash2,
  Eye,
  User,
  Mail,
  DollarSign,
} from "lucide-react";
import PayoutDrawer from "../../components/superadmin/payout-drawer";
import { getStoreUrl } from "../../utils/store-url";

// =========================================================================
// Helper Components
// =========================================================================

function StatusBadge({ store }: { store: AdminStorefrontData }) {
  if (!store.isApproved) {
    return (
      <Badge colorScheme="warning" variant="subtle" size="sm" rounded>
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>
    );
  }
  if (store.suspendedByAdmin) {
    return (
      <Badge colorScheme="error" variant="subtle" size="sm" rounded>
        <ShieldAlert className="w-3 h-3 mr-1" /> Suspended
      </Badge>
    );
  }
  if (store.isActive) {
    return (
      <Badge colorScheme="success" variant="subtle" size="sm" rounded>
        <CheckCircle className="w-3 h-3 mr-1" /> Active
      </Badge>
    );
  }
  return (
    <Badge colorScheme="gray" variant="subtle" size="sm" rounded>
      <XCircle className="w-3 h-3 mr-1" /> Inactive
    </Badge>
  );
}

// =========================================================================
// Store Detail Dialog
// =========================================================================

function StoreDetailDialog({
  store,
  detail,
  detailLoading,
  isOpen,
  onClose,
  onApprove,
  onToggleStatus,
  onDelete,
  isProcessing,
  onViewPayouts,
  reconciliation,
  reconciliationLoading,
  onReconcile,
  reconcileApplying,
  backfillPreview,
  backfillLoading,
  onBackfill,
  backfillApplying,
}: {
  store: AdminStorefrontData | null;
  detail: AdminStorefrontDetail | null;
  detailLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onToggleStatus: (store: AdminStorefrontData) => void;
  onDelete: (store: AdminStorefrontData) => void;
  isProcessing: boolean;
  onViewPayouts?: (agentId: string, store?: AdminStorefrontData) => void;
  reconciliation?: EarningsReconciliation | null;
  reconciliationLoading?: boolean;
  onReconcile?: (agentId: string) => void;
  reconcileApplying?: boolean;
  backfillPreview?: EarningsBackfillPreview | null;
  backfillLoading?: boolean;
  onBackfill?: (agentId: string) => void;
  backfillApplying?: boolean;
}) {
  if (!store) return null;

  // Use the rich detail when available, fall back to list-level data
  const d = detail ?? store;
  const agent = detail?.agentId ?? (typeof store.agentId === "object" ? store.agentId : null);
  const orderStats = detail?.orderStats;
  const recentOrders = detail?.recentOrders ?? [];
  const agentId = agent && typeof agent === "object" ? (agent as any)._id : null;

  const fmtCurrency = (v: number) =>
    `GH₵ ${v.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const orderStatusColor: Record<string, string> = {
    completed: "text-green-700 bg-green-50",
    confirmed: "text-blue-700 bg-blue-50",
    processing: "text-indigo-700 bg-indigo-50",
    pending: "text-amber-700 bg-amber-50",
    pending_payment: "text-amber-700 bg-amber-50",
    failed: "text-red-700 bg-red-50",
    cancelled: "text-gray-600 bg-gray-100",
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {d.displayName || d.businessName}
            </h3>
            <p className="text-sm text-gray-500">/{d.businessName}</p>
          </div>
          <div className="ml-auto shrink-0">
            <StatusBadge store={store} />
          </div>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-5">
        {/* Loading overlay */}
        {detailLoading && (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
            <span className="ml-2 text-sm text-gray-400">Loading full details…</span>
          </div>
        )}

        {/* Suspension alert */}
        {store.suspendedByAdmin && (
          <Alert status="error" variant="left-accent">
            <div>
              <p className="font-medium">This store is suspended</p>
              {store.suspensionReason && <p className="text-sm mt-1">Reason: {store.suspensionReason}</p>}
              {store.suspendedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Since {new Date(store.suspendedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </Alert>
        )}

        {/* ── Order Stats ─────────────────────────────────────────────────── */}
        {orderStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{orderStats.totalOrders}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600">Completed</p>
              <p className="text-lg font-bold text-green-800">{orderStats.completedOrders}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600">Revenue</p>
              <p className="text-sm font-bold text-blue-800">{fmtCurrency(orderStats.totalRevenue)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-xs text-emerald-600">Profit</p>
              <p className="text-sm font-bold text-emerald-800">{fmtCurrency(orderStats.totalProfit)}</p>
            </div>
          </div>
        )}

        {/* ── Agent + Earnings ────────────────────────────────────────────── */}
        {agent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Agent</p>
              <div className="flex items-center gap-1.5 text-sm">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium text-gray-900">{agent.fullName}</span>
                <Badge colorScheme="info" variant="subtle" size="xs">
                  {agent.userType.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{agent.email}</span>
              </div>
              {agent.phone && (
                <div className="text-xs text-gray-500">📞 {agent.phone}</div>
              )}
              {(agent as any).createdAt && (
                <div className="text-xs text-gray-400">
                  Agent since {new Date((agent as any).createdAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Balances</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Wallet</span>
                <span className="text-sm font-semibold text-gray-900">
                  {typeof agent.walletBalance === 'number' ? fmtCurrency(agent.walletBalance) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Earnings</span>
                <span className="text-sm font-semibold text-green-700">
                  {typeof agent.earningsBalance === 'number' ? fmtCurrency(agent.earningsBalance) : '—'}
                </span>
              </div>
              {reconciliationLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <Spinner size="sm" /> Reconciling earnings...
                </div>
              )}
              {reconciliation && !reconciliationLoading && (
                <div className="pt-2 mt-1 border-t border-gray-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Earned</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {fmtCurrency(reconciliation.totalEarned)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Withdrawn</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {fmtCurrency(reconciliation.totalWithdrawn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Expected Available</span>
                    <span className="text-xs font-semibold text-gray-900">
                      {fmtCurrency(reconciliation.expectedAvailable)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Delta</span>
                    <span className={`text-xs font-semibold ${reconciliation.isBalanced ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {reconciliation.delta < 0 ? '-' : ''}{fmtCurrency(Math.abs(reconciliation.delta))}
                    </span>
                  </div>
                  {!reconciliation.isBalanced && (
                    <Alert status="warning" variant="left-accent">
                      Available earnings are {reconciliation.delta < 0 ? 'short by' : 'over by'} {fmtCurrency(Math.abs(reconciliation.delta))}.
                    </Alert>
                  )}
                </div>
              )}
              <div className="pt-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  className="w-full"
                  leftIcon={<DollarSign className="w-3 h-3" />}
                  onClick={() => onViewPayouts?.((agent as any)._id, store)}
                  disabled={!agentId}
                >
                  View Payouts
                </Button>
              </div>
              {reconciliation && !reconciliation.isBalanced && (
                <div className="pt-2">
                  <Button
                    size="xs"
                    variant="primary"
                    className="w-full"
                    onClick={() => agentId && onReconcile?.(agentId)}
                    disabled={!agentId || reconciliationLoading || reconcileApplying}
                    isLoading={reconcileApplying}
                  >
                    Apply Reconciliation
                  </Button>
                </div>
              )}
              {backfillLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                  <Spinner size="sm" /> Checking missing credits...
                </div>
              )}
              {backfillPreview && backfillPreview.missingCount > 0 && (
                <Alert status="warning" variant="left-accent">
                  Missing {backfillPreview.missingCount} profit credit(s) from completed orders
                  (GH₵ {backfillPreview.totalMissingAmount.toFixed(2)}).
                </Alert>
              )}
              {backfillPreview && backfillPreview.missingCount > 0 && (
                <div className="pt-2">
                  <Button
                    size="xs"
                    variant="outline"
                    className="w-full"
                    onClick={() => agentId && onBackfill?.(agentId)}
                    disabled={!agentId || backfillLoading || backfillApplying}
                    isLoading={backfillApplying}
                  >
                    Backfill Missing Credits
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Store Details ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Created</p>
            <p className="text-gray-900 font-medium">
              {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Approved</p>
            <p className="text-gray-900 font-medium">
              {d.isApproved
                ? (d.approvedAt ? new Date(d.approvedAt).toLocaleDateString() : "Yes")
                : "Pending"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Contact</p>
            <p className="text-gray-900 font-medium">{d.contactInfo?.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Email</p>
            <p className="text-gray-900 font-medium truncate">{d.contactInfo?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Payment Methods</p>
            <p className="text-gray-900 font-medium">
              {d.paymentMethods?.filter(pm => pm.isActive).length || 0} active
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Subaccount</p>
            <p className="text-gray-900 font-medium text-xs truncate">
              {d.paystackSubaccountId || "—"}
            </p>
          </div>
        </div>

        {/* ── Recent Orders ───────────────────────────────────────────────── */}
        {!detailLoading && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Recent Orders {recentOrders.length > 0 && `(last ${recentOrders.length})`}
            </p>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No orders yet</p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {recentOrders.map(order => (
                  <div
                    key={order._id}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-gray-700">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${orderStatusColor[order.status] ?? "text-gray-600 bg-gray-100"
                            }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {order.storefrontData?.customerInfo?.name || "Customer"}
                        {" · "}
                        {order.storefrontData?.items?.length ?? 0} item{(order.storefrontData?.items?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(order.storefrontData?.totalTierCost ?? order.total)}
                      </p>
                      {(order.storefrontData?.totalMarkup ?? 0) > 0 && (
                        <p className="text-xs text-emerald-600">+{fmtCurrency(order.storefrontData!.totalMarkup!)}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogBody>

      <DialogFooter justify="between">
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => onDelete(store)}
            disabled={isProcessing}
          >
            Delete
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            onClick={() => window.open(getStoreUrl(store.businessName), "_blank")}
          >
            Visit
          </Button>
          {!store.isApproved && (
            <Button
              variant="success"
              size="sm"
              leftIcon={<Shield className="w-4 h-4" />}
              onClick={() => onApprove(store._id!)}
              isLoading={isProcessing}
            >
              Approve
            </Button>
          )}
          {store.isApproved && (
            <Button
              variant={store.suspendedByAdmin ? "success" : "danger"}
              size="sm"
              leftIcon={store.suspendedByAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              onClick={() => onToggleStatus(store)}
              isLoading={isProcessing}
            >
              {store.suspendedByAdmin ? "Unsuspend" : "Suspend"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </Dialog>
  );
}

// =========================================================================
// Confirm/Input Dialog
// =========================================================================

interface ConfirmOpts {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'success' | 'primary';
  hasInput: boolean;
  inputRequired?: boolean;
  inputLabel: string;
  inputPlaceholder: string;
  onConfirm: (inputValue?: string) => void;
}

const CONFIRM_CLOSED: ConfirmOpts = {
  isOpen: false, title: '', message: '', confirmLabel: 'Confirm',
  variant: 'primary', hasInput: false, inputRequired: false, inputLabel: '', inputPlaceholder: '',
  onConfirm: () => { },
};

function ConfirmDialog({
  opts, input, onInputChange, loading, onClose, onConfirm,
}: {
  opts: ConfirmOpts;
  input: string;
  onInputChange: (v: string) => void;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const confirmDisabled = loading || (opts.inputRequired && !input.trim());

  return (
    <Dialog isOpen={opts.isOpen} onClose={onClose} size="sm">
      <DialogHeader>{opts.title}</DialogHeader>
      <DialogBody>
        <p className="text-sm text-gray-700">{opts.message}</p>
        {opts.hasInput && (
          <FormField label={opts.inputLabel} className="mt-4">
            <Input
              value={input}
              onChange={e => onInputChange(e.target.value)}
              placeholder={opts.inputPlaceholder}
              autoFocus
            />
          </FormField>
        )}
      </DialogBody>
      <DialogFooter>
        <div className="flex gap-2 justify-end w-full">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={opts.variant} onClick={onConfirm} isLoading={loading} disabled={confirmDisabled}>
            {opts.confirmLabel}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

// =========================================================================
// Main Page
// =========================================================================

export default function StoresPage() {
  const { addToast } = useToast();
  const [stores, setStores] = useState<AdminStorefrontData[]>([]);
  const [stats, setStats] = useState<AdminStorefrontStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedStore, setSelectedStore] = useState<AdminStorefrontData | null>(null);
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<AdminStorefrontDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [autoApproveLoading, setAutoApproveLoading] = useState(false);
  const [storefrontsOpen, setStorefrontsOpen] = useState(true);
  const [storefrontsOpenLoading, setStorefrontsOpenLoading] = useState(false);
  const [reconciliation, setReconciliation] = useState<EarningsReconciliation | null>(null);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const [reconcileApplying, setReconcileApplying] = useState(false);
  const [backfillPreview, setBackfillPreview] = useState<EarningsBackfillPreview | null>(null);
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillApplying, setBackfillApplying] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [payoutMode, setPayoutMode] = useState({
    autoPayoutEnabled: false,
    canAutoPayout: false,
    paystackConfigured: false,
  });

  // Payouts drawer (admin)
  const [payoutsDrawerOpen, setPayoutsDrawerOpen] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [agentPayouts, setAgentPayouts] = useState<any[]>([]);
  const [pendingPayoutsMap, setPendingPayoutsMap] = useState<Record<string, number>>({});
  const [selectedPayoutsStore, setSelectedPayoutsStore] = useState<AdminStorefrontData | null>(null);

  // Confirm dialog
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOpts>(CONFIRM_CLOSED);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Open store detail: set list-level store immediately, then lazy-load full detail
  const openStoreDetail = useCallback(async (store: AdminStorefrontData) => {
    setSelectedStore(store);
    setSelectedStoreDetail(null);
    if (!store._id) return;
    setDetailLoading(true);
    try {
      const detail = await storefrontService.getAdminStorefrontById(store._id);
      setSelectedStoreDetail(detail);
    } catch {
      // Detail load failed — dialog still shows with list-level data
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const agentId = typeof selectedStore?.agentId === "object"
      ? (selectedStore?.agentId as any)?._id
      : selectedStore?.agentId;

    if (!agentId) {
      setReconciliation(null);
      setBackfillPreview(null);
      return;
    }

    let active = true;
    setReconciliationLoading(true);
    walletService.getEarningsReconciliation(agentId)
      .then((data) => {
        if (active) setReconciliation(data);
      })
      .catch(() => {
        if (active) setReconciliation(null);
      })
      .finally(() => {
        if (active) setReconciliationLoading(false);
      });

    setBackfillLoading(true);
    walletService.getEarningsBackfillPreview(agentId)
      .then((data) => {
        if (active) setBackfillPreview(data);
      })
      .catch(() => {
        if (active) setBackfillPreview(null);
      })
      .finally(() => {
        if (active) setBackfillLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedStore]);

  const openConfirm = (opts: Omit<ConfirmOpts, 'isOpen'>) => {
    setConfirmInput('');
    setConfirmOpts({ ...opts, isOpen: true });
  };
  const closeConfirm = () => setConfirmOpts(CONFIRM_CLOSED);
  const doConfirm = async () => {
    setConfirmLoading(true);
    try {
      await Promise.resolve(confirmOpts.onConfirm(confirmOpts.hasInput ? confirmInput : undefined));
      closeConfirm();
    } catch {
      // error already handled inside handler
    } finally {
      setConfirmLoading(false);
    }
  };

  const updateAgentEarningsBalance = (nextBalance: number) => {
    setSelectedStore(prev => {
      if (!prev || typeof prev.agentId !== "object") return prev;
      return { ...prev, agentId: { ...(prev.agentId as any), earningsBalance: nextBalance } };
    });
    setSelectedStoreDetail(prev => {
      if (!prev || typeof prev.agentId !== "object") return prev;
      return { ...prev, agentId: { ...(prev.agentId as any), earningsBalance: nextBalance } };
    });
  };

  const handleReconcileEarnings = (agentId: string) => {
    const delta = reconciliation?.delta ?? 0;
    const amount = Math.abs(delta);
    const action = delta < 0 ? "credit" : "debit";

    openConfirm({
      title: "Reconcile Earnings",
      message: amount > 0
        ? `This will apply a ${action} adjustment of GH₵ ${amount.toFixed(2)} to sync the balance with earned minus withdrawn.`
        : "This will reconcile the earnings balance using the ledger calculation.",
      confirmLabel: "Apply Adjustment",
      variant: "primary",
      hasInput: true,
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Enter reason for adjustment…",
      onConfirm: async (reason) => {
        setReconcileApplying(true);
        try {
          const data = await walletService.applyEarningsReconciliation(agentId, reason);
          setReconciliation(data);
          updateAgentEarningsBalance(data.availableBalance);
          addToast("Earnings reconciled", "success");
        } catch {
          addToast("Failed to reconcile earnings", "error");
          throw new Error("failed");
        } finally {
          setReconcileApplying(false);
        }
      },
    });
  };

  const handleBackfillEarnings = (agentId: string) => {
    const count = backfillPreview?.missingCount || 0;
    const total = backfillPreview?.totalMissingAmount || 0;

    openConfirm({
      title: "Backfill Missing Credits",
      message: count > 0
        ? `This will credit ${count} missing order(s) totaling GH₵ ${total.toFixed(2)}.`
        : "No missing credits were detected for this agent.",
      confirmLabel: "Apply Backfill",
      variant: "primary",
      hasInput: true,
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Enter reason for backfill…",
      onConfirm: async (reason) => {
        setBackfillApplying(true);
        try {
          const data = await walletService.applyEarningsBackfill(agentId, reason);
          updateAgentEarningsBalance(data.availableBalance);
          const refreshed = await walletService.getEarningsBackfillPreview(agentId);
          setBackfillPreview(refreshed);
          const updatedReconciliation = await walletService.getEarningsReconciliation(agentId);
          setReconciliation(updatedReconciliation);
          addToast("Backfill applied", "success");
        } catch {
          addToast("Failed to apply backfill", "error");
          throw new Error("failed");
        } finally {
          setBackfillApplying(false);
        }
      },
    });
  };

  // Debounce search input to avoid lots of rapid requests
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusFilter =
        filter === 'all'
          ? undefined
          : (filter as 'active' | 'inactive' | 'suspended' | 'pending' | 'approved');
      const paging = { limit, offset: (page - 1) * limit };

      const [storesRes, statsRes, autoApproveRes, siteSettingsRes, allPayoutsRes, payoutModeRes] = await Promise.all([
        storefrontService.getAdminStorefronts({ status: statusFilter, search: debouncedSearch || undefined, ...paging }),
        storefrontService.getAdminStats(),
        settingsService.getAutoApproveStorefronts(),
        settingsService.getSiteSettings().catch(() => ({ storefrontsOpen: true })),
        walletService.getPendingPayouts().catch(() => [] as any[]),
        walletService.getAutoPayoutAvailability().catch(() => ({
          autoPayoutEnabled: false,
          canAutoPayout: false,
          paystackConfigured: false,
          message: "",
        })),
      ]);

      setStores(storesRes.storefronts);
      setTotal(storesRes.total);
      setStats(statsRes);
      setAutoApprove(autoApproveRes.autoApproveStorefronts);
      setStorefrontsOpen(siteSettingsRes.storefrontsOpen ?? true);
      setPayoutMode({
        autoPayoutEnabled: payoutModeRes.autoPayoutEnabled,
        canAutoPayout: payoutModeRes.canAutoPayout,
        paystackConfigured: payoutModeRes.paystackConfigured,
      });

      // Build pending payout count map per agent
      const map: Record<string, number> = {};
      (allPayoutsRes as any[]).forEach((p: any) => {
        if (p.status === 'pending') {
          const uid = typeof p.user === 'object' ? (p.user as any)?._id : p.user;
          if (uid) map[uid as string] = (map[uid as string] || 0) + 1;
        }
      });
      setPendingPayoutsMap(map);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
      setError("Failed to load stores data.");
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const handleApprove = async (storefrontId: string) => {
    try {
      setActionLoading(storefrontId);
      await storefrontService.approveStorefront(storefrontId);
      addToast("Store approved successfully", "success");
      setStores(prev => prev.map(s => s._id === storefrontId
        ? { ...s, isApproved: true, approvedAt: new Date() as unknown as string }
        : s
      ));
      setSelectedStore(null);
    } catch {
      addToast("Failed to approve store", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = (storefrontId: string) => {
    openConfirm({
      title: 'Suspend Store',
      message: 'Suspending this store will make it inaccessible to customers.',
      confirmLabel: 'Suspend',
      variant: 'danger',
      hasInput: true,
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Enter reason for suspension…',
      onConfirm: async (reason) => {
        setActionLoading(storefrontId);
        try {
          await storefrontService.suspendStorefront(storefrontId, reason || undefined);
          addToast('Store suspended', 'success');
          setStores(prev => prev.map(s => s._id === storefrontId
            ? { ...s, suspendedByAdmin: true, suspensionReason: reason || '', suspendedAt: new Date() as unknown as string }
            : s
          ));
          setSelectedStore(null);
        } catch {
          addToast('Failed to suspend store', 'error');
          throw new Error('failed');
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleUnsuspend = async (storefrontId: string) => {
    try {
      setActionLoading(storefrontId);
      await storefrontService.unsuspendStorefront(storefrontId);
      addToast('Store unsuspended', 'success');
      setStores(prev => prev.map(s => s._id === storefrontId
        ? { ...s, suspendedByAdmin: false, suspensionReason: undefined as unknown as string }
        : s
      ));
      setSelectedStore(null);
    } catch {
      addToast('Failed to unsuspend store', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (store: AdminStorefrontData) => {
    if (store.suspendedByAdmin) {
      await handleUnsuspend(store._id!);
    } else {
      await handleSuspend(store._id!);
    }
  };

  const handleDelete = (store: AdminStorefrontData) => {
    openConfirm({
      title: `Delete "${store.businessName}"`,
      message: 'This action is permanent and cannot be undone. The agent will lose access to their storefront.',
      confirmLabel: 'Delete Permanently',
      variant: 'danger',
      hasInput: true,
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Enter reason for deletion…',
      onConfirm: async (reason) => {
        setActionLoading(store._id!);
        try {
          await storefrontService.adminDeleteStorefront(store._id!, reason || undefined);
          addToast('Store deleted', 'success');
          setStores(prev => prev.filter(s => s._id !== store._id));
          setSelectedStore(null);
        } catch {
          addToast('Failed to delete store', 'error');
          throw new Error('failed');
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // --- Admin: fetch payouts for the selected agent ---
  const openPayoutsForAgent = async (agentId: string, store?: AdminStorefrontData) => {
    try {
      setPayoutsDrawerOpen(true);
      setSelectedPayoutsStore(store ?? selectedStore ?? null);
      setPayoutsLoading(true);
      // getPendingPayouts now returns pending + approved + processing
      const allPayouts = await walletService.getPendingPayouts();
      const filtered = allPayouts.filter(p => {
        const userId = typeof p.user === 'object' ? (p.user as any)?._id : p.user;
        return userId === agentId;
      });
      setAgentPayouts(filtered || []);
    } catch {
      addToast('Failed to load payouts', 'error');
    } finally {
      setPayoutsLoading(false);
    }
  };

  const openAllPayouts = async () => {
    try {
      setPayoutsDrawerOpen(true);
      setSelectedPayoutsStore(null);
      setPayoutsLoading(true);
      const allPayouts = await walletService.getPendingPayouts();
      setAgentPayouts(allPayouts || []);
    } catch {
      addToast('Failed to load payouts', 'error');
    } finally {
      setPayoutsLoading(false);
    }
  };

  const refreshPayouts = async () => {
    const store = selectedPayoutsStore || selectedStore;
    if (!store) {
      // "All Payouts" mode — reload without agent filter
      await openAllPayouts();
      return;
    }
    const agentId = typeof store.agentId === 'object' ? (store.agentId as any)._id : store.agentId;
    if (agentId) await openPayoutsForAgent(agentId as string);
  };

  // Filtering is now handled server-side; we use returned page results.
  const filteredStores = stores;

  // Stats for tabs (fallback to current page counts if stats not yet loaded)
  const counts = {
    all: stats?.totalStores ?? stores.length,
    active: stats?.activeStores ?? stores.filter(s => s.isApproved && s.isActive && !s.suspendedByAdmin).length,
    pending: stats?.pendingApproval ?? stores.filter(s => !s.isApproved).length,
    suspended: stats?.suspendedStores ?? stores.filter(s => s.suspendedByAdmin).length,
    inactive: stats
      ? stats.totalStores - (stats.activeStores + stats.pendingApproval + stats.suspendedStores)
      : stores.filter(s => s.isActive === false && s.isApproved && !s.suspendedByAdmin).length,
  };

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Agent Stores</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage and monitor all agent storefronts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          {(() => {
            const totalPendingPayouts = Object.values(pendingPayoutsMap).reduce((sum, n) => sum + n, 0);
            return (
              <Button
                variant={totalPendingPayouts > 0 ? "primary" : "outline"}
                size="sm"
                leftIcon={<DollarSign className="w-4 h-4" />}
                onClick={openAllPayouts}
              >
                Payouts
                {totalPendingPayouts > 0 && (
                  <Badge colorScheme="error" variant="solid" size="xs" rounded className="ml-1.5">
                    {totalPendingPayouts}
                  </Badge>
                )}
              </Button>
            );
          })()}
        </div>
      </div>

      {/* Stats Grid — using design system StatsGrid */}
      {stats && (
        <StatsGrid
          columns={3}
          gap="sm"
          stats={[
            { title: "Total Stores", value: stats.totalStores, icon: <Store className="w-5 h-5" />, size: "sm" },
            { title: "Active", value: stats.activeStores, icon: <CheckCircle className="w-5 h-5" />, size: "sm" },
            { title: "Pending", value: stats.pendingApproval, icon: <Clock className="w-5 h-5" />, size: "sm" },
            { title: "Suspended", value: stats.suspendedStores, icon: <ShieldAlert className="w-5 h-5" />, size: "sm" },
            { title: "Orders", value: stats.totalStorefrontOrders, icon: <ShoppingBag className="w-5 h-5" />, size: "sm" },
            { title: "Revenue", value: `₵${stats.totalRevenue.toFixed(0)}`, icon: <TrendingUp className="w-5 h-5" />, size: "sm" },
          ]}
        />
      )}

      {/* Global Storefront Availability */}
      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Storefront Availability</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {storefrontsOpen
                ? "All storefronts are open to customers"
                : "All storefronts are closed by admin"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={storefrontsOpen}
              onChange={async () => {
                setStorefrontsOpenLoading(true);
                try {
                  const res = await settingsService.toggleStorefrontsAvailability();
                  setStorefrontsOpen(res.storefrontsOpen);
                  addToast(`Storefronts ${res.storefrontsOpen ? "opened" : "closed"}`, "success");
                } catch {
                  addToast("Failed to update storefront availability", "error");
                } finally {
                  setStorefrontsOpenLoading(false);
                }
              }}
              disabled={storefrontsOpenLoading}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {storefrontsOpen ? "Open" : "Closed"}
            </span>
          </label>
        </CardBody>
      </Card>

      {/* Auto-Approve Toggle */}
      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Auto-Approve New Storefronts</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {autoApprove
                ? "New agent storefronts are approved automatically"
                : "New storefronts require manual admin approval"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={autoApprove}
              onChange={async () => {
                setAutoApproveLoading(true);
                try {
                  const newVal = !autoApprove;
                  await settingsService.updateAutoApproveStorefronts(newVal);
                  setAutoApprove(newVal);
                  addToast(`Storefront auto-approval ${newVal ? "enabled" : "disabled"}`, "success");
                } catch {
                  addToast("Failed to update auto-approval setting", "error");
                } finally {
                  setAutoApproveLoading(false);
                }
              }}
              disabled={autoApproveLoading}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {autoApprove ? "Auto" : "Manual"}
            </span>
          </label>
        </CardBody>
      </Card>

      {/* Error State */}
      {error && (
        <Alert status="error" variant="left-accent" isClosable onClose={() => setError(null)}>
          <div className="flex items-center justify-between w-full">
            <span>{error}</span>
            <Button variant="link" size="sm" onClick={fetchData}>Retry</Button>
          </div>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card noPadding>
        <CardBody className="p-0">
          {/* Search + Filter Tabs */}
          <div className="p-3 sm:p-4 space-y-3 border-b border-gray-100">
            {/* Search */}
            <Input
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search stores, agents, emails..."
              size="sm"
            />

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(value) => { setFilter(value); setPage(1); }}>
              <TabsList className="w-full overflow-x-auto">
                <TabsTrigger value="all">
                  All <Badge size="xs" colorScheme="gray" variant="subtle" className="ml-1.5">{counts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active <Badge size="xs" colorScheme="success" variant="subtle" className="ml-1.5">{counts.active}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending <Badge size="xs" colorScheme="warning" variant="subtle" className="ml-1.5">{counts.pending}</Badge>
                </TabsTrigger>
                <TabsTrigger value="suspended">
                  Suspended <Badge size="xs" colorScheme="error" variant="subtle" className="ml-1.5">{counts.suspended}</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Single content area for all tabs — filtered list */}
              {["all", "active", "pending", "suspended"].map(tab => (
                <TabsContent key={tab} value={tab} className="mt-0">
                  {/* Loading */}
                  {loading && (
                    <div className="flex items-center justify-center py-16">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && filteredStores.length === 0 && (
                    <div className="py-12 sm:py-16 text-center px-4">
                      <Store className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">No stores found</h3>
                      <p className="text-sm text-gray-500">
                        {search ? "Try adjusting your search or filters." : "No agent stores have been created yet."}
                      </p>
                    </div>
                  )}

                  {/* Desktop Table (lg+) */}
                  {!loading && filteredStores.length > 0 && (
                    <>
                      <div className="hidden lg:block">
                        <Table variant="simple" size="md">
                          <TableHeader>
                            <TableRow isHoverable={false}>
                              <TableHeaderCell>Store</TableHeaderCell>
                              <TableHeaderCell>Agent</TableHeaderCell>
                              <TableHeaderCell>Status</TableHeaderCell>
                              <TableHeaderCell>Created</TableHeaderCell>
                              <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStores.map(store => {
                              const agent = typeof store.agentId === "object" ? store.agentId : null;
                              const isProcessing = actionLoading === store._id;
                              return (
                                <TableRow key={store._id}>
                                  <TableCell>
                                    <button
                                      className="flex items-center gap-3 text-left group"
                                      onClick={() => openStoreDetail(store)}
                                    >
                                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                                        <Store className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                          {store.displayName || store.businessName}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">/{store.businessName}</p>
                                      </div>
                                    </button>
                                  </TableCell>
                                  <TableCell>
                                    {agent ? (
                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{agent.fullName}</p>
                                        <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">N/A</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1.5 items-start">
                                      <StatusBadge store={store} />
                                      {(() => {
                                        const agentId = typeof store.agentId === 'object' ? (store.agentId as any)._id : store.agentId;
                                        const count = agentId ? (pendingPayoutsMap[agentId as string] || 0) : 0;
                                        return count > 0 ? (
                                          <Badge colorScheme="warning" variant="solid" size="xs" rounded>
                                            {count} pending payout{count > 1 ? 's' : ''}
                                          </Badge>
                                        ) : null;
                                      })()}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-500">
                                      {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      {(() => {
                                        const agentId = typeof store.agentId === 'object' ? (store.agentId as any)._id : store.agentId;
                                        return agentId ? (
                                          <Button
                                            iconOnly
                                            variant="ghost"
                                            size="sm"
                                            leftIcon={<DollarSign className={`w-4 h-4 ${pendingPayoutsMap[agentId as string] ? 'text-amber-500' : 'text-gray-400'}`} />}
                                            onClick={() => { setSelectedPayoutsStore(store); openPayoutsForAgent(agentId as string); }}
                                            aria-label="View payouts"
                                          />
                                        ) : null;
                                      })()}
                                      <Button
                                        iconOnly
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Eye className="w-4 h-4" />}
                                        onClick={() => openStoreDetail(store)}
                                        aria-label="View details"
                                      />
                                      <Button
                                        iconOnly
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<ExternalLink className="w-4 h-4" />}
                                        onClick={() => window.open(getStoreUrl(store.businessName), "_blank")}
                                        aria-label="Visit store"
                                      />
                                      {!store.isApproved && (
                                        <Button
                                          variant="success"
                                          size="xs"
                                          leftIcon={<Shield className="w-3 h-3" />}
                                          onClick={() => handleApprove(store._id!)}
                                          isLoading={isProcessing}
                                        >
                                          Approve
                                        </Button>
                                      )}
                                      {store.isApproved && (
                                        <Button
                                          variant={store.suspendedByAdmin ? "success" : "danger"}
                                          size="xs"
                                          leftIcon={store.suspendedByAdmin ? <ShieldOff className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                          onClick={() => handleToggleStatus(store)}
                                          isLoading={isProcessing}
                                        >
                                          {store.suspendedByAdmin ? "Unsuspend" : "Suspend"}
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Mobile Card Layout (< lg) */}
                      <div className="lg:hidden divide-y divide-gray-100">
                        {filteredStores.map(store => {
                          const agent = typeof store.agentId === "object" ? store.agentId : null;
                          const isProcessing = actionLoading === store._id;
                          return (
                            <div
                              key={store._id}
                              className="p-3 sm:p-4 active:bg-gray-50 transition-colors"
                            >
                              {/* Top: Store name + Status */}
                              <button
                                className="w-full flex items-start justify-between gap-3 mb-2.5 text-left"
                                onClick={() => openStoreDetail(store)}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Store className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                      {store.displayName || store.businessName}
                                    </p>
                                    {agent && (
                                      <p className="text-xs text-gray-400 truncate">{agent.fullName}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <StatusBadge store={store} />
                                  {(() => {
                                    const agentId = typeof store.agentId === 'object' ? (store.agentId as any)._id : store.agentId;
                                    const count = agentId ? (pendingPayoutsMap[agentId as string] || 0) : 0;
                                    return count > 0 ? (
                                      <Badge colorScheme="warning" variant="solid" size="xs" rounded>
                                        {count} payout{count > 1 ? 's' : ''}
                                      </Badge>
                                    ) : null;
                                  })()}
                                </div>
                              </button>

                              {/* Bottom: Agent email + Actions */}
                              <div className="flex items-center justify-between gap-2 ml-[46px]">
                                <span className="text-xs text-gray-400 truncate">
                                  {agent?.email || ""}
                                </span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {(() => {
                                    const agentId = typeof store.agentId === 'object' ? (store.agentId as any)._id : store.agentId;
                                    return agentId ? (
                                      <Button
                                        iconOnly
                                        variant="ghost"
                                        size="xs"
                                        leftIcon={<DollarSign className={`w-3.5 h-3.5 ${pendingPayoutsMap[agentId as string] ? 'text-amber-500' : 'text-gray-400'}`} />}
                                        onClick={() => { setSelectedPayoutsStore(store); openPayoutsForAgent(agentId as string); }}
                                        aria-label="View payouts"
                                      />
                                    ) : null;
                                  })()}
                                  <Button
                                    iconOnly
                                    variant="ghost"
                                    size="xs"
                                    leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                                    onClick={() => window.open(getStoreUrl(store.businessName), "_blank")}
                                    aria-label="Visit store"
                                  />
                                  {!store.isApproved && (
                                    <Button
                                      variant="success"
                                      size="xs"
                                      onClick={() => handleApprove(store._id!)}
                                      isLoading={isProcessing}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {store.isApproved && (
                                    <Button
                                      variant={store.suspendedByAdmin ? "success" : "danger"}
                                      size="xs"
                                      onClick={() => handleToggleStatus(store)}
                                      isLoading={isProcessing}
                                    >
                                      {store.suspendedByAdmin ? "Unsuspend" : "Suspend"}
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Suspension reason on mobile */}
                              {store.suspendedByAdmin && store.suspensionReason && (
                                <div className="mt-2 ml-[46px]">
                                  <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 inline-block">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                    {store.suspensionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Results count */}
                      <div className="px-3 sm:px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
                        Showing {(total === 0 ? 0 : (page - 1) * limit + 1)} - {Math.min(page * limit, total)} of {total} stores
                      </div>

                      {/* Pagination controls */}
                      <div className="px-3 sm:px-4 pt-2 pb-4 bg-gray-50 border-t border-gray-100">
                        <Pagination
                          currentPage={page}
                          totalPages={Math.max(1, Math.ceil(total / limit))}
                          totalItems={total}
                          itemsPerPage={limit}
                          onPageChange={(next) => setPage(next)}
                          onItemsPerPageChange={(nextLimit) => {
                            setLimit(nextLimit);
                            setPage(1);
                          }}
                          showInfo={false}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardBody>
      </Card>

      <PayoutDrawer
        open={payoutsDrawerOpen}
        payouts={agentPayouts}
        loading={payoutsLoading}
        title="Payout Requests"
        subtitle={selectedPayoutsStore ? `${selectedPayoutsStore.displayName || selectedPayoutsStore.businessName}` : undefined}
        autoMode={payoutMode.canAutoPayout}
        paystackConfigured={payoutMode.paystackConfigured}
        onClose={() => setPayoutsDrawerOpen(false)}
        onRefresh={refreshPayouts}
      />

      {/* Store Detail Dialog */}
      <StoreDetailDialog
        store={selectedStore}
        detail={selectedStoreDetail}
        detailLoading={detailLoading}
        isOpen={!!selectedStore}
        onClose={() => { setSelectedStore(null); setSelectedStoreDetail(null); }}
        onApprove={handleApprove}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        isProcessing={!!actionLoading}
        onViewPayouts={openPayoutsForAgent}
        reconciliation={reconciliation}
        reconciliationLoading={reconciliationLoading}
        onReconcile={handleReconcileEarnings}
        reconcileApplying={reconcileApplying}
        backfillPreview={backfillPreview}
        backfillLoading={backfillLoading}
        onBackfill={handleBackfillEarnings}
        backfillApplying={backfillApplying}
      />

      {/* Confirm / Input Dialog */}
      <ConfirmDialog
        opts={confirmOpts}
        input={confirmInput}
        onInputChange={setConfirmInput}
        loading={confirmLoading}
        onClose={closeConfirm}
        onConfirm={doConfirm}
      />
    </div>
  );
}
