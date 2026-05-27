// src/pages/auth/forgot-password-page.tsx

/**
 * Forgot Password Page within the shared auth layout.
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { Button, Input, Alert } from "../../design-system";
import { FaUser, FaKey } from "react-icons/fa";
import { AuthLayout } from "../../layouts/auth-layout";

export const ForgotPasswordPage = () => {
  const { authState, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const identifier = (formData.get("identifier") as string) ?? "";
    const pin = (formData.get("pin") as string) ?? "";

    try {
      const response = await forgotPassword(identifier, pin);
      if (response?.resetToken) {
        navigate(`/reset-password/${response.resetToken}`);
      }
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Recover access to your vendor account."
      backLink="/login"
      backLabel="Back"
    >
      {authState.error && (
        <Alert status="error" variant="left-accent" className="mb-4">
          {authState.error}
        </Alert>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            label="Account Identifier"
            autoComplete="username"
            required
            placeholder="Phone, email, or agent code"
            fullWidth
            leftIcon={<FaUser className="text-[var(--text-muted)]" />}
          />
        </div>

        <div>
          <Input
            id="pin"
            name="pin"
            type="password"
            label="Security PIN"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            placeholder="Enter your PIN"
            fullWidth
            leftIcon={<FaKey className="text-[var(--text-muted)]" />}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={authState.isLoading}
        >
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Remembered your password?{" "}
        <Link
          className="font-semibold text-primary hover:text-[var(--color-primary-hover)]"
          to="/login"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
