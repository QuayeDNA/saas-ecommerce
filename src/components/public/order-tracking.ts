import { TRACK_TTL } from "./constants";

// =============================================================================
// Track Order — LocalStorage utilities (24 h TTL, device-scoped per store)
// =============================================================================

export interface SavedOrderEntry {
  orderId: string;
  orderNumber: string;
  reference: string;
  bundleName: string;
  provider: string;
  total: number;
  paymentType: string;
  savedAt: number;
  lastStatus: string;
}

function trackStorageKey(biz: string) {
  return `storefront_orders_${biz}`;
}

export function loadSavedOrders(biz: string): SavedOrderEntry[] {
  try {
    const raw = localStorage.getItem(trackStorageKey(biz));
    if (!raw) return [];
    const all: SavedOrderEntry[] = JSON.parse(raw);
    const cutoff = Date.now() - TRACK_TTL;
    return all.filter((e) => {
      if (e.savedAt < cutoff) return false;
      if (e.lastStatus === "completed" || e.lastStatus === "failed") {
        return e.savedAt > Date.now() - 60 * 60 * 1000; // keep 1 h after final state
      }
      return true;
    });
  } catch {
    return [];
  }
}

export function saveOrderEntry(biz: string, entry: SavedOrderEntry) {
  const existing = loadSavedOrders(biz).filter(
    (e) => e.orderId !== entry.orderId,
  );
  try {
    localStorage.setItem(
      trackStorageKey(biz),
      JSON.stringify([entry, ...existing]),
    );
  } catch {
    /* quota */
  }
}

export function updateSavedStatus(biz: string, orderId: string, status: string) {
  const updated = loadSavedOrders(biz).map((e) =>
    e.orderId === orderId ? { ...e, lastStatus: status } : e,
  );
  try {
    localStorage.setItem(trackStorageKey(biz), JSON.stringify(updated));
  } catch {
    /* */
  }
}
