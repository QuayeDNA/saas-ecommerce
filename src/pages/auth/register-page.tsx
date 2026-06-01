import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  FaShareAlt
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
  referralCode: string;
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
  referralCode?: string;
}

// OTP disabled - re-enable when SMS is ready
// const SMS_COMING_SOON_MESSAGE =
//   "SMS verification coming soon";

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
  // OTP disabled - re-enable when SMS is ready
  // const [selectedChannel, setSelectedChannel] = useState<"email" | "phone">("email");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    businessName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      match: false,
    });

  // OTP state - disabled, re-enable when SMS is ready
  // const [otpSent, setOtpSent] = useState(false);
  // const [otpVerified, setOtpVerified] = useState(false);
  // const [maskedContact, setMaskedContact] = useState("");
  // const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  // const [otpSending, setOtpSending] = useState(false);
  // const [otpVerifying, setOtpVerifying] = useState(false);
  // const [otpError, setOtpError] = useState<string | null>(null);
  // const [resendCooldown, setResendCooldown] = useState(0);
  // const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [searchParams] = useSearchParams();

  const totalSteps = STEPS_REGISTRATION.length;

  // Read referral code from URL query param on mount
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref }));
      setTouchedFields((prev) => new Set(prev).add("referralCode"));
    }
  }, [searchParams]);

  // Resend cooldown timer - OTP disabled
  // useEffect(() => {
  //   if (resendCooldown <= 0) return;
  //   const timer = setInterval(() => {
  //     setResendCooldown((prev) => prev - 1);
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, [resendCooldown]);

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
      case "referralCode":
        if (value && value.trim().length < 3)
          return "Referral code seems invalid";
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

    // OTP step disabled - re-enable when SMS is ready
    // if (currentStep === 3) {
    //   return otpVerified;
    // }

    return Object.values(passwordValidation).every(Boolean);
  };

  // OTP handlers disabled - re-enable when SMS is ready
  // const handleSendOtp = useCallback(async () => {
  //   setOtpSending(true);
  //   setOtpError(null);
  //   try {
  //     const result = await authService.sendOtp(formData.phone, formData.email, selectedChannel);
  //     setOtpSent(true);
  //     setResendCooldown(60);
  //     const channel = result.channel || selectedChannel;
  //     setMaskedContact(result.maskedContact || "");
  //     addToast(
  //       channel === "email"
  //         ? `Verification code sent to your email`
  //         : "OTP sent to your phone",
  //       "success",
  //     );
  //   } catch (err: unknown) {
  //     const error = err as { message?: string };
  //     const message = error?.message || "Failed to send OTP";
  //     setOtpError(message);
  //     addToast(message, "error");
  //   } finally {
  //     setOtpSending(false);
  //   }
  // }, [formData.phone, formData.email, selectedChannel, addToast]);

  // const handleVerifyOtp = async () => {
  //   const code = otpCode.join("");
  //   if (code.length !== 6) {
  //     setOtpError("Please enter the complete 6-digit code");
  //     return;
  //   }
  //   setOtpVerifying(true);
  //   setOtpError(null);
  //   try {
  //     await authService.verifyOtp(formData.phone, code);
  //     setOtpVerified(true);
  //     addToast("Phone verified successfully", "success");
  //   } catch (err: unknown) {
  //     const error = err as { message?: string };
  //     setOtpError(error?.message || "Invalid or expired OTP code");
  //   } finally {
  //     setOtpVerifying(false);
  //   }
  // };

  // const handleResendOtp = async () => {
  //   if (resendCooldown > 0) return;
  //   await handleSendOtp();
  // };

  const nextStep = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // OTP state reset disabled - re-enable when SMS is ready
      // if (currentStep === 3) {
      //   setOtpSent(false);
      //   setOtpVerified(false);
      //   setOtpCode(["", "", "", "", "", ""]);
      //   setOtpError(null);
      // }
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // OTP input handlers disabled - re-enable when SMS is ready
  // const handleOtpDigitChange = (index: number, value: string) => {
  //   if (!/^\d*$/.test(value)) return;
  //   const newOtp = [...otpCode];
  //   newOtp[index] = value.slice(-1);
  //   setOtpCode(newOtp);
  //   setOtpError(null);
  //   if (value && index < 5) {
  //     otpInputRefs.current[index + 1]?.focus();
  //   }
  // };

  // const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
  //   if (e.key === "Backspace" && !otpCode[index] && index > 0) {
  //     otpInputRefs.current[index - 1]?.focus();
  //   }
  // };

  // const handleOtpPaste = (e: React.ClipboardEvent) => {
  //   e.preventDefault();
  //   const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  //   const newOtp = [...otpCode];
  //   for (let i = 0; i < pasted.length; i++) {
  //     newOtp[i] = pasted[i];
  //   }
  //   setOtpCode(newOtp);
  //   if (pasted.length === 6) {
  //     otpInputRefs.current[5]?.focus();
  //   }
  // };

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
        ...(formData.referralCode.trim()
          ? { referralCode: formData.referralCode.trim() }
          : {}),
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

  // OTP helper disabled - re-enable when SMS is ready
  // const maskPhone = (phone: string) => {
  //   if (phone.length < 8) return phone;
  //   const visible = phone.slice(0, 3) + "***" + phone.slice(-3);
  //   return visible;
  // };

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
            <FaExclamationTriangle className="mt-0.5 text-error" />
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
              leftIcon={<FaUser className="text-[var(--text-muted)]" />}
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
              leftIcon={<FaEnvelope className="text-[var(--text-muted)]" />}
              errorText={
                touchedFields.has("email") ? fieldErrors.email : undefined
              }
            />
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
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
              leftIcon={<FaBuilding className="text-[var(--text-muted)]" />}
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
              leftIcon={<FaPhoneAlt className="text-[var(--text-muted)]" />}
              errorText={
                touchedFields.has("phone") ? fieldErrors.phone : undefined
              }
            />
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
              Your business details help us approve your account faster.
            </div>
          </div>
        )}

        {/* OTP step disabled - re-enable when SMS is ready */}
        {/* {currentStep === 3 && (
          <div className="space-y-6">
            OTP UI goes here
          </div>
        )} */}

        {currentStep === 3 && (
          <div className="space-y-5">
            <Input
              label="Referral Code (optional)"
              value={formData.referralCode}
              onChange={(e) => handleInputChange("referralCode", e.target.value)}
              onBlur={() => handleFieldBlur("referralCode")}
              type="text"
              placeholder="Enter referral code if you have one"
              leftIcon={<FaShareAlt className="text-[var(--text-muted)]" />}
              errorText={
                touchedFields.has("referralCode")
                  ? fieldErrors.referralCode
                  : undefined
              }
            />
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--warning)]/10 p-4 text-sm text-[var(--warning)]">
              Have a referral code? Enter it above to get started with bonus
              benefits from your referrer.
            </div>
            <div className="space-y-4 pt-2">
              <Input
                label={FIELD_LABELS.password}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
                type={showPasswords ? "text" : "password"}
                required
                placeholder="Create a strong password"
                leftIcon={<FaLock className="text-[var(--text-muted)]" />}
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
                  <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                    <span>Password Strength</span>
                    <span
                      className={
                        passwordStrength.strength === 100
                          ? "text-success"
                          : passwordStrength.strength >= 60
                            ? "text-[var(--warning)]"
                            : "text-error"
                      }
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border-color)]">
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
              leftIcon={<FaLock className="text-[var(--text-muted)]" />}
              errorText={
                touchedFields.has("confirmPassword")
                  ? fieldErrors.confirmPassword
                  : undefined
              }
            />
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface-alt)] p-4 grid gap-2 text-sm text-[var(--text-secondary)]">
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
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${item.valid ? "bg-success/20 text-success" : "bg-[var(--border-color)] text-[var(--text-muted)]"}`}
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

        <div className="flex gap-3 pt-6 border-t border-[var(--border-color)]">
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
              disabled={
                !validateCurrentStep()
              }
              className="flex-1"
            >
              Next
              <FaArrowRight className="ml-2" />
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

        <div className="text-center mt-6 text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary hover:text-[var(--color-primary-hover)]"
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
            <div className="rounded-2xl bg-success/20 p-3 text-success">
              <FaCheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Registration submitted
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Your account is pending approval.
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
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
