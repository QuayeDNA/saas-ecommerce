import { useState, useEffect, useCallback } from 'react';
import { FaMoneyBillWave, FaUsers, FaCalculator, FaCreditCard, FaEye, FaClock, FaCheck } from 'react-icons/fa';
import { Card, CardBody, Button, Badge, Input, Table, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner, useToast } from '../../design-system';
import { SearchAndFilter } from '../../components/common/SearchAndFilter';
import { commissionService, type CommissionRecord, type CommissionStatistics, type CommissionSettings } from '../../services/commission.service';

interface CommissionFilters {
  status?: 'pending' | 'paid' | 'cancelled';
  period?: 'monthly' | 'weekly' | 'daily';
  agentId?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
}

export default function SuperAdminCommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [statistics, setStatistics] = useState<CommissionStatistics | null>(null);
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CommissionFilters>({ status: 'pending' }); // Default to pending
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showPaySingleDialog, setShowPaySingleDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<CommissionRecord | null>(null);
  const [viewingCommission, setViewingCommission] = useState<CommissionRecord | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [singlePaymentReference, setSinglePaymentReference] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const toast = useToast();

  // Load data on component mount
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [commissionsData, statisticsData, settingsData] = await Promise.all([
        commissionService.getAllCommissions(filters),
        commissionService.getCommissionStatistics(),
        commissionService.getCommissionSettings()
      ]);

      setCommissions(commissionsData);
      setStatistics(statisticsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load commission data:', error);
      toast.addToast('Failed to load commission data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'month') {
      // Extract the actual month value (remove the index suffix)
      const monthValue = value === 'all' ? '' : (value ? value.split('-').slice(0, 2).join('-') : '');
      const newFilters = { ...filters, month: monthValue || undefined };
      setFilters(newFilters);
    } else {
      const newFilters = { ...filters, [filterKey]: value || undefined };
      setFilters(newFilters);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const searchAndFilterProps = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search agents by name or email...",
    filters: {
      status: {
        value: filters.status || '',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'paid', label: 'Paid' },
          { value: 'cancelled', label: 'Cancelled' }
        ],
        label: 'Status',
        placeholder: 'All Status'
      },
      month: {
        value: filters.month || '',
        options: [
          { value: 'all', label: 'All Months' },
          ...Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const value = date.toISOString().slice(0, 7); // YYYY-MM format
            const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            return { value: `${value}-${i}`, label };
          })
        ],
        label: 'Month',
        placeholder: 'All Months'
      }
    },
    onFilterChange: handleFilterChange,
    onSearch: handleSearch,
    onClearFilters: handleClearFilters,
    showDateRange: true,
    dateRange: {
      startDate: filters.startDate || '',
      endDate: filters.endDate || ''
    },
    onDateRangeChange: filters.startDate || filters.endDate ? (startDate: string, endDate: string) => {
      setFilters({ ...filters, startDate, endDate });
    } : undefined,
    showSearchButton: true,
    showClearButton: true,
    isLoading: loading
  };

  const handlePaySelected = async () => {
    if (selectedCommissions.length === 0) return;

    // Check if any selected commissions are already paid
    const paidCommissions = filteredCommissions.filter(
      commission => selectedCommissions.includes(commission._id) && commission.status === 'paid'
    );

    if (paidCommissions.length > 0) {
      toast.addToast(
        `Cannot pay ${paidCommissions.length} commission(s) that are already paid`,
        'error'
      );
      return;
    }

    try {
      const result = await commissionService.payMultipleCommissions({
        commissionIds: selectedCommissions,
        paymentReference: paymentReference || undefined
      });

      toast.addToast(
        `Successfully paid ${result.summary.successful} of ${result.summary.total} commissions`,
        'success'
      );

      setShowPayDialog(false);
      setSelectedCommissions([]);
      setPaymentReference('');
      loadData();
    } catch (error) {
      console.error('Failed to process commission payments:', error);
      toast.addToast('Failed to process commission payments', 'error');
    }
  };

  const handlePaySingleCommission = (commission: CommissionRecord) => {
    setSelectedCommission(commission);
    setShowPaySingleDialog(true);
  };

  const handleViewCommission = (commission: CommissionRecord) => {
    setViewingCommission(commission);
    setShowViewDialog(true);
  };

  const handleConfirmSinglePayment = async () => {
    if (!selectedCommission) return;

    // Check if commission is already paid
    if (selectedCommission.status === 'paid') {
      toast.addToast('This commission has already been paid', 'error');
      return;
    }

    try {
      await commissionService.payCommission(selectedCommission._id, {
        paymentReference: singlePaymentReference || undefined
      });

      toast.addToast(
        `Successfully paid commission of ${formatCurrency(selectedCommission.amount)} to ${selectedCommission.agentId.fullName}`,
        'success'
      );

      setShowPaySingleDialog(false);
      setSelectedCommission(null);
      setSinglePaymentReference('');
      loadData();
    } catch (error) {
      console.error('Failed to process commission payment:', error);
      toast.addToast('Failed to process commission payment', 'error');
    }
  };

  const handleUpdateSettings = async (newSettings: CommissionSettings) => {
    try {
      await commissionService.updateCommissionSettings(newSettings);
      setSettings(newSettings);
      setShowSettingsDialog(false);
      toast.addToast('Commission settings updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update commission settings:', error);
      toast.addToast('Failed to update commission settings', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const filteredCommissions = commissions.filter(commission => {
    // Text search filter
    const matchesSearch = commission.agentId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.agentId.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2"
          >
            <FaCalculator className="text-sm" />
            Settings
          </Button>
          {selectedCommissions.length > 0 && (
            <Button
              onClick={() => setShowPayDialog(true)}
              className="flex items-center gap-2"
            >
              <FaCreditCard className="text-sm" />
              Pay Selected ({selectedCommissions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics.totalPaid)}</p>
                </div>
                <FaMoneyBillWave className="text-green-500 text-2xl" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(statistics.totalPending)}</p>
                </div>
                <FaClock className="text-yellow-500 text-2xl" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Count</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.pendingCount}</p>
                </div>
                <FaUsers className="text-blue-500 text-2xl" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(statistics.thisMonth.totalPaid + statistics.thisMonth.totalPending)}</p>
                  <p className="text-xs text-gray-500">
                    Paid: {formatCurrency(statistics.thisMonth.totalPaid)} | 
                    Pending: {formatCurrency(statistics.thisMonth.totalPending)}
                  </p>
                </div>
                <FaCalculator className="text-purple-500 text-2xl" />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <SearchAndFilter {...searchAndFilterProps} />

      {/* Commissions Display - Mobile Cards or Desktop Table */}
      {isMobile ? (
        /* Mobile Card Layout */
        <div className="space-y-4">
          {filteredCommissions.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <div className="flex flex-col items-center">
                  <FaMoneyBillWave className="text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {commissions.length === 0 
                      ? 'No Commissions Found' 
                      : searchTerm || filters.status || filters.month || filters.startDate || filters.endDate
                        ? 'No Commissions Match Your Search'
                        : `No ${filters.status || 'Pending'} Commissions`
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {commissions.length === 0 
                      ? 'There are no commission records available at this time.'
                      : searchTerm || filters.status || filters.month || filters.startDate || filters.endDate
                        ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                        : `There are currently no ${filters.status || 'pending'} commission records.`
                    }
                  </p>
                  {(searchTerm || filters.status || filters.month || filters.startDate || filters.endDate) && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex items-center gap-2"
                    >
                      <FaCalculator className="text-sm" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ) : (
            filteredCommissions.map((commission) => (
              <Card key={commission._id} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.includes(commission._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCommissions([...selectedCommissions, commission._id]);
                          } else {
                            setSelectedCommissions(selectedCommissions.filter(id => id !== commission._id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{commission.agentId.fullName}</h3>
                        <p className="text-sm text-gray-500">{commission.agentId.email}</p>
                      </div>
                    </div>
                    <Badge colorScheme={getStatusColor(commission.status)}>
                      {commission.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Period</p>
                      <p className="text-sm font-medium">
                        {new Date(commission.periodStart).toLocaleDateString()} - {new Date(commission.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="text-sm font-medium">{commission.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-sm font-medium">{formatCurrency(commission.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Commission</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(commission.amount)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewCommission(commission)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEye className="text-sm mr-1" />
                      View
                    </Button>
                    {commission.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePaySingleCommission(commission)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <FaCheck className="text-sm mr-1" />
                        Pay
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Desktop Table Layout */
        <Card>
          <CardBody className="p-0">
            {filteredCommissions.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <FaMoneyBillWave className="text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {commissions.length === 0 
                      ? 'No Commissions Found' 
                      : searchTerm || filters.status || filters.month || filters.startDate || filters.endDate
                        ? 'No Commissions Match Your Search'
                        : `No ${filters.status || 'Pending'} Commissions`
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {commissions.length === 0 
                      ? 'There are no commission records available at this time.'
                      : searchTerm || filters.status || filters.month || filters.startDate || filters.endDate
                        ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                        : `There are currently no ${filters.status || 'pending'} commission records.`
                    }
                  </p>
                  {(searchTerm || filters.status || filters.month || filters.startDate || filters.endDate) && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex items-center gap-2"
                    >
                      <FaCalculator className="text-sm" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Table>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.length === filteredCommissions.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCommissions(filteredCommissions.map(c => c._id));
                          } else {
                            setSelectedCommissions([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCommissions.map((commission) => (
                    <tr key={commission._id}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCommissions.includes(commission._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCommissions([...selectedCommissions, commission._id]);
                            } else {
                              setSelectedCommissions(selectedCommissions.filter(id => id !== commission._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{commission.agentId.fullName}</div>
                          <div className="text-sm text-gray-500">{commission.agentId.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(commission.periodStart).toLocaleDateString()} - {new Date(commission.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{commission.totalOrders}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(commission.totalRevenue)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(commission.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge colorScheme={getStatusColor(commission.status)}>
                          {commission.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCommission(commission)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye className="text-sm" />
                          </Button>
                          {commission.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePaySingleCommission(commission)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <FaCheck className="text-sm" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}

      {/* Pay Multiple Dialog */}
      <Dialog isOpen={showPayDialog} onClose={() => setShowPayDialog(false)}>
        <DialogHeader>Pay Selected Commissions</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <p>Are you sure you want to pay {selectedCommissions.length} commission(s)?</p>
            <Input
              label="Payment Reference (Optional)"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Enter payment reference"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPayDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handlePaySelected}>
            Pay Commissions
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog isOpen={showSettingsDialog} onClose={() => setShowSettingsDialog(false)}>
        <DialogHeader>Commission Settings</DialogHeader>
        <DialogBody>
          {settings && (
            <div className="space-y-4">
              <Input
                label="Agent Commission Rate (%)"
                type="number"
                value={settings.agentCommission}
                onChange={(e) => setSettings({ ...settings, agentCommission: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="0.1"
              />
              <Input
                label="Customer Commission Rate (%)"
                type="number"
                value={settings.customerCommission}
                onChange={(e) => setSettings({ ...settings, customerCommission: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => settings && handleUpdateSettings(settings)}>
            Save Settings
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Pay Single Commission Dialog */}
      <Dialog isOpen={showPaySingleDialog} onClose={() => setShowPaySingleDialog(false)}>
        <DialogHeader>Pay Commission</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            {selectedCommission && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Commission Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Agent:</span> {selectedCommission.agentId.fullName}</p>
                    <p><span className="font-medium">Amount:</span> {formatCurrency(selectedCommission.amount)}</p>
                    <p><span className="font-medium">Period:</span> {new Date(selectedCommission.periodStart).toLocaleDateString()} - {new Date(selectedCommission.periodEnd).toLocaleDateString()}</p>
                    <p><span className="font-medium">Orders:</span> {selectedCommission.totalOrders}</p>
                  </div>
                </div>
                <Input
                  label="Payment Reference (Optional)"
                  value={singlePaymentReference}
                  onChange={(e) => setSinglePaymentReference(e.target.value)}
                  placeholder="Enter payment reference"
                />
              </>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPaySingleDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSinglePayment} className="bg-green-600 hover:bg-green-700">
            <FaCheck className="text-sm mr-2" />
            Confirm Payment
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Commission Dialog */}
      <Dialog isOpen={showViewDialog} onClose={() => setShowViewDialog(false)}>
        <DialogHeader>Commission Details</DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            {viewingCommission && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Agent Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {viewingCommission.agentId.fullName}</p>
                    <p><span className="font-medium">Email:</span> {viewingCommission.agentId.email}</p>
                    {viewingCommission.agentId.businessName && (
                      <p><span className="font-medium">Business:</span> {viewingCommission.agentId.businessName}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Commission Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Period</p>
                      <p>{new Date(viewingCommission.periodStart).toLocaleDateString()} - {new Date(viewingCommission.periodEnd).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <Badge colorScheme={getStatusColor(viewingCommission.status)}>
                        {viewingCommission.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Total Orders</p>
                      <p>{viewingCommission.totalOrders}</p>
                    </div>
                    <div>
                      <p className="font-medium">Commission Rate</p>
                      <p>{(viewingCommission.commissionRate).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="font-medium">Total Revenue</p>
                      <p>{formatCurrency(viewingCommission.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Commission Amount</p>
                      <p className="text-green-600 font-semibold">{formatCurrency(viewingCommission.amount)}</p>
                    </div>
                  </div>
                </div>

                {viewingCommission.status === 'paid' && viewingCommission.paidAt && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Payment Information</h4>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><span className="font-medium">Paid At:</span> {new Date(viewingCommission.paidAt).toLocaleString()}</p>
                      {viewingCommission.paidBy && (
                        <p><span className="font-medium">Paid By:</span> {viewingCommission.paidBy.fullName}</p>
                      )}
                      {viewingCommission.paymentReference && (
                        <p><span className="font-medium">Reference:</span> {viewingCommission.paymentReference}</p>
                      )}
                    </div>
                  </div>
                )}

                {viewingCommission.notes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Notes</h4>
                    <p className="text-sm text-blue-800">{viewingCommission.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowViewDialog(false)}>
            Close
          </Button>
          {viewingCommission?.status === 'pending' && (
            <Button
              onClick={() => {
                setShowViewDialog(false);
                handlePaySingleCommission(viewingCommission);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <FaCheck className="text-sm mr-2" />
              Pay Commission
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Message */}
      {/* Toast notifications are now used instead of Alert component */}
    </div>
  );
}