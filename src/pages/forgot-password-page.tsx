// src/pages/forgot-password-page.tsx

/**
 * Forgot Password Page
 *
 * Features:
 * - Identifier and PIN input with validation
 * - Clear success/error states
 * - Animated transitions
 * - Mobile-first responsive design
 * - Consistent with auth design system
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import {
  Button,
  Input,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "../design-system";
import {
  FaUser,
  FaArrowLeft,
  FaExclamationTriangle,
  FaLock,
  FaKey,
} from "react-icons/fa";

export const ForgotPasswordPage = () => {
  const { authState, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const pin = formData.get("pin") as string;

    try {
      const response = await forgotPassword(identifier, pin);
      // Immediately navigate to the reset password page with the token
      if (response && response.resetToken) {
        navigate(`/reset-password/${response.resetToken}`);
      }
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
      <div className="mb-4">
        <Link
          to="/login"
          className="inline-flex items-center transition"
          style={{ color: "var(--color-primary-600)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-primary-700)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-primary-600)")
          }
        >
          <FaArrowLeft className="mr-1" />
          Back to Login
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md" variant="elevated" size="lg">
          <CardHeader className="text-center">
            <div
              className="mx-auto p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--color-primary-100)" }}
            >
              <FaLock
                className="text-2xl"
                style={{ color: "var(--color-primary-600)" }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-gray-600 text-sm">
              Enter your account identifier and security PIN to reset your
              password
            </p>
          </CardHeader>

          <CardBody>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {authState.error && (
                <Alert
                  status="error"
                  variant="left-accent"
                  className="flex items-start"
                >
                  <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                  <span>{authState.error}</span>
                </Alert>
              )}

              <div>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  label="Account Identifier"
                  autoComplete="username"
                  required
                  placeholder="Phone, Email, or Agent Code"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaUser className="text-gray-400" />}
                />
              </div>

              <div>
                <Input
                  id="pin"
                  name="pin"
                  type="password"
                  label="4-Digit Security PIN"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  placeholder="Enter your 4-digit PIN"
                  size="md"
                  variant="outline"
                  colorScheme="default"
                  fullWidth
                  leftIcon={<FaKey className="text-gray-400" />}
                />
              </div>

              <Button
                type="submit"
                disabled={authState.isLoading}
                isLoading={authState.isLoading}
                variant="primary"
                colorScheme="default"
                size="lg"
                fullWidth
              >
                {authState.isLoading ? "Verifying..." : "Verify PIN"}
              </Button>

              <div className="mt-4 text-center text-sm text-gray-600">
                <Link
                  to="/"
                  className="font-medium transition"
                  style={{ color: "var(--color-primary-600)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-primary-700)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--color-primary-600)")
                  }
                >
                  ← Back to home
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
