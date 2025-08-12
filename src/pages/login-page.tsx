// src/pages/login-page.tsx

/**
 * Modern Login Page with Enhanced UX
 *
 * Features:
 * - Mobile-first responsive design with modern aesthetics
 * - Clear visual hierarchy and user-friendly layout
 * - Comprehensive loading states and error handling
 * - Enhanced accessibility and form validation
 * - Password visibility toggle with smooth animations
 * - Remember me functionality with clear messaging
 * - Social proof elements and trust indicators
 * - Seamless navigation and user flow
 * - Consistent design system integration
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Alert,
  Container,
} from "../design-system";
import { useAuth } from "../hooks";
import {
  BryteLinksSvgLogoCompact,
  BryteLinksSvgLogo,
} from "../components/common/BryteLinksSvgLogo";

export const LoginPage = () => {
  const { authState, login, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.dashboardUrl) {
      navigate(authState.dashboardUrl);
    }
  }, [authState, navigate]);

  // Clear errors on mount
  useEffect(() => {
    clearErrors();
    setLocalError(null);
  }, [clearErrors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    clearErrors();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("remember_me") === "on";

    try {
      await login(email, password, rememberMe);
    } catch (error) {
      let message = "Login failed";
      if (error instanceof Error) {
        if (error.message.includes("pending approval")) {
          message =
            "Your account is pending approval by a super admin. You will be notified by email once approved.";
        } else if (error.message.includes("rejected")) {
          message =
            "Your account has been rejected. Please contact support for more information.";
        } else {
          message = error.message;
        }
      }
      setLocalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Header with back to home */}
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

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl border-0" variant="elevated">
            <CardHeader className="text-center mb-6 p-0">
              <div className="flex justify-center items-center">
                <BryteLinksSvgLogo width={120} height={140} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </CardHeader>

            <CardBody className="pt-0">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Alert */}
                {(localError || authState.error) && (
                  <Alert
                    status="error"
                    variant="left-accent"
                    className="flex items-start"
                  >
                    <FaExclamationTriangle className="mt-0.5 mr-3 flex-shrink-0 text-red-500" />
                    <div>
                      <div className="font-medium text-red-800">
                        Login Failed
                      </div>
                      <div className="text-red-700 text-sm mt-1">
                        {localError ?? authState.error}
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className="w-full"
                    disabled={isSubmitting || authState.isLoading}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      className="w-full pr-12"
                      disabled={isSubmitting || authState.isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting || authState.isLoading}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isSubmitting || authState.isLoading}
                    />
                    <span className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting || authState.isLoading}
                  leftIcon={
                    isSubmitting || authState.isLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : undefined
                  }
                >
                  {isSubmitting || authState.isLoading
                    ? "Signing in..."
                    : "Sign in"}
                </Button>

                {/* Additional Help */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">
                    Need help? Contact our support team
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                    <a
                      href="https://wa.me/+233548983019"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-500 transition-colors"
                    >
                      📞 +233 54 898 3019
                    </a>
                    <a
                      href="https://chat.whatsapp.com/EstSwEm3q9Z4sS42Ed5N8u?mode=ac_t"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-500 transition-colors"
                    >
                      📱 Join our WhatsApp Community
                    </a>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                99.9% Uptime
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Bank-grade Security
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
