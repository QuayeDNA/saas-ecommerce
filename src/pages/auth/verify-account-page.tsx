// src/pages/auth/verify-account-page.tsx

/**
 * Account Verification Page using centralized auth layout.
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import { useState, useEffect } from "react";
import { Button, Alert } from "../../design-system";
import { FaSpinner } from "react-icons/fa";
import { AuthLayout } from "../../layouts/auth-layout";

export const VerifyAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const { verifyAccount } = useAuth();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!token) {
      setVerificationError(
        "Invalid verification link. Please check your email for the correct link.",
      );
      setIsVerifying(false);
      return;
    }

    const performVerification = async () => {
      try {
        const result = await verifyAccount(token);
        setUserType(result.userType);
        setIsSuccess(true);
      } catch (error) {
        setVerificationError(
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again.",
        );
      } finally {
        setIsVerifying(false);
      }
    };

    performVerification();
  }, [token, verifyAccount]);

  const handleContinue = () => {
    navigate(userType === "super_admin" ? "/superadmin" : "/agent/dashboard");
  };

  return (
    <AuthLayout
      title={isSuccess ? "Account verified" : "Verify account"}
      subtitle={
        isVerifying
          ? "Please wait while we verify your account..."
          : isSuccess
            ? "Your account has been verified successfully."
            : (verificationError ?? "Verification failed.")
      }
      backLink="/home"
      backLabel="Back"
    >
      {isVerifying ? (
        <div className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]">
            <FaSpinner className="animate-spin" size={28} />
          </div>
          <div className="space-y-3">
            <div className="h-3 rounded-full bg-[var(--border-color)]"></div>
            <div className="h-3 rounded-full bg-[var(--border-color)] w-5/6"></div>
            <div className="h-3 rounded-full bg-[var(--border-color)] w-2/3"></div>
          </div>
        </div>
      ) : isSuccess ? (
        <div className="space-y-6">
          <Alert status="success" variant="left-accent">
            <div className="text-sm">
              Your account is now verified. Continue to your dashboard or sign
              in.
            </div>
          </Alert>
          <div className="grid gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleContinue}
            >
              Continue to Dashboard
            </Button>
            <Link to="/login">
              <Button variant="outline" size="lg" fullWidth>
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Alert status="error" variant="left-accent">
            <div className="text-sm">
              {verificationError ?? "Unable to verify your account."}
            </div>
          </Alert>
          <div className="grid gap-3">
            <Link to="/login">
              <Button variant="primary" size="lg" fullWidth>
                Go to Login
              </Button>
            </Link>
            <Link to="/home">
              <Button variant="outline" size="lg" fullWidth>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
