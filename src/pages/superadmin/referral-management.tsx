import { useState, useEffect } from "react";
import { referralService } from "../../services/referral.service";
import { commissionService } from "../../services/commission.service";
import { useToast } from "../../design-system/components/toast";
import { Card, CardBody } from "../../design-system/components/card";
import { Button } from "../../design-system/components/button";
import { Alert } from "../../design-system/components/alert";
import { Badge } from "../../design-system/components/badge";
import { Spinner } from "../../design-system/components/spinner";
import {
  Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell,
} from "../../design-system/components/table";
import {
  FaUsers, FaMoneyBillWave, FaCalendarCheck, FaUserTie,
  FaPlay, FaCheckCircle, FaExclamationTriangle, FaChartBar,
  FaUserPlus, FaCrown,
} from "react-icons/fa";
import type { ReferralAdminStats, ReferralAdminUser } from "../../types/referral";
import type { CommissionStats } from "../../types/commission";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
};

export const ReferralManagement = () => {
  const { addToast } = useToast();
  const [adminStats, setAdminStats] = useState<ReferralAdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<ReferralAdminUser[]>([]);
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchResult, setBatchResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      totalCommissions: number;
      totalAmount: number;
      qualifiedUsersCount: number;
      date: string;
    };
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [stats, users, commStats] = await Promise.all([
          referralService.getAdminStats(),
          referralService.getAdminUsers(),
          commissionService.getStats(),
        ]);
        setAdminStats(stats);
        setAdminUsers(users);
        setCommissionStats(commStats);
      } catch (err) {
        console.error("Failed to load referral admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleProcessDaily = async () => {
    setProcessing(true);
    setBatchResult(null);
    try {
      const result = await commissionService.processDailyBatch();
      setBatchResult(result);
      addToast("Daily batch processing completed", "success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || "Batch processing failed";
      setBatchResult({ success: false, message: msg });
      addToast(msg, "error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading referral management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral & Commission Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Oversee referral program performance, users, and daily batch processing</p>
      </div>

      {/* Stats Cards */}
      {adminStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Referrals", value: adminStats.totalReferrals, icon: FaUsers, color: "from-blue-500 to-blue-600" },
            { label: "Active Participants", value: adminStats.activeParticipants, icon: FaUserTie, color: "from-emerald-500 to-emerald-600" },
            { label: "Commission Paid", value: `GHS ${(adminStats.totalCommissionPaid || 0).toFixed(2)}`, icon: FaMoneyBillWave, color: "from-purple-500 to-purple-600" },
            { label: "Commission Pending", value: `GHS ${(adminStats.totalCommissionPending || 0).toFixed(2)}`, icon: FaCalendarCheck, color: "from-amber-500 to-amber-600" },
          ].map((stat) => (
            <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} text-white border-0`}>
              <CardBody>
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-white/70" />
                </div>
                <p className="text-2xl font-bold">{typeof stat.value === "number" ? stat.value : stat.value}</p>
                <p className="text-xs text-white/70 mt-0.5">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Top Referrer Highlight */}
      {adminStats?.topReferrer && (
        <Card variant="elevated" className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FaCrown className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Top Referrer</p>
                <p className="text-lg font-bold text-gray-900">{adminStats.topReferrer.fullName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{adminStats.topReferrer.referralCount} referrals</p>
                <p className="text-xs text-amber-600 font-medium">GHS {adminStats.topReferrer.commissionEarned.toFixed(2)} earned</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Daily Signups Chart */}
      {adminStats?.dailySignups && adminStats.dailySignups.length > 0 && (
        <Card variant="outlined">
          <CardBody>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUserPlus className="w-4 h-4 text-primary-500" /> Daily Signups (Last 7 Days)
            </h3>
            <div className="flex items-end gap-2 h-24">
              {adminStats.dailySignups.slice(-7).map((day, idx) => {
                const max = Math.max(...adminStats.dailySignups.slice(-7).map((d) => d.count), 1);
                const height = (day.count / max) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-700">{day.count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-primary-500 to-primary-400 transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-400">
                      {new Date(day.date).toLocaleDateString("en-GH", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Daily Batch Processing */}
      <Card variant="outlined">
        <CardBody>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendarCheck className="w-4 h-4 text-primary-500" /> Daily Batch Processing
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Manually trigger the daily commission calculation for all referred users
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleProcessDaily}
              disabled={processing}
              isLoading={processing}
              loadingText="Processing..."
              leftIcon={<FaPlay className="w-4 h-4" />}
            >
              Run Daily Batch
            </Button>
          </div>
          {batchResult && (
            <div className="mt-4">
              {batchResult.success !== false ? (
                <Alert status="success" variant="subtle">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="w-4 h-4" />
                    <span>Batch processed successfully: {batchResult.message || "Commission calculation complete"}</span>
                  </div>
                </Alert>
              ) : (
                <Alert status="error" variant="subtle">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="w-4 h-4" />
                    <span>{batchResult.message || "Batch processing failed"}</span>
                  </div>
                </Alert>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Users with Referrals */}
      <Card variant="outlined">
        <CardBody>
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaUsers className="w-4 h-4 text-primary-500" /> Users with Referrals ({adminUsers.length})
          </h3>
          {adminUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users with referrals</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table variant="striped" size="sm">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Phone</TableHeaderCell>
                    <TableHeaderCell>Code</TableHeaderCell>
                    <TableHeaderCell>Referrals</TableHeaderCell>
                    <TableHeaderCell>Earned</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Joined</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">{u.phone}</TableCell>
                      <TableCell>
                        <Badge variant="subtle" colorScheme="info" size="sm">{u.referralCode}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme="success" variant="subtle" size="sm">{u.referralCount}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">GHS {(u.totalEarned || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge size="xs" variant="outline">{u.userType?.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(u.createdAt)}<br />
                        <span className="text-xs">{formatTime(u.createdAt)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Raw API Data */}
      <details className="rounded-xl border border-gray-200 bg-white">
        <summary className="flex items-center gap-2 p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50 text-sm transition-colors">
          <FaChartBar className="w-4 h-4 text-gray-400" /> Raw API Data
        </summary>
        <div className="p-4 border-t border-gray-100 space-y-3 max-h-64 overflow-y-auto">
          {[
            { label: "Admin Stats", data: adminStats },
            { label: "Commission Stats", data: commissionStats },
          ].map((section) => (
            <div key={section.label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">{section.label}</p>
              <pre className="text-xs text-gray-700 overflow-auto">{JSON.stringify(section.data, null, 2)}</pre>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default ReferralManagement;
