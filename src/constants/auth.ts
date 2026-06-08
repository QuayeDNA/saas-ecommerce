import { BUSINESS_USER_TYPES } from "../utils/userTypeHelpers";

export const AUTH_COOKIE_KEYS = {
  TOKEN: "authToken",
  USER: "user",
  REFRESH_TOKEN: "refreshToken",
  REMEMBER_ME: "rememberMe",
} as const;

export const AUTH_COOKIE_OPTIONS = {
  secure: import.meta.env.PROD,
  sameSite: "strict" as const,
  path: "/",
};

export const AUTH_COOKIE_EXPIRY = {
  DEFAULT: 7,
  REMEMBER_ME: 30,
} as const;

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  ACCOUNT_DEACTIVATED: "AUTH_ACCOUNT_DEACTIVATED",
  ACCOUNT_PENDING_APPROVAL: "AUTH_ACCOUNT_PENDING_APPROVAL",
  ACCOUNT_REJECTED: "AUTH_ACCOUNT_REJECTED",
  SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  INVALID_PIN: "AUTH_INVALID_PIN",
  PIN_NOT_CONFIGURED: "AUTH_PIN_NOT_CONFIGURED",
  INVALID_RESET_TOKEN: "AUTH_INVALID_RESET_TOKEN",
} as const;

export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export const DASHBOARD_ROUTES: Record<string, string> = {
  super_admin: "/superadmin",
  admin: "/admin/dashboard",
  ...Object.fromEntries(BUSINESS_USER_TYPES.map((type) => [type, "/agent/dashboard"])),
  subscriber: "/agent/dashboard",
};

export const AUTH_API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER_AGENT: "/api/auth/register/agent",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_ACCOUNT: "/api/auth/verify-account",
  VERIFY_TOKEN: "/api/auth/verify-token",
  SETUP_PIN: "/api/auth/setup-pin",
  UPDATE_FIRST_TIME: "/api/auth/update-first-time",
  // SEND_OTP: "/api/auth/send-otp", // OTP disabled - re-enable when SMS is ready
  // VERIFY_OTP: "/api/auth/verify-otp",
} as const;

export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRES_UPPERCASE: true,
  REQUIRES_LOWERCASE: true,
  REQUIRES_NUMBER: true,
} as const;

export const STEPS_REGISTRATION = [
  { title: "Account", icon: "User" },
  { title: "Business", icon: "Building2" },
  // { title: "Verify", icon: "Smartphone" }, // OTP step disabled - re-enable when SMS is ready
  { title: "Security", icon: "Shield" },
] as const;

export const FIELD_LABELS = {
  fullName: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  businessName: "Business Name",
  password: "Password",
  confirmPassword: "Confirm Password",
} as const;
