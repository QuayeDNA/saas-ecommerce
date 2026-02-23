import { useEffect, useState, useCallback } from 'react';
import { useToast } from '../../design-system';
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
  Input,
  Select,
  Pagination,
  Spinner,
} from '../../design-system';
import { walletService } from '../../services/wallet-service';
import type { PayoutRequestItem } from '../../types/wallet';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function SuperAdminPayoutsPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState<PayoutRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = statusFilter ? await walletService.getPayouts(statusFilter) : await walletService.getPendingPayouts();
      // simple client-side search + pagination until backend supports server pagination
      const filtered = data.filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const userObj = typeof p.user === 'object' ? (p.user as { fullName?: string; email?: string }) : null;
        const user = userObj ? `${userObj.fullName || ''} ${userObj.email || ''}` : String(p.user || '');
        return String(p._id).includes(q) || user.toLowerCase().includes(q) || String(p.amount).includes(q);
      });
      setTotal(filtered.length);
      const start = (page - 1) * limit;
      setPayouts(filtered.slice(start, start + limit));
    } catch {
      addToast('Failed to load payouts', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, limit, addToast]);

  useEffect(() => { void load(); }, [load]);

  const refreshAndNotify = async (msg: string, severity: 'success' | 'error' = 'success') => {
    addToast(msg, severity);
    void load();
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this payout?')) return;
    try {
      setActionLoading(id);
      await walletService.approvePayout(id);
      await refreshAndNotify('Payout approved', 'success');
    } catch {
      refreshAndNotify('Failed to approve payout', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      setActionLoading(id);
      await walletService.rejectPayout(id, reason || undefined);
      await refreshAndNotify('Payout rejected', 'success');
    } catch {
      refreshAndNotify('Failed to reject payout', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcess = async (id: string) => {
    if (!confirm('Trigger transfer for this payout?')) return;
    try {
      setActionLoading(id);
      await walletService.processPayout(id);
      await refreshAndNotify('Payout processing started', 'success');
    } catch {
      refreshAndNotify('Failed to process payout', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const badgeColor = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'processing') return 'info';
    if (status === 'failed' || status === 'rejected') return 'error';
    return 'gray';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Payout Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and process agent payout requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onChange={(v: string) => { setStatusFilter(v); setPage(1); }} options={STATUS_OPTIONS} />
          <Input placeholder="Search by agent, id or amount" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('pending'); setPage(1); }}>Reset</Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {loading ? (
            <div className="py-8 text-center"><Spinner /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Requested</TableHeaderCell>
                    <TableHeaderCell>Agent</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Destination</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map(p => (
                    <TableRow key={p._id}>
                      <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="min-w-[220px]">
                        {typeof p.user === 'object' ? `${(p.user as { fullName?: string; email?: string }).fullName} • ${(p.user as { fullName?: string; email?: string }).email}` : String(p.user)}
                      </TableCell>
                      <TableCell>GH₵ {p.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs truncate max-w-[240px]">
                        {p.destination.type === 'mobile_money' ? `${p.destination.mobileProvider} • ${p.destination.phoneNumber}` : `${p.destination.bankCode || ''} • ${p.destination.accountNumber || ''}`}
                      </TableCell>
                      <TableCell><Badge colorScheme={badgeColor(p.status)}>{p.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {p.status === 'pending' && (
                            <>
                              <Button size="xs" onClick={() => handleApprove(p._id)} isLoading={actionLoading === p._id}>Approve</Button>
                              <Button size="xs" variant="danger" onClick={() => handleReject(p._id)} isLoading={actionLoading === p._id}>Reject</Button>
                              <Button size="xs" variant="outline" onClick={() => handleProcess(p._id)} isLoading={actionLoading === p._id}>Process</Button>
                            </>
                          )}
                          {p.status !== 'pending' && <span className="text-xs text-gray-500">No actions</span>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payouts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500 py-8">No payouts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing {payouts.length} of {total} results</div>
            <Pagination currentPage={page} itemsPerPage={limit} totalItems={total} totalPages={Math.ceil(total / limit)} onPageChange={(p: number) => setPage(p)} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
