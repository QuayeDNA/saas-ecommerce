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
        <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 20%, transparent)' }}>
            🔒
          </span>
          Change Admin Password
        </h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)' }}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5" style={{ color: 'var(--error)' }}>⚠️</span>
                <div>
                  <h4 className="font-medium" style={{ color: 'var(--error)' }}>Security Notice</h4>
                  <p className="text-sm mt-1" style={{ color: 'color-mix(in srgb, var(--error) 80%, transparent)' }}>
                    Changing your admin password will require you to log in
                    again with the new password.
                  </p>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)', color: 'var(--error)' }}>
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
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
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
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  aria-label={showPasswords.new ? "Hide new password" : "Show new password"}
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              }
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
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
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  aria-label={showPasswords.confirm ? "Hide confirm password" : "Show confirm password"}
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
