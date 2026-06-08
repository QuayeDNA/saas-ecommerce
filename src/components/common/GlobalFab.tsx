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
import { X } from "lucide-react";
import { FaUsers, FaWhatsapp } from "react-icons/fa";
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

function menuDirection(edge: Edge): string {
  switch (edge) {
    case "right":  return "flex-col items-end";
    case "left":   return "flex-col items-start";
    case "top":    return "flex-col items-center";
    case "bottom": return "flex-col-reverse items-center";
  }
}

function menuOffset(edge: Edge): React.CSSProperties {
  const gap = 10;
  switch (edge) {
    case "right":  return { right: FAB_SIZE + gap, top: 0 };
    case "left":   return { left: FAB_SIZE + gap, top: 0 };
    case "top":    return { top: FAB_SIZE + gap, left: "50%", transform: "translateX(-50%)" };
    case "bottom": return { bottom: FAB_SIZE + gap, left: "50%", transform: "translateX(-50%)" };
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
      // It was a tap/click — toggle menu
      setOpen((v) => {
        const next = !v;
        if (next) {
          clearPeekTimer();
          setDocked(false);
        } else {
          startPeekTimer();
        }
        return next;
      });
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
    if (e.key === "Escape") {
      setOpen(false);
      resetPeekTimer();
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => {
        const next = !v;
        if (next) {
          clearPeekTimer();
          setDocked(false);
        } else {
          startPeekTimer();
        }
        return next;
      });
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

  /* ── Click-outside to close menu ──────────────────────────────────── */

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setOpen(false);
        startPeekTimer();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open, startPeekTimer]);

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

        @keyframes fab-item-in {
          from { opacity: 0; transform: scale(0.88) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .fab-item {
          animation: fab-item-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .fab-item:nth-child(1) { animation-delay: 0.04s; }
        .fab-item:nth-child(2) { animation-delay: 0.1s;  }

        @media (prefers-reduced-motion: reduce) {
          .fab-pulse, .fab-item { animation: none !important; }
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
        {/* ── Action menu ───────────────────────────────────────────── */}
        {open && (
          <div
            role="menu"
            aria-label="Contact options"
            className={[
              "absolute flex gap-2.5 pointer-events-auto",
              menuDirection(edge),
            ].join(" ")}
            style={{ ...menuOffset(edge), width: "max-content" }}
          >
            <a
              href={CONTACTS.community.waGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => { setOpen(false); startPeekTimer(); }}
              className={[
                "fab-item",
                "flex items-center gap-2 rounded-full px-3.5 py-2",
                "text-xs font-semibold whitespace-nowrap",
                "border border-[var(--border-color)] bg-[var(--bg-surface)]",
                "text-[var(--text-secondary)]",
                "shadow-lg shadow-black/10",
                "hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-color-strong)]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]",
              ].join(" ")}
            >
              <FaUsers className="text-[var(--color-secondary)] text-sm flex-shrink-0" aria-hidden="true" />
              Community
            </a>

            <a
              href={CONTACTS.support.waLink}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => { setOpen(false); startPeekTimer(); }}
              className={[
                "fab-item",
                "flex items-center gap-2 rounded-full px-3.5 py-2",
                "text-xs font-semibold whitespace-nowrap",
                "border border-[var(--border-color)] bg-[var(--bg-surface)]",
                "text-[var(--text-secondary)]",
                "shadow-lg shadow-black/10",
                "hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-color-strong)]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              ].join(" ")}
            >
              <FaWhatsapp className="text-emerald-500 text-sm flex-shrink-0" aria-hidden="true" />
              Support
            </a>
          </div>
        )}

        {/* ── Handle button ──────────────────────────────────────────── */}
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Close contact menu" : "Open contact menu"}
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
          {open ? (
            <X className="h-5 w-5 text-white" aria-hidden="true" />
          ) : (
            <FaWhatsapp className="h-5 w-5 text-white" aria-hidden="true" />
          )}
        </button>

        {/* ── Dock edge indicator ────────────────────────────────────── */}
        {!open && !dragging && (
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
    </>
  );
}
