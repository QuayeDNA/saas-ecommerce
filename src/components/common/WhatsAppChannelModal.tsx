import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/use-auth";
import { Dialog, DialogBody, Button } from "../../design-system";
import { CONTACTS } from "../../config/contacts";
import { FaWhatsapp } from "react-icons/fa";
import { Bell, Sparkles, Lightbulb } from "lucide-react";

const SEEN_KEY = "bl_whatsapp_channel_seen";

export const WhatsAppChannelModal = () => {
  const { authState, updateFirstTimeFlag } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (
      authState.isAuthenticated &&
      authState.user?.isFirstTime &&
      localStorage.getItem(SEEN_KEY) !== "true"
    ) {
      setIsOpen(true);
    }
  }, [authState.isAuthenticated, authState.user?.isFirstTime]);

  const handleDismiss = async () => {
    localStorage.setItem(SEEN_KEY, "true");
    setIsOpen(false);
    try {
      await updateFirstTimeFlag();
    } catch {
      // Silently fail
    }
  };

  const handleJoin = () => {
    window.open(CONTACTS.community.waGroupLink, "_blank", "noopener noreferrer");
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={handleDismiss} size="sm" closeOnOverlay={false}>
      <DialogBody>
        <div className="flex flex-col items-center text-center pt-8 pb-6 space-y-5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
          >
            <FaWhatsapp className="h-6 w-6 text-white" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">Stay in the know</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">
              Get real-time updates on system status, new features, and platform tips.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
              <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              System Status
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              New Features
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}>
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              Platform Tips
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<FaWhatsapp className="text-sm" />}
            onClick={handleJoin}
          >
            Join WhatsApp Channel
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            Maybe later
          </button>
        </div>
      </DialogBody>
    </Dialog>
  );
};
