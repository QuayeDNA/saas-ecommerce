import { useState, useRef, useEffect, useCallback } from "react";
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
  FaShareAlt,
  FaMobileAlt,
  FaClock,
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
import { authService } from "../../services/auth.service";
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
  const [selectedChannel, setSelectedChannel] = useState<"email" | "phone">("email");

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

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [maskedContact, setMaskedContact] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

    if (currentStep === 3) {
      return otpVerified;
    }

    return Object.values(passwordValidation).every(Boolean);
  };

  // Send OTP when moving to step 3
  const handleSendOtp = useCallback(async () => {
    setOtpSending(true);
    setOtpError(null);
    try {
      const result = await authService.sendOtp(formData.phone, formData.email, selectedChannel);
      setOtpSent(true);
      setResendCooldown(60);
      const channel = result.channel || selectedChannel;
      setMaskedContact(result.maskedContact || "");
      addToast(
        channel === "email"
          ? `Verification code sent to your email`
          : "OTP sent to your phone",
        "success",
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      const message = error?.message || "Failed to send OTP";
      setOtpError(message);
      addToast(message, "error");
    } finally {
      setOtpSending(false);
    }
  }, [formData.phone, formData.email, selectedChannel, addToast]);

  // Verify OTP
  const handleVerifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }
    setOtpVerifying(true);
    setOtpError(null);
    try {
      await authService.verifyOtp(formData.phone, code);
      setOtpVerified(true);
      addToast("Phone verified successfully", "success");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setOtpError(error?.message || "Invalid or expired OTP code");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp();
  };

  const nextStep = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 3) {
        setOtpSent(false);
        setOtpVerified(false);
        setOtpCode(["", "", "", "", "", ""]);
        setOtpError(null);
      }
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    setOtpError(null);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpCode(newOtp);
    if (pasted.length === 6) {
      otpInputRefs.current[5]?.focus();
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

  const maskPhone = (phone: string) => {
    if (phone.length < 8) return phone;
    const visible = phone.slice(0, 3) + "***" + phone.slice(-3);
    return visible;
  };

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
          <div className="space-y-6">
            {otpError && (
              <Alert status="error" variant="left-accent" className="mb-2">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="mt-0.5 text-red-600 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              </Alert>
            )}

            {!otpSent && !otpVerified && (
              <div className="space-y-5">
                <label className="block text-sm font-semibold text-slate-800">
                  Choose how to receive your code
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel("email")}
                    className={`flex-1 flex items-center gap-4 rounded-xl border-2 p-5 transition-all text-left ${
                      selectedChannel === "email"
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 ${
                      selectedChannel === "email"
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300"
                    }`}>
                      {selectedChannel === "email" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <FaEnvelope className={`text-xl flex-shrink-0 ${selectedChannel === "email" ? "text-blue-600" : "text-slate-400"}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${selectedChannel === "email" ? "text-blue-700" : "text-slate-700"}`}>
                          Email
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {formData.email}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex-1 flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-5 text-left opacity-50 cursor-not-allowed"
                    title="SMS verification coming soon"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-100 flex-shrink-0">
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <FaMobileAlt className="text-xl text-slate-300 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-400">
                          Phone (SMS)
                        </p>
                        <p className="text-xs text-slate-300 truncate">
                          {formData.phone} &middot; Coming soon
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSendOtp}
                  className="w-full"
                  isLoading={otpSending}
                  disabled={otpSending}
                >
                  {otpSending ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            )}

            {(otpSent || otpVerified) && (
              <>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    {otpVerified ? (
                      <FaCheckCircle className="h-7 w-7" />
                    ) : selectedChannel === "email" ? (
                      <FaEnvelope className="h-7 w-7" />
                    ) : (
                      <FaMobileAlt className="h-7 w-7" />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {otpVerified
                      ? `${selectedChannel === "email" ? "Email" : "Phone"} Verified`
                      : `Verify your ${selectedChannel === "email" ? "email" : "phone number"}`}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {otpVerified
                      ? (maskedContact || (selectedChannel === "email" ? formData.email : maskPhone(formData.phone)))
                      : `We sent a code to ${maskedContact || (selectedChannel === "email" ? formData.email : maskPhone(formData.phone))}`}
                  </p>

                  {selectedChannel === "phone" && !otpVerified && (
                    <p className="mt-2 text-xs text-amber-600">
                      SMS not available yet. Switch to email to receive your code.
                    </p>
                  )}
                </div>

                {!otpVerified && (
                  <>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">
                        Enter verification code
                      </label>
                      <div
                        className="flex justify-center gap-2 sm:gap-3"
                        onPaste={handleOtpPaste}
                      >
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { otpInputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-slate-300 text-center text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                            autoFocus={index === 0}
                            aria-label={`Digit ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleVerifyOtp}
                        disabled={otpCode.join("").length !== 6 || otpVerifying}
                        className="w-full"
                        isLoading={otpVerifying}
                      >
                        {otpVerifying ? "Verifying..." : "Verify Code"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || otpSending}
                        className="w-full text-sm"
                      >
                        {resendCooldown > 0 ? (
                          <span className="flex items-center justify-center gap-2 text-slate-500">
                            <FaClock className="h-3 w-3" />
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          "Resend code"
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {otpVerified && (
                  <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 text-center">
                    <FaCheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
                    <p className="font-semibold text-green-800">{selectedChannel === "email" ? "Email" : "Phone"} verified</p>
                    <p className="text-sm text-green-600 mt-1">
                      You can now proceed to set up your account security.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5">
            <Input
              label="Referral Code (optional)"
              value={formData.referralCode}
              onChange={(e) => handleInputChange("referralCode", e.target.value)}
              onBlur={() => handleFieldBlur("referralCode")}
              type="text"
              placeholder="Enter referral code if you have one"
              leftIcon={<FaShareAlt className="text-slate-400" />}
              errorText={
                touchedFields.has("referralCode")
                  ? fieldErrors.referralCode
                  : undefined
              }
            />
            <div className="rounded-3xl border border-slate-200 bg-amber-50 p-4 text-sm text-amber-800">
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
              disabled={
                !validateCurrentStep() ||
                (currentStep === 2 && otpSending)
              }
              className="flex-1"
              isLoading={currentStep === 2 && otpSending}
            >
              {currentStep === 2 && otpSending
                ? "Sending Code..."
                : "Next"}
              {currentStep !== 2 && <FaArrowRight className="ml-2" />}
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
