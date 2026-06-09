import { memo, useState, useEffect, useCallback } from "react";
import {
  FaBoxOpen,
  FaXmark,
  FaChevronDown,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";
import storefrontService, {
  type TrackedOrder,
} from "../../services/storefront.service";
import type { ThemeConfig } from "./types";
import {
  type SavedOrderEntry,
  loadSavedOrders,
  updateSavedStatus,
} from "./order-tracking";
import { ORDER_STATUS_CFG } from "./constants";

// =============================================================================
// TrackOrderDrawer — slide-in from right, shows saved orders + manual lookup
// =============================================================================

interface TrackOrderDrawerProps {
  businessName: string;
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderDrawer = memo(
  ({ businessName, theme, isOpen, onClose }: TrackOrderDrawerProps) => {
    const [savedOrders, setSavedOrders] = useState<SavedOrderEntry[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [liveData, setLiveData] = useState<Record<string, TrackedOrder>>({});
    const [manualRef, setManualRef] = useState("");
    const [showManual, setShowManual] = useState(false);
    const [trackResult, setTrackResult] = useState<TrackedOrder | null>(null);
    const [trackError, setTrackError] = useState<string | null>(null);
    const [trackLoading, setTrackLoading] = useState(false);
    const [showFullPhoneForOrder, setShowFullPhoneForOrder] = useState<
      Set<string>
    >(new Set());

    const toggleShowFullPhoneForOrder = useCallback((orderId: string) => {
      setShowFullPhoneForOrder((prev) => {
        const next = new Set(prev);
        if (next.has(orderId)) next.delete(orderId);
        else next.add(orderId);
        return next;
      });
    }, []);

    const maskPhone = (p?: string) => {
      if (!p) return "";
      const d = p.replace(/\D/g, "");
      if (d.length < 7) return p;
      return `${d.slice(0, 3)}***${d.slice(-3)}`;
    };

    useEffect(() => {
      if (isOpen) setSavedOrders(loadSavedOrders(businessName));
    }, [isOpen, businessName]);

    const fetchLiveStatus = useCallback(
      async (entry: SavedOrderEntry) => {
        try {
          const lookupKey = entry.orderNumber || entry.reference;
          const data = await storefrontService.trackOrder(
            businessName,
            lookupKey,
          );
          setLiveData((prev) => ({ ...prev, [entry.orderId]: data }));
          if (data.status !== entry.lastStatus) {
            updateSavedStatus(businessName, entry.orderId, data.status);
            setSavedOrders(loadSavedOrders(businessName));
          }
        } catch {
          /* silent */
        }
      },
      [businessName],
    );

    const handleExpand = useCallback(
      (entry: SavedOrderEntry) => {
        const next = expandedId === entry.orderId ? null : entry.orderId;
        setExpandedId(next);
        if (next && !liveData[entry.orderId]) fetchLiveStatus(entry);
      },
      [expandedId, liveData, fetchLiveStatus],
    );

    const handleManualTrack = useCallback(async () => {
      const lookup = manualRef.trim().toUpperCase();
      if (!lookup) return;
      setTrackLoading(true);
      setTrackError(null);
      setTrackResult(null);
      try {
        const data = await storefrontService.trackOrder(businessName, lookup);
        setTrackResult(data);
      } catch (err) {
        setTrackError(err instanceof Error ? err.message : "Order not found");
      } finally {
        setTrackLoading(false);
      }
    }, [businessName, manualRef]);

    const fmtDate = (iso: string | null) =>
      !iso
        ? "—"
        : new Date(iso).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

    const renderTimeline = (order: TrackedOrder) => {
      const showFull = showFullPhoneForOrder.has(order.orderId);
      return (
        <div className="pt-3">
          {order.timeline.map((step, idx) => {
            const isLast = idx === order.timeline.length - 1;
            const dotColor = step.failed
              ? "#EF4444"
              : step.done
                ? "#22C55E"
                : "#D1D5DB";
            return (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full border-2 mt-1 shrink-0"
                    style={{
                      borderColor: dotColor,
                      backgroundColor:
                        step.done || step.failed ? dotColor : "white",
                    }}
                  />
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 min-h-[22px] mt-0.5"
                      style={{
                        backgroundColor: step.done ? "#22C55E" : "#E5E7EB",
                      }}
                    />
                  )}
                </div>
                <div className={`${isLast ? "pb-1" : "pb-3"}`}>
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{
                      color: step.failed
                        ? "var(--error)"
                        : step.done
                          ? "var(--text-primary)"
                          : "var(--text-tertiary)",
                    }}
                  >
                    {step.event}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {step.at ? fmtDate(step.at) : step.done ? "" : "Pending…"}
                  </p>
                </div>
              </div>
            );
          })}
          {order.items.length > 0 && (
            <div
              className="mt-2 pt-3 border-t space-y-2"
              style={{ borderColor: "var(--border-color)" }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: "var(--text-tertiary)" }}
              >
                Bundle Details
              </p>
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between text-xs gap-2"
                >
                  <div className="min-w-0">
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.bundleName}
                    </span>
                    {item.dataVolume > 0 && (
                      <span
                        className="ml-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        · {item.dataVolume}
                        {item.dataUnit}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <p
                      className="font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {showFull
                        ? item.customerPhone
                        : maskPhone(item.customerPhone)}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleShowFullPhoneForOrder(order.orderId)}
                      className="flex items-center justify-center w-8 h-8 rounded-full transition"
                      aria-label={
                        showFull
                          ? "Hide phone number"
                          : "Show full phone number"
                      }
                    >
                      {showFull ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color:
                          item.processingStatus === "completed"
                            ? "var(--success)"
                            : item.processingStatus === "failed"
                              ? "var(--error)"
                              : item.processingStatus === "processing"
                                ? "var(--color-primary)"
                                : "var(--warning)",
                      }}
                    >
                      {item.processingStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const renderOrderCard = (entry: SavedOrderEntry) => {
      const cfg =
        ORDER_STATUS_CFG[entry.lastStatus] ?? ORDER_STATUS_CFG.pending;
      const live = liveData[entry.orderId];
      const isExpanded = expandedId === entry.orderId;
      return (
        <div
          key={entry.orderId}
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <button
            onClick={() => handleExpand(entry)}
            className="w-full p-4 flex items-start justify-between gap-3 text-left transition"
            style={{ backgroundColor: "var(--bg-muted)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-mono font-bold shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {entry.orderNumber}
                </span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>
              <p
                className="text-sm font-semibold mt-1 truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {entry.bundleName}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                GH₵{entry.total.toFixed(2)} ·{" "}
                {entry.paymentType === "paystack"
                  ? "⚡ Paystack"
                  : entry.paymentType === "mobile_money"
                    ? "📱 MoMo"
                    : "🏦 Bank"}{" "}
                ·{" "}
                {new Date(entry.savedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <FaChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 mt-1 ${isExpanded ? "rotate-180" : ""}`}
              style={{ color: "var(--text-tertiary)" }}
            />
          </button>
          {isExpanded && (
            <div
              className="px-4 pb-4 border-t"
              style={{
                backgroundColor: "var(--bg-muted)",
                borderColor: "var(--border-color)",
              }}
            >
              {live ? (
                renderTimeline(live)
              ) : (
                <div
                  className="py-5 flex items-center justify-center gap-2 text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                  Loading status…
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    const renderTrackResult = (order: TrackedOrder) => {
      const cfg = ORDER_STATUS_CFG[order.status] ?? ORDER_STATUS_CFG.pending;
      return (
        <div
          className="rounded-2xl border p-4"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-mono font-bold"
              style={{ color: "var(--text-secondary)" }}
            >
              {order.orderNumber}
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          {renderTimeline(order)}
        </div>
      );
    };

    // Always render drawer so we can animate open/close smoothly. visibility
    // controlled via CSS transitions on opacity and transform.
    return (
      <div
        className={`fixed inset-0 z-50 flex justify-end ${isOpen ? "" : "pointer-events-none"}`}
        onClick={onClose}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`relative w-full max-w-md h-full flex flex-col  shadow-2xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ backgroundColor: "var(--bg-surface)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b shrink-0"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme.primary + "18" }}
              >
                <FaBoxOpen
                  className="w-4 h-4"
                  style={{ color: theme.primary }}
                />
              </div>
              <div>
                <h2
                  className="font-black text-base leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  My Orders
                </h2>
                <p
                  className="text-[11px] leading-tight"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Track your purchases on this device
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border flex items-center justify-center transition"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-muted)",
                  borderColor: "var(--border-color)",
                }}
              >
                <FaXmark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Order list */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {savedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--bg-muted)" }}
                >
                  <FaBoxOpen
                    className="w-8 h-8"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
                <p
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  No recent orders
                </p>
                <p
                  className="text-sm mt-1 leading-relaxed"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Orders placed on this device appear here for 24 hours.
                </p>
                <p
                  className="text-xs mt-3"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Have an order number? Use the lookup below.
                </p>
              </div>
            ) : (
              savedOrders.map((entry) => renderOrderCard(entry))
            )}
          </div>

          {/* Manual lookup */}
          <div
            className="border-t px-4 py-4 shrink-0 space-y-3"
            style={{
              backgroundColor: "var(--bg-muted)",
              borderColor: "var(--border-color)",
            }}
          >
            <button
              onClick={() => {
                setShowManual((m) => !m);
                setTrackResult(null);
                setTrackError(null);
              }}
              className="flex items-center justify-between w-full text-sm font-bold transition"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>Track by order number</span>
              <FaChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showManual ? "rotate-180" : ""}`}
              />
            </button>
            {showManual && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste order number (e.g. BAGS-1234)…"
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualTrack()}
                  className="w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2"
                  style={
                    {
                      "--tw-ring-color": theme.primary + "50",
                    } as React.CSSProperties
                  }
                />
                <button
                  onClick={handleManualTrack}
                  disabled={!manualRef.trim() || trackLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: theme.primary }}
                >
                  {trackLoading ? "Looking up…" : "Track Order"}
                </button>
                {trackError && (
                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--error)" }}
                  >
                    {trackError}
                  </p>
                )}
                {trackResult && renderTrackResult(trackResult)}
              </div>
            )}
            <p
              className="text-[10px] text-center"
              style={{ color: "var(--text-tertiary)" }}
            >
              Data stored locally on this device · Clears after 24 hours
            </p>
          </div>
        </div>
      </div>
    );
  },
);
