// src/pages/register-page.tsx

/**
 * Modern Agent Registration Page with Enhanced UX
 *
 * Features:
 * - Mobile-first responsive design
 * - Agent-only registration
 * - Real-time validation
 * - Password strength indicator
 * - Progress indicators
 * - Success states with approval flow
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaStore,
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Alert,
  Container,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "../design-system";
import { useAuth } from "../hooks";
import { useSiteStatus } from "../contexts/site-status-context";
import { useToast } from "../design-system/components/toast";
import type { RegisterAgentData } from "../services/auth.service";
import {
  BryteLinksSvgLogoCompact,
  BryteLinksSvgLogo,
} from "../components/common/BryteLinksSvgLogo";

export const RegisterPage = () => {
  const { registerAgent } = useAuth();
  const { signupApprovalRequired, isLoading: siteStatusLoading } =
    useSiteStatus();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });

  // Password validation
  const validatePassword = (password: string, confirmPassword: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      match: password === confirmPassword && password.length > 0,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const confirmPassword =
      (
        document.querySelector(
          'input[name="confirmPassword"]'
        ) as HTMLInputElement
      )?.value || "";
    validatePassword(password, confirmPassword);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const confirmPassword = e.target.value;
    const password =
      (document.querySelector('input[name="password"]') as HTMLInputElement)
        ?.value || "";
    validatePassword(password, confirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent submission while site status is loading
    if (siteStatusLoading) {
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const agentData: RegisterAgentData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      businessName: formData.get("businessName") as string,
      businessCategory: "services", // Default to 'services'
      subscriptionPlan: "basic", // Default to 'basic' (free)
    };

    try {
      await registerAgent(agentData);

      // Show success dialog for approval required, or navigate to login for auto approval
      if (signupApprovalRequired) {
        setShowSuccessDialog(true);
      } else {
        // Show success toast for auto approval before navigating
        addToast(
          "Agent account created successfully! You can now log in.",
          "success"
        );
        navigate("/login");
      }
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <Container>
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <BryteLinksSvgLogoCompact width={140} height={40} />
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8">
        <Card
          className="w-full max-w-2xl shadow-xl border-0"
          variant="elevated"
          size="lg"
        >
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center items-center">
              <BryteLinksSvgLogo width={120} height={140} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agent Registration
            </h1>
            <p className="text-gray-600">
              Join our platform as a telecom agent and start earning commissions
            </p>
          </CardHeader>

          <CardBody>
            {localError && (
              <Alert status="error" variant="left-accent" className="mb-6">
                <div className="flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  {localError}
                </div>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    leftIcon={<FaUser className="text-gray-400" />}
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    leftIcon={<FaEnvelope className="text-gray-400" />}
                  />
                </div>

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  leftIcon={<FaPhoneAlt className="text-gray-400" />}
                />
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaBuilding className="mr-2 text-blue-600" />
                  Business Information
                </h3>

                <Input
                  label="Business Name"
                  name="businessName"
                  type="text"
                  required
                  placeholder="Enter your business name"
                  leftIcon={<FaBuilding className="text-gray-400" />}
                />
              </div>

              {/* Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaLock className="mr-2 text-blue-600" />
                  Security
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a strong password"
                      leftIcon={<FaLock className="text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      }
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div>
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm your password"
                      leftIcon={<FaLock className="text-gray-400" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      }
                      onChange={handleConfirmPasswordChange}
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Password Requirements:
                  </h4>
                  <div className="space-y-2">
                    <div
                      className={`flex items-center text-sm ${
                        passwordValidation.length
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FaCheckCircle
                        className={`mr-2 ${
                          passwordValidation.length
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      />
                      At least 8 characters
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordValidation.uppercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FaCheckCircle
                        className={`mr-2 ${
                          passwordValidation.uppercase
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      />
                      One uppercase letter
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordValidation.lowercase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FaCheckCircle
                        className={`mr-2 ${
                          passwordValidation.lowercase
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      />
                      One lowercase letter
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordValidation.number
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FaCheckCircle
                        className={`mr-2 ${
                          passwordValidation.number
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      />
                      One number
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        passwordValidation.match
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <FaCheckCircle
                        className={`mr-2 ${
                          passwordValidation.match
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      />
                      Passwords match
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <FaShieldAlt className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Important Information:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Your account will be reviewed by the admin</li>
                      <li>• You will receive an email once approved</li>
                      <li>
                        • After approval, you can log in and start earning
                      </li>
                      <li>
                        • By registering, you agree to our terms of service
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isPasswordValid || isSubmitting || siteStatusLoading}
              >
                {siteStatusLoading ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isSubmitting ? (
                  <>
                    <FaSpinner className="mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FaStore className="mr-2" />
                    Register as Agent
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardBody>
        </Card>
      </main>

      {/* Success Dialog for Approval Required */}
      <Dialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        size="md"
      >
        <DialogHeader>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            Registration Successful!
          </h2>
        </DialogHeader>
        <DialogBody>
          <div className="text-center py-4">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your Agent Account Has Been Created
            </h3>
            <p className="text-gray-600 mb-4">
              Your account is currently pending approval by a super admin. You
              will receive an email notification once your account is approved
              and you can start using the platform.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">
                What happens next?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your application will be reviewed within 24-48 hours</li>
                <li>• You'll receive an email when approved</li>
                <li>• After approval, you can log in and start earning</li>
              </ul>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowSuccessDialog(false)}
            className="mr-2"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowSuccessDialog(false);
              navigate("/login");
            }}
          >
            Go to Login
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
