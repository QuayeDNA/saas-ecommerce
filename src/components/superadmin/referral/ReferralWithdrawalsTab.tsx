import { FaHistory } from "react-icons/fa";
import type { Withdrawal } from "../../../types/commission";
import { Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from "../../../design-system";
import { formatCurrency } from "../../../utils/pricingHelpers";

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
  };
};

interface ReferralWithdrawalsTabProps {
  withdrawals: Withdrawal[];
  loading: boolean;
}

export const ReferralWithdrawalsTab = ({ withdrawals, loading }: ReferralWithdrawalsTabProps) => (
  <Card variant="outlined">
    <CardBody>
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <FaHistory className="w-4 h-4 text-[var(--color-secondary)]" />
        Withdrawal History
        <Badge variant="subtle" colorScheme="info" size="sm">{withdrawals.length}</Badge>
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <FaHistory className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No withdrawals recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table variant="striped" size="sm">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Balance After</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => {
                const dt = formatDateTime(w.createdAt);
                return (
                  <TableRow key={w._id}>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {dt.date}<br /><span className="text-xs">{dt.time}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-[var(--text-primary)]">
                      {formatCurrency(w.amount)}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {formatCurrency(w.balanceAfter)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="subtle" colorScheme="info" size="sm">
                        {w.type?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)] max-w-xs truncate">
                      {w.description}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CardBody>
  </Card>
);
