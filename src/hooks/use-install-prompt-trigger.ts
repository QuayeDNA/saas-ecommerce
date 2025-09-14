import { useInstallPrompt } from "../hooks/use-install-prompt";

// Hook for manual triggering of install prompt
export const useInstallPromptTrigger = () => {
  const { canPrompt, promptInstall } = useInstallPrompt();

  return {
    canPrompt,
    triggerInstall: promptInstall,
  };
};
