import { useState, useEffect, useCallback } from "react";

interface InstallPromptState {
  isInstallable: boolean;
  isInstalled: boolean;
  canPrompt: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const useInstallPrompt = () => {
  const [state, setState] = useState<InstallPromptState>({
    isInstallable: false,
    isInstalled: false,
    canPrompt: false,
    deferredPrompt: null,
  });

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const navigator = window.navigator as { standalone?: boolean };
      const isInWebAppiOS = navigator.standalone === true;

      setState((prev) => ({
        ...prev,
        isInstalled: isStandalone || isInWebAppiOS,
      }));
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setState((prev) => ({ ...prev, isInstalled: e.matches }));
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Store the event for later use
      setState((prev) => ({
        ...prev,
        isInstallable: true,
        canPrompt: true,
        deferredPrompt: e as BeforeInstallPromptEvent,
      }));
    };

    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        canPrompt: false,
        deferredPrompt: null,
      }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt || !state.canPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      await state.deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await state.deferredPrompt.userChoice;

      // Reset the deferred prompt
      setState((prev) => ({
        ...prev,
        canPrompt: false,
        deferredPrompt: null,
      }));

      return outcome === "accepted";
    } catch (error) {
      console.error("Error showing install prompt:", error);
      return false;
    }
  }, [state.deferredPrompt, state.canPrompt]);

  const dismissPrompt = useCallback(() => {
    setState((prev) => ({
      ...prev,
      canPrompt: false,
    }));
  }, []);

  // Smart install prompt logic - show after user engagement
  const shouldShowPrompt = useCallback(() => {
    if (!state.canPrompt || state.isInstalled) return false;

    // Check if user has been engaged (multiple page views, time spent, etc.)
    const pageViews = parseInt(localStorage.getItem("pageViews") || "0");
    const lastPromptDismissed = localStorage.getItem("installPromptDismissed");
    const timeSinceDismissed = lastPromptDismissed
      ? Date.now() - parseInt(lastPromptDismissed)
      : Infinity;

    // Show prompt if:
    // - User has viewed at least 3 pages, AND
    // - At least 24 hours have passed since last dismissal, OR
    // - No previous dismissal
    return pageViews >= 3 && timeSinceDismissed > 24 * 60 * 60 * 1000;
  }, [state.canPrompt, state.isInstalled]);

  const trackEngagement = useCallback(() => {
    const currentViews = parseInt(localStorage.getItem("pageViews") || "0");
    localStorage.setItem("pageViews", (currentViews + 1).toString());
  }, []);

  const markPromptDismissed = useCallback(() => {
    localStorage.setItem("installPromptDismissed", Date.now().toString());
    dismissPrompt();
  }, [dismissPrompt]);

  return {
    ...state,
    promptInstall,
    dismissPrompt,
    shouldShowPrompt,
    trackEngagement,
    markPromptDismissed,
  };
};
