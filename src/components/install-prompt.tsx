import React, { useEffect } from "react";
import { useInstallPrompt } from "../hooks/use-install-prompt";
import { Button } from "../design-system/components/button";
import { Modal } from "../design-system/components/modal";
import { Download, Smartphone } from "lucide-react";

interface InstallPromptProps {
  trigger?: "auto" | "manual";
  showOnEngagement?: boolean;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({
  trigger = "auto",
  showOnEngagement = true,
}) => {
  const {
    isInstallable,
    isInstalled,
    canPrompt,
    shouldShowPrompt,
    promptInstall,
    markPromptDismissed,
    trackEngagement,
  } = useInstallPrompt();

  const [showModal, setShowModal] = React.useState(false);

  // Track user engagement
  useEffect(() => {
    if (showOnEngagement) {
      trackEngagement();
    }
  }, [showOnEngagement, trackEngagement]);

  // Auto-show prompt based on engagement
  useEffect(() => {
    if (trigger === "auto" && shouldShowPrompt() && !isInstalled) {
      setShowModal(true);
    }
  }, [trigger, shouldShowPrompt, isInstalled]);

  // Manual trigger
  useEffect(() => {
    if (trigger === "manual" && canPrompt && !isInstalled) {
      setShowModal(true);
    }
  }, [trigger, canPrompt, isInstalled]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowModal(false);
    }
  };

  const handleDismiss = () => {
    markPromptDismissed();
    setShowModal(false);
  };

  // Don't render if not installable or already installed
  if (!isInstallable || isInstalled || !canPrompt) {
    return null;
  }

  return (
    <Modal isOpen={showModal} onClose={handleDismiss}>
      <div className="p-6">
        <div className="flex items-start mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "var(--color-primary-50)" }}
            >
              <Smartphone
                className="w-6 h-6"
                style={{ color: "var(--color-primary-600)" }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Install BryteLinks
              </h3>
              <p className="text-sm text-gray-600">
                Get the full app experience
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Receive instant order notifications</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Access offline when network is unavailable</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Quick access from your home screen</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Native app-like performance</span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleInstall}
            variant="primary"
            useThemeColor
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>
          <Button onClick={handleDismiss} variant="outline" className="flex-1">
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can install later from your browser menu
        </p>
      </div>
    </Modal>
  );
};
