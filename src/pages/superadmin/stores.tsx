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
} from "../../design-system";
import { useToast } from "../../design-system";
import { walletService } from '../../services/wallet-service';
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
  X,
  DollarSign,
} from "lucide-react";

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
}) {
  if (!store) return null;

  // Use the rich detail when available, fall back to list-level data
  const d = detail ?? store;
  const agent = detail?.agentId ?? (typeof store.agentId === "object" ? store.agentId : null);
  const orderStats = detail?.orderStats;
  const recentOrders = detail?.recentOrders ?? [];

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
              <div className="pt-1.5">
                <Button
                  size="xs"
                  variant="outline"
                  className="w-full"
                  leftIcon={<DollarSign className="w-3 h-3" />}
                  onClick={() => onViewPayouts?.((agent as any)._id, store)}
                  disabled={!(agent as any)._id}
                >
                  View Payouts
                </Button>
              </div>
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
            onClick={() => window.open(`/store/${store.businessName}`, "_blank")}
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
  inputLabel: string;
  inputPlaceholder: string;
  onConfirm: (inputValue?: string) => void;
}

const CONFIRM_CLOSED: ConfirmOpts = {
  isOpen: false, title: '', message: '', confirmLabel: 'Confirm',
  variant: 'primary', hasInput: false, inputLabel: '', inputPlaceholder: '',
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
          <Button variant={opts.variant} onClick={onConfirm} isLoading={loading}>
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

  // Payouts drawer (admin)
  const [payoutsDrawerOpen, setPayoutsDrawerOpen] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [agentPayouts, setAgentPayouts] = useState<any[]>([]);
  const [payoutActionLoading, setPayoutActionLoading] = useState<string | null>(null);
  const [pendingPayoutsMap, setPendingPayoutsMap] = useState<Record<string, number>>({});
  const [selectedPayoutsStore, setSelectedPayoutsStore] = useState<AdminStorefrontData | null>(null);
  const [bulkApproveLoading, setBulkApproveLoading] = useState(false);

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

  // Reactive helper — get current agent ID from selected payouts store
  const getPayoutsAgentId = () => {
    const store = selectedPayoutsStore || selectedStore;
    if (!store) return null;
    return typeof store.agentId === 'object' ? (store.agentId as any)._id as string : store.agentId as string;
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storesRes, statsRes, autoApproveRes, allPayoutsRes] = await Promise.all([
        storefrontService.getAdminStorefronts(),
        storefrontService.getAdminStats(),
        settingsService.getAutoApproveStorefronts(),
        walletService.getPendingPayouts().catch(() => [] as any[]),
      ]);
      setStores(storesRes.storefronts);
      setStats(statsRes);
      setAutoApprove(autoApproveRes.autoApproveStorefronts);
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
  }, []);

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

  const handleApprovePayout = (payoutId: string) => {
    openConfirm({
      title: 'Approve Payout',
      message: "The agent's earnings will be deducted and the payout will be marked ready for transfer.",
      confirmLabel: 'Approve',
      variant: 'success',
      hasInput: false,
      inputLabel: '',
      inputPlaceholder: '',
      onConfirm: async () => {
        setPayoutActionLoading(payoutId);
        try {
          await walletService.approvePayout(payoutId);
          addToast('Payout approved — ready for Paystack transfer', 'success');
          // Reactive update — no full reload needed
          setAgentPayouts(prev => prev.map(p => p._id === payoutId ? { ...p, status: 'approved' } : p));
          const agentId = getPayoutsAgentId();
          if (agentId) setPendingPayoutsMap(prev => ({
            ...prev,
            [agentId]: Math.max(0, (prev[agentId] || 0) - 1),
          }));
          fetchData().catch(() => { });
        } catch (err: unknown) {
          addToast((err instanceof Error ? err.message : null) || 'Failed to approve payout', 'error');
          throw err;
        } finally {
          setPayoutActionLoading(null);
        }
      },
    });
  };

  const handleRejectPayout = (payoutId: string) => {
    openConfirm({
      title: 'Reject Payout',
      message: 'The agent will be notified and can submit a new request.',
      confirmLabel: 'Reject',
      variant: 'danger',
      hasInput: true,
      inputLabel: 'Rejection reason (optional)',
      inputPlaceholder: 'e.g. Invalid account details, insufficient verification…',
      onConfirm: async (reason) => {
        setPayoutActionLoading(payoutId);
        try {
          await walletService.rejectPayout(payoutId, reason || undefined);
          addToast('Payout rejected', 'success');
          // Reactive update
          setAgentPayouts(prev => prev.map(p => p._id === payoutId
            ? { ...p, status: 'rejected', rejectionReason: reason || 'Rejected by administrator' }
            : p
          ));
          const agentId = getPayoutsAgentId();
          if (agentId) setPendingPayoutsMap(prev => ({
            ...prev,
            [agentId]: Math.max(0, (prev[agentId] || 0) - 1),
          }));
          fetchData().catch(() => { });
        } catch (err: unknown) {
          addToast((err instanceof Error ? err.message : null) || 'Failed to reject payout', 'error');
          throw err;
        } finally {
          setPayoutActionLoading(null);
        }
      },
    });
  };

  const handleProcessPayout = (payoutId: string) => {
    openConfirm({
      title: 'Send via Paystack Transfer',
      message: 'This will initiate a live Paystack transfer to the agent. The money will leave the platform balance immediately.',
      confirmLabel: 'Send Transfer',
      variant: 'primary',
      hasInput: false,
      inputLabel: '',
      inputPlaceholder: '',
      onConfirm: async () => {
        setPayoutActionLoading(payoutId);
        try {
          const updated = await walletService.processPayout(payoutId);
          addToast('Paystack transfer initiated — awaiting webhook confirmation', 'success');
          setAgentPayouts(prev => prev.map(p => p._id === payoutId ? { ...p, ...updated, status: 'processing' } : p));
          fetchData().catch(() => { });
        } catch (err: unknown) {
          addToast((err instanceof Error ? err.message : null) || 'Failed to process payout transfer', 'error');
          throw err;
        } finally {
          setPayoutActionLoading(null);
        }
      },
    });
  };

  const handleMarkPayoutPaid = (payoutId: string) => {
    openConfirm({
      title: 'Mark Payout as Manually Paid',
      message: 'Confirm that you have personally sent the funds to the agent (MoMo, bank transfer, etc.).',
      confirmLabel: 'Mark as Paid',
      variant: 'success',
      hasInput: true,
      inputLabel: 'Transfer Reference (optional)',
      inputPlaceholder: 'e.g. MoMo transaction ID or bank ref',
      onConfirm: async (ref?: string) => {
        setPayoutActionLoading(payoutId);
        try {
          const updated = await walletService.markPayoutComplete(payoutId, ref || undefined);
          addToast('Payout marked as completed', 'success');
          setAgentPayouts(prev => prev.map(p => p._id === payoutId ? { ...p, ...updated, status: 'completed' } : p));
          fetchData().catch(() => { });
        } catch (err: unknown) {
          addToast((err instanceof Error ? err.message : null) || 'Failed to mark payout complete', 'error');
          throw err;
        } finally {
          setPayoutActionLoading(null);
        }
      },
    });
  };

  const handleBulkApprove = () => {
    const pending = agentPayouts.filter(p => p.status === 'pending');
    if (pending.length === 0) return;
    openConfirm({
      title: `Approve All ${pending.length} Payout${pending.length > 1 ? 's' : ''}`,
      message: `Each agent's earnings will be deducted for all ${pending.length} pending payout request${pending.length > 1 ? 's' : ''}.`,
      confirmLabel: `Approve All`,
      variant: 'success',
      hasInput: false,
      inputLabel: '',
      inputPlaceholder: '',
      onConfirm: async () => {
        setBulkApproveLoading(true);
        let approved = 0;
        for (const p of pending) {
          try {
            await walletService.approvePayout(p._id);
            approved++;
          } catch {
            // continue with remaining
          }
        }
        setBulkApproveLoading(false);
        if (approved > 0) {
          addToast(`${approved} payout${approved > 1 ? 's' : ''} approved`, 'success');
          // Reactive update
          setAgentPayouts(prev => prev.map(p => p.status === 'pending' ? { ...p, status: 'approved' } : p));
          const agentId = getPayoutsAgentId();
          if (agentId) setPendingPayoutsMap(prev => ({ ...prev, [agentId]: 0 }));
          fetchData().catch(() => { });
        }
      },
    });
  };

  // Filtering
  const filteredStores = stores.filter(store => {
    if (filter === "active" && !(store.isApproved && store.isActive && !store.suspendedByAdmin)) return false;
    if (filter === "pending" && store.isApproved) return false;
    if (filter === "suspended" && !store.suspendedByAdmin) return false;
    if (filter === "inactive" && (store.isActive || !store.isApproved || store.suspendedByAdmin)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (store.displayName || store.businessName || "").toLowerCase();
      const agentName = (typeof store.agentId === "object" ? store.agentId.fullName : "").toLowerCase();
      const agentEmail = (typeof store.agentId === "object" ? store.agentId.email : "").toLowerCase();
      return name.includes(q) || agentName.includes(q) || agentEmail.includes(q);
    }
    return true;
  });

  // Stats for tabs
  const counts = {
    all: stores.length,
    active: stores.filter(s => s.isApproved && s.isActive && !s.suspendedByAdmin).length,
    pending: stores.filter(s => !s.isApproved).length,
    suspended: stores.filter(s => s.suspendedByAdmin).length,
    inactive: stores.filter(s => s.isActive === false && s.isApproved && !s.suspendedByAdmin).length,
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stores, agents, emails..."
              size="sm"
            />

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={setFilter}>
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
                                        onClick={() => window.open(`/store/${store.businessName}`, "_blank")}
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
                                    onClick={() => window.open(`/store/${store.businessName}`, "_blank")}
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
                        Showing {filteredStores.length} of {stores.length} stores
                      </div>
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardBody>
      </Card>

      {/* Payout Side Drawer */}
      {payoutsDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setPayoutsDrawerOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] z-50 bg-white shadow-2xl flex flex-col">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-white shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900">Payout Requests</h3>
                </div>
                {selectedPayoutsStore && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {selectedPayoutsStore.displayName || selectedPayoutsStore.businessName}
                    {(() => {
                      const agent = typeof selectedPayoutsStore.agentId === 'object' ? selectedPayoutsStore.agentId : null;
                      return agent ? ` · ${agent.fullName}` : '';
                    })()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {agentPayouts.filter(p => p.status === 'pending').length > 0 && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={handleBulkApprove}
                    isLoading={bulkApproveLoading}
                    disabled={!!payoutActionLoading || bulkApproveLoading}
                  >
                    Approve All ({agentPayouts.filter(p => p.status === 'pending').length})
                  </Button>
                )}
                <Button
                  iconOnly
                  size="sm"
                  variant="ghost"
                  leftIcon={<RefreshCw className={`w-4 h-4 ${payoutsLoading ? 'animate-spin' : ''}`} />}
                  onClick={refreshPayouts}
                  disabled={payoutsLoading}
                  aria-label="Refresh"
                />
                <button
                  onClick={() => setPayoutsDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable payout list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {payoutsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : agentPayouts.length === 0 ? (
                <div className="py-16 text-center">
                  <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No payout requests</p>
                  <p className="text-xs text-gray-400 mt-1">This agent has no pending, approved, or processing payouts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentPayouts.map(p => {
                    const isPending = p.status === 'pending';
                    const isApproved = p.status === 'approved';
                    const isProcessing = p.status === 'processing';
                    const isActionable = isPending || isApproved;
                    const statusColor = isPending ? 'warning' : isApproved ? 'info' : isProcessing ? 'info' : p.status === 'completed' ? 'success' : 'error';
                    const statusLabel = isPending ? 'Pending Review' : isApproved ? 'Approved' : isProcessing ? 'Processing' : p.status === 'completed' ? 'Completed' : p.status === 'rejected' ? 'Rejected' : p.status === 'failed' ? 'Failed' : p.status;

                    return (
                      <div key={p._id} className={`border rounded-xl p-4 ${isActionable ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge colorScheme={statusColor as 'warning' | 'info' | 'success' | 'error'}>{statusLabel}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(p.requestedAt || p.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold">GH₵ {p.amount.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <div className="text-xs text-gray-500">Destination</div>
                            <div className="font-medium text-sm">
                              {p.destination.type === 'mobile_money'
                                ? `${p.destination.mobileProvider} — ${p.destination.phoneNumber}`
                                : `Bank — ${p.destination.accountNumber || ''}`}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Fee Bearer</div>
                            <div className="font-medium capitalize text-sm">{p.metadata?.feeBearer || 'agent'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Transfer Fee</div>
                            <div className="font-medium text-orange-600 text-sm">
                              {p.transferFee != null ? `GH₵ ${p.transferFee.toFixed(2)}` : '—'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Agent Receives</div>
                            <div className="font-medium text-green-600 text-sm">
                              {p.netAmount != null ? `GH₵ ${p.netAmount.toFixed(2)}` : `GH₵ ${p.amount.toFixed(2)}`}
                            </div>
                          </div>
                        </div>

                        {/* Paystack transfer ref */}
                        {p.paystackTransfer?.transferReference && (
                          <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 mb-3">
                            <span className="font-medium">Transfer ref:</span> {p.paystackTransfer.transferReference}
                            {p.paystackTransfer.transferCode && <> &bull; <span className="font-medium">Code:</span> {p.paystackTransfer.transferCode}</>}
                            {p.paystackTransfer.failureReason && (
                              <div className="text-red-500 mt-1">
                                <span className="font-medium">Failure:</span> {p.paystackTransfer.failureReason}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        {isActionable && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                            {isPending && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleApprovePayout(p._id)}
                                  isLoading={payoutActionLoading === p._id}
                                  disabled={!!payoutActionLoading || bulkApproveLoading}
                                >
                                  Approve & Deduct
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleRejectPayout(p._id)}
                                  isLoading={payoutActionLoading === p._id}
                                  disabled={!!payoutActionLoading || bulkApproveLoading}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {isApproved && (
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessPayout(p._id)}
                                  isLoading={payoutActionLoading === p._id}
                                  disabled={!!payoutActionLoading || bulkApproveLoading}
                                  title="Send money via Paystack Transfers API"
                                >
                                  Send via Paystack
                                </Button>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleMarkPayoutPaid(p._id)}
                                  isLoading={payoutActionLoading === p._id}
                                  disabled={!!payoutActionLoading || bulkApproveLoading}
                                  title="You sent money manually — mark this payout as complete"
                                >
                                  Mark as Paid
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        {isProcessing && (
                          <div className="text-xs text-blue-600 pt-2 border-t border-gray-200">
                            Transfer in progress — awaiting Paystack webhook confirmation…
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-3 border-t bg-gray-50 shrink-0 text-xs text-gray-500 text-center">
              {agentPayouts.length > 0 && `${agentPayouts.length} payout request${agentPayouts.length > 1 ? 's' : ''} total`}
            </div>
          </div>
        </>
      )}

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
