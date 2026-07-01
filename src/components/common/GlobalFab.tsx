/**
 * GlobalFab — draggable, edge-snapping, auto-docking floating action button
 *
 * Behaviour:
 *  1. Freely draggable anywhere on screen via pointer events (entire container is the drag handle)
 *  2. On release → snaps to nearest screen edge
 *  3. After snap → stays fully visible for 5s (peek-in period)
 *  4. After 5s idle → slides ~85% off-screen toward anchor edge (docked state)
 *     leaving ~18px handle visible — never fully hidden, never blocking content
 *  5. Hover / focus / touch on handle → slides fully back in, resets 5s timer
 *  6. While menu is open → auto-dock timer suspended
 *  7. Pulse glow at rest for easy identification; pauses on hover/drag/open
 *  8. Keyboard: Arrow keys move the FAB; Enter/Space toggles menu; Escape closes
 *  9. prefers-reduced-motion: all transitions/animations disabled
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { MessageCircle, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Dialog, DialogBody } from "../../design-system";
import { CONTACTS } from "../../config/contacts";

/* ─── Types ────────────────────────────────────────────────────────────── */

type Edge = "left" | "right" | "top" | "bottom";

interface Pos {
  x: number;
  y: number;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */

const FAB_SIZE = 52;
const PEEK_OFFSET = 18;
const PEEK_DURATION = 5000;
const EDGE_THRESHOLD = 0.35;
const KBD_STEP = 24;
/** If pointer moves less than this (px) between down/up, treat as a click — not a drag. */
const DRAG_THRESHOLD = 5;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function snapToEdge(x: number, y: number, vw: number, vh: number): { edge: Edge; pos: Pos } {
  const cx = x + FAB_SIZE / 2;
  const cy = y + FAB_SIZE / 2;
  const toLeft = cx;
  const toRight = vw - cx;

  const verticalFraction = cy / vh;
  const preferVertical = verticalFraction < EDGE_THRESHOLD || verticalFraction > (1 - EDGE_THRESHOLD);

  let edge: Edge;
  if (preferVertical) {
    edge = verticalFraction < 0.5 ? "top" : "bottom";
  } else {
    edge = toLeft < toRight ? "left" : "right";
  }

  const margin = FAB_SIZE / 2 + 4;
  let snappedX = x;
  let snappedY = y;

  switch (edge) {
    case "left":
      snappedX = 0;
      snappedY = Math.max(margin, Math.min(vh - FAB_SIZE - margin, y));
      break;
    case "right":
      snappedX = vw - FAB_SIZE;
      snappedY = Math.max(margin, Math.min(vh - FAB_SIZE - margin, y));
      break;
    case "top":
      snappedY = 0;
      snappedX = Math.max(margin, Math.min(vw - FAB_SIZE - margin, x));
      break;
    case "bottom":
      snappedY = vh - FAB_SIZE;
      snappedX = Math.max(margin, Math.min(vw - FAB_SIZE - margin, x));
      break;
  }

  return { edge, pos: { x: snappedX, y: snappedY } };
}

function dockedTranslate(edge: Edge): string {
  const hide = FAB_SIZE - PEEK_OFFSET;
  switch (edge) {
    case "left":   return `translateX(-${hide}px)`;
    case "right":  return `translateX(${hide}px)`;
    case "top":    return `translateY(-${hide}px)`;
    case "bottom": return `translateY(${hide}px)`;
  }
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function GlobalFab() {
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;

  const [pos, setPos] = useState<Pos>({ x: vw() - FAB_SIZE, y: vh() / 2 - FAB_SIZE / 2 });
  const [edge, setEdge] = useState<Edge>("right");
  const [docked, setDocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const dragStartPointer = useRef<{ px: number; py: number; fx: number; fy: number } | null>(null);
  const hasDragged = useRef(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef<Pos>({ x: window.innerWidth - FAB_SIZE, y: window.innerHeight / 2 - FAB_SIZE / 2 });

  posRef.current = pos;

  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ── Timer management ──────────────────────────────────────────────── */

  const clearPeekTimer = useCallback(() => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = null;
  }, []);

  const startPeekTimer = useCallback(() => {
    clearPeekTimer();
    peekTimer.current = setTimeout(() => {
      setDocked(true);
    }, PEEK_DURATION);
  }, [clearPeekTimer]);

  /** Undock + restart timer. Called on any interaction. */
  const resetPeekTimer = useCallback(() => {
    setDocked(false);
    if (!open) startPeekTimer();
  }, [open, startPeekTimer]);

  /* ── Drag handlers ─────────────────────────────────────────────────── */

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();

    clearPeekTimer();
    setDocked(false);

    dragStartPointer.current = {
      px: e.clientX,
      py: e.clientY,
      fx: pos.x,
      fy: pos.y,
    };
    hasDragged.current = false;
    setDragging(true);
  }, [pos, clearPeekTimer]);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartPointer.current) return;

    const dx = e.clientX - dragStartPointer.current.px;
    const dy = e.clientY - dragStartPointer.current.py;

    // Only count as a drag once threshold is exceeded
    if (!hasDragged.current) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      hasDragged.current = true;
    }

    const newX = Math.max(0, Math.min(window.innerWidth - FAB_SIZE, dragStartPointer.current.fx + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragStartPointer.current.fy + dy));
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartPointer.current) return;

    const dx = e.clientX - dragStartPointer.current.px;
    const dy = e.clientY - dragStartPointer.current.py;
    const wasDrag = hasDragged.current;

    // Compute end position from drag start + total delta (no stale closure)
    const endX = Math.max(0, Math.min(window.innerWidth - FAB_SIZE, dragStartPointer.current.fx + dx));
    const endY = Math.max(0, Math.min(window.innerHeight - FAB_SIZE, dragStartPointer.current.fy + dy));

    dragStartPointer.current = null;
    setDragging(false);

    if (wasDrag) {
      const { edge: newEdge, pos: snapped } = snapToEdge(endX, endY, window.innerWidth, window.innerHeight);
      setEdge(newEdge);
      setPos(snapped);
      startPeekTimer();
    } else {
      // It was a tap/click — open help modal
      clearPeekTimer();
      setDocked(false);
      setOpen(true);
    }
  }, [startPeekTimer, clearPeekTimer]);

  /* ── Keyboard ──────────────────────────────────────────────────────── */

  const onKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft:  [-KBD_STEP, 0],
      ArrowRight: [KBD_STEP, 0],
      ArrowUp:    [0, -KBD_STEP],
      ArrowDown:  [0, KBD_STEP],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      setPos((p) => ({
        x: Math.max(0, Math.min(vw() - FAB_SIZE, p.x + dx)),
        y: Math.max(0, Math.min(vh() - FAB_SIZE, p.y + dy)),
      }));
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      clearPeekTimer();
      setDocked(false);
      setOpen(true);
    }
  }, [resetPeekTimer, clearPeekTimer, startPeekTimer]);

  const onKeyUp = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      const { edge: newEdge, pos: snapped } = snapToEdge(posRef.current.x, posRef.current.y, window.innerWidth, window.innerHeight);
      setEdge(newEdge);
      setPos(snapped);
      startPeekTimer();
    }
  }, [startPeekTimer]);

  /* ── Hover ─────────────────────────────────────────────────────────── */

  const onMouseEnter = useCallback(() => {
    setHovered(true);
    setDocked(false);
    clearPeekTimer();
  }, [clearPeekTimer]);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    if (!open) startPeekTimer();
  }, [open, startPeekTimer]);

  /* ── Cleanup ───────────────────────────────────────────────────────── */

  useEffect(() => () => { clearPeekTimer(); }, [clearPeekTimer]);

  /* ── Reposition on resize ──────────────────────────────────────────── */

  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: Math.min(p.x, vw() - FAB_SIZE),
        y: Math.min(p.y, vh() - FAB_SIZE),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Derived visual values ─────────────────────────────────────────── */

  const shouldDock = docked && !hovered && !open && !dragging;
  const showPulse = !open && !dragging && !hovered;
  const transition = reducedMotion ? "none" : dragging
    ? "none"
    : "transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)";

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        @keyframes fab-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5), 0 4px 20px rgba(0,0,0,0.25); }
          60%       { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0), 0 4px 20px rgba(0,0,0,0.25); }
        }
        .fab-pulse { animation: fab-pulse 2.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .fab-pulse { animation: none !important; }
        }
      `}</style>

      <div
        ref={fabRef}
        role="complementary"
        aria-label="Help and community"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        className={[
          "fixed z-50 select-none touch-none",
          dragging ? "cursor-grabbing" : "cursor-grab",
          "focus-visible:outline-none",
        ].join(" ")}
        style={{
          left: pos.x,
          top: pos.y,
          width: FAB_SIZE,
          height: FAB_SIZE,
          transform: shouldDock ? dockedTranslate(edge) : "translate(0,0)",
          transition,
        }}
      >
        {/* ── Handle button ──────────────────────────────────────────── */}
        <button
          type="button"
          aria-label="Open help menu"
          className={[
            "flex h-full w-full items-center justify-center rounded-full",
            "pointer-events-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600",
            "active:scale-90 transition-transform duration-100",
            showPulse && !reducedMotion ? "fab-pulse" : "",
          ].filter(Boolean).join(" ")}
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            boxShadow: showPulse ? undefined : "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          <FaWhatsapp className="h-5 w-5 text-white" aria-hidden="true" />
        </button>

        {/* ── Dock edge indicator ────────────────────────────────────── */}
        {!dragging && (
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute rounded-full bg-white/30",
              edge === "left"   ? "left-0 top-1/2 -translate-y-1/2 -translate-x-px h-5 w-1"   : "",
              edge === "right"  ? "right-0 top-1/2 -translate-y-1/2 translate-x-px h-5 w-1"   : "",
              edge === "top"    ? "top-0 left-1/2 -translate-x-1/2 -translate-y-px w-5 h-1"   : "",
              edge === "bottom" ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-px w-5 h-1" : "",
            ].filter(Boolean).join(" ")}
          />
        )}
      </div>

      {/* ── Help modal ──────────────────────────────────────────────── */}
      <Dialog
        isOpen={open}
        onClose={() => { setOpen(false); startPeekTimer(); }}
        size="sm"
      >
        <DialogBody>
          <div className="flex flex-col items-center text-center pt-8 pb-6 space-y-5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
              style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold">Need Help?</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Connect with us through WhatsApp in one tap.
              </p>
            </div>

            <div className="w-full space-y-2">
              <a
                href={CONTACTS.community.waGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { setOpen(false); startPeekTimer(); }}
                className={[
                  "flex items-center gap-3 rounded-xl p-3 w-full",
                  "hover:bg-[var(--bg-surface-alt)]",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]",
                ].join(" ")}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
                  <Users className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <span className="text-sm font-semibold">Join Community</span>
              </a>

              <a
                href={CONTACTS.support.waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { setOpen(false); startPeekTimer(); }}
                className={[
                  "flex items-center gap-3 rounded-xl p-3 w-full",
                  "hover:bg-[var(--bg-surface-alt)]",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]",
                ].join(" ")}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
                  <FaWhatsapp className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold">Contact Support</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => { setOpen(false); startPeekTimer(); }}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}
