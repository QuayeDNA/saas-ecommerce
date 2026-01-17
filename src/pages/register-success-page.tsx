import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSiteStatus } from "../contexts/site-status-context";

export const RegisterSuccessPage = () => {
  const { signupApprovalRequired } = useSiteStatus();
  const navigate = useNavigate();

  // Redirect to login if approval is not required (shouldn't happen due to navigation logic in register-page)
  useEffect(() => {
    if (!signupApprovalRequired) {
      navigate("/login");
    }
  }, [signupApprovalRequired, navigate]);

  // Don't render anything if approval is not required
  if (!signupApprovalRequired) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Registration Successful!
        </h1>
        <p className="text-gray-600">
          Your account is pending approval by a super admin.
        </p>
        <Link
          to="/login"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};
