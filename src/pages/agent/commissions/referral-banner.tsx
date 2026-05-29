import { useState, useCallback, useRef, useEffect } from "react";
import { FaCopy, FaCheck, FaShareAlt, FaLink, FaWhatsapp, FaSms } from "react-icons/fa";
import { Card } from "../../../design-system/components/card";
import { Button } from "../../../design-system/components/button";
import { useToast } from "../../../design-system/components/toast";

interface ReferralBannerProps {
  referralCode: string;
}

export const ReferralBanner = ({ referralCode }: ReferralBannerProps) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  const shareLink = `${window.location.origin}/register?ref=${referralCode}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target as Node)) {
        setShareDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast("Copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  }, [addToast]);

  const shareVia = (platform: "whatsapp" | "sms") => {
    const text = `Join me on BryteLinks and start vending airtime & data! Use my referral code: ${referralCode}`;
    const url = platform === "whatsapp"
      ? `https://wa.me/?text=${encodeURIComponent(text + " " + shareLink)}`
      : `sms:?body=${encodeURIComponent(text + " " + shareLink)}`;
    window.open(url, "_blank");
    setShareDropdownOpen(false);
  };

  return (
    <Card variant="elevated" className="overflow-hidden" noPadding>
      <div
        className="p-4 sm:p-6"
        style={{ background: "var(--gradient-brand-dark)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <p
              className="text-[10px] sm:text-xs font-medium tracking-wider uppercase"
              style={{ color: "var(--text-inverse)", opacity: 0.6 }}
            >
              Your Referral Code
            </p>
            <p
              className="text-2xl sm:text-3xl font-bold tracking-[0.2em] mt-1 font-mono break-all"
              style={{ color: "var(--text-inverse)" }}
            >
              {referralCode}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(referralCode)}
              className="flex-1 sm:flex-initial"
              style={{
                background: "color-mix(in srgb, var(--text-inverse) 20%, transparent)",
                color: "var(--text-inverse)",
                border: 0,
              }}
            >
              {copied ? <><FaCheck className="w-4 h-4 mr-1.5" /> Copied</> : <><FaCopy className="w-4 h-4 mr-1.5" /> Copy Code</>}
            </Button>
            <div className="relative" ref={shareDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                className="flex-1 sm:flex-initial"
                style={{
                  background: "color-mix(in srgb, var(--text-inverse) 15%, transparent)",
                  color: "var(--text-inverse)",
                  border: 0,
                }}
              >
                <FaShareAlt className="w-4 h-4 mr-1.5" /> Share
              </Button>
              {shareDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShareDropdownOpen(false)} />
                  <div
                    className="fixed sm:absolute inset-x-0 bottom-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 z-50 rounded-t-2xl sm:rounded-xl shadow-xl sm:min-w-[200px] overflow-hidden pb-safe-area sm:pb-0 animate-slide-up sm:animate-none"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}
                  >
                    <div className="sm:hidden w-full flex justify-center py-3">
                      <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--border-color)" }} />
                    </div>
                    <div className="sm:hidden px-4 pb-2 pt-1">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Share Referral Link</p>
                    </div>
                    <button
                      onClick={() => { copyToClipboard(shareLink); setShareDropdownOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-sm transition-colors border-b"
                      style={{
                        color: "var(--text-primary)",
                        background: "transparent",
                        borderColor: "var(--border-color)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 8%, transparent)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <FaLink className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> Copy Link
                    </button>
                    <button
                      onClick={() => shareVia("whatsapp")}
                      className="flex items-center gap-3 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-sm transition-colors border-b"
                      style={{
                        color: "var(--text-primary)",
                        background: "transparent",
                        borderColor: "var(--border-color)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 8%, transparent)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <FaWhatsapp className="w-4 h-4" style={{ color: "var(--color-whatsapp)" }} /> WhatsApp
                    </button>
                    <button
                      onClick={() => shareVia("sms")}
                      className="flex items-center gap-3 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-sm transition-colors"
                      style={{
                        color: "var(--text-primary)",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "color-mix(in srgb, var(--color-primary) 8%, transparent)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <FaSms className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> SMS
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
