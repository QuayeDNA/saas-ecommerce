import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  FormField,
  Input,
  Button,
} from "../../design-system";
import { useUser } from "../../hooks";
import type { ChangePasswordData } from "../../services/user.service";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { changePassword, isLoading } = useUser();
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<
    Partial<ChangePasswordData & { confirmPassword: string }>
  >({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
    });
    setConfirmPassword("");
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordData & { confirmPassword: string }> =
      {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== confirmPassword) {
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

    try {
      await changePassword(formData);
      resetForm();
      onClose();
    } catch (error) {
      // Error is handled by the context
      console.error("Failed to change password:", error);
    }
  };

  const handleInputChange = (
    field: keyof ChangePasswordData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleCurrentPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleInputChange("currentPassword", e.target.value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("newPassword", e.target.value);
  };

  const handleConfirmPasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleConfirmPasswordChange(e.target.value);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="md">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Change Password</h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-4">
            <FormField>
              <Input
                type={showCurrentPassword ? "text" : "password"}
                label="Current Password"
                value={formData.currentPassword}
                onChange={handleCurrentPasswordChange}
                placeholder="Enter your current password"
                errorText={errors.currentPassword}
                isInvalid={!!errors.currentPassword}
                fullWidth
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] focus:outline-none"
                    aria-label={
                      showCurrentPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
              />
            </FormField>

            <FormField>
              <Input
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                value={formData.newPassword}
                onChange={handleNewPasswordChange}
                placeholder="Enter your new password"
                errorText={errors.newPassword}
                isInvalid={!!errors.newPassword}
                fullWidth
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] focus:outline-none"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
              />
            </FormField>

            <FormField>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm New Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordInputChange}
                placeholder="Confirm your new password"
                errorText={errors.confirmPassword}
                isInvalid={!!errors.confirmPassword}
                fullWidth
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] focus:outline-none"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                }
              />
            </FormField>

            <div className="text-sm text-[var(--text-secondary)] bg-[var(--bg-surface-alt)] rounded-lg">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
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
            variant="primary"
            colorScheme="success"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Change Password
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
