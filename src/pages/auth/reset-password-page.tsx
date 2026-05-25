// src/pages/auth/reset-password-page.tsx

import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { useState, useEffect } from "react";
import { Button, Input, Alert } from "../../design-system";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { AuthLayout } from "../../layouts/auth-layout";
import { FIELD_LABELS, PASSWORD_RULES } from "../../constants/auth";

export const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { authState, resetPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const validatePassword = (password: string, confirmPassword: string) => {
    if (password.length < PASSWORD_RULES.MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long.`;
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return "Password must contain uppercase, lowercase and a number.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const password = (formData.get("password") as string) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

    const error = validatePassword(password, confirmPassword);
    if (error) {
      setPasswordError(error);
      return;
    }

    if (token) {
      try {
        await resetPassword(token, password);
        setIsSuccess(true);
      } catch (error) {
        console.error("Password reset failed:", error);
      }
    }
  };

  return (
    <AuthLayout
      title={isSuccess ? "Password updated" : "Set new password"}
      subtitle={
        isSuccess
          ? "You can now sign in to your vendor account."
          : "Create a strong password to secure your account."
      }
      backLink="/login"
      backLabel="Back"
    >
      {isSuccess ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-success/20 text-success">
            <FaCheck size={28} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Your password has been updated successfully.
          </p>
          <Link to="/login">
            <Button variant="primary" size="lg" fullWidth>
              Go to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {(authState.error || passwordError) && (
            <Alert status="error" variant="left-accent" className="space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <FaExclamationTriangle />
                Reset failed
              </div>
              <div className="text-sm">{passwordError ?? authState.error}</div>
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label={FIELD_LABELS.password}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              fullWidth
              leftIcon={<FaLock className="text-[var(--text-muted)]" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
              helperText={`Minimum ${PASSWORD_RULES.MIN_LENGTH} characters, uppercase, lowercase, and number.`}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label={FIELD_LABELS.confirmPassword}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              fullWidth
              leftIcon={<FaLock className="text-[var(--text-muted)]" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={authState.isLoading}
          >
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};
