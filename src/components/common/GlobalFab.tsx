import { useState } from "react";
import { X } from "lucide-react";
import { FaUsers, FaWhatsapp } from "react-icons/fa";
import { CONTACTS } from "../../config/contacts";

export function GlobalFab() {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {fabOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setFabOpen(false)}
        />
      )}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <div
          style={{
            animation: fabOpen
              ? "fabItemIn 0.2s ease-out forwards"
              : "none",
            opacity: fabOpen ? 1 : 0,
            transform: fabOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
            pointerEvents: fabOpen ? "auto" : "none",
          }}
          className="transition-all duration-200"
        >
          <a
            href={CONTACTS.community.waGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setFabOpen(false)}
            className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-lg text-sm font-semibold text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-color-strong)]"
          >
            <FaUsers className="text-[var(--color-secondary)]" />
            <span>Community</span>
          </a>
        </div>

        <div
          style={{
            animation: fabOpen
              ? "fabItemIn 0.2s ease-out forwards 0.07s"
              : "none",
            opacity: fabOpen ? 1 : 0,
            transform: fabOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
            pointerEvents: fabOpen ? "auto" : "none",
          }}
          className="transition-all duration-200"
        >
          <a
            href={CONTACTS.support.waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setFabOpen(false)}
            className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-lg text-sm font-semibold text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-color-strong)]"
          >
            <FaWhatsapp className="text-success" />
            <span>Support</span>
          </a>
        </div>

        <button
          onClick={() => setFabOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform active:scale-90"
          style={{
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            animation: fabOpen
              ? "none"
              : "fabPulse 2s ease-in-out infinite",
          }}
          aria-label={fabOpen ? "Close menu" : "Get help"}
        >
          {fabOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <FaWhatsapp className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
          50% { box-shadow: 0 0 0 18px rgba(37, 211, 102, 0); }
        }
        @keyframes fabItemIn {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
