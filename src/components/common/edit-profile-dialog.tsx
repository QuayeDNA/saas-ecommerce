import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Form,
  FormField,
  Input,
  Select,
  Button,
} from "../../design-system";
import { useUser, useAuth } from "../../hooks";
import { isBusinessUser } from "../../utils/userTypeHelpers";
import type { UpdateProfileData } from "../../services/user.service";

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  businessName?: string;
  businessCategory?: string;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { authState } = useAuth();
  const { updateProfile, isLoading } = useUser();
  const [formData, setFormData] = useState<UpdateProfileData>({
    fullName: "",
    phone: "",
    businessName: "",
    businessCategory: "services",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen && authState.user) {
      setFormData({
        fullName: authState.user.fullName || "",
        phone: authState.user.phone || "",
        businessName: authState.user.businessName || "",
        businessCategory: authState.user.businessCategory || "services",
      });
      setErrors({});
    }
  }, [isOpen, authState.user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Validate business fields for business users
    if (authState.user && isBusinessUser(authState.user.userType)) {
      if (!formData.businessName?.trim()) {
        newErrors.businessName = "Business name is required";
      }

      if (!formData.businessCategory) {
        newErrors.businessCategory = "Business category is required";
      }
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
      await updateProfile(formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by the context
      console.error("Failed to update profile:", error);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("fullName", e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("phone", e.target.value);
  };

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("businessName", e.target.value);
  };

  const handleBusinessCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessCategory: value as UpdateProfileData["businessCategory"],
    }));
    if (errors.businessCategory) {
      setErrors((prev) => ({ ...prev, businessCategory: undefined }));
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="md">
      <DialogHeader>
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
      </DialogHeader>

      <Form onSubmit={handleSubmit}>
        <DialogBody>
          <div className="space-y-4">
            <FormField>
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={handleFullNameChange}
                placeholder="Enter your full name"
                errorText={errors.fullName}
                isInvalid={!!errors.fullName}
                fullWidth
              />
            </FormField>

            <FormField>
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                errorText={errors.phone}
                isInvalid={!!errors.phone}
                fullWidth
              />
            </FormField>

            {/* Business fields for business users */}
            {authState.user && isBusinessUser(authState.user.userType) && (
              <>
                <FormField>
                  <Input
                    label="Business Name"
                    value={formData.businessName}
                    onChange={handleBusinessNameChange}
                    placeholder="Enter your business name"
                    errorText={errors.businessName}
                    isInvalid={!!errors.businessName}
                    fullWidth
                  />
                </FormField>

                <FormField>
                  <Select
                    label="Business Category"
                    value={formData.businessCategory || "services"}
                    onChange={handleBusinessCategoryChange}
                    options={[
                      { value: "electronics", label: "Electronics" },
                      { value: "fashion", label: "Fashion" },
                      { value: "food", label: "Food" },
                      { value: "services", label: "Services" },
                      { value: "other", label: "Other" },
                    ]}
                    placeholder="Select business category"
                    error={errors.businessCategory}
                  />
                </FormField>
              </>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </DialogFooter>
      </Form>
    </Dialog>
  );
};
