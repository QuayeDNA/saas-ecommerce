import React, { useEffect } from "react";
import { useInstallPrompt } from "../hooks/use-install-prompt";
import { Button } from "../design-system/components/button";
import { Modal } from "../design-system/components/modal";
import { Download, Smartphone } from "lucide-react";

export const InstallPrompt: React.FC = () => {
  const { canPrompt, isInstalled, promptInstall, shouldShowAutoPrompt, markDismissed } = useInstallPrompt();
  const [showModal, setShowModal] = React.useState(false);

  // Auto-show modal based on engagement
  useEffect(() => {
    if (shouldShowAutoPrompt()) setShowModal(true);
  }, [shouldShowAutoPrompt]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) setShowModal(false);
  };

  const handleDismiss = () => {
    markDismissed();
    setShowModal(false);
  };

  return (
    <>
      {/* Auto modal */}
      <Modal isOpen={showModal} onClose={handleDismiss}>
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--color-primary-50)" }}>
                <Smartphone className="w-6 h-6" style={{ color: "var(--color-primary-600)" }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Install BryteLinks</h3>
                <p className="text-sm text-gray-600">Get the full app experience</p>
              </div>
            </div>
          </div>
          <ul className="mb-6 space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Receive instant order notifications</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Quick access from your home screen</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>Native app-like performance</span>
            </li>
          </ul>
          <div className="flex space-x-3">
            <Button onClick={handleInstall} variant="primary" className="flex-1">
              <Download className="w-4 h-4 mr-2" />Install App
            </Button>
            <Button onClick={handleDismiss} variant="outline" className="flex-1">Maybe Later</Button>
          </div>
        </div>
      </Modal>

      {/* Floating install badge — always visible when canPrompt */}
      {canPrompt && !isInstalled && !showModal && (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:scale-105"
          style={{ background: "var(--color-primary)", color: "#fff" }}
        >
          <Download className="h-4 w-4" />
          Install App
        </button>
      )}
    </>
  );
};
