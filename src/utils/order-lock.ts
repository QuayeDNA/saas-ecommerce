import type { Order } from "../types/order";

/**
 * Terminal statuses after which an order should become locked (non-updatable)
 * once 24 hours have passed — unless the order has been reported and is in
 * an active investigation status (not_received / checking).
 */
const TERMINAL_STATUSES = [
  "completed",
  "cancelled",
  "failed",
  "partially_completed",
] as const;

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Returns `true` when the order is in a terminal status, more than 24 hours
 * old (based on `updatedAt`), and does NOT have an active report investigation.
 *
 * "Active investigation" means the order is `reported === true` AND its
 * `receptionStatus` is either `"not_received"` or `"checking"`.
 */
export function isOrderLocked(order: Order): boolean {
  // Only applies to terminal statuses
  if (!TERMINAL_STATUSES.includes(order.status as (typeof TERMINAL_STATUSES)[number])) {
    return false;
  }

  // Check if the order was last updated more than 24 hours ago
  const updatedAt = new Date(order.updatedAt).getTime();
  const now = Date.now();

  if (now - updatedAt < TWENTY_FOUR_HOURS_MS) {
    return false; // Still within the 24-hour window → not locked
  }

  // ── Exception: active report investigation ──
  if (
    order.reported &&
    (order.receptionStatus === "not_received" || order.receptionStatus === "checking")
  ) {
    return false; // Under active investigation → not locked
  }

  // All conditions met → locked
  return true;
}
