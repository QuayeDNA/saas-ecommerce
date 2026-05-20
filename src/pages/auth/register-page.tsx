// src/pages/auth/register-page.tsx

/**
 * Agent Registration Page within the centralized auth flow.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaArrowRight,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaCheck,
} from "react-icons/fa";
import {
  Button,
  Input,
  Alert,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../../design-system";
import { useAuth } from "../../hooks";
import { useSiteStatus } from "../../contexts/site-status-context";
import { useToast } from "../../design-system/components/toast";
import type { RegisterAgentData } from "../../services/auth.service";
import { AuthLayout } from "../../layouts/auth-layout";
import {
  FIELD_LABELS,
  PASSWORD_RULES,
  STEPS_REGISTRATION,
} from "../../constants/auth";

interface FormData {
  fullName: string;
  email: string;
  businessName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  match: boolean;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage = () => {
  const { registerAgent } = useAuth();
  const { signupApprovalRequired, isLoading: siteStatusLoading } =
    useSiteStatus();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    businessName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      match: false,
    });

  const totalSteps = STEPS_REGISTRATION.length;

  const validateField = (
    field: keyof FormData,
    value: string,
  ): string | undefined => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return undefined;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return undefined;
      case "businessName":
        if (!value.trim()) return "Business name is required";
        if (value.trim().length < 2)
          return "Business name must be at least 2 characters";
        return undefined;
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[\d\s\-+()]{10,}$/.test(value)) return "Invalid phone number";
        return undefined;
      case "password":
        if (!value) return "Password is required";
        if (value.length < PASSWORD_RULES.MIN_LENGTH)
          return `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`;
        return undefined;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return undefined;
      default:
        return undefined;
    }
  };

  const validatePassword = (password: string, confirmPassword: string) => {
    setPasswordValidation({
      length: password.length >= PASSWORD_RULES.MIN_LENGTH,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === confirmPassword && password.length > 0,
    });
  };

  const handleFieldBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    const error = validateField(field, formData[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setLocalError(null);

    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }

    if (field === "password" || field === "confirmPassword") {
      validatePassword(
        field === "password" ? value : formData.password,
        field === "confirmPassword" ? value : formData.confirmPassword,
      );
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return (
        !fieldErrors.fullName &&
        !fieldErrors.email &&
        formData.fullName.trim() !== "" &&
        formData.email.trim() !== ""
      );
    }

    if (currentStep === 2) {
      return (
        !fieldErrors.businessName &&
        !fieldErrors.phone &&
        formData.businessName.trim() !== "" &&
        formData.phone.trim() !== ""
      );
    }

    return Object.values(passwordValidation).every(Boolean);
  };

  const nextStep = () => {
    if (currentStep < totalSteps && validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (siteStatusLoading) return;

    if (!validateCurrentStep()) {
      addToast("Please complete all required fields correctly", "error");
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      const agentData: RegisterAgentData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
      };

      await registerAgent(agentData);

      if (signupApprovalRequired) {
        setShowSuccessDialog(true);
      } else {
        addToast(
          "Agent account created successfully! You can now log in.",
          "success",
        );
        navigate("/login");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setLocalError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (() => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    const strength = (validCount / 5) * 100;

    if (strength === 100)
      return { strength, label: "Strong", color: "bg-green-500" };
    if (strength >= 60)
      return { strength, label: "Medium", color: "bg-yellow-500" };
    if (strength > 0) return { strength, label: "Weak", color: "bg-red-500" };
    return { strength: 0, label: "Very Weak", color: "bg-slate-300" };
  })();

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register to start vending airtime and data."
      backLink="/home"
      backLabel="Back"
      steps={STEPS_REGISTRATION.map((step) => step.title)}
      activeStep={currentStep}
    >
      {localError && (
        <Alert status="error" variant="left-accent" className="mb-6">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 text-red-600" />
            <span>{localError}</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-5">
            <Input
              label={FIELD_LABELS.fullName}
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              onBlur={() => handleFieldBlur("fullName")}
              type="text"
              required
              placeholder="Enter your full name"
              leftIcon={<FaUser className="text-slate-400" />}
              errorText={
                touchedFields.has("fullName") ? fieldErrors.fullName : undefined
              }
            />
            <Input
              label={FIELD_LABELS.email}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleFieldBlur("email")}
              type="email"
              required
              placeholder="your.email@example.com"
              leftIcon={<FaEnvelope className="text-slate-400" />}
              errorText={
                touchedFields.has("email") ? fieldErrors.email : undefined
              }
            />
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Provide the name and email used for notifications and account
              security.
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <Input
              label={FIELD_LABELS.businessName}
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              onBlur={() => handleFieldBlur("businessName")}
              type="text"
              required
              placeholder="Enter your business name"
              leftIcon={<FaBuilding className="text-slate-400" />}
              errorText={
                touchedFields.has("businessName")
                  ? fieldErrors.businessName
                  : undefined
              }
            />
            <Input
              label={FIELD_LABELS.phone}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onBlur={() => handleFieldBlur("phone")}
              type="tel"
              required
              placeholder="+233 XX XXX XXXX"
              leftIcon={<FaPhoneAlt className="text-slate-400" />}
              errorText={
                touchedFields.has("phone") ? fieldErrors.phone : undefined
              }
            />
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Your business details help us approve your account faster.
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="space-y-4">
              <Input
                label={FIELD_LABELS.password}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
                type={showPasswords ? "text" : "password"}
                required
                placeholder="Create a strong password"
                leftIcon={<FaLock className="text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full"
                    aria-label={
                      showPasswords ? "Hide password" : "Show password"
                    }
                  >
                    {showPasswords ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
                errorText={
                  touchedFields.has("password")
                    ? fieldErrors.password
                    : undefined
                }
              />
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Password Strength</span>
                    <span
                      className={
                        passwordStrength.strength === 100
                          ? "text-emerald-600"
                          : passwordStrength.strength >= 60
                            ? "text-amber-600"
                            : "text-rose-600"
                      }
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`${passwordStrength.color} h-full transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Input
              label={FIELD_LABELS.confirmPassword}
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              onBlur={() => handleFieldBlur("confirmPassword")}
              type={showPasswords ? "text" : "password"}
              required
              placeholder="Confirm your password"
              leftIcon={<FaLock className="text-slate-400" />}
              errorText={
                touchedFields.has("confirmPassword")
                  ? fieldErrors.confirmPassword
                  : undefined
              }
            />
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 grid gap-2 text-sm text-slate-600">
              {[
                {
                  valid: passwordValidation.length,
                  label: `At least ${PASSWORD_RULES.MIN_LENGTH} characters`,
                },
                {
                  valid: passwordValidation.uppercase,
                  label: "One uppercase letter",
                },
                {
                  valid: passwordValidation.lowercase,
                  label: "One lowercase letter",
                },
                { valid: passwordValidation.number, label: "One number" },
                { valid: passwordValidation.match, label: "Passwords match" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${item.valid ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
                  >
                    {item.valid ? (
                      <FaCheck size={12} />
                    ) : (
                      <span className="text-xs">•</span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1"
          >
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className="flex-1"
            >
              Next <FaArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              disabled={
                !validateCurrentStep() || isSubmitting || siteStatusLoading
              }
              className="flex-1"
              isLoading={isSubmitting || siteStatusLoading}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" /> Creating
                  Account...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" /> Create Account
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-slate-900 hover:text-slate-700"
            to="/login"
          >
            Sign in here
          </Link>
        </div>
      </form>

      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        size="md"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <FaCheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Registration submitted
              </h2>
              <p className="text-sm text-slate-600">
                Your account is pending approval.
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-3 text-sm text-slate-600">
            <p>We will review your registration within 24-48 hours.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Watch your inbox for approval updates.</li>
              <li>You can sign in immediately once approved.</li>
              <li>Contact support if you need help.</li>
            </ul>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/login");
              }}
              className="flex-1"
            >
              Go to Login
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </AuthLayout>
  );
};
