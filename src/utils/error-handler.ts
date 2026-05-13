import { AxiosError } from "axios";

export const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your inputs.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource could not be found.",
  408: "Request timeout. Please try again.",
  409: "Account conflict detected.",
  422: "Resource already exists or there is a conflict.",
  429: "Unprocessable entity. Please verify your data.",
  500: "An internal server error occurred. Our team has been notified.",
  502: "Bad gateway. The service is temporarily unavailable.",
  503: "Service unavailable. Please try again later.",
  504: "Gateway timeout. Please check your connection.",
};

export const DEFAULT_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again.";

export const ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "Invalid email or password",
  AUTH_ACCOUNT_DEACTIVATED:
    "Your account has been deactivated by an administrator.",
  AUTH_ACCOUNT_PENDING_APPROVAL:
    "Your account is pending approval by a super admin.",
  AUTH_ACCOUNT_REJECTED:
    "Your account has been rejected. Please contact support.",
  AUTH_IDENTIFIER_PIN_REQUIRED: "Identifier and PIN are required",
  AUTH_INVALID_PIN_FORMAT: "PIN must be 4 to 6 digits",
  AUTH_INVALID_PIN: "Invalid Security PIN",
  AUTH_IDENTIFIER_NOT_FOUND: "No user found with this identifier",
  AUTH_PIN_NOT_CONFIGURED:
    "Security PIN has not been set up. Please contact support.",
  AUTH_INVALID_RESET_TOKEN: "Invalid or expired reset token",
  AUTH_INVALID_RESET_PAYLOAD: "Invalid request payload",
  AUTH_SESSION_EXPIRED: "Your session has expired. Please log in again.",
};

export const parseApiError = (
  error: unknown,
  actionFallback?: string,
): string => {
  const fallback = actionFallback
    ? `Failed to ${actionFallback}`
    : DEFAULT_ERROR_MESSAGE;

  if (error && typeof error === "object") {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
      code?: string;
    }>;

    // Use server-provided stable error code when available
    const errorCode = axiosError.response?.data?.code;
    if (errorCode) {
      const mappedMessage = ERROR_CODE_MESSAGES[errorCode];
      if (mappedMessage) {
        return mappedMessage;
      }
    }

    // 1. If the server provides a specific human-readable message, prioritize it.
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }

    // 2. Map known HTTP status codes to friendly messages
    if (axiosError.response?.status) {
      const statusMessage = ERROR_MESSAGES[axiosError.response.status];
      if (statusMessage) {
        return statusMessage;
      }
    }

    // 3. Handle Network Errors (no response from server)
    if (
      axiosError.code === "ERR_NETWORK" ||
      axiosError.message === "Network Error"
    ) {
      return "Network error. Please check your internet connection.";
    }
  }

  if (
    error instanceof Error &&
    error.message &&
    !error.message.includes("status code")
  ) {
    const appCode = (error as Error & { code?: string }).code;
    if (appCode && ERROR_CODE_MESSAGES[appCode]) {
      return ERROR_CODE_MESSAGES[appCode];
    }
    return error.message;
  }

  return fallback;
};
