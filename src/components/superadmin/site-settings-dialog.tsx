import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  Button,
  Textarea,
} from "../../design-system";
import {
  settingsService,
  type SiteSettings,
} from "../../services/settings.service";

interface SiteSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: SiteSettings;
  onSuccess: (settings: SiteSettings) => void;
}

export const SiteSettingsDialog: React.FC<SiteSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<SiteSettings>(currentSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentSettings);
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await settingsService.updateSiteSettings(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update site settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(currentSettings);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            🌐
          </span>
          Site Management Settings
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Site Status</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Control whether the site is open for public access
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${
                      formData.isSiteOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formData.isSiteOpen ? "Open" : "Closed"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isSiteOpen: !prev.isSiteOpen,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isSiteOpen ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isSiteOpen ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <Textarea
              label="Maintenance Message"
              value={formData.customMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  customMessage: e.target.value,
                }))
              }
              placeholder="Enter a message to display when the site is closed..."
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be shown to users when the site is closed for
              maintenance.
            </p>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="blue"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
