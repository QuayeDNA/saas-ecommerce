import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const useInstallPrompt = () => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true);

  const canPrompt = deferredPrompt !== null && !isInstalled && !isStandalone;

  // Track route changes for engagement
  useEffect(() => {
    const key = "pwa_page_visits";
    const raw = localStorage.getItem(key);
    const count = raw ? parseInt(raw, 10) : 0;
    localStorage.setItem(key, String(count + 1));
  }, [location.pathname]);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const onDisplayMode = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", onDisplayMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mq.removeEventListener("change", onDisplayMode);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === "accepted";
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setDeferredPrompt(null);
  }, []);

  const shouldShowAutoPrompt = useCallback(() => {
    if (!canPrompt) return false;
    const visits = parseInt(localStorage.getItem("pwa_page_visits") || "0", 10);
    const dismissed = localStorage.getItem("pwa_dismissed_at");
    if (dismissed) {
      const elapsed = Date.now() - parseInt(dismissed, 10);
      if (elapsed < 24 * 60 * 60 * 1000) return false;
    }
    return visits >= 2;
  }, [canPrompt]);

  const markDismissed = useCallback(() => {
    localStorage.setItem("pwa_dismissed_at", String(Date.now()));
    setDeferredPrompt(null);
  }, []);

  return {
    canPrompt,
    isInstalled: isInstalled || isStandalone,
    promptInstall,
    dismissPrompt,
    shouldShowAutoPrompt,
    markDismissed,
  };
};
