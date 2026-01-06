import React, { useState } from "react";
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
    value: string
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange("currentPassword", e.target.value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("newPassword", e.target.value);
  };

  const handleConfirmPasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
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
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? "🙈" : "👁️"}
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
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? "🙈" : "👁️"}
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
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                }
              />
            </FormField>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
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
            color="blue"
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
