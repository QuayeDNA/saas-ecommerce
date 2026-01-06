import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  Input,
  Button,
  FormField,
} from "../../design-system";
import {
  settingsService,
  type ApiSettings,
} from "../../services/settings.service";

interface ApiSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ApiSettings;
  onSuccess: (settings: ApiSettings) => void;
}

export const ApiSettingsDialog: React.FC<ApiSettingsDialogProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ApiSettings>(currentSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeys, setShowKeys] = useState({
    mtn: false,
    telecel: false,
    airtelTigo: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(currentSettings);
    }
  }, [isOpen, currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await settingsService.updateApiSettings(formData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error("Failed to update API settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(currentSettings);
    setShowKeys({ mtn: false, telecel: false, airtelTigo: false });
    onClose();
  };

  const toggleKeyVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="xl">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            🔑
          </span>
          API Configuration
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">API Endpoint</h3>
              <Input
                value={formData.apiEndpoint}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    apiEndpoint: e.target.value,
                  }))
                }
                placeholder="https://api.telecomsaas.com"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Provider API Keys</h3>

              <div className="grid grid-cols-1 gap-4">
                {/* MTN API Key */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">MTN API Key</h4>
                      <p className="text-sm text-gray-600">
                        For MTN data services
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type={showKeys.mtn ? "text" : "password"}
                      value={formData.mtnApiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mtnApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter MTN API key"
                      className="font-mono"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility("mtn")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showKeys.mtn ? "🙈" : "👁️"}
                        </button>
                      }
                    />
                  </FormField>
                </div>

                {/* Telecel API Key */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Telecel API Key
                      </h4>
                      <p className="text-sm text-gray-600">
                        For Telecel data services
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type={showKeys.telecel ? "text" : "password"}
                      value={formData.telecelApiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          telecelApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter Telecel API key"
                      className="font-mono"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility("telecel")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showKeys.telecel ? "🙈" : "👁️"}
                        </button>
                      }
                    />
                  </FormField>
                </div>

                {/* AirtelTigo API Key */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        AirtelTigo API Key
                      </h4>
                      <p className="text-sm text-gray-600">
                        For AirtelTigo data services
                      </p>
                    </div>
                  </div>
                  <FormField>
                    <Input
                      type={showKeys.airtelTigo ? "text" : "password"}
                      value={formData.airtelTigoApiKey}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          airtelTigoApiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter AirtelTigo API key"
                      className="font-mono"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility("airtelTigo")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showKeys.airtelTigo ? "🙈" : "👁️"}
                        </button>
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>
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
            {isLoading ? "Saving..." : "Save API Settings"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
