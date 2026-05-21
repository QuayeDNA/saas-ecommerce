export const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.register": "Account Registration",
  "auth.password_change": "Password Change",
  "auth.password_reset": "Password Reset",
  "auth.pin_setup": "PIN Setup",
  "auth.failed_login": "Failed Login Attempt",
  "user.created": "User Created",
  "user.updated": "User Updated",
  "user.status_changed": "Status Changed",
  "user.deleted": "User Deleted",
  "user.impersonated": "User Impersonated",
  "order.created": "Order Created",
  "order.status_updated": "Order Status Updated",
  "order.cancelled": "Order Cancelled",
  "order.reported": "Order Reported",
  "order.bulk_processed": "Bulk Order Processed",
  "wallet.topup_requested": "Top-Up Requested",
  "wallet.topup_approved": "Top-Up Approved",
  "wallet.topup_rejected": "Top-Up Rejected",
  "wallet.credited": "Wallet Credited",
  "wallet.debited": "Wallet Debited",
  "wallet.paystack_initiated": "Paystack Payment Initiated",
  "wallet.paystack_verified": "Paystack Payment Verified",
  "storefront.created": "Storefront Created",
  "storefront.updated": "Storefront Updated",
  "storefront.pricing_updated": "Pricing Updated",
  "storefront.approved": "Storefront Approved",
  "storefront.suspended": "Storefront Suspended",
  "storefront.order_created": "Storefront Order Created",
  "storefront.payment_verified": "Payment Verified",
  "payout.requested": "Payout Requested",
  "payout.approved": "Payout Approved",
  "payout.rejected": "Payout Rejected",
  "payout.completed": "Payout Completed",
  "payout.failed": "Payout Failed",
  "settings.updated": "Settings Updated",
  "bundle.created": "Bundle Created",
  "bundle.updated": "Bundle Updated",
  "bundle.deleted": "Bundle Deleted",
};

export function formatAction(action: string): string {
  return (
    ACTION_LABELS[action] ||
    action.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  auth: "Authentication",
  user: "User Management",
  order: "Orders",
  wallet: "Wallet",
  storefront: "Storefront",
  payout: "Payouts",
  settings: "Settings",
  bundle: "Bundles",
};

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

const METADATA_FIELD_LABELS: Record<string, string> = {
  changedBy: "Changed By",
  source: "Source",
  reason: "Reason",
  note: "Note",
  ipAddress: "IP Address",
  userAgent: "User Agent",
  sessionId: "Session ID",
  requestId: "Request ID",
  duration: "Duration",
  amount: "Amount",
  currency: "Currency",
  reference: "Reference",
  method: "Method",
  email: "Email",
  phone: "Phone",
};

const SKIP_METADATA_FIELDS = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "password",
]);

export function formatMetadataEntries(
  metadata: Record<string, unknown> | null | undefined,
): Array<{ label: string; value: string }> {
  if (!metadata) return [];
  return Object.entries(metadata)
    .filter(([key]) => !SKIP_METADATA_FIELDS.has(key))
    .map(([key, value]) => {
      const label =
        METADATA_FIELD_LABELS[key] ||
        key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const displayValue =
        typeof value === "object" && value !== null
          ? JSON.stringify(value)
          : String(value);
      return { label, value: displayValue };
    });
}

const CHANGE_FIELD_LABELS: Record<string, string> = {
  status: "Status",
  userType: "User Type",
  role: "Role",
  email: "Email",
  fullName: "Full Name",
  firstName: "First Name",
  lastName: "Last Name",
  phone: "Phone",
  amount: "Amount",
  balance: "Balance",
  price: "Price",
  tier: "Tier",
  plan: "Plan",
  isActive: "Active",
  isVerified: "Verified",
  isSuspended: "Suspended",
};

export interface ChangeEntry {
  field: string;
  from: string;
  to: string;
}

export function formatChanges(
  changes:
    | { before?: Record<string, unknown>; after?: Record<string, unknown> }
    | null
    | undefined,
): ChangeEntry[] {
  if (!changes || !changes.before || !changes.after) return [];

  const before: Record<string, unknown> = changes.before as Record<
    string,
    unknown
  >;
  const after: Record<string, unknown> = changes.after as Record<
    string,
    unknown
  >;

  const allFields = new Set([...Object.keys(before), ...Object.keys(after)]);

  return Array.from(allFields)
    .filter((field) => before[field] !== after[field])
    .map((field) => ({
      field:
        CHANGE_FIELD_LABELS[field] ||
        field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      from:
        before[field] === null || before[field] === undefined
          ? "(none)"
          : typeof before[field] === "object"
            ? JSON.stringify(before[field])
            : String(before[field]),
      to:
        after[field] === null || after[field] === undefined
          ? "(none)"
          : typeof after[field] === "object"
            ? JSON.stringify(after[field])
            : String(after[field]),
    }));
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
