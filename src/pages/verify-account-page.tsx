// src/pages/verify-account-page.tsx

/**
 * Account Verification Page
 *
 * Features:
 * - Handles token-based email verification
 * - Automatic token extraction from URL
 * - Visual feedback states (loading, success, error)
 * - Consistent with auth design system
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { useState, useEffect } from "react";
import {
  Button,
  Alert,
  Card,
  CardHeader,
  CardBody,
  Container,
} from "../design-system";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { BryteLinksSvgIcon } from "../components/common/BryteLinksSvgLogo";

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
    null
  );

  useEffect(() => {
    if (!token) {
      setVerificationError(
        "Invalid verification link. Please check your email for the correct link."
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
            : "Verification failed. Please try again."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    performVerification();
  }, [token, verifyAccount]);

  // Redirect to appropriate dashboard based on user type
  const handleContinue = () => {
    navigate(userType === "super_admin" ? "/superadmin" : "/agent/dashboard");
  };

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
              <BryteLinksSvgIcon className="w-8 h-8" />
              <span className="font-bold text-gray-900 hidden sm:block">
                BryteLinks
              </span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6">
        <Card
          className="w-full max-w-lg shadow-xl border-0"
          variant="elevated"
          size="lg"
        >
          <CardHeader className="text-center pb-6">
            {isVerifying && (
              <div className="mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
                <FaSpinner className="text-blue-600 text-2xl animate-spin" />
              </div>
            )}

            {isSuccess && (
              <div className="mx-auto bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6 animate-fade-in">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            )}

            {!isVerifying && !isSuccess && (
              <div className="mx-auto bg-gradient-to-br from-red-100 to-orange-100 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isVerifying && "Verifying Your Account"}
              {isSuccess && "Account Verified!"}
              {!isVerifying && !isSuccess && "Verification Failed"}
            </h1>

            <p className="text-gray-600">
              {isVerifying && "Please wait while we verify your account..."}
              {isSuccess && "Your email has been successfully verified."}
              {!isVerifying && !isSuccess && "We couldn't verify your account."}
            </p>
          </CardHeader>

          <CardBody className="pt-0">
            {isVerifying && (
              <div className="flex justify-center py-6">
                <div className="w-full max-w-sm">
                  <div className="animate-pulse space-y-4">
                    <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-5/6 mx-auto"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-4/6 mx-auto"></div>
                  </div>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="space-y-6 animate-fade-in">
                <Alert status="success" variant="left-accent">
                  <div className="text-sm">
                    Your account has been successfully verified. You can now
                    access all features of your account.
                  </div>
                </Alert>

                <div className="space-y-3">
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
            )}

            {!isVerifying && !isSuccess && (
              <div className="space-y-6">
                <Alert status="error" variant="left-accent">
                  <div className="text-sm">{verificationError}</div>
                </Alert>

                <div className="space-y-3">
                  <Link to="/login">
                    <Button variant="primary" size="lg" fullWidth>
                      Go to Login
                    </Button>
                  </Link>

                  <Link to="/">
                    <Button variant="outline" size="lg" fullWidth>
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
