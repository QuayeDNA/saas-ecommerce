// src/pages/auth/login-page.tsx

/**
 * Modern Login Page with centralized auth layout.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button, Input, Alert } from "../../design-system";
import { useAuth } from "../../hooks";
import { AuthLayout } from "../../layouts/auth-layout";
import { FIELD_LABELS } from "../../constants/auth";

export const LoginPage = () => {
  const { authState, login, clearErrors } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated && authState.dashboardUrl) {
      navigate(authState.dashboardUrl);
    }
  }, [authState, navigate]);

  useEffect(() => {
    document.title = "BryteLinks - Login";
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    clearErrors();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const rememberMe = formData.get("remember_me") === "on";

    try {
      await login(email, password, rememberMe);
    } catch (error) {
      let message = "Login failed";

      if (error instanceof Error) {
        if (error.message.includes("pending approval")) {
          message =
            "Your account is pending approval. Please wait for admin confirmation.";
        } else if (error.message.includes("rejected")) {
          message =
            "Your account has been rejected. Contact support if you need help.";
        } else if (error.message.includes("Too many login attempts")) {
          message = error.message;
        } else if (
          error.message.includes("429") ||
          error.message.includes("Too Many Requests")
        ) {
          message =
            "Too many login attempts. Please wait a few minutes before trying again.";
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
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your agent account."
      backLink="/home"
      backLabel="Back"
    >
      {(localError || authState.error) && (
        <Alert status="error" variant="left-accent" className="mb-4">
          <div className="font-semibold">
            {(localError ?? authState.error)?.includes("Too many")
              ? "Rate Limited"
              : "Login failed"}
          </div>
          <div className="mt-2 text-sm">{localError ?? authState.error}</div>
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--text-secondary)]"
          >
            {FIELD_LABELS.email}
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

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--text-secondary)]"
          >
            {FIELD_LABELS.password}
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
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting || authState.isLoading}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--border-color)] text-primary focus:ring-primary"
              disabled={isSubmitting || authState.isLoading}
            />
            Remember me
          </label>

          <Link
            className="text-sm font-medium text-primary hover:text-[var(--color-primary-hover)]"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting || authState.isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Don't have an account?{" "}
        <Link
          className="font-semibold text-primary hover:text-[var(--color-primary-hover)]"
          to="/register"
        >
          Create one
        </Link>
      </div>
    </AuthLayout>
  );
};
