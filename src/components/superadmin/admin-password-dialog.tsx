import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  Input,
  Button,
} from "../../design-system";
import { settingsService } from "../../services/settings.service";

interface AdminPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordDialog: React.FC<AdminPasswordDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPasswords({ current: false, new: false, confirm: false });
    onClose();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await settingsService.changeAdminPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error("Failed to change admin password:", error);
      const err = error as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message) {
        setErrors({ submit: err.response.data.message });
      } else {
        setErrors({ submit: "Failed to change password. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="md">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            🔒
          </span>
          Change Admin Password
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-red-600 mt-0.5">⚠️</span>
                <div>
                  <h4 className="font-medium text-red-900">Security Notice</h4>
                  <p className="text-sm text-red-800 mt-1">
                    Changing your admin password will require you to log in
                    again with the new password.
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <Input
              label="Current Password"
              errorText={errors.currentPassword}
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              placeholder="Enter your current password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? "🙈" : "👁️"}
                </button>
              }
            />

            <Input
              label="New Password"
              errorText={errors.newPassword}
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder="Enter your new password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long
            </p>

            <Input
              label="Confirm New Password"
              errorText={errors.confirmPassword}
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Confirm your new password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              }
            />
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
            color="red"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
