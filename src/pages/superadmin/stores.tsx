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
import {
  storefrontService,
  type AdminStorefrontData,
  type AdminStorefrontStats,
} from "../../services/storefront.service";
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
  Calendar,
  User,
  Mail,
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
  isOpen,
  onClose,
  onApprove,
  onToggleStatus,
  onDelete,
  isProcessing,
}: {
  store: AdminStorefrontData | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onToggleStatus: (store: AdminStorefrontData) => void;
  onDelete: (store: AdminStorefrontData) => void;
  isProcessing: boolean;
}) {
  if (!store) return null;
  const agent = typeof store.agentId === "object" ? store.agentId : null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {store.displayName || store.businessName}
            </h3>
            <p className="text-sm text-gray-500">/{store.businessName}</p>
          </div>
        </div>
      </DialogHeader>

      <DialogBody>
        <div className="space-y-5">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Status:</span>
            <StatusBadge store={store} />
          </div>

          {/* Suspension info */}
          {store.suspendedByAdmin && (
            <Alert status="error" variant="left-accent">
              <div>
                <p className="font-medium">This store is suspended</p>
                {store.suspensionReason && (
                  <p className="text-sm mt-1">Reason: {store.suspensionReason}</p>
                )}
                {store.suspendedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Since {new Date(store.suspendedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Alert>
          )}

          {/* Agent Info */}
          {agent && (
            <Card variant="flat" className="bg-gray-50">
              <CardBody>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Agent Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-900">{agent.fullName}</span>
                    <Badge colorScheme="info" variant="subtle" size="xs">
                      {agent.userType.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Store Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Created</p>
              <div className="flex items-center gap-1.5 text-gray-900">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Approved</p>
              <div className="flex items-center gap-1.5 text-gray-900">
                {store.isApproved ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    {store.approvedAt ? new Date(store.approvedAt).toLocaleDateString() : "Yes"}
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-yellow-500" />
                    Not yet
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Contact</p>
              <p className="text-gray-900">{store.contactInfo?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Methods</p>
              <p className="text-gray-900">{store.paymentMethods?.filter(pm => pm.isActive).length || 0} active</p>
            </div>
          </div>
        </div>
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

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storesRes, statsRes] = await Promise.all([
        storefrontService.getAdminStorefronts(),
        storefrontService.getAdminStats(),
      ]);
      setStores(storesRes.storefronts);
      setStats(statsRes);
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
      await fetchData();
      setSelectedStore(null);
    } catch {
      addToast("Failed to approve store", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (storefrontId: string) => {
    const reason = prompt("Reason for suspension (optional):");
    try {
      setActionLoading(storefrontId);
      await storefrontService.suspendStorefront(storefrontId, reason || undefined);
      addToast("Store suspended", "success");
      await fetchData();
      setSelectedStore(null);
    } catch {
      addToast("Failed to suspend store", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async (storefrontId: string) => {
    try {
      setActionLoading(storefrontId);
      await storefrontService.unsuspendStorefront(storefrontId);
      addToast("Store unsuspended", "success");
      await fetchData();
      setSelectedStore(null);
    } catch {
      addToast("Failed to unsuspend store", "error");
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

  const handleDelete = async (store: AdminStorefrontData) => {
    const reason = prompt(`Delete "${store.businessName}"? Enter reason (optional):`);
    if (reason === null) return; // cancelled
    try {
      setActionLoading(store._id!);
      await storefrontService.adminDeleteStorefront(store._id!, reason || undefined);
      addToast("Store deleted", "success");
      await fetchData();
      setSelectedStore(null);
    } catch {
      addToast("Failed to delete store", "error");
    } finally {
      setActionLoading(null);
    }
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
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
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
                                      onClick={() => setSelectedStore(store)}
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
                                    <StatusBadge store={store} />
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-500">
                                      {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : "—"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        iconOnly
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<Eye className="w-4 h-4" />}
                                        onClick={() => setSelectedStore(store)}
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
                                onClick={() => setSelectedStore(store)}
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
                                <StatusBadge store={store} />
                              </button>

                              {/* Bottom: Agent email + Actions */}
                              <div className="flex items-center justify-between gap-2 ml-[46px]">
                                <span className="text-xs text-gray-400 truncate">
                                  {agent?.email || ""}
                                </span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
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

      {/* Store Detail Dialog */}
      <StoreDetailDialog
        store={selectedStore}
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        onApprove={handleApprove}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        isProcessing={!!actionLoading}
      />
    </div>
  );
}
