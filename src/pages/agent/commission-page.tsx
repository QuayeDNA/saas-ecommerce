import { useState, useEffect, useCallback, useRef } from "react";
import { commissionService } from "../../services/commission.service";
import { referralService } from "../../services/referral.service";
import { useAuth } from "../../hooks";
import {
  FaCopy, FaShareAlt, FaWhatsapp, FaSms, FaCheck,
  FaUsers, FaMoneyBillWave, FaLink,
  FaWallet, FaHistory,
  FaChevronRight, FaChevronDown, FaUserPlus,
} from "react-icons/fa";
import { useToast } from "../../design-system/components/toast";
import { Card, CardBody } from "../../design-system/components/card";
import { Button } from "../../design-system/components/button";
import { Input } from "../../design-system/components/input";
import { Badge } from "../../design-system/components/badge";
import { Alert } from "../../design-system/components/alert";
import {
  Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell,
} from "../../design-system/components/table";
import { Spinner } from "../../design-system/components/spinner";
import {Tabs, TabsList, TabsTrigger, TabsContent } from "../../design-system/components/tabs";
import type { Commission, CommissionStats, WithdrawResponse, WithdrawalHistoryResponse } from "../../types/commission";
import type { ReferralDashboard, ReferralTreeNode } from "../../types/referral";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
};

const CommissionStatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { scheme: "success" | "warning" | "error" | "info"; label: string }> = {
    credited: { scheme: "success", label: "Credited" },
    pending: { scheme: "warning", label: "Pending" },
    cancelled: { scheme: "error", label: "Cancelled" },
  };
  const c = colors[status] || { scheme: "info" as const, label: status };
  return <Badge colorScheme={c.scheme} size="sm">{c.label}</Badge>;
};

const ReferralTreeBranch = ({ node, level = 0 }: { node: ReferralTreeNode; level?: number }) => {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--color-primary-50)] cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <FaChevronDown className="w-3 h-3 text-[var(--color-muted-text)]" /> : <FaChevronRight className="w-3 h-3 text-[var(--color-muted-text)]" />
        ) : (
          <span className="w-3" />
        )}
        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-bold text-[var(--color-primary-700)] flex-shrink-0">
          {node.fullName?.charAt(0) || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--color-text)] truncate">{node.fullName}</p>
          <p className="text-xs text-[var(--color-muted-text)]">{node.phone} &middot; {formatDate(node.createdAt)}</p>
        </div>
        <Badge size="xs" variant="subtle" colorScheme="info">Level {node.level}</Badge>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <ReferralTreeBranch key={child.userId} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommissionPage = () => {
  const { authState } = useAuth();
  const { addToast } = useToast();

  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryResponse["data"]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<WithdrawResponse["data"] | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("commission");

  const [dashboard, setDashboard] = useState<ReferralDashboard | null>(null);
  const [tree, setTree] = useState<ReferralTreeNode | null>(null);
  const treeFetchedRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  const referralCode = dashboard?.referralCode ?? "";
  const shareLink = referralCode
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bal, stat, comms, wds, dash] = await Promise.all([
        commissionService.getBalance(),
        commissionService.getStats(),
        commissionService.getCommissions(),
        commissionService.getWithdrawalHistory(),
        referralService.getDashboard(),
      ]);
      setBalance(bal);
      setStats(stat);
      setCommissions(comms);
      setWithdrawals(wds);
      setDashboard(dash);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target as Node)) {
        setShareDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === "tree" && !treeFetchedRef.current) {
      treeFetchedRef.current = true;
      referralService.getReferralTree(3, { fullName: authState.user?.fullName, phone: authState.user?.phone }).then(setTree).catch(() => {});
    }
  }, [activeTab]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    setWithdrawing(true);
    setWithdrawResult(null);
    setWithdrawError(null);
    try {
      const result = await commissionService.withdraw(amount);
      setWithdrawResult(result);
      setBalance(result.newBalance);
      setWithdrawAmount("");
      addToast(`GHS ${amount.toFixed(2)} withdrawn successfully`, "success");
      fetchAll();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || "Withdrawal failed";
      setWithdrawError(msg);
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [addToast]);

  const shareVia = (platform: "whatsapp" | "sms") => {
    const text = `Join me on BryteLinks and start vending airtime & data! Use my referral code: ${referralCode}`;
    const url = platform === "whatsapp"
      ? `https://wa.me/?text=${encodeURIComponent(text + " " + shareLink)}`
      : `sms:?body=${encodeURIComponent(text + " " + shareLink)}`;
    window.open(url, "_blank");
    setShareDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--color-muted-text)]">Loading commission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Commission & Referrals</h1>
          <p className="text-xs sm:text-sm text-[var(--color-muted-text)] mt-0.5">Track earnings, withdraw commissions, and manage referrals</p>
        </div>
      </div>

      {referralCode && (
        <Card variant="elevated" className="overflow-hidden" noPadding>
          <div className="bg-gradient-to-br from-[var(--color-primary-700)] via-[var(--color-primary-500)] to-[var(--color-primary-400)] p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="w-full sm:w-auto">
                <p className="text-[var(--color-primary-200)] text-[10px] sm:text-xs font-medium tracking-wider uppercase">Your Referral Code</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-[0.2em] mt-1 font-mono break-all">{referralCode}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(referralCode)}
                  className="bg-white hover:bg-slate-400 text-gray-700 border-0 flex-1 sm:flex-initial"
                >
                  {copied ? <><FaCheck className="w-4 h-4 mr-1.5" /> Copied</> : <><FaCopy className="w-4 h-4 mr-1.5" /> Copy Code</>}
                </Button>
                <div className="relative" ref={shareDropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                    className="bg-white/20 hover:bg-white/30 text-white border-0 flex-1 sm:flex-initial"
                  >
                    <FaShareAlt className="w-4 h-4 mr-1.5" /> Share
                  </Button>
                  {shareDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShareDropdownOpen(false)} />
                      <div className="fixed sm:absolute inset-x-0 bottom-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 z-50 bg-[var(--color-surface)] sm:border sm:border-[var(--color-border)] rounded-t-2xl sm:rounded-xl shadow-xl sm:min-w-[200px] overflow-hidden pb-safe-area sm:pb-0 animate-slide-up sm:animate-none">
                        <div className="sm:hidden w-full flex justify-center py-3">
                          <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full" />
                        </div>
                        <div className="sm:hidden px-4 pb-2 pt-1">
                          <p className="text-sm font-semibold text-[var(--color-text)]">Share Referral Link</p>
                        </div>
                        <button
                          onClick={() => { copyToClipboard(shareLink); setShareDropdownOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-50)] transition-colors border-b border-[var(--color-border)] sm:border-b-0"
                        >
                          <FaLink className="w-4 h-4 text-[var(--color-muted-text)]" /> Copy Link
                        </button>
                        <button
                          onClick={() => shareVia("whatsapp")}
                          className="flex items-center gap-3 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-50)] transition-colors border-b border-[var(--color-border)] sm:border-b-0"
                        >
                          <FaWhatsapp className="w-4 h-4 text-[var(--color-whatsapp)]" /> WhatsApp
                        </button>
                        <button
                          onClick={() => shareVia("sms")}
                          className="flex items-center gap-3 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-50)] transition-colors"
                        >
                          <FaSms className="w-4 h-4 text-[var(--color-muted-text)]" /> SMS
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {dashboard && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Referrals", value: dashboard.totalReferred, icon: FaUsers },
            { label: "Active Referrals", value: dashboard.activeReferred, icon: FaUserPlus },
            { label: "Commission Balance", value: `GHS ${(dashboard.commissionBalance || 0).toFixed(2)}`, icon: FaWallet },
            { label: "Total Earned", value: `GHS ${(dashboard.totalCommissionsEarned || 0).toFixed(2)}`, icon: FaMoneyBillWave },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] text-white border-0"
            >
              <CardBody>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 mb-2" />
                <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="commission">
            <FaWallet className="w-4 h-4 mr-1.5" /> Commission
          </TabsTrigger>
          <TabsTrigger value="tree">
            <FaShareAlt className="w-4 h-4 mr-1.5" /> Referral Tree
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="elevated">
              <CardBody>
                <p className="text-xs sm:text-sm text-[var(--color-muted-text)]">Available Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mt-1">GHS {balance.toFixed(2)}</p>
                <p className="text-[10px] sm:text-xs text-[var(--color-muted-text)] mt-1">Ready to withdraw</p>
              </CardBody>
            </Card>
            {stats && (
              <>
                <Card variant="elevated">
                  <CardBody>
                    <p className="text-xs sm:text-sm text-[var(--color-muted-text)]">Total Earned</p>
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mt-1">
                      GHS {(stats.totalCommissions || 0).toFixed(2)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge colorScheme="success" size="xs" variant="subtle">{stats.paidCommissions || 0} paid</Badge>
                      <Badge colorScheme="warning" size="xs" variant="subtle">{stats.pendingCommissions || 0} pending</Badge>
                    </div>
                  </CardBody>
                </Card>
                <Card variant="elevated">
                  <CardBody>
                    <p className="text-xs sm:text-sm text-[var(--color-muted-text)]">Daily Average</p>
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mt-1">
                      GHS {(stats.dailyAverage || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[var(--color-muted-text)] mt-1">Per day average</p>
                  </CardBody>
                </Card>
              </>
            )}
          </div>

          <Card variant="outlined">
            <CardBody>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <FaMoneyBillWave className="w-4 h-4 text-[var(--color-primary-500)]" /> Withdraw Commission
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="w-full sm:w-64">
                  <Input
                    label="Amount (GHS)"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount to withdraw"
                    leftIcon={<FaMoneyBillWave className="text-[var(--color-muted-text)]" />}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  isLoading={withdrawing}
                  loadingText="Processing..."
                  className="w-full sm:w-auto"
                >
                  Withdraw
                </Button>
              </div>
              {balance > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[50, 100, 200, 500].filter((v) => v <= balance).map((v) => (
                    <button
                      key={v}
                      onClick={() => setWithdrawAmount(v.toString())}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-control-bg)] hover:bg-[var(--color-primary-100)] text-[var(--color-secondary-text)] hover:text-[var(--color-primary-700)] transition-colors"
                    >
                      GHS {v}
                    </button>
                  ))}
                </div>
              )}
              {withdrawError && (
                <Alert status="error" variant="subtle" className="mt-3">
                  {withdrawError}
                </Alert>
              )}
              {withdrawResult && (
                <Alert status="success" variant="subtle" className="mt-3">
                  Withdrawal of GHS {withdrawAmount} successful! New commission balance: GHS {(withdrawResult.newBalance ?? balance).toFixed(2)}
                </Alert>
              )}
            </CardBody>
          </Card>

          <Card variant="outlined">
            <CardBody>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <FaHistory className="w-4 h-4 text-[var(--color-primary-500)]" /> Commission History
              </h3>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-muted-text)]">
                  <FaMoneyBillWave className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No commissions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <Table variant="striped" size="sm">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Rate</TableHeaderCell>
                        <TableHeaderCell>Orders</TableHeaderCell>
                        <TableHeaderCell>Qualified Users</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell>
                            <p className="text-sm whitespace-nowrap">{formatDate(c.date)}</p>
                          </TableCell>
                          <TableCell className="font-semibold">GHS {c.amount.toFixed(2)}</TableCell>
                          <TableCell>{c.commissionRate}%</TableCell>
                          <TableCell>{c.ordersCount || 0}</TableCell>
                          <TableCell>{c.qualifiedUsersCount || 0}</TableCell>
                          <TableCell><CommissionStatusBadge status={c.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>

          <Card variant="outlined">
            <CardBody>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                <FaHistory className="w-4 h-4 text-[var(--color-primary-500)]" /> Withdrawal History
              </h3>
              {withdrawals.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-muted-text)]">
                  <FaMoneyBillWave className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No withdrawals yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <Table variant="striped" size="sm">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Balance After</TableHeaderCell>
                        <TableHeaderCell>Description</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w._id}>
                          <TableCell className="whitespace-nowrap">
                            <p className="text-sm">{formatDate(w.createdAt)}</p>
                            <p className="text-xs text-[var(--color-muted-text)]">{formatTime(w.createdAt)}</p>
                          </TableCell>
                          <TableCell className="font-semibold text-[var(--color-success-icon)]">+GHS {w.amount.toFixed(2)}</TableCell>
                          <TableCell>GHS {(w.balanceAfter || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-sm text-[var(--color-secondary-text)] max-w-xs truncate">{w.description || w.metadata?.type || "Commission withdrawal"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="tree" className="space-y-4 pt-4">
          <Card variant="outlined">
            <CardBody>
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <FaShareAlt className="w-4 h-4 text-[var(--color-primary-500)]" /> Referral Network
              </h3>
              {!tree ? (
                <div className="text-center py-8 text-[var(--color-muted-text)]">
                  <FaShareAlt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No referral tree data</p>
                </div>
              ) : (
                <div className="bg-[var(--color-primary-50)] rounded-lg p-3">
                  <ReferralTreeBranch node={tree} />
                </div>
              )}
            </CardBody>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommissionPage;