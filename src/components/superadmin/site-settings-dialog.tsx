import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  Button,
  Textarea,
  Switch,
} from "../../design-system";
import { Input } from "../../design-system/components/input";
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
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
            🌐
          </span>
          Site Management Settings
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Site Status</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Control whether the site is open for public access
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: formData.isSiteOpen ? 'var(--success)' : 'var(--error)' }}>
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
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: formData.isSiteOpen ? 'var(--success)' : 'var(--border-color)' }}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isSiteOpen ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <Input
                label="Greeting Text"
                value={formData.greetingText ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    greetingText: e.target.value,
                  }))
                }
                placeholder="Good morning"
                className="w-full"
              />

              <Input
                label="Welcome Message"
                value={formData.welcomeMessage ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    welcomeMessage: e.target.value,
                  }))
                }
                placeholder="Welcome back!"
                className="w-full"
              />

              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Show welcome icon
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Toggle whether the welcome message includes an icon.
                  </p>
                </div>
                <Switch
                  checked={formData.showGreetingIcon ?? true}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      showGreetingIcon: checked,
                    }))
                  }
                />
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
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
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
