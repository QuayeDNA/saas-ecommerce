/**
 * Shared error handling utilities for consistent API error extraction.
 * Eliminates duplicated error extraction logic across components.
 */

/**
 * Extracts a human-readable error message from an API error response.
 * Handles Axios error shapes and falls back to a default message.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred"
): string {
  if (!error || typeof error !== "object") return fallback;

  // Axios error shape: error.response.data.message
  const axiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  // Native Error
  if (axiosError.message) {
    return axiosError.message;
  }

  return fallback;
}
