import { useState } from "react";
import { X } from "lucide-react";
import { FaUsers, FaWhatsapp } from "react-icons/fa";
import { CONTACTS } from "../../config/contacts";

export function GlobalFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 overflow-hidden"
        style={{
          maxWidth: open ? "500px" : "20px",
          transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="flex items-center gap-2 sm:gap-3"
          style={{
            animation: open ? "none" : "peekGlow 2s ease-in-out infinite",
          }}
        >
          {/* FAB toggle button */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full shadow-xl transition-transform active:scale-90"
            style={{
              background: "linear-gradient(135deg, #25D366, #128C7E)",
            }}
            aria-label={open ? "Close menu" : "Get help"}
          >
            {open ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <FaWhatsapp className="h-6 w-6 text-white" />
            )}
          </button>

          {/* Menu items */}
          <div
            className="flex items-center gap-2 sm:gap-3"
            style={{
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.2s ease 0.1s",
            }}
          >
            <a
              href={CONTACTS.community.waGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 shadow-lg transition-all hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-color-strong)]"
            >
              <FaUsers className="text-[var(--color-secondary)] text-xs sm:text-sm" />
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                Community
              </span>
            </a>
            <a
              href={CONTACTS.support.waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 shadow-lg transition-all hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-color-strong)]"
            >
              <FaWhatsapp className="text-success text-xs sm:text-sm" />
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                Support
              </span>
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes peekGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
      `}</style>
    </>
  );
}
